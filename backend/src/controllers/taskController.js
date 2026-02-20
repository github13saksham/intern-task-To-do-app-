const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Task = require('../models/Task');

// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { q, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = { UserId: req.user.id };

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      filter.status = status;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority;
    }

    if (q && q.trim()) {
      filter[Op.or] = [
        { title: { [Op.like]: `%${q.trim()}%` } },
        { description: { [Op.like]: `%${q.trim()}%` } },
      ];
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const validSortFields = ['createdAt', 'dueDate', 'priority', 'status', 'title'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const tasks = await Task.findAll({
      where: filter,
      order: [[orderField, sortOrder]],
    });

    const stats = {
      total: await Task.count({ where: { UserId: req.user.id } }),
      todo: await Task.count({ where: { UserId: req.user.id, status: 'todo' } }),
      inProgress: await Task.count({ where: { UserId: req.user.id, status: 'in-progress' } }),
      done: await Task.count({ where: { UserId: req.user.id, status: 'done' } }),
    };

    res.json({ success: true, count: tasks.length, tasks, stats });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @route   POST /api/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      UserId: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const task = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    res.json({ success: true, message: 'Task updated.', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await task.destroy();

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// @route   GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, UserId: req.user.id } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTask };
