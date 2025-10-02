const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sebi_final',
  password: process.env.DB_PASSWORD || 'Pass@12345#',
  port: process.env.DB_PORT || 5432,
});

class DynamicRiskService {
  static async calculateRiskScore(responses) {
    try {
      // Get dynamic risk factors from database
      const factorsResult = await pool.query('SELECT * FROM "RiskFactors" WHERE is_active = true');
      const factors = factorsResult.rows;
      
      let score = 0;
      
      // Age scoring
      const age = responses.age;
      const ageFactor = factors.find(f => f.factor_type === 'age' && this.matchesAgeCondition(age, f.condition_key));
      if (ageFactor) score += ageFactor.points;
      
      // Income scoring
      const incomeFactor = factors.find(f => f.factor_type === 'income' && f.condition_key === responses.income);
      if (incomeFactor) score += incomeFactor.points;
      
      // Experience scoring
      const experienceFactor = factors.find(f => f.factor_type === 'experience' && f.condition_key === responses.experience);
      if (experienceFactor) score += experienceFactor.points;
      
      // Emergency fund scoring
      const emergencyFactor = factors.find(f => f.factor_type === 'emergency_fund' && f.condition_key === responses.emergencyFund);
      if (emergencyFactor) score += emergencyFactor.points;
      
      // Investment horizon scoring
      const horizon = responses.horizon;
      const horizonFactor = factors.find(f => f.factor_type === 'horizon' && this.matchesHorizonCondition(horizon, f.condition_key));
      if (horizonFactor) score += horizonFactor.points;
      
      // Goals scoring
      const goalsFactor = factors.find(f => f.factor_type === 'goals' && f.condition_key === responses.goals);
      if (goalsFactor) score += goalsFactor.points;
      
      // Volatility tolerance scoring
      const volatilityFactor = factors.find(f => f.factor_type === 'volatility' && f.condition_key === responses.volatilityTolerance);
      if (volatilityFactor) score += volatilityFactor.points;
      
      // Market knowledge scoring
      const knowledgeFactor = factors.find(f => f.factor_type === 'knowledge' && f.condition_key === responses.marketKnowledge);
      if (knowledgeFactor) score += knowledgeFactor.points;
      
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error calculating dynamic risk score:', error);
      // Fallback to basic calculation
      return this.fallbackRiskCalculation(responses);
    }
  }
  
  static matchesAgeCondition(age, condition) {
    switch (condition) {
      case '<=25': return age <= 25;
      case '26-35': return age >= 26 && age <= 35;
      case '36-45': return age >= 36 && age <= 45;
      case '46-55': return age >= 46 && age <= 55;
      case '>55': return age > 55;
      default: return false;
    }
  }
  
  static matchesHorizonCondition(horizon, condition) {
    switch (condition) {
      case '<2': return horizon < 2;
      case '2-5': return horizon >= 2 && horizon < 5;
      case '5-10': return horizon >= 5 && horizon < 10;
      case '10-20': return horizon >= 10 && horizon < 20;
      case '>=20': return horizon >= 20;
      default: return false;
    }
  }
  
  static async getRiskProfileType(score) {
    try {
      const profilesResult = await pool.query('SELECT * FROM "RiskProfiles" WHERE is_active = true AND $1 >= min_score AND $1 <= max_score', [score]);
      return profilesResult.rows[0] || null;
    } catch (error) {
      console.error('Error getting risk profile type:', error);
      return this.fallbackProfileType(score);
    }
  }
  
  static async calculatePortfolioMetrics(riskScore) {
    // Use fallback calculation for now to ensure metrics work
    return this.fallbackMetricsCalculation(riskScore);
  }
  
  static fallbackRiskCalculation(responses) {
    // Fallback to original hardcoded calculation
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
  
  static fallbackProfileType(score) {
    if (score <= 25) return { profile_name: 'Very Conservative', description: 'Capital preservation focused' };
    if (score <= 45) return { profile_name: 'Conservative', description: 'Stability preferred' };
    if (score <= 65) return { profile_name: 'Moderate', description: 'Balanced approach' };
    if (score <= 80) return { profile_name: 'Aggressive', description: 'Growth focused' };
    return { profile_name: 'Very Aggressive', description: 'Maximum growth potential' };
  }
  
  static fallbackMetricsCalculation(riskScore) {
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

module.exports = DynamicRiskService;