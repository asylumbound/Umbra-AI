const express = require('express');
const router = express.Router();
const { 
  createConversation, 
  getUserConversations, 
  getConversationMessages,
  updateConversation,
  saveMessage 
} = require('../config/supabase');
const { authenticateUser, rateLimitByTier } = require('../middleware/auth');

// Get all user conversations
router.get('/', authenticateUser, async (req, res) => {
  try {
    const conversations = await getUserConversations(req.user.id);
    
    res.json({
      success: true,
      conversations: conversations,
      count: conversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      message: 'An error occurred while fetching your conversations'
    });
  }
});

// Create new conversation
router.post('/', authenticateUser, rateLimitByTier, async (req, res) => {
  try {
    const { title, threadId } = req.body;
    const userId = req.user.id;

    const conversation = await createConversation(
      userId, 
      title || 'New Conversation', 
      threadId
    );

    if (!conversation) {
      return res.status(500).json({
        error: 'Failed to create conversation',
        message: 'An error occurred while creating the conversation'
      });
    }

    res.status(201).json({
      success: true,
      conversation: conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Failed to create conversation',
      message: 'An error occurred while creating the conversation'
    });
  }
});

// Get specific conversation
router.get('/:conversationId', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist or you do not have access to it'
      });
    }

    // Get conversation messages
    const messages = await getConversationMessages(conversationId, userId);

    res.json({
      success: true,
      conversation: conversation,
      messages: messages,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation',
      message: 'An error occurred while fetching the conversation'
    });
  }
});

// Update conversation (title, archive status, etc.)
router.put('/:conversationId', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title, isArchived } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (isArchived !== undefined) updates.is_archived = isArchived;

    const updatedConversation = await updateConversation(conversationId, userId, updates);

    if (!updatedConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      conversation: updatedConversation,
      message: 'Conversation updated successfully'
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({
      error: 'Failed to update conversation',
      message: 'An error occurred while updating the conversation'
    });
  }
});

// Delete conversation (archive it)
router.delete('/:conversationId', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const updatedConversation = await updateConversation(conversationId, userId, {
      is_archived: true
    });

    if (!updatedConversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      error: 'Failed to archive conversation',
      message: 'An error occurred while archiving the conversation'
    });
  }
});

// Add message to conversation
router.post('/:conversationId/messages', authenticateUser, rateLimitByTier, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { role, content, metadata } = req.body;
    const userId = req.user.id;

    if (!role || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Role and content are required'
      });
    }

    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist or you do not have access to it'
      });
    }

    const message = await saveMessage(conversationId, userId, role, content, metadata || {});

    if (!message) {
      return res.status(500).json({
        error: 'Failed to save message',
        message: 'An error occurred while saving the message'
      });
    }

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      error: 'Failed to save message',
      message: 'An error occurred while saving the message'
    });
  }
});

// Get conversation messages
router.get('/:conversationId/messages', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist or you do not have access to it'
      });
    }

    const messages = await getConversationMessages(conversationId, userId);

    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: 'An error occurred while fetching the messages'
    });
  }
});

// Health check for conversations service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Conversations API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

