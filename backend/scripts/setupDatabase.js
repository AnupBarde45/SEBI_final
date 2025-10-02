const { Sequelize } = require('sequelize');
const { User, QuizAttempt, Portfolio, Trade, UserProgress, sequelize } = require('../models');

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models (create tables)
    console.log('📋 Creating/updating tables...');
    await sequelize.sync({ force: true }); // force: true will drop and recreate tables
    console.log('✅ All tables created/updated successfully');
    
    // Create sample data
    console.log('📊 Creating sample data...');
    
    // Create a sample user
    const sampleUser = await User.create({
      email: 'test@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      name: 'Test User',
      phone: '1234567890',
      age: 25
    });
    console.log('✅ Sample user created');
    
    // Create user progress
    await UserProgress.create({
      userId: sampleUser.id,
      riskScore: 65,
      riskProfileType: 'Moderate',
      riskProfileDescription: {
        description: 'You seek a balance between growth and stability.',
        allocation: '60% Stocks, 40% Bonds',
        suitableFor: 'Mid-career professionals, balanced approach'
      },
      totalQuizScore: 85,
      completedQuizzes: 3,
      totalTrades: 5,
      portfolioValue: 105000,
      badges: [
        { badgeType: 'Risk Explorer', earnedAt: new Date() },
        { badgeType: 'Quiz Master', earnedAt: new Date() }
      ]
    });
    console.log('✅ Sample user progress created');
    
    // Create sample portfolio
    await Portfolio.create({
      userId: sampleUser.id,
      holdings: {
        'AAPL': { quantity: 10, avgPrice: 150.00 },
        'GOOGL': { quantity: 5, avgPrice: 2800.00 },
        'MSFT': { quantity: 8, avgPrice: 300.00 }
      },
      totalValue: 105000,
      cash: 50000
    });
    console.log('✅ Sample portfolio created');
    
    // Create sample trades
    const trades = [
      {
        userId: sampleUser.id,
        symbol: 'AAPL',
        type: 'buy',
        quantity: 10,
        price: 150.00,
        totalAmount: 1500.00
      },
      {
        userId: sampleUser.id,
        symbol: 'GOOGL',
        type: 'buy',
        quantity: 5,
        price: 2800.00,
        totalAmount: 14000.00
      },
      {
        userId: sampleUser.id,
        symbol: 'MSFT',
        type: 'buy',
        quantity: 8,
        price: 300.00,
        totalAmount: 2400.00
      }
    ];
    
    for (const trade of trades) {
      await Trade.create(trade);
    }
    console.log('✅ Sample trades created');
    
    // Create sample quiz attempts
    const quizAttempts = [
      {
        userId: sampleUser.id,
        score: 85,
        totalQuestions: 10,
        timeSpent: 300
      },
      {
        userId: sampleUser.id,
        score: 90,
        totalQuestions: 10,
        timeSpent: 280
      },
      {
        userId: sampleUser.id,
        score: 80,
        totalQuestions: 10,
        timeSpent: 320
      }
    ];
    
    for (const attempt of quizAttempts) {
      await QuizAttempt.create(attempt);
    }
    console.log('✅ Sample quiz attempts created');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Database: final');
    console.log('   - Tables: Users, Portfolios, Trades, UserProgress, quiz_attempts');
    console.log('   - Sample data created for testing');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupDatabase();



