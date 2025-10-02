const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RiskAggressiveness = sequelize.define('RiskAggressiveness', {
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
  riskLevel: {
    type: DataTypes.ENUM('Very Conservative', 'Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'),
    allowNull: false
  },
  aggressivenessScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    }
  },
  riskTolerance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.50
  },
  maxDrawdown: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.20
  },
  volatilityPreference: {
    type: DataTypes.ENUM('Very Low', 'Low', 'Medium', 'High', 'Very High'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  investmentHorizon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5 // years
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'risk_aggressiveness',
  timestamps: true
});

module.exports = RiskAggressiveness;



