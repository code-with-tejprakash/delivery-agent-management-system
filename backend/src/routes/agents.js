const express = require('express');
const {
  listAgents, getAgent, createAgent, updateAgent, deleteAgent, getStats
} = require('../controllers/agents');
const {
  createAgentRules, updateAgentRules, idRule, listRules, validate
} = require('../validators/agents');

const router = express.Router();

router.get('/', listRules, validate, listAgents);
router.get('/stats', getStats);
router.get('/:id', idRule, validate, getAgent);
router.post('/', createAgentRules, validate, createAgent);
router.put('/:id', idRule, updateAgentRules, validate, updateAgent);
router.patch('/:id', idRule, updateAgentRules, validate, updateAgent);
router.delete('/:id', idRule, validate, deleteAgent);

module.exports = router;
