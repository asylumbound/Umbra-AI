const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for public operations (with RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to verify JWT token
const verifyToken = async (token) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Helper function to create user profile
const createUserProfile = async (user) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          subscription_tier: 'free',
          api_usage_count: 0,
          api_usage_limit: 100
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

// Helper function to update API usage
const updateApiUsage = async (userId, tokensUsed = 1, costCents = 0) => {
  try {
    // Record API usage
    await supabase
      .from('api_usage')
      .insert([
        {
          user_id: userId,
          endpoint: '/api/chat/completion',
          tokens_used: tokensUsed,
          cost_cents: costCents
        }
      ]);

    // Update user's total usage count
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        api_usage_count: supabase.sql`api_usage_count + ${tokensUsed}` 
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating API usage:', error);
    return false;
  }
};

// Helper function to check if user has API quota
const checkApiQuota = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;
    
    return profile.api_usage_count < profile.api_usage_limit;
  } catch (error) {
    console.error('Error checking API quota:', error);
    return false;
  }
};

// Helper function to create conversation
const createConversation = async (userId, title = 'New Conversation', threadId = null) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title: title,
          thread_id: threadId
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Helper function to get user conversations
const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

// Helper function to save message
const saveMessage = async (conversationId, userId, role, content, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          role: role,
          content: content,
          metadata: metadata
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
};

// Helper function to get conversation messages
const getConversationMessages = async (conversationId, userId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
};

// Helper function to update conversation
const updateConversation = async (conversationId, userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return null;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  verifyToken,
  getUserProfile,
  createUserProfile,
  updateApiUsage,
  checkApiQuota,
  createConversation,
  getUserConversations,
  saveMessage,
  getConversationMessages,
  updateConversation
};

