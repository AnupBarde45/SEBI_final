const express = require('express');
const { Portfolio, Trade, UserProgress } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let portfolio = await Portfolio.findOne({ where: { userId } });
    
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId,
        holdings: {},
        totalValue: 100000,
        cash: 100000
      });
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { userId, holdings, totalValue, cash } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Portfolio.upsert({
      userId,
      holdings,
      totalValue,
      cash
    });
    
    // Update user progress
    let progress = await UserProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    await progress.update({
      portfolioValue: totalValue,
      lastActive: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Portfolio update error:', error);
    res.status(500).json({ error: 'Failed to update portfolio' });
  }
});

router.post('/trade', authenticateToken, async (req, res) => {
  try {
    const { userId, symbol, type, quantity, price, totalAmount } = req.body;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trade = await Trade.create({
      userId,
      symbol,
      type,
      quantity,
      price,
      totalAmount
    });
    
    // Update user progress
    let progress = await UserProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }
    
    const allTrades = await Trade.findAll({ where: { userId } });
    
    await progress.update({
      totalTrades: allTrades.length,
      lastActive: new Date()
    });
    
    res.json({ success: true, trade });
  } catch (error) {
    console.error('Trade recording error:', error);
    res.status(500).json({ error: 'Failed to record trade' });
  }
});

router.get('/trades/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trades = await Trade.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(trades);
  } catch (error) {
    console.error('Trades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

module.exports = router;