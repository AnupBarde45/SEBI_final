const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  console.log('Received request:', req.body);
  res.json({ success: true, message: 'Auth endpoint working' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});