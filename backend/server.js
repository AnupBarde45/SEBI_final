const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

// Import database and models
const { sequelize, User, QuizAttempt, Portfolio, Trade, UserProgress } = require('./models');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const quizRoutes = require('./routes/quiz');
const portfolioRoutes = require('./routes/portfolio');
const userProgressRoutes = require('./routes/userProgress');
const dashboardRoutes = require('./routes/dashboard');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces

app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/progress', userProgressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/config', require('./routes/dynamicConfig'));

// Admin API endpoints for web dashboard
const { Pool } = require('pg');
const adminPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sebi_final',
  password: process.env.DB_PASSWORD || 'Pass@12345#',
  port: process.env.DB_PORT || 5432,
});

// Badge types endpoint for frontend
app.get('/api/config/badge-types', async (req, res) => {
  try {
    const badges = await adminPool.query('SELECT * FROM "BadgeTypes" WHERE is_active = true ORDER BY min_value');
    res.json(badges.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alpha Vantage stock data endpoint
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query;
    const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    
    const functionMap = {
      '1min': 'TIME_SERIES_INTRADAY&interval=1min',
      '5min': 'TIME_SERIES_INTRADAY&interval=5min',
      '15min': 'TIME_SERIES_INTRADAY&interval=15min',
      '30min': 'TIME_SERIES_INTRADAY&interval=30min',
      '60min': 'TIME_SERIES_INTRADAY&interval=60min',
      'daily': 'TIME_SERIES_DAILY',
      'weekly': 'TIME_SERIES_WEEKLY',
      'monthly': 'TIME_SERIES_MONTHLY'
    };
    
    const func = functionMap[interval] || 'TIME_SERIES_DAILY';
    const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock analysis chatbot endpoint (separate from RAG)
app.post('/api/stock-analysis', async (req, res) => {
  try {
    const { message, stockData, symbol, timeRange } = req.body;
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a stock market analyst. Analyze this stock chart data and answer the user's question.

Stock: ${symbol}
Time Range: ${timeRange}
Stock Data: ${JSON.stringify(stockData)}

User Question: ${message}

Provide a clear, educational analysis focusing on trends, patterns, and what the data means for investors. Keep it concise and actionable.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ answer: text });
  } catch (error) {
    console.error('Stock analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze stock data' });
  }
});

// Initialize badge types if empty
app.post('/api/admin/init-badges', async (req, res) => {
  try {
    const existing = await adminPool.query('SELECT COUNT(*) FROM "BadgeTypes"');
    if (existing.rows[0].count > 0) {
      return res.json({ message: 'Badge types already exist' });
    }
    
    const badges = [
      { name: 'Conservative Investor', icon: '🛡️', color: '#27ae60', min: 0, max: 45, desc: 'Risk Score: 0-45 (Conservative approach)' },
      { name: 'Balanced Investor', icon: '⚖️', color: '#f39c12', min: 46, max: 65, desc: 'Risk Score: 46-65 (Moderate approach)' },
      { name: 'Aggressive Investor', icon: '🚀', color: '#e74c3c', min: 66, max: 80, desc: 'Risk Score: 66-80 (High risk tolerance)' },
      { name: 'Very Aggressive Investor', icon: '💎', color: '#9b59b6', min: 81, max: 100, desc: 'Risk Score: 81-100 (Maximum risk tolerance)' }
    ];
    
    for (const badge of badges) {
      await adminPool.query(
        'INSERT INTO "BadgeTypes" (badge_name, badge_icon, badge_color, criteria_type, min_value, max_value, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [badge.name, badge.icon, badge.color, 'risk_score', badge.min, badge.max, badge.desc]
      );
    }
    
    res.json({ message: 'Badge types initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await adminPool.query('SELECT COUNT(*) FROM "Users"');
    const totalQuizzes = await adminPool.query('SELECT COUNT(*) FROM "QuizAttempts"');
    const totalTrades = await adminPool.query('SELECT COUNT(*) FROM "Trades"');
    const avgRiskScore = await adminPool.query('SELECT COALESCE(AVG("riskScore"), 0) FROM "UserProgresses" WHERE "riskScore" > 0');
    
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalQuizzes: parseInt(totalQuizzes.rows[0].count),
      totalTrades: parseInt(totalTrades.rows[0].count),
      avgRiskScore: Math.round(avgRiskScore.rows[0].coalesce || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Risk factors management
app.get('/api/admin/risk-factors', async (req, res) => {
  try {
    const factors = await adminPool.query('SELECT * FROM "RiskFactors" WHERE is_active = true ORDER BY factor_type, points DESC');
    res.json(factors.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/risk-factors', async (req, res) => {
  try {
    const { factor_name, factor_type, condition_key, condition_label, points } = req.body;
    const result = await adminPool.query(
      'INSERT INTO "RiskFactors" (factor_name, factor_type, condition_key, condition_label, points) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [factor_name, factor_type, condition_key, condition_label, points]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/risk-factors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { factor_name, factor_type, condition_key, condition_label, points } = req.body;
    const result = await adminPool.query(
      'UPDATE "RiskFactors" SET factor_name = $1, factor_type = $2, condition_key = $3, condition_label = $4, points = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [factor_name, factor_type, condition_key, condition_label, points, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/risk-profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_name, min_score, max_score, description, allocation_stocks, allocation_bonds, suitable_for } = req.body;
    const result = await adminPool.query(
      'UPDATE "RiskProfiles" SET profile_name = $1, min_score = $2, max_score = $3, description = $4, allocation_stocks = $5, allocation_bonds = $6, suitable_for = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [profile_name, min_score, max_score, description, allocation_stocks, allocation_bonds, suitable_for, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Risk profiles
app.get('/api/admin/risk-profiles', async (req, res) => {
  try {
    const profiles = await adminPool.query('SELECT * FROM "RiskProfiles" WHERE is_active = true ORDER BY min_score');
    res.json(profiles.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quiz questions
app.get('/api/admin/quiz-questions', async (req, res) => {
  try {
    const questions = await adminPool.query(`
      SELECT q.*, array_agg(
        json_build_object(
          'id', o.id,
          'option_text', o.option_text,
          'is_correct', o.is_correct
        ) ORDER BY o.id
      ) as options
      FROM "QuizQuestions" q
      LEFT JOIN "QuizOptions" o ON q.id = o.question_id
      WHERE q.is_active = true
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `);
    res.json(questions.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/quiz-questions', async (req, res) => {
  try {
    const { question, explanation, category, difficulty_level, options } = req.body;
    
    const questionResult = await adminPool.query(
      'INSERT INTO "QuizQuestions" (question, explanation, category, difficulty_level) VALUES ($1, $2, $3, $4) RETURNING *',
      [question, explanation, category || 'general', difficulty_level || 'medium']
    );
    
    const questionId = questionResult.rows[0].id;
    
    for (const option of options) {
      await adminPool.query(
        'INSERT INTO "QuizOptions" (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
        [questionId, option.option_text, option.is_correct]
      );
    }
    
    res.json({ success: true, question: questionResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/quiz-questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE request received for question ID:', id);
    
    // Delete options first (due to foreign key constraint)
    await adminPool.query('DELETE FROM "QuizOptions" WHERE question_id = $1', [id]);
    
    // Delete the question
    const result = await adminPool.query('DELETE FROM "QuizQuestions" WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    console.log('Question deleted successfully:', result.rows[0]);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete error in backend:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quiz settings
app.get('/api/admin/quiz-settings', async (req, res) => {
  try {
    const settings = await adminPool.query('SELECT * FROM "QuizSettings" ORDER BY setting_name');
    res.json(settings.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/quiz-settings/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { setting_value } = req.body;
    const result = await adminPool.query(
      'UPDATE "QuizSettings" SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_name = $2 RETURNING *',
      [setting_value, name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trading tips
app.get('/api/admin/trading-tips', async (req, res) => {
  try {
    const tips = await adminPool.query('SELECT * FROM "TradingTips" WHERE is_active = true ORDER BY trade_action, scenario_type');
    res.json(tips.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/trading-tips', async (req, res) => {
  try {
    const { tip_code, trade_action, scenario_type, tip_message } = req.body;
    const result = await adminPool.query(
      'INSERT INTO "TradingTips" (tip_code, trade_action, scenario_type, tip_message) VALUES ($1, $2, $3, $4) RETURNING *',
      [tip_code, trade_action, scenario_type, tip_message]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trading rules
app.get('/api/admin/trading-rules', async (req, res) => {
  try {
    const rules = await adminPool.query('SELECT * FROM "TradingRules" WHERE is_active = true ORDER BY rule_type, threshold_value');
    res.json(rules.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/trading-rules', async (req, res) => {
  try {
    const { rule_name, rule_type, threshold_value, comparison_operator, trigger_message } = req.body;
    const result = await adminPool.query(
      'INSERT INTO "TradingRules" (rule_name, rule_type, threshold_value, comparison_operator, trigger_message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rule_name, rule_type, threshold_value, comparison_operator, trigger_message]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/trading-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminPool.query('DELETE FROM "TradingRules" WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Badge types
app.get('/api/admin/badge-types', async (req, res) => {
  try {
    const badges = await adminPool.query('SELECT * FROM "BadgeTypes" WHERE is_active = true ORDER BY min_value');
    res.json(badges.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/badge-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { min_value, max_value, description } = req.body;
    const result = await adminPool.query(
      'UPDATE "BadgeTypes" SET min_value = $1, max_value = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [min_value, max_value, description, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock case studies
app.get('/api/admin/stock-cases', async (req, res) => {
  try {
    const cases = await adminPool.query('SELECT * FROM "StockCaseStudies" WHERE is_active = true ORDER BY symbol');
    res.json(cases.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/stock-cases', async (req, res) => {
  try {
    const { symbol, base_price, event_name, scenario_type, start_date, volatility_factor, trend_direction } = req.body;
    const result = await adminPool.query(
      'INSERT INTO "StockCaseStudies" (symbol, base_price, event_name, scenario_type, start_date, volatility_factor, trend_direction) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [symbol, base_price, event_name, scenario_type, start_date, volatility_factor || 1.0, trend_direction || 'neutral']
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tutorials management
app.get('/api/admin/tutorials', async (req, res) => {
  try {
    const tutorials = await adminPool.query(`
      SELECT t.*, 
        array_agg(
          json_build_object(
            'id', tc.id,
            'heading', tc.heading,
            'body', tc.body,
            'order_index', tc.order_index
          ) ORDER BY tc.order_index
        ) as content
      FROM "Tutorials" t
      LEFT JOIN "TutorialContent" tc ON t.id = tc.tutorial_id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.level, t.id
    `);
    res.json(tutorials.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/tutorials', async (req, res) => {
  try {
    const { level, title, video_embed_id, content } = req.body;
    const tutorialResult = await adminPool.query(
      'INSERT INTO "Tutorials" (level, title, video_embed_id) VALUES ($1, $2, $3) RETURNING *',
      [level, title, video_embed_id]
    );
    
    const tutorialId = tutorialResult.rows[0].id;
    
    if (content && content.length > 0) {
      for (let i = 0; i < content.length; i++) {
        await adminPool.query(
          'INSERT INTO "TutorialContent" (tutorial_id, heading, body, order_index) VALUES ($1, $2, $3, $4)',
          [tutorialId, content[i].heading, content[i].body, i]
        );
      }
    }
    
    res.json({ success: true, tutorial: tutorialResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/tutorials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminPool.query('DELETE FROM "Tutorials" WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await adminPool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.age, u."createdAt", u."updatedAt",
             up."riskScore", up."riskProfileType", up.badges,
             COUNT(qa.id) as quiz_attempts,
             COUNT(t.id) as total_trades,
             p."totalValue" as portfolio_value
      FROM "Users" u
      LEFT JOIN "UserProgresses" up ON u.id = up."userId"
      LEFT JOIN "QuizAttempts" qa ON u.id = qa."userId"
      LEFT JOIN "Trades" t ON u.id = t."userId"
      LEFT JOIN "Portfolios" p ON u.id = p."userId"
      GROUP BY u.id, up."riskScore", up."riskProfileType", up.badges, p."totalValue"
      ORDER BY u."createdAt" DESC
    `);
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await adminPool.query(`
      SELECT u.*, up."riskScore", up."riskProfileType", up.badges, up."lastActive",
             p.holdings, p."totalValue", p.cash
      FROM "Users" u
      LEFT JOIN "UserProgresses" up ON u.id = up."userId"
      LEFT JOIN "Portfolios" p ON u.id = p."userId"
      WHERE u.id = $1
    `, [id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const trades = await adminPool.query(`
      SELECT * FROM "Trades" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10
    `, [id]);
    
    const quizAttempts = await adminPool.query(`
      SELECT * FROM "QuizAttempts" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5
    `, [id]);
    
    res.json({
      user: user.rows[0],
      recentTrades: trades.rows,
      recentQuizzes: quizAttempts.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, age } = req.body;
    const result = await adminPool.query(
      'UPDATE "Users" SET name = $1, email = $2, phone = $3, age = $4, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, email, phone, age, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password || 'defaultpass123', 10);
    
    const result = await adminPool.query(
      'INSERT INTO "Users" (name, email, password, phone, age) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, phone, age]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminPool.query('DELETE FROM "Users" WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/leaderboard', async (req, res) => {
  try {
    const leaderboard = await adminPool.query(`
      SELECT u.id, u.name, u.email,
             up."riskScore",
             COUNT(qa.id) as quiz_count,
             AVG(qa.score) as avg_quiz_score,
             p."totalValue" as portfolio_value,
             COALESCE(array_length(up.badges, 1), 0) as badge_count
      FROM "Users" u
      LEFT JOIN "UserProgresses" up ON u.id = up."userId"
      LEFT JOIN "QuizAttempts" qa ON u.id = qa."userId"
      LEFT JOIN "Portfolios" p ON u.id = p."userId"
      GROUP BY u.id, u.name, u.email, up."riskScore", p."totalValue", up.badges
      ORDER BY 
        COALESCE(AVG(qa.score), 0) * 0.4 + 
        COALESCE(p."totalValue", 100000) / 1000 * 0.3 + 
        COALESCE(array_length(up.badges, 1), 0) * 10 * 0.3 DESC
      LIMIT 50
    `);
    res.json(leaderboard.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Portfolio settings
app.get('/api/admin/portfolio-settings', async (req, res) => {
  try {
    const settings = await adminPool.query('SELECT * FROM "PortfolioSettings" ORDER BY setting_name');
    res.json(settings.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/portfolio-settings/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { setting_value, setting_formula } = req.body;
    const result = await adminPool.query(
      'UPDATE "PortfolioSettings" SET setting_value = $1, setting_formula = $2, updated_at = CURRENT_TIMESTAMP WHERE setting_name = $3 RETURNING *',
      [setting_value, setting_formula, name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use(express.static('public'));

// Test endpoint for risk calculation (no auth required)
app.post('/api/risk/test-calculation', async (req, res) => {
  try {
    const { responses } = req.body;
    const riskScore = await calculateRiskScore(responses);
    const profileType = await getRiskProfileType(riskScore);
    const profileDescription = getRiskProfileDescription(profileType, riskScore);
    const metrics = await calculatePortfolioMetrics(riskScore);
    
    res.json({ 
      success: true, 
      riskScore,
      profileType,
      profileDescription,
      metrics,
      responses
    });
  } catch (error) {
    console.error('Test risk calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate risk score', details: error.message });
  }
});

// Risk Assessment Routes with proper user isolation
app.post('/api/risk/quiz', authenticateToken, async (req, res) => {
  try {
    const { responses } = req.body;
    const userId = req.user.userId;
    
    const riskScore = await calculateRiskScore(responses);
    const profileType = await getRiskProfileType(riskScore);
    const profileDescription = getRiskProfileDescription(profileType, riskScore);
    
    // Update user progress
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
    
    // Award badge
    const badges = progress.badges || [];
    const existingBadge = badges.find(b => b.badgeType === 'Risk Explorer');
    if (!existingBadge) {
      badges.push({ badgeType: 'Risk Explorer', earnedAt: new Date() });
      await progress.update({ badges });
    }
    
    res.json({ 
      success: true, 
      profile: {
        userId,
        riskScore,
        profileType,
        profileDescription,
        responses,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Risk quiz error:', error);
    res.status(500).json({ error: 'Failed to process risk assessment' });
  }
});

app.get('/api/risk/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress || !progress.riskScore) {
      return res.json(null);
    }
    
    res.json({
      userId,
      riskScore: progress.riskScore,
      profileType: progress.riskProfileType,
      profileDescription: progress.riskProfileDescription,
      createdAt: progress.updatedAt
    });
  } catch (error) {
    console.error('Risk profile error:', error);
    res.status(500).json({ error: 'Failed to fetch risk profile' });
  }
});

app.get('/api/risk/metrics/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress || !progress.riskScore) {
      return res.json(null);
    }
    
    const metrics = await calculatePortfolioMetrics(progress.riskScore);
    res.json(metrics);
  } catch (error) {
    console.error('Risk metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch risk metrics' });
  }
});

app.post('/api/risk/simulate', authenticateToken, async (req, res) => {
  try {
    const { marketChange } = req.body;
    const userId = req.user.userId;
    
    const progress = await UserProgress.findOne({ where: { userId } });
    
    if (!progress || !progress.riskScore) {
      return res.status(400).json({ error: 'Risk profile not found' });
    }
    
    const portfolioChange = simulatePortfolioChange(progress.riskScore, marketChange);
    
    // Award badge
    const badges = progress.badges || [];
    const existingBadge = badges.find(b => b.badgeType === 'Risk Forecaster');
    if (!existingBadge) {
      badges.push({ badgeType: 'Risk Forecaster', earnedAt: new Date() });
      await progress.update({ badges });
    }
    
    res.json({ portfolioChange, marketChange });
  } catch (error) {
    console.error('Risk simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate risk' });
  }
});

app.get('/api/risk/badges/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const progress = await UserProgress.findOne({ where: { userId } });
    
    const badges = progress ? progress.badges || [] : [];
    res.json(badges);
  } catch (error) {
    console.error('Badges error:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Dynamic Risk Calculation using database factors
async function calculateRiskScore(responses) {
  try {
    const DynamicRiskService = require('./services/dynamicRiskService');
    return await DynamicRiskService.calculateRiskScore(responses);
  } catch (error) {
    console.error('Dynamic risk calculation failed, using fallback:', error);
    return fallbackRiskCalculation(responses);
  }
}

// Fallback calculation if dynamic service fails
function fallbackRiskCalculation(responses) {
  const { age, income, experience, emergencyFund, horizon, goals, volatilityTolerance, marketKnowledge } = responses;
  let score = 0;
  
  if (age <= 25) score += 15;
  else if (age <= 35) score += 13;
  else if (age <= 45) score += 10;
  else if (age <= 55) score += 7;
  else score += 4;
  
  const incomeScores = { 'very_stable': 15, 'stable': 12, 'variable': 9, 'irregular': 6 };
  score += incomeScores[income] || 6;
  
  const experienceScores = { 'experienced': 10, 'moderate': 8, 'some': 6, 'beginner': 4 };
  score += experienceScores[experience] || 4;
  
  const emergencyScores = { 'excellent': 10, 'good': 8, 'basic': 5, 'none': 2 };
  score += emergencyScores[emergencyFund] || 2;
  
  if (horizon >= 20) score += 20;
  else if (horizon >= 10) score += 16;
  else if (horizon >= 5) score += 12;
  else if (horizon >= 2) score += 8;
  else score += 4;
  
  const goalScores = { 'growth': 10, 'balanced': 8, 'income': 6, 'preservation': 4 };
  score += goalScores[goals] || 6;
  
  const volatilityScores = { 'very_high': 15, 'high': 12, 'medium': 9, 'low': 6, 'very_low': 3 };
  score += volatilityScores[volatilityTolerance] || 6;
  
  const knowledgeScores = { 'excellent': 5, 'good': 4, 'basic': 3, 'limited': 2 };
  score += knowledgeScores[marketKnowledge] || 2;
  
  return Math.min(100, Math.max(0, score));
}

async function getRiskProfileType(score) {
  try {
    const DynamicRiskService = require('./services/dynamicRiskService');
    const profile = await DynamicRiskService.getRiskProfileType(score);
    return profile ? profile.profile_name : 'Moderate';
  } catch (error) {
    console.error('Dynamic profile type failed, using fallback:', error);
    if (score <= 25) return 'Very Conservative';
    if (score <= 45) return 'Conservative';
    if (score <= 65) return 'Moderate';
    if (score <= 80) return 'Aggressive';
    return 'Very Aggressive';
  }
}

function getRiskProfileDescription(profileType, score) {
  const descriptions = {
    'Very Conservative': {
      description: 'You prioritize capital preservation above all else. You prefer guaranteed returns and are uncomfortable with any possibility of loss.',
      allocation: '10% Stocks, 90% Bonds/Cash',
      suitableFor: 'Near retirement, emergency funds, short-term goals'
    },
    'Conservative': {
      description: 'You prefer stability and are willing to accept lower returns to minimize risk. You can handle small fluctuations but want to protect your principal.',
      allocation: '30% Stocks, 70% Bonds',
      suitableFor: 'Pre-retirement, risk-averse investors, medium-term goals'
    },
    'Moderate': {
      description: 'You seek a balance between growth and stability. You can handle moderate volatility for potentially better long-term returns.',
      allocation: '60% Stocks, 40% Bonds',
      suitableFor: 'Mid-career professionals, balanced approach, 5-15 year goals'
    },
    'Aggressive': {
      description: 'You are comfortable with significant volatility in pursuit of higher returns. You can handle substantial short-term losses for long-term growth.',
      allocation: '80% Stocks, 20% Bonds',
      suitableFor: 'Young investors, long-term goals, experienced investors'
    },
    'Very Aggressive': {
      description: 'You are willing to accept high volatility and potential significant losses for the possibility of maximum returns. You have a long investment horizon.',
      allocation: '95% Stocks, 5% Bonds',
      suitableFor: 'Very young investors, 20+ year goals, high risk tolerance'
    }
  };
  
  return descriptions[profileType] || descriptions['Moderate'];
}

async function calculatePortfolioMetrics(riskScore) {
  try {
    const DynamicRiskService = require('./services/dynamicRiskService');
    return await DynamicRiskService.calculatePortfolioMetrics(riskScore);
  } catch (error) {
    console.error('Dynamic metrics calculation failed, using fallback:', error);
    const volatility = (riskScore / 100) * 0.30 + 0.04;
    const beta = (riskScore / 100) * 1.6 + 0.2;
    const expectedReturn = (riskScore / 100) * 0.08 + 0.03;
    const sharpeRatio = Math.max(0.1, (expectedReturn - 0.02) / volatility);
    const var95 = volatility * 1.645 * 100000 / Math.sqrt(252);
    const maxDrawdown = volatility * 2.5;
    
    return {
      volatility: Math.round(volatility * 10000) / 100,
      beta: Math.round(beta * 100) / 100,
      expectedReturn: Math.round(expectedReturn * 10000) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      var95: Math.round(var95),
      maxDrawdown: Math.round(maxDrawdown * 100) / 100
    };
  }
}

function simulatePortfolioChange(riskScore, marketChange) {
  const beta = (riskScore / 100) * 1.5 + 0.3;
  return Math.round(marketChange * beta * 100) / 100;
}

// RAG Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Chat endpoint called with:', req.body);
    const { message, topK = 15 } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      // Import RAG Manager
      const RAGManager = require('./services/ragManager');
      const ragManager = new RAGManager();
      
      // Initialize if not already done
      if (!ragManager.initialized) {
        console.log('Initializing RAG Manager...');
        await ragManager.initialize();
      }

      // Query the RAG system
      console.log('Querying RAG system...');
      const result = await ragManager.queryDocuments(message, topK);
      
      res.json({
        success: true,
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        query: message,
        timestamp: new Date().toISOString()
      });
      
    } catch (ragError) {
      console.error('RAG system error:', ragError);
      // Fallback to simple response if RAG fails
      res.json({
        success: true,
        answer: `You asked: "${message}". I'm your SEBI assistant, but I'm still learning about the documents. Please add some PDF files to the data/pdfs folder so I can help you better!`,
        sources: [],
        confidence: 0.5,
        query: message,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process your question. Please try again.',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const RAGManager = require('./services/ragManager');
    const ragManager = new RAGManager();
    
    if (!ragManager.initialized) {
      await ragManager.initialize();
    }
    
    const status = await ragManager.getStatus();
    
    res.json({
      status: 'healthy',
      initialized: status.initialized,
      collection: status.collection,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Collection info endpoint
app.get('/api/collection-info', async (req, res) => {
  try {
    const RAGManager = require('./services/ragManager');
    const ragManager = new RAGManager();
    
    if (!ragManager.initialized) {
      await ragManager.initialize();
    }
    
    const collectionInfo = await ragManager.getCollectionInfo();
    
    res.json(collectionInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized successfully.');
    
    app.listen(PORT, HOST, () => {
      console.log(`SEBI Backend running on http://${HOST}:${PORT}`);
      console.log('Database: PostgreSQL');
      console.log('Ready to accept connections...');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();