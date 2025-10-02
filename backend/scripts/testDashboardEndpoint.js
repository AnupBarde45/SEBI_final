const express = require('express');
const { sequelize, User, RiskAggressiveness, PortfolioScore, UserProgress, Portfolio, Trade, QuizAttempt } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const app = express();

// Test the dashboard route logic
async function testDashboardRoute(userId) {
  try {
    console.log(`🔍 Testing dashboard route for userId: ${userId}`);
    
    // Get user data
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ User found: ${user.name}`);

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

    // Calculate user ranking
    const allUsers = await User.findAll({
      include: [{
        model: PortfolioScore,
        attributes: ['overallScore']
      }],
      attributes: ['id', 'name']
    });

    // Sort users by portfolio score
    const rankedUsers = allUsers
      .filter(u => u.PortfolioScore)
      .sort((a, b) => b.PortfolioScore.overallScore - a.PortfolioScore.overallScore);

    const userRank = rankedUsers.findIndex(u => u.id === userId) + 1;
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

    const result = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        ranking: {
          currentRank: userRank,
          totalUsers: totalUsers,
          percentile: totalUsers > 0 ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100) : 0
        },
        portfolioPerformance,
        riskMetrics,
        scores,
        achievements,
        recentActivity: {
          trades: recentTrades,
          quizzes: recentQuizzes
        }
      }
    };

    console.log('✅ Dashboard data generated successfully');
    console.log('📊 Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error in dashboard route:', error);
  }
}

// Test with different user IDs
async function runTests() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Get all users
    const users = await User.findAll({ limit: 5 });
    console.log(`\n📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n🧪 Testing user: ${user.name} (${user.id})`);
      await testDashboardRoute(user.id);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

runTests();



