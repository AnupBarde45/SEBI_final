const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define('Portfolio', {
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
  holdings: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 100000
  },
  cash: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 100000
  }
}, {
  tableName: 'Portfolios',
  timestamps: true
});

module.exports = Portfolio;