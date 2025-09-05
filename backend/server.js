const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory storage for demo
let riskProfiles = [];
let portfolioMetrics = [];
let userBadges = [];

// Risk Assessment Routes
app.post('/api/risk/quiz', (req, res) => {
  const { userId, responses } = req.body;
  
  // Calculate risk score
  const riskScore = calculateRiskScore(responses);
  const profileType = getRiskProfileType(riskScore);
  
  const profileDescription = getRiskProfileDescription(profileType, riskScore);
  
  const profile = {
    userId,
    riskScore,
    profileType,
    profileDescription,
    responses,
    createdAt: new Date()
  };
  
  riskProfiles = riskProfiles.filter(p => p.userId !== userId);
  riskProfiles.push(profile);
  
  // Award badge
  awardBadge(userId, 'Risk Explorer');
  
  res.json({ success: true, profile });
});

app.get('/api/risk/profile/:userId', (req, res) => {
  const profile = riskProfiles.find(p => p.userId === req.params.userId);
  res.json(profile || null);
});

app.get('/api/risk/metrics/:userId', (req, res) => {
  const profile = riskProfiles.find(p => p.userId === req.params.userId);
  if (!profile) return res.json(null);
  
  const metrics = calculatePortfolioMetrics(profile.riskScore);
  res.json(metrics);
});

app.post('/api/risk/simulate', (req, res) => {
  const { userId, marketChange } = req.body;
  const profile = riskProfiles.find(p => p.userId === userId);
  
  if (!profile) return res.json({ error: 'Profile not found' });
  
  const portfolioChange = simulatePortfolioChange(profile.riskScore, marketChange);
  
  // Award badge
  awardBadge(userId, 'Risk Forecaster');
  
  res.json({ portfolioChange, marketChange });
});

app.get('/api/risk/badges/:userId', (req, res) => {
  const badges = userBadges.filter(b => b.userId === req.params.userId);
  res.json(badges);
});

// Enhanced Risk Calculation Functions
function calculateRiskScore(responses) {
  const { age, income, experience, emergencyFund, horizon, goals, volatilityTolerance, marketKnowledge } = responses;
  
  let score = 0;
  
  // Age scoring (15% weight)
  if (age <= 25) score += 15;
  else if (age <= 35) score += 13;
  else if (age <= 45) score += 10;
  else if (age <= 55) score += 7;
  else score += 4;
  
  // Income stability (15% weight)
  const incomeScores = {
    'very_stable': 15,
    'stable': 12,
    'variable': 9,
    'irregular': 6
  };
  score += incomeScores[income] || 6;
  
  // Investment experience (10% weight)
  const experienceScores = {
    'experienced': 10,
    'moderate': 8,
    'some': 6,
    'beginner': 4
  };
  score += experienceScores[experience] || 4;
  
  // Emergency fund (10% weight)
  const emergencyScores = {
    'excellent': 10,
    'good': 8,
    'basic': 5,
    'none': 2
  };
  score += emergencyScores[emergencyFund] || 2;
  
  // Investment horizon (20% weight)
  if (horizon >= 20) score += 20;
  else if (horizon >= 10) score += 16;
  else if (horizon >= 5) score += 12;
  else if (horizon >= 2) score += 8;
  else score += 4;
  
  // Investment goals (10% weight)
  const goalScores = {
    'growth': 10,
    'balanced': 8,
    'income': 6,
    'preservation': 4
  };
  score += goalScores[goals] || 6;
  
  // Volatility tolerance (15% weight)
  const volatilityScores = {
    'very_high': 15,
    'high': 12,
    'medium': 9,
    'low': 6,
    'very_low': 3
  };
  score += volatilityScores[volatilityTolerance] || 6;
  
  // Market knowledge (5% weight)
  const knowledgeScores = {
    'excellent': 5,
    'good': 4,
    'basic': 3,
    'limited': 2
  };
  score += knowledgeScores[marketKnowledge] || 2;
  
  return Math.min(100, Math.max(0, score));
}

function getRiskProfileType(score) {
  if (score <= 25) return 'Very Conservative';
  if (score <= 45) return 'Conservative';
  if (score <= 65) return 'Moderate';
  if (score <= 80) return 'Aggressive';
  return 'Very Aggressive';
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

function calculatePortfolioMetrics(riskScore) {
  // More sophisticated calculations based on risk score
  const volatility = (riskScore / 100) * 0.30 + 0.04; // 4-34%
  const beta = (riskScore / 100) * 1.6 + 0.2; // 0.2-1.8
  const expectedReturn = (riskScore / 100) * 0.08 + 0.03; // 3-11%
  const sharpeRatio = Math.max(0.1, (expectedReturn - 0.02) / volatility); // Risk-free rate 2%
  const var95 = volatility * 1.645 * 100000 / Math.sqrt(252); // Assuming ₹1,00,000 portfolio, daily VaR
  const maxDrawdown = volatility * 2.5; // Estimated maximum drawdown
  
  return {
    volatility: Math.round(volatility * 10000) / 100,
    beta: Math.round(beta * 100) / 100,
    expectedReturn: Math.round(expectedReturn * 10000) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    var95: Math.round(var95),
    maxDrawdown: Math.round(maxDrawdown * 100) / 100
  };
}

function simulatePortfolioChange(riskScore, marketChange) {
  const beta = (riskScore / 100) * 1.5 + 0.3;
  return Math.round(marketChange * beta * 100) / 100;
}

function awardBadge(userId, badgeType) {
  const existing = userBadges.find(b => b.userId === userId && b.badgeType === badgeType);
  if (!existing) {
    userBadges.push({
      userId,
      badgeType,
      earnedAt: new Date()
    });
  }
}

app.listen(PORT, () => {
  console.log(`Risk Assessment Backend running on port ${PORT}`);
});