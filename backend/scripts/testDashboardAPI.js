const { sequelize, User, RiskAggressiveness, PortfolioScore, UserProgress, Portfolio, Trade, QuizAttempt } = require('../models');

async function testDashboardAPI() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Test with the first user who has data
    const userId = 'bef2e804-3ae2-4289-814e-c10d6fcdcfdb';
    
    console.log(`\n🔍 Testing dashboard API for user: ${userId}`);

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
    console.log(`✅ Risk Aggressiveness:`, riskAggressiveness ? 'Found' : 'Not found');

    // Get portfolio score data
    const portfolioScore = await PortfolioScore.findOne({ 
      where: { userId },
      attributes: ['overallScore', 'diversificationScore', 'riskAdjustedReturn', 'volatilityScore', 'performanceScore', 'consistencyScore', 'totalReturn', 'sharpeRatio', 'maxDrawdown']
    });
    console.log(`✅ Portfolio Score:`, portfolioScore ? 'Found' : 'Not found');

    // Get user progress data
    const userProgress = await UserProgress.findOne({ 
      where: { userId },
      attributes: ['riskScore', 'riskProfileType', 'totalQuizScore', 'completedQuizzes', 'totalTrades', 'portfolioValue', 'badges']
    });
    console.log(`✅ User Progress:`, userProgress ? 'Found' : 'Not found');

    // Calculate user ranking
    const allUsers = await User.findAll({
      include: [{
        model: PortfolioScore,
        attributes: ['overallScore']
      }],
      attributes: ['id', 'name']
    });

    const rankedUsers = allUsers
      .filter(u => u.PortfolioScore)
      .sort((a, b) => b.PortfolioScore.overallScore - a.PortfolioScore.overallScore);

    const userRank = rankedUsers.findIndex(u => u.id === userId) + 1;
    const totalUsers = rankedUsers.length;

    console.log(`✅ Ranking: ${userRank} out of ${totalUsers}`);

    // Test the complete dashboard data structure
    const dashboardData = {
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
      riskMetrics: {
        riskLevel: riskAggressiveness?.riskLevel || 'Moderate',
        aggressivenessScore: riskAggressiveness?.aggressivenessScore || 50,
        riskTolerance: riskAggressiveness?.riskTolerance || 0.50,
        maxDrawdown: riskAggressiveness?.maxDrawdown || 0.20,
        volatilityPreference: riskAggressiveness?.volatilityPreference || 'Medium',
        investmentHorizon: riskAggressiveness?.investmentHorizon || 5
      },
      scores: {
        overall: portfolioScore?.overallScore || 0,
        diversification: portfolioScore?.diversificationScore || 0,
        performance: portfolioScore?.performanceScore || 0,
        volatility: portfolioScore?.volatilityScore || 0,
        consistency: portfolioScore?.consistencyScore || 0,
        riskAdjustedReturn: portfolioScore?.riskAdjustedReturn || 0
      },
      portfolioPerformance: {
        totalValue: 0,
        cash: 0,
        investedAmount: 0,
        totalReturn: portfolioScore?.totalReturn || 0,
        sharpeRatio: portfolioScore?.sharpeRatio || 0,
        maxDrawdown: portfolioScore?.maxDrawdown || 0
      },
      achievements: {
        totalQuizzes: userProgress?.completedQuizzes || 0,
        totalTrades: userProgress?.totalTrades || 0,
        badges: userProgress?.badges || [],
        riskProfile: userProgress?.riskProfileType || 'Not Assessed'
      }
    };

    console.log('\n📊 Dashboard Data Structure:');
    console.log(JSON.stringify(dashboardData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDashboardAPI();



