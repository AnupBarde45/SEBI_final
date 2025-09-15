const express = require('express');
const { User, QuizAttempt, sequelize } = require('../models');

const router = express.Router();

// Admin dashboard - get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: QuizAttempt,
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalQuizzes = await QuizAttempt.count();
    const avgScore = await QuizAttempt.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']]
    });
    
    res.json({
      totalUsers,
      totalQuizzes,
      avgRiskScore: Math.round(avgScore?.dataValues?.avgScore || 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;