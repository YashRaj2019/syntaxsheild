const express = require('express');
const crypto = require('crypto');
const { Queue } = require('bullmq');
const Repository = require('../models/Repository');

const router = express.Router();

const redisOptions = {
  host: process.env.REDIS_HOST ? process.env.REDIS_HOST.trim() : '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim() : undefined,
  tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes('upstash') ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null
};

// Initialize BullMQ Queue
const reviewQueue = new Queue('pr-reviews', { connection: redisOptions });

// Middleware to verify GitHub Webhook Signature
const verifyGitHubSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[Webhook] Warning: GITHUB_WEBHOOK_SECRET not set. Skipping signature verification.');
    return next();
  }

  if (!signature) {
    return res.status(401).send('No signature provided');
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }

  next();
};

// @route   POST /api/webhooks/github
// @desc    Receive GitHub Events
router.post('/github', verifyGitHubSignature, async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  // Acknowledge receipt quickly to prevent GitHub timeout
  res.status(202).send('Accepted');

  // We only care about Pull Request events (opened or synchronize)
  if (event === 'pull_request') {
    const action = payload.action;
    
    if (action === 'opened' || action === 'synchronize') {
      const repoFullName = payload.repository.full_name;
      const pullRequestNumber = payload.pull_request.number;
      const owner = payload.repository.owner.login;
      const repoName = payload.repository.name;

      // Verify repo is registered in our DB and webhook is active
      const repoRecord = await Repository.findOne({ fullName: repoFullName, webhookActive: true });
      
      if (repoRecord) {
        // Enqueue job for background processing
        console.log(`[Webhook] PR #${pullRequestNumber} event detected on ${repoFullName}. Queuing job...`);
        await reviewQueue.add('review-pr', {
          repoFullName,
          owner,
          repoName,
          pullRequestNumber,
          userId: repoRecord.userId
        });
      }
    }
  }
});

module.exports = router;
