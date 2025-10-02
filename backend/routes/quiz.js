const express = require('express');
const { QuizAttempt, User, UserProgress } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { score, totalQuestions, timeSpent } = req.body;
    const userId = req.user.userId;
    
    const attempt = await QuizAttempt.create({
      userId,
      score,
      totalQuestions,
      timeSpent
    });
    
    // Update user progress
    let progress = await UserProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    const allAttempts = await QuizAttempt.findAll({ where: { userId } });
    const totalQuizScore = allAttempts.reduce((sum, att) => sum + att.score, 0);
    
    await progress.update({
      totalQuizScore,
      completedQuizzes: allAttempts.length,
      lastActive: new Date()
    });
    
    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    // Get all quiz attempts with user info
    const allQuizzes = await QuizAttempt.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['score', 'DESC']],
      attributes: ['userId', 'score']
    });

    // Get unique users with their highest score
    const userScores = new Map();
    allQuizzes.forEach(quiz => {
      if (!userScores.has(quiz.userId) || userScores.get(quiz.userId).latestScore < quiz.score) {
        userScores.set(quiz.userId, {
          userId: quiz.userId,
          User: quiz.User,
          latestScore: quiz.score,
          completedQuizzes: 1,
          totalTrades: 0
        });
      }
    });

    const leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.latestScore - a.latestScore)
      .slice(0, 10);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const history = await QuizAttempt.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(history);
  } catch (error) {
    console.error('Quiz history error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

module.exports = router;