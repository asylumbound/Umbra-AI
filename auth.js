const express = require('express');
const router = express.Router();
const { supabase, getUserProfile, createUserProfile } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Sign up user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });

    if (error) {
      return res.status(400).json({
        error: 'Signup failed',
        message: error.message
      });
    }

    // If user is created successfully
    if (data.user) {
      // Create user profile (this might be handled by the database trigger)
      let profile = await getUserProfile(data.user.id);
      
      if (!profile) {
        profile = await createUserProfile(data.user);
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at !== null
        },
        profile: profile,
        session: data.session
      });
    } else {
      res.status(400).json({
        error: 'Signup failed',
        message: 'Failed to create user account'
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during signup'
    });
  }
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }

    // Get user profile
    const profile = await getUserProfile(data.user.id);

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at !== null
      },
      profile: profile,
      session: data.session
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during signin'
    });
  }
});

// Sign out endpoint
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: 'Signout failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during signout'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        emailConfirmed: req.user.email_confirmed_at !== null
      },
      profile: req.profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: 'Profile update failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating profile'
    });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required for password reset'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json({
        error: 'Password reset failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during password reset'
    });
  }
});

// Update password
router.put('/password', authenticateUser, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: 'Missing password',
        message: 'New password is required'
      });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({
        error: 'Password update failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while updating password'
    });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        error: 'Token refresh failed',
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Session refreshed successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during token refresh'
    });
  }
});

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Authentication API',
    supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

