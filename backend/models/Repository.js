const mongoose = require('mongoose');

const RepositorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  githubRepoId: { type: String, required: true },
  fullName: { type: String, required: true }, // e.g., "username/repo"
  webhookActive: { type: Boolean, default: false },
  webhookId: { type: String }, // ID returned from GitHub after creating webhook
}, { timestamps: true });

module.exports = mongoose.model('Repository', RepositorySchema);
