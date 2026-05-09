const express = require('express');
const { protect } = require('../middleware/auth');
const Repository = require('../models/Repository');
const Workflow = require('../models/Workflow');
const Review = require('../models/Review');
const { Octokit } = require('@octokit/rest');

const router = express.Router();

// @route   GET /api/repositories
// @desc    Get user's registered repositories
router.get('/', protect, async (req, res) => {
  try {
    const repos = await Repository.find({ userId: req.user._id });
    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/repositories/import
// @desc    Import a new repository and setup webhook
router.post('/import', protect, async (req, res) => {
  const { fullName } = req.body; // e.g., 'username/repo'
  
  if (!fullName) {
    return res.status(400).json({ msg: 'Please provide fullName of the repository' });
  }

  try {
    // Check if already registered
    let repo = await Repository.findOne({ fullName, userId: req.user._id });
    if (repo) {
      return res.status(400).json({ msg: 'Repository already imported' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    // Validate the repo exists and user has access
    const parts = fullName.split('/');
    if (parts.length !== 2) {
      return res.status(400).json({ msg: 'Invalid repository format. Use username/repo' });
    }
    const [owner, repoName] = parts;
    const { data: githubRepo } = await octokit.repos.get({
      owner,
      repo: repoName
    });

    // Create Webhook on GitHub
    const webhookUrl = `${process.env.PUBLIC_URL || 'http://localhost:8080'}/api/webhooks/github`;
    
    // Note: To test webhooks locally, PUBLIC_URL should be an ngrok url.
    let webhookId = null;
    let webhookActive = false;
    
    try {
      const { data: hook } = await octokit.repos.createWebhook({
        owner,
        repo: repoName,
        name: 'web',
        active: true,
        events: ['pull_request'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          // secret: process.env.GITHUB_WEBHOOK_SECRET,
        }
      });
      webhookId = hook.id.toString();
      webhookActive = true;
    } catch (hookError) {
      console.warn(`[WEBHOOK_ERROR] Failed for ${fullName}: ${hookError.message}`);
    }

    // Save to database
    repo = new Repository({
      userId: req.user._id,
      githubRepoId: githubRepo.id.toString(),
      fullName: githubRepo.full_name,
      webhookActive,
      webhookId
    });

    await repo.save();

    // Create a default workflow for this repo
    const defaultNodes = [
      { id: '1', position: { x: 50, y: 50 }, data: { label: 'TRIGGER: PR Opened' }, type: 'input', style: { background: '#1A1A1A', color: 'white', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '10px' } },
      { id: '2', position: { x: 50, y: 150 }, data: { label: 'AGENT: Gemini Flash Code Review' }, style: { background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' } },
      { id: '3', position: { x: 50, y: 250 }, data: { label: 'ACTION: GitHub Comment' }, type: 'output', style: { background: '#14b8a6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px' } },
    ];
    const defaultEdges = [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1' } }, 
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#14b8a6' } }
    ];

    const workflow = new Workflow({
      userId: req.user._id,
      repositoryId: repo._id,
      nodes: defaultNodes,
      edges: defaultEdges
    });
    await workflow.save();

    res.json(repo);

  } catch (error) {
    console.error('Error importing repository:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/repositories/reviews
// @desc    Get user's recent AI reviews
router.get('/reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/repositories/stats
// @desc    Get aggregated review statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id });
    
    // Generate last 7 days activity data for chart
    const days = 7;
    const activityData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const count = reviews.filter(r => {
        const rDate = new Date(r.createdAt);
        return rDate >= d && rDate < nextD;
      }).length;

      activityData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        reviews: count
      });
    }

    const stats = {
      totalReviews: reviews.length,
      totalSuggestions: reviews.reduce((acc, r) => acc + (r.commentCount || 0), 0),
      successRate: reviews.length > 0 
        ? Math.round((reviews.filter(r => r.status === 'success').length / reviews.length) * 100) 
        : 100,
      activeRepos: await Repository.countDocuments({ userId: req.user._id }),
      activityData
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/repositories/:id
// @desc    Delete a repository
router.delete('/:id', protect, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ msg: 'Repository not found' });

    // Check ownership
    if (repo.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Optional: Delete webhook on GitHub if you want to be super clean
    // try {
    //   const octokit = new Octokit({ auth: req.user.accessToken });
    //   const [owner, repoName] = repo.fullName.split('/');
    //   // You'd need to store the webhook ID to delete it specifically
    // } catch (e) {}

    await repo.deleteOne();
    await Review.deleteMany({ repoFullName: repo.fullName, userId: req.user._id });
    
    res.json({ msg: 'Repository removed' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/repositories/:id/simulate
// @desc    Simulate a PR review for testing
router.post('/:id/simulate', protect, async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ msg: 'Repo not found' });

    const possibleFiles = ['auth.js', 'server.py', 'database.sql', 'config.yaml', 'utils.ts', 'App.jsx', 'main.go'];
    const possibleIssues = [
      { 
        title: 'Security: Critical Credential Leak', 
        priority: 'CRITICAL',
        riskScore: 92,
        debt: '1.5h',
        desc: 'Plaintext secret detected in auth.js. This violates SOC2 compliance and allows full system takeover.',
        original: 'const stripe = require("stripe")("sk_live_51M3v...");\nconst db_pass = "admin12345";',
        corrected: 'const stripe = require("stripe")(process.env.STRIPE_SECRET);\nconst db_pass = process.env.DB_PASSWORD;'
      },
      { 
        title: 'Performance: N+1 Query Problem', 
        priority: 'WARNING',
        riskScore: 65,
        debt: '2h',
        desc: 'Database queries inside a loop detected. This will cause severe latency as the user base grows.',
        original: 'for (const user of users) {\n  const posts = await db.query("SELECT * FROM posts WHERE uid=" + user.id);\n}',
        corrected: 'const uids = users.map(u => u.id);\nconst posts = await db.query("SELECT * FROM posts WHERE uid IN (?)", [uids]);'
      },
      { 
        title: 'Logic: Memory Leak Risk', 
        priority: 'WARNING',
        riskScore: 45,
        debt: '45m',
        desc: 'Event listeners are being added but never removed. This will lead to heap exhaustion in long-running processes.',
        original: 'window.addEventListener("scroll", () => {\n  handleScroll(data);\n});',
        corrected: 'useEffect(() => {\n  const onScroll = () => handleScroll(data);\n  window.addEventListener("scroll", onScroll);\n  return () => window.removeEventListener("scroll", onScroll);\n}, [data]);'
      }
    ];

    const numSuggestions = Math.floor(Math.random() * 2) + 2;
    const mockComments = [];
    
    for (let i = 0; i < numSuggestions; i++) {
      const issue = possibleIssues[Math.floor(Math.random() * possibleIssues.length)];
      mockComments.push({
        path: possibleFiles[Math.floor(Math.random() * possibleFiles.length)],
        line: Math.floor(Math.random() * 150) + 1,
        priority: issue.priority,
        title: issue.title,
        riskScore: issue.riskScore,
        debt: issue.debt,
        body: issue.desc,
        originalCode: issue.original,
        correctedCode: issue.corrected
      });
    }

    const mockReview = {
      userId: req.user._id,
      repoFullName: repo.fullName,
      pullRequestNumber: Math.floor(Math.random() * 9000) + 1000,
      commentCount: numSuggestions,
      status: 'success',
      comments: mockComments,
      securityGrade: 'B',
      technicalDebt: `${numSuggestions * 1.5}h`
    };

    const Review = require('../models/Review');
    const savedReview = await Review.create(mockReview);
    res.json({ msg: 'Simulation completed', review: savedReview });
  } catch (error) {
    res.status(500).send('Simulation Failed');
  }
});

module.exports = router;
