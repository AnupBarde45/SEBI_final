const express = require('express');
const { User, UserProgress, QuizAttempt, Portfolio, Trade } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get or create user progress
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    let progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    // Update with latest data
    const quizAttempts = await QuizAttempt.findAll({ where: { userId } });
    const trades = await Trade.findAll({ where: { userId } });
    const portfolio = await Portfolio.findOne({ where: { userId } });
    
    const totalQuizScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const completedQuizzes = quizAttempts.length;
    const totalTrades = trades.length;
    const portfolioValue = portfolio ? portfolio.totalValue : 100000;
    
    await progress.update({
      totalQuizScore,
      completedQuizzes,
      totalTrades,
      portfolioValue,
      lastActive: new Date()
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Update risk profile
router.post('/:userId/risk', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { riskScore, profileType, profileDescription } = req.body;
    
    let progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    await progress.update({
      riskScore,
      riskProfileType: profileType,
      riskProfileDescription: profileDescription,
      lastActive: new Date()
    });
    
    res.json({ success: true, progress });
  } catch (error) {
    console.error('Error updating risk profile:', error);
    res.status(500).json({ error: 'Failed to update risk profile' });
  }
});

// Add badge
router.post('/:userId/badge', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { badgeType } = req.body;
    
    let progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    const badges = progress.badges || [];
    const existingBadge = badges.find(b => b.badgeType === badgeType);
    
    if (!existingBadge) {
      badges.push({
        badgeType,
        earnedAt: new Date()
      });
      
      await progress.update({ badges });
    }
    
    res.json({ success: true, badges });
  } catch (error) {
    console.error('Error adding badge:', error);
    res.status(500).json({ error: 'Failed to add badge' });
  }
});

module.exports = router;