const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get(`
    SELECT u.*, p.risk_score, p.risk_profile, p.total_quiz_score, 
           p.completed_quizzes, p.virtual_balance, p.virtual_portfolio, p.badges
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse JSON fields
    user.virtual_portfolio = JSON.parse(user.virtual_portfolio || '{}');
    user.badges = JSON.parse(user.badges || '[]');

    res.json(user);
  });
});

// Update user profile
router.put('/', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { name, phone, age } = req.body;

  db.run(
    'UPDATE users SET name = ?, phone = ?, age = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, phone, age, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Update risk profile
router.post('/risk', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { riskScore, riskProfile } = req.body;

  db.run(
    'UPDATE user_profiles SET risk_score = ?, risk_profile = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [riskScore, riskProfile, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update risk profile' });
      }

      res.json({ message: 'Risk profile updated successfully' });
    }
  );
});

// Update quiz progress
router.post('/quiz', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { score } = req.body;

  db.run(
    'UPDATE user_profiles SET total_quiz_score = total_quiz_score + ?, completed_quizzes = completed_quizzes + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [score, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update quiz progress' });
      }

      res.json({ message: 'Quiz progress updated successfully' });
    }
  );
});

// Update virtual portfolio
router.post('/portfolio', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { balance, portfolio } = req.body;

  db.run(
    'UPDATE user_profiles SET virtual_balance = ?, virtual_portfolio = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [balance, JSON.stringify(portfolio), userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update portfolio' });
      }

      res.json({ message: 'Portfolio updated successfully' });
    }
  );
});

module.exports = router;