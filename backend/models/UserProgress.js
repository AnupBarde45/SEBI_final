const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  riskScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  riskProfileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  riskProfileDescription: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  totalQuizScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedQuizzes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalTrades: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  portfolioValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 100000
  },
  badges: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_progress',
  timestamps: true
});

module.exports = UserProgress;