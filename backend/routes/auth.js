const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/auth/github
// @desc    Redirect to GitHub OAuth
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user`;
  res.redirect(githubAuthUrl);
});

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth Callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // 1. Get Access Token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. Get User Profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, login, avatar_url } = userResponse.data;

    // 3. Find or Create User in DB
    let user = await User.findOne({ githubId: id.toString() });

    if (!user) {
      user = await User.create({
        githubId: id.toString(),
        username: login,
        avatar: avatar_url,
        accessToken, 
      });
    } else {
      // Update token if returning user
      user.accessToken = accessToken;
      user.avatar = avatar_url;
      await user.save();
    }

    // 4. Generate JWT for our frontend
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
  } catch (error) {
    console.error('OAuth Error:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error`);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
