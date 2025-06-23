const express = require('express');
const router = express.Router();
const axios = require('axios');
const { 
  supabase,
  createConversation, 
  getUserConversations, 
  saveMessage,
  updateConversation,
  updateApiUsage,
  checkApiQuota
} = require('../config/supabase');
const { authenticateUser, optionalAuth, rateLimitByTier } = require('../middleware/auth');

// OpenAI Assistant API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID || 'asst_SIM27MLhW3jL4xRG6SyNzFzc';

// Store active threads in memory (in production, use a database)
const activeThreads = new Map();

// Helper function to create a new thread
const createThread = async () => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/threads',
      {},
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.id;
  } catch (error) {
    console.error('Error creating thread:', error.response?.data || error.message);
    throw new Error('Failed to create conversation thread');
  }
};

// Helper function to add message to thread
const addMessageToThread = async (threadId, message) => {
  try {
    await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { 
        role: 'user', 
        content: message 
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error adding message to thread:', error.response?.data || error.message);
    throw new Error('Failed to add message to conversation');
  }
};

// Helper function to run assistant
const runAssistant = async (threadId) => {
  try {
    const runResponse = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      { assistant_id: ASSISTANT_ID },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
          'Content-Type': 'application/json',
        },
      }
    );

    const runId = runResponse.data.id;

    // Poll for completion with timeout
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      const statusResponse = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        }
      );

      const status = statusResponse.data.status;
      
      if (status === 'completed') {
        break;
      } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
        throw new Error(`Assistant run ${status}: ${statusResponse.data.last_error?.message || 'Unknown error'}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Assistant response timeout');
    }

    return runId;
  } catch (error) {
    console.error('Error running assistant:', error.response?.data || error.message);
    throw new Error('Failed to get assistant response');
  }
};

// Helper function to get assistant reply
const getAssistantReply = async (threadId) => {
  try {
    const messagesResponse = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    const messages = messagesResponse.data.data;
    const latestAssistantMessage = messages.find(msg => msg.role === 'assistant');
    
    if (!latestAssistantMessage) {
      throw new Error('No assistant response found');
    }

    return latestAssistantMessage.content[0]?.text?.value || '[No response]';
  } catch (error) {
    console.error('Error getting assistant reply:', error.response?.data || error.message);
    throw new Error('Failed to retrieve assistant response');
  }
};

// Chat completion endpoint using Assistant API
router.post('/completion', authenticateUser, rateLimitByTier, async (req, res) => {
  try {
    const { message, threadId: clientThreadId, conversationId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        message: 'Please provide a message to process'
      });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API not configured',
        message: 'Please configure your OpenAI API key in the environment variables'
      });
    }

    if (!ASSISTANT_ID) {
      return res.status(500).json({
        error: 'Assistant not configured',
        message: 'Please configure your OpenAI Assistant ID in the environment variables'
      });
    }

    // Check API quota
    const hasQuota = await checkApiQuota(userId);
    if (!hasQuota) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'You have exceeded your API usage limit. Please upgrade your subscription.'
      });
    }

    // Get or create thread
    let threadId = clientThreadId;
    let conversation = null;

    if (conversationId) {
      // Get existing conversation
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (!convError && existingConv) {
        conversation = existingConv;
        threadId = existingConv.thread_id;
      }
    }

    if (!threadId || !activeThreads.has(threadId)) {
      threadId = await createThread();
      activeThreads.set(threadId, {
        created: new Date(),
        lastUsed: new Date()
      });

      // Create or update conversation with thread ID
      if (conversation) {
        conversation = await updateConversation(conversationId, userId, { thread_id: threadId });
      } else {
        conversation = await createConversation(userId, 'New Conversation', threadId);
      }
    } else {
      // Update last used time
      activeThreads.get(threadId).lastUsed = new Date();
    }

    // Save user message to database
    if (conversation) {
      await saveMessage(conversation.id, userId, 'user', message);
    }

    // Add user message to thread
    await addMessageToThread(threadId, message);

    // Run assistant
    await runAssistant(threadId);

    // Get assistant reply
    const assistantReply = await getAssistantReply(threadId);

    // Save assistant message to database
    if (conversation) {
      await saveMessage(conversation.id, userId, 'assistant', assistantReply);
    }

    // Update API usage
    await updateApiUsage(userId, 1, 0); // 1 token used, 0 cost for now

    res.json({
      success: true,
      response: assistantReply,
      threadId: threadId,
      conversationId: conversation?.id,
      timestamp: new Date().toISOString(),
      model: 'assistant-api'
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    
    // Handle specific OpenAI errors
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'OpenAI API quota has been exceeded. Please check your billing settings.'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided OpenAI API key is invalid. Please check your configuration.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while processing your request'
    });
  }
});

// Create new thread endpoint
router.post('/thread/new', authenticateUser, async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API not configured',
        message: 'Please configure your OpenAI API key'
      });
    }

    const threadId = await createThread();
    activeThreads.set(threadId, {
      created: new Date(),
      lastUsed: new Date()
    });

    // Create conversation in database
    const conversation = await createConversation(req.user.id, 'New Conversation', threadId);

    res.json({
      success: true,
      threadId: threadId,
      conversationId: conversation?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating new thread:', error);
    res.status(500).json({
      error: 'Failed to create new thread',
      message: error.message
    });
  }
});

// Get thread messages endpoint
router.get('/thread/:threadId/messages', authenticateUser, async (req, res) => {
  try {
    const { threadId } = req.params;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API not configured'
      });
    }

    // Verify user owns a conversation with this thread
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'Thread not found',
        message: 'The requested thread does not exist or you do not have access to it'
      });
    }

    const messagesResponse = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    const messages = messagesResponse.data.data.reverse().map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content[0]?.text?.value || '',
      timestamp: new Date(msg.created_at * 1000).toISOString()
    }));

    res.json({
      success: true,
      messages: messages,
      threadId: threadId
    });
  } catch (error) {
    console.error('Error getting thread messages:', error);
    res.status(500).json({
      error: 'Failed to get thread messages',
      message: error.message
    });
  }
});

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Chat API (Assistant)',
    openai_configured: !!OPENAI_API_KEY,
    assistant_configured: !!ASSISTANT_ID,
    active_threads: activeThreads.size,
    timestamp: new Date().toISOString()
  });
});

// Get available models (updated for Assistant API)
router.get('/models', (req, res) => {
  const models = [
    {
      id: 'openai-assistant',
      name: 'OpenAI Assistant',
      provider: 'OpenAI',
      available: !!(OPENAI_API_KEY && ASSISTANT_ID),
      type: 'assistant'
    }
  ];

  res.json({
    models: models,
    default_model: 'openai-assistant',
    assistant_id: ASSISTANT_ID
  });
});

// Cleanup old threads (run periodically)
const cleanupOldThreads = () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [threadId, threadInfo] of activeThreads.entries()) {
    if (now - threadInfo.lastUsed > maxAge) {
      activeThreads.delete(threadId);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldThreads, 60 * 60 * 1000);

module.exports = router;

