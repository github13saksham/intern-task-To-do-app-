const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User'); // Import User model to define relation

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Task title is required' },
        len: { args: [1, 100], msg: 'Title cannot exceed 100 characters' },
      },
    },
    description: {
      type: DataTypes.STRING(500),
      defaultValue: '',
      validate: {
        len: { args: [0, 500], msg: 'Description cannot exceed 500 characters' },
      },
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: 'todo',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ['UserId', 'createdAt'] },
      { fields: ['UserId', 'status'] },
    ],
  }
);

// Define associations
User.hasMany(Task, {
  foreignKey: { name: 'UserId', allowNull: false },
  onDelete: 'CASCADE',
});
Task.belongsTo(User, { foreignKey: 'UserId' });

module.exports = Task;
