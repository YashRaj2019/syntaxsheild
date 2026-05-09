const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  accessToken: { type: String }, // Encrypted preferred in prod
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
