const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'REDIS_HOST',
  'REDIS_PASSWORD'
];

/*
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar] ? process.env[envVar].trim() : '';
  if (!value) {
    console.error(`CRITICAL ERROR: Environment variable ${envVar} is missing!`);
    process.exit(1);
  }
});
*/
console.log('Environment Variables Loaded:', Object.keys(process.env).filter(k => requiredEnvVars.includes(k)));

const http = require('http');
const { Server } = require('socket.io');
const { QueueEvents } = require('bullmq');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" }
});

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

const redisOptions = {
  host: process.env.REDIS_HOST ? process.env.REDIS_HOST.trim() : '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD.trim() : undefined,
  tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes('upstash') ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null
};

// Initialize QueueEvents to listen for completions
const queueEvents = new QueueEvents('pr-reviews', { connection: redisOptions });

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`[Queue] Job ${jobId} completed. Broadcasting result...`);
  // returnvalue is what the worker returns. It should contain the repoName and userId.
  if (returnvalue) {
    const data = JSON.parse(returnvalue);
    io.emit('review-completed', data);
  }
});

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected'));
});

const path = require('path');
// ... rest of routes ...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/repositories', require('./routes/repositories'));
app.use('/api/workflows', require('./routes/workflows'));

// Health Check for Render
app.get('/api/health', (req, res) => res.status(200).json({ status: 'SyntaxShield Engine Active' }));

// Serve Frontend in Production (Updated for Express 5.0)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('(.*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Start Server
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Real-time Notifications`);
  });
}

module.exports = app;
