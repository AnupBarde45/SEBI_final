const express = require('express');
const { User, RiskAggressiveness, PortfolioScore, UserProgress, Portfolio, Trade, QuizAttempt } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const GeminiMotivationService = require('../services/geminiMotivationService');

const router = express.Router();

// Test endpoint without authentication (for debugging)
router.get('/test/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('🧪 Test endpoint called for userId:', userId);
    
    // Get user data
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get risk aggressiveness data
    const riskAggressiveness = await RiskAggressiveness.findOne({ 
      where: { userId },
      attributes: ['riskLevel', 'aggressivenessScore', 'riskTolerance', 'maxDrawdown', 'volatilityPreference', 'investmentHorizon']
    });

    // Get portfolio score data
    const portfolioScore = await PortfolioScore.findOne({ 
      where: { userId },
      attributes: ['overallScore', 'diversificationScore', 'riskAdjustedReturn', 'volatilityScore', 'performanceScore', 'consistencyScore', 'totalReturn', 'sharpeRatio', 'maxDrawdown']
    });

    res.json({
      success: true,
      userId: userId,
      user: user.name,
      hasRiskData: !!riskAggressiveness,
      hasPortfolioData: !!portfolioScore,
      riskData: riskAggressiveness,
      portfolioData: portfolioScore
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch test data' });
  }
});

