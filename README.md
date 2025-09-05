# Risk Assessment Module

A complete Risk Assessment application with React Native Expo frontend and Node.js backend.

## 🔹 Features

### 1. Risk Profiling Quiz
- Multi-step questionnaire covering age, income, investment horizon, and volatility tolerance
- Scoring algorithm that calculates risk score (0-100)
- Automatic profile classification (Conservative/Moderate/Aggressive)

### 2. Risk Score Calculator
- Weighted scoring system with 25% weight for each factor
- Visual gauge display with color coding
- Real-time score calculation and profile updates

### 3. Risk Metrics Dashboard
- **Volatility**: Annual price fluctuation percentage
- **Beta**: Market sensitivity coefficient
- **Sharpe Ratio**: Risk-adjusted return measure
- **VaR (Value at Risk)**: Maximum potential loss at 95% confidence

### 4. Scenario Simulator
- Interactive slider for market change simulation (-50% to +50%)
- Real-time portfolio impact calculation
- Visual feedback with color-coded results

### 5. Gamification System
- **Risk Explorer**: Complete the quiz
- **Risk Forecaster**: Use scenario simulator
- **Risk Analyst**: Multiple dashboard visits

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI
- Android Studio/Xcode (for device testing)

### Installation

1. **Install all dependencies:**
```bash
npm run install-all
```

2. **Start the backend:**
```bash
cd backend
npm run dev
```

3. **Start the frontend (new terminal):**
```bash
cd frontend
npm start
```

4. **Run on device:**
- Scan QR code with Expo Go app
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

## 📱 App Flow

1. **Home Screen** → Choose your action
2. **Risk Quiz** → Answer 4 questions to get your profile
3. **Dashboard** → View your risk metrics and profile
4. **Simulator** → Test market scenarios
5. **Badges** → Track your achievements

## 🔧 Technical Stack

**Frontend:**
- React Native with Expo
- React Navigation for routing
- SVG for custom gauge visualization
- Axios for API communication

**Backend:**
- Node.js with Express
- In-memory storage (easily replaceable with database)
- RESTful API design
- CORS enabled for cross-origin requests

## 📊 Risk Calculation Formulas

### Risk Score Calculation:
```javascript
// Age Factor (25% weight)
age <= 30: +25 points
age <= 40: +20 points  
age <= 50: +15 points
age > 50: +10 points

// Income Stability (25% weight)
stable: +20 points
variable: +15 points
irregular: +10 points

// Investment Horizon (25% weight)
>= 10 years: +25 points
>= 5 years: +20 points
>= 2 years: +15 points
< 2 years: +10 points

// Volatility Tolerance (25% weight)
high: +25 points
medium: +15 points
low: +5 points

Final Score = Sum of all factors (max 100)
```

### Portfolio Metrics:
```javascript
// Volatility (Annual Standard Deviation)
volatility = (riskScore / 100) * 0.25 + 0.05  // 5-30%

// Beta (Market Sensitivity)
beta = (riskScore / 100) * 1.5 + 0.3  // 0.3-1.8

// Sharpe Ratio (Risk-Adjusted Return)
sharpeRatio = max(0.1, 1.5 - (volatility * 2))

// VaR 95% (Value at Risk)
var95 = volatility * 1.645 * portfolioValue / sqrt(252)
```

## 🎯 API Endpoints

- `POST /api/risk/quiz` - Submit quiz responses
- `GET /api/risk/profile/:userId` - Get user risk profile
- `GET /api/risk/metrics/:userId` - Get portfolio metrics
- `POST /api/risk/simulate` - Run scenario simulation
- `GET /api/risk/badges/:userId` - Get user badges

## 🔄 Next Steps

1. **Database Integration**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Authentication**: Add user login/signup system
3. **Real Market Data**: Integrate with financial APIs
4. **Advanced Metrics**: Add more sophisticated risk calculations
5. **Push Notifications**: Alert users about market changes
6. **Portfolio Integration**: Connect with actual investment portfolios

## 📝 Notes

- Backend runs on `http://localhost:3000`
- Frontend connects to backend automatically
- All data is stored in memory (resets on server restart)
- Mock user ID: `user123` is used for demo purposes