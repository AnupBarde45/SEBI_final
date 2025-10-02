const { sequelize, User, RiskAggressiveness, PortfolioScore, UserProgress } = require('../models');

async function testDashboard() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Get all users to see which one you might be logged in as
    const users = await User.findAll({ 
      attributes: ['id', 'name', 'email'],
      limit: 5 
    });
    
    console.log('\n👥 Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // Test with the first user
    const testUserId = users[0]?.id;
    if (!testUserId) {
      console.log('❌ No users found');
      return;
    }

    console.log(`\n🧪 Testing dashboard for: ${users[0].name}`);

    // Check if user has data in new tables
    const riskData = await RiskAggressiveness.findOne({ where: { userId: testUserId } });
    const portfolioData = await PortfolioScore.findOne({ where: { userId: testUserId } });
    const progressData = await UserProgress.findOne({ where: { userId: testUserId } });

    console.log('📊 Data availability:');
    console.log(`   Risk Aggressiveness: ${riskData ? '✅' : '❌'}`);
    console.log(`   Portfolio Score: ${portfolioData ? '✅' : '❌'}`);
    console.log(`   User Progress: ${progressData ? '✅' : '❌'}`);

    if (riskData) {
      console.log(`   Risk Level: ${riskData.riskLevel}`);
      console.log(`   Aggressiveness Score: ${riskData.aggressivenessScore}`);
    }

    if (portfolioData) {
      console.log(`   Overall Score: ${portfolioData.overallScore}`);
      console.log(`   Total Return: ${portfolioData.totalReturn}`);
    }

    if (progressData) {
      console.log(`   Quizzes: ${progressData.completedQuizzes}`);
      console.log(`   Trades: ${progressData.totalTrades}`);
    }

    // Test ranking calculation
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

    const userRank = rankedUsers.findIndex(u => u.id === testUserId) + 1;
    const totalUsers = rankedUsers.length;

    console.log(`\n🏆 Ranking calculation:`);
    console.log(`   User Rank: ${userRank}`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Percentile: ${totalUsers > 0 ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100) : 0}%`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDashboard();



