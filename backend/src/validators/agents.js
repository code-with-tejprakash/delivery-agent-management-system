const { body, param, query, validationResult } = require('express-validator');

const editableFields = ['fullName', 'phone', 'email', 'serviceArea', 'status'];

const createAgentRules = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2–120 characters'),
  body('phone').trim().matches(/^\+?[0-9 ()-]{7,20}$/).withMessage('Phone number must contain 7–20 valid characters'),
  body('email').trim().isEmail().withMessage('A valid email address is required').isLength({ max: 190 }),
  body('serviceArea').trim().isLength({ min: 2, max: 120 }).withMessage('Service area must be 2–120 characters'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

const updateAgentRules = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Request body must be an object');
    const supplied = Object.keys(value);
    if (!supplied.length) throw new Error('At least one field must be provided');
    const unknown = supplied.filter((key) => !editableFields.includes(key));
    if (unknown.length) throw new Error(`Unsupported field(s): ${unknown.join(', ')}`);
    return true;
  }),
  body('fullName').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Full name must be 2–120 characters'),
  body('phone').optional().trim().matches(/^\+?[0-9 ()-]{7,20}$/).withMessage('Phone number must contain 7–20 valid characters'),
  body('email').optional().trim().isEmail().withMessage('A valid email address is required'),
  body('serviceArea').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Service area must be 2–120 characters'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
];

const idRule = [param('id').isInt({ min: 1 }).withMessage('Agent ID must be a positive integer')];
const listRules = [
  query('page').optional().isInt({ min: 1, max: 100000 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive'),
  query('search').optional().isString().isLength({ max: 120 }).withMessage('search must be 120 characters or fewer')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please correct the invalid request fields',
        details: errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
      }
    });
  }
  next();
}

module.exports = { createAgentRules, updateAgentRules, idRule, listRules, validate };
