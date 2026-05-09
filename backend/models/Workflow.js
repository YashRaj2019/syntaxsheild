const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  name: { type: String, required: true, default: 'Default CI Workflow' },
  nodes: { type: Array, default: [] }, // React Flow Nodes
  edges: { type: Array, default: [] }, // React Flow Edges
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);
