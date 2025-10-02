const { User, RiskAggressiveness, PortfolioScore, sequelize } = require('../models');

async function addNewTables() {
  try {
    console.log('🗄️  Adding new tables...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync new models (create tables)
    console.log('📋 Creating new tables...');
    await sequelize.sync({ alter: true }); // alter: true will add new tables without dropping existing ones
    console.log('✅ New tables created successfully');
    
    // Create sample data for existing users
    console.log('📊 Creating sample data for new tables...');
    
    // Get all existing users
    const users = await User.findAll();
    console.log(`Found ${users.length} existing users`);
    
    for (const user of users) {
      // Create Risk Aggressiveness data
      const existingRiskAgg = await RiskAggressiveness.findOne({ where: { userId: user.id } });
      if (!existingRiskAgg) {
        await RiskAggressiveness.create({
          userId: user.id,
          riskLevel: 'Moderate',
          aggressivenessScore: Math.floor(Math.random() * 40) + 30, // 30-70
          riskTolerance: 0.50 + (Math.random() * 0.3), // 0.50-0.80
          maxDrawdown: 0.15 + (Math.random() * 0.15), // 0.15-0.30
          volatilityPreference: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          investmentHorizon: Math.floor(Math.random() * 10) + 3 // 3-12 years
        });
        console.log(`✅ Risk Aggressiveness created for user: ${user.name}`);
      }
      
      // Create Portfolio Score data
      const existingPortfolioScore = await PortfolioScore.findOne({ where: { userId: user.id } });
      if (!existingPortfolioScore) {
        await PortfolioScore.create({
          userId: user.id,
          overallScore: Math.floor(Math.random() * 30) + 60, // 60-90
          diversificationScore: Math.floor(Math.random() * 25) + 65, // 65-90
          riskAdjustedReturn: 0.08 + (Math.random() * 0.12), // 0.08-0.20
          volatilityScore: Math.floor(Math.random() * 20) + 70, // 70-90
          performanceScore: Math.floor(Math.random() * 25) + 65, // 65-90
          consistencyScore: Math.floor(Math.random() * 20) + 70, // 70-90
          totalReturn: (Math.random() * 20) + 5, // 5-25%
          sharpeRatio: 0.5 + (Math.random() * 1.0), // 0.5-1.5
          maxDrawdown: -(Math.random() * 15) - 5 // -5% to -20%
        });
        console.log(`✅ Portfolio Score created for user: ${user.name}`);
      }
    }
    
    console.log('\n🎉 New tables setup completed successfully!');
    console.log('📊 Summary:');
    console.log('   - risk_aggressiveness table created');
    console.log('   - portfolio_scores table created');
    console.log('   - Sample data created for all existing users');
    
  } catch (error) {
    console.error('❌ New tables setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the setup
addNewTables();



