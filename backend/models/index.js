const sequelize = require('../config/database');
const User = require('./User');
const QuizAttempt = require('./QuizAttempt');
const Portfolio = require('./Portfolio');
const Trade = require('./Trade');
const UserProgress = require('./UserProgress');

// Define associations
User.hasMany(QuizAttempt, { foreignKey: 'userId' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Portfolio, { foreignKey: 'userId' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Trade, { foreignKey: 'userId' });
Trade.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(UserProgress, { foreignKey: 'userId' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  QuizAttempt,
  Portfolio,
  Trade,
  UserProgress
};