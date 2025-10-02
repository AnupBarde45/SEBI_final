const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Use the same database connection as main backend
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sebi_final',
  password: process.env.DB_PASSWORD || 'Pass@12345#',
  port: process.env.DB_PORT || 5432,
});

// Get dynamic risk factors for scoring
router.get('/risk-factors', async (req, res) => {
  try {
    const factors = await pool.query('SELECT * FROM "RiskFactors" WHERE is_active = true');
    res.json(factors.rows);
  } catch (error) {
    console.error('Error fetching risk factors:', error);
    res.status(500).json({ error: 'Failed to fetch risk factors' });
  }
});

// Get dynamic quiz questions
router.get('/quiz-questions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const questions = await pool.query(`
      SELECT q.*, array_agg(
        json_build_object(
          'text', o.option_text,
          'isCorrect', o.is_correct
        ) ORDER BY o.id
      ) as options
      FROM "QuizQuestions" q
      LEFT JOIN "QuizOptions" o ON q.id = o.question_id
      WHERE q.is_active = true
      GROUP BY q.id
      ORDER BY RANDOM()
      LIMIT $1
    `, [limit]);
    res.json(questions.rows);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

// Get quiz settings
router.get('/quiz-settings', async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM "QuizSettings"');
    const settingsObj = {};
    settings.rows.forEach(setting => {
      settingsObj[setting.setting_name] = setting.setting_value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching quiz settings:', error);
    res.status(500).json({ error: 'Failed to fetch quiz settings' });
  }
});

// Get dynamic guru tips
router.get('/guru-tips', async (req, res) => {
  try {
    const tips = await pool.query('SELECT * FROM "GuruTips" WHERE is_active = true');
    res.json(tips.rows);
  } catch (error) {
    console.error('Error fetching guru tips:', error);
    res.status(500).json({ error: 'Failed to fetch guru tips' });
  }
});

module.exports = router;