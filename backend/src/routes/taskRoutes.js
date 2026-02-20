const express = require('express');
const { body, param } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

router.get('/', protect, getTasks);
router.post('/', protect, taskValidation, createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, taskValidation, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
