const { sequelize, User, RiskAggressiveness, PortfolioScore } = require('../models');

async function checkData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const users = await User.findAll({ limit: 5 });
    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.id})`);
      
      const risk = await RiskAggressiveness.findOne({ where: { userId: user.id } });
      const portfolio = await PortfolioScore.findOne({ where: { userId: user.id } });
      
      console.log(`   Risk Aggressiveness: ${risk ? '✅' : '❌'}`);
      if (risk) {
        console.log(`     - Risk Level: ${risk.riskLevel}`);
        console.log(`     - Score: ${risk.aggressivenessScore}`);
      }
      
      console.log(`   Portfolio Score: ${portfolio ? '✅' : '❌'}`);
      if (portfolio) {
        console.log(`     - Overall Score: ${portfolio.overallScore}`);
        console.log(`     - Total Return: ${portfolio.totalReturn}`);
      }
    }

    // Check total counts
    const totalRisk = await RiskAggressiveness.count();
    const totalPortfolio = await PortfolioScore.count();
    console.log(`\n📈 Total Records:`);
    console.log(`   Risk Aggressiveness: ${totalRisk}`);
    console.log(`   Portfolio Scores: ${totalPortfolio}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkData();



