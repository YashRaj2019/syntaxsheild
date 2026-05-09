const express = require('express');
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');

const router = express.Router();

// @route   GET /api/workflows/:repoId
// @desc    Get workflow for a specific repository
router.get('/:repoId', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ repositoryId: req.params.repoId, userId: req.user._id });
    if (!workflow) {
      return res.status(404).json({ msg: 'Workflow not found for this repository' });
    }
    res.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/workflows/:repoId
// @desc    Update workflow nodes and edges
router.put('/:repoId', protect, async (req, res) => {
  const { nodes, edges } = req.body;

  try {
    let workflow = await Workflow.findOne({ repositoryId: req.params.repoId, userId: req.user._id });
    
    if (!workflow) {
      return res.status(404).json({ msg: 'Workflow not found for this repository' });
    }

    workflow.nodes = nodes;
    workflow.edges = edges;
    await workflow.save();

    res.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