// Get dashboard data for a user
router.get('/dashboard/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user data
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get risk aggressiveness data
    const riskAggressiveness = await RiskAggressiveness.findOne({ 
      where: { userId },
      attributes: ['riskLevel', 'aggressivenessScore', 'riskTolerance', 'maxDrawdown', 'volatilityPreference', 'investmentHorizon']
    });

    // Get portfolio score data
    const portfolioScore = await PortfolioScore.findOne({ 
      where: { userId },
      attributes: ['overallScore', 'diversificationScore', 'riskAdjustedReturn', 'volatilityScore', 'performanceScore', 'consistencyScore', 'totalReturn', 'sharpeRatio', 'maxDrawdown']
    });

    // Get user progress data
    const userProgress = await UserProgress.findOne({ 
      where: { userId },
      attributes: ['riskScore', 'riskProfileType', 'totalQuizScore', 'completedQuizzes', 'totalTrades', 'portfolioValue', 'badges']
    });

    // Get portfolio data
    const portfolio = await Portfolio.findOne({ 
      where: { userId },
      attributes: ['totalValue', 'cash', 'holdings']
    });

    // Get recent trades
    const recentTrades = await Trade.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['symbol', 'type', 'quantity', 'price', 'totalAmount', 'createdAt']
    });

    // Get recent quiz attempts
    const recentQuizzes = await QuizAttempt.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 3,
      attributes: ['score', 'totalQuestions', 'timeSpent', 'createdAt']
    });

    // Calculate user ranking based on quiz scores - same as leaderboard
    const allQuizzes = await QuizAttempt.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name']
      }],
      order: [['score', 'DESC']],
      attributes: ['userId', 'score']
    });

    // Get unique users with their highest score
    const userScores = new Map();
    allQuizzes.forEach(quiz => {
      if (!userScores.has(quiz.userId) || userScores.get(quiz.userId).score < quiz.score) {
        userScores.set(quiz.userId, {
          userId: quiz.userId,
          score: quiz.score
        });
      }
    });

    const rankedUsers = Array.from(userScores.values())
      .sort((a, b) => b.score - a.score);

    const userRank = rankedUsers.findIndex(u => u.userId == userId) + 1;
    const totalUsers = rankedUsers.length;

    // Calculate portfolio performance metrics
    const portfolioPerformance = {
      totalValue: portfolio?.totalValue || 0,
      cash: portfolio?.cash || 0,
      investedAmount: (portfolio?.totalValue || 0) - (portfolio?.cash || 0),
      totalReturn: portfolioScore?.totalReturn || 0,
      sharpeRatio: portfolioScore?.sharpeRatio || 0,
      maxDrawdown: portfolioScore?.maxDrawdown || 0
    };

    // Calculate risk metrics
    const riskMetrics = {
      riskLevel: riskAggressiveness?.riskLevel || 'Moderate',
      aggressivenessScore: riskAggressiveness?.aggressivenessScore || 50,
      riskTolerance: riskAggressiveness?.riskTolerance || 0.50,
      maxDrawdown: riskAggressiveness?.maxDrawdown || 0.20,
      volatilityPreference: riskAggressiveness?.volatilityPreference || 'Medium',
      investmentHorizon: riskAggressiveness?.investmentHorizon || 5
    };

    // Calculate portfolio scores
    const scores = {
      overall: portfolioScore?.overallScore || 0,
      diversification: portfolioScore?.diversificationScore || 0,
      performance: portfolioScore?.performanceScore || 0,
      volatility: portfolioScore?.volatilityScore || 0,
      consistency: portfolioScore?.consistencyScore || 0,
      riskAdjustedReturn: portfolioScore?.riskAdjustedReturn || 0
    };

    // Calculate achievements
    const achievements = {
      totalQuizzes: userProgress?.completedQuizzes || 0,
      totalTrades: userProgress?.totalTrades || 0,
      badges: userProgress?.badges || [],
      riskProfile: userProgress?.riskProfileType || 'Not Assessed'
    };

    // Prepare dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      ranking: {
        currentRank: userRank > 0 ? userRank : null,
        totalUsers: totalUsers,
        percentile: totalUsers > 0 && userRank > 0 ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100) : 0
      },
      portfolioPerformance,
      riskMetrics,
      scores,
      achievements,
      recentActivity: {
        trades: recentTrades,
        quizzes: recentQuizzes
      }
    };

    // Generate motivational message using Gemini API
    try {
      const geminiService = new GeminiMotivationService();
      const motivationalMessage = await geminiService.generateMotivationalMessage(dashboardData);
      dashboardData.motivationalMessage = motivationalMessage;
    } catch (error) {
      console.error('Error generating motivational message:', error);
      // Fallback message if Gemini fails
      dashboardData.motivationalMessage = `Keep up the great work! ${userRank > 0 ? `You're ranked #${userRank} out of ${totalUsers} players.` : 'Take a quiz to get ranked!'}`;
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await User.findAll({
      include: [{
        model: PortfolioScore,
        attributes: ['overallScore', 'totalReturn', 'sharpeRatio']
      }],
      attributes: ['id', 'name'],
      order: [[PortfolioScore, 'overallScore', 'DESC']],
      limit: parseInt(limit)
    });

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      score: user.PortfolioScore?.overallScore || 0,
      totalReturn: user.PortfolioScore?.totalReturn || 0,
      sharpeRatio: user.PortfolioScore?.sharpeRatio || 0
    }));

    res.json({
      success: true,
      data: formattedLeaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Update portfolio score (for when trades are made)
router.post('/update-portfolio-score/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { overallScore, diversificationScore, performanceScore, volatilityScore, consistencyScore, totalReturn, sharpeRatio, maxDrawdown } = req.body;

    const [portfolioScore, created] = await PortfolioScore.upsert({
      userId,
      overallScore: overallScore || 0,
      diversificationScore: diversificationScore || 0,
      performanceScore: performanceScore || 0,
      volatilityScore: volatilityScore || 0,
      consistencyScore: consistencyScore || 0,
      riskAdjustedReturn: (totalReturn || 0) / (volatilityScore || 1),
      totalReturn: totalReturn || 0,
      sharpeRatio: sharpeRatio || 0,
      maxDrawdown: maxDrawdown || 0,
      lastCalculated: new Date()
    });

    res.json({
      success: true,
      data: portfolioScore
    });

  } catch (error) {
    console.error('Update portfolio score error:', error);
    res.status(500).json({ error: 'Failed to update portfolio score' });
  }
});

// Update risk aggressiveness
router.post('/update-risk-aggressiveness/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { riskLevel, aggressivenessScore, riskTolerance, maxDrawdown, volatilityPreference, investmentHorizon } = req.body;

    const [riskAggressiveness, created] = await RiskAggressiveness.upsert({
      userId,
      riskLevel: riskLevel || 'Moderate',
      aggressivenessScore: aggressivenessScore || 50,
      riskTolerance: riskTolerance || 0.50,
      maxDrawdown: maxDrawdown || 0.20,
      volatilityPreference: volatilityPreference || 'Medium',
      investmentHorizon: investmentHorizon || 5,
      lastUpdated: new Date()
    });

    res.json({
      success: true,
      data: riskAggressiveness
    });

  } catch (error) {
    console.error('Update risk aggressiveness error:', error);
    res.status(500).json({ error: 'Failed to update risk aggressiveness' });
  }
});

module.exports = router;
