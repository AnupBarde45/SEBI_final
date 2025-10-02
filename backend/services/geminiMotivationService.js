const axios = require('axios');
const settings = require('../config/settings');

class GeminiMotivationService {
  constructor() {
    this.apiKey = settings.gemini.apiKey;
    this.apiUrl = settings.gemini.apiUrl;
  }

  async generateMotivationalMessage(userData) {
    try {
      if (!this.apiKey) {
        return this.getFallbackMessage(userData);
      }

      const prompt = this.createPrompt(userData);
      
      const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      });

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        return generatedText.trim();
      } else {
        return this.getFallbackMessage(userData);
      }

    } catch (error) {
      console.error('Gemini API error:', error.message);
      return this.getFallbackMessage(userData);
    }
  }

  createPrompt(userData) {
    const {
      ranking,
      achievements,
      portfolioPerformance,
      riskMetrics,
      scores
    } = userData;

    const rank = ranking?.currentRank || 'N/A';
    const totalUsers = ranking?.totalUsers || 0;
    const percentile = ranking?.percentile || 0;
    const quizzes = achievements?.totalQuizzes || 0;
    const trades = achievements?.totalTrades || 0;
    const badges = achievements?.badges?.length || 0;
    const totalReturn = portfolioPerformance?.totalReturn || 0;
    const riskLevel = riskMetrics?.riskLevel || 'Moderate';
    const overallScore = scores?.overall || 0;

    return `You are a financial advisor and motivational coach. Generate a personalized, encouraging message for a user based on their performance data. Keep it concise (2-3 sentences), professional yet inspiring, and use financial terminology.

User Performance Data:
- Ranking: ${rank} out of ${totalUsers} players (Top ${percentile}%)
- Quizzes Completed: ${quizzes}
- Trades Made: ${trades}
- Badges Earned: ${badges}
- Portfolio Return: ${totalReturn}%
- Risk Profile: ${riskLevel}
- Overall Score: ${overallScore}/100

Generate a motivational message that:
1. Acknowledges their current performance
2. Provides encouragement or advice based on their data
3. Uses appropriate financial language
4. Is positive and motivating

Message:`;
  }

  getFallbackMessage(userData) {
    const {
      ranking,
      achievements,
      portfolioPerformance
    } = userData;

    const rank = ranking?.currentRank || 'N/A';
    const percentile = ranking?.percentile || 0;
    const quizzes = achievements?.totalQuizzes || 0;
    const trades = achievements?.totalTrades || 0;
    const totalReturn = portfolioPerformance?.totalReturn || 0;

    if (percentile >= 80) {
      return `Outstanding performance! You're in the top ${percentile}% of players with ${totalReturn}% returns. Your ${quizzes} quiz completions and ${trades} trades show excellent market engagement. Keep up the exceptional work!`;
    } else if (percentile >= 60) {
      return `Great progress! You're performing well in the top ${percentile}% with solid ${totalReturn}% returns. Your ${quizzes} quizzes and ${trades} trades demonstrate good market understanding. Continue building your financial expertise!`;
    } else if (percentile >= 40) {
      return `Good foundation! You're in the top ${percentile}% with ${totalReturn}% returns. With ${quizzes} quizzes completed and ${trades} trades, you're on the right track. Focus on consistent learning and strategic trading.`;
    } else {
      return `Keep learning! You've completed ${quizzes} quizzes and made ${trades} trades. Every expert was once a beginner. Focus on understanding market fundamentals and building your investment strategy.`;
    }
  }
}

module.exports = GeminiMotivationService;



