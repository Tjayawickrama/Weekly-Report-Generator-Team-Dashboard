const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  weekStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  weekEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hoursWorked: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.STRING(2000),
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'late'),
    defaultValue: 'draft',
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tasksCompleted: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  tasksPlanned: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  blockers: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Report;
