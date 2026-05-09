const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoFullName: { type: String, required: true },
  pullRequestNumber: { type: Number, required: true },
  commentCount: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  comments: [{
    path: String,
    line: Number,
    priority: String,
    riskScore: Number,
    title: String,
    body: String,
    originalCode: String,
    correctedCode: String
  }],
  securityGrade: String,
  technicalDebt: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
