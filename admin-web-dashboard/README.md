# SaralNivesh Admin Dashboard

A React Native Web admin dashboard for dynamically configuring all hardcoded features in the SaralNivesh app.

## Features

- **Risk Assessment Configuration**: Edit scoring algorithms, thresholds, and profile types
- **Quiz Questions Management**: Add/edit questions, options, and scoring system
- **Guru Tips Configuration**: Manage trading insights and educational tips
- **Badge System**: Configure badge criteria, icons, and descriptions
- **Stock Data Management**: Create/edit mock stock scenarios and case studies
- **Portfolio Settings**: Configure virtual portfolio formulas and settings

## Setup Instructions

### 1. Install Dependencies
```bash
cd admin-web-dashboard
npm install
```

### 2. Setup Database Tables
Run the SQL script to create dynamic configuration tables:
```bash
psql -U postgres -d sebi_final -f ../database_dynamic_config.sql
```

### 3. Start Main Backend
```bash
cd ../backend
npm start
# Runs on http://localhost:3000 (includes admin APIs)
```

### 4. Start Admin Web Dashboard
```bash
cd ../admin-web-dashboard
npm run web
# Runs on http://localhost:19006
```

## Usage

1. Open the admin dashboard at http://localhost:19006
2. Use the sidebar to navigate between different configuration sections
3. Edit configurations directly in the web interface
4. Changes are immediately saved to the database
5. The main app will use the new configurations without requiring redeployment

## Dynamic Features

### Risk Assessment
- Age factor scoring rules
- Income stability points
- Experience level points
- Risk profile thresholds
- Portfolio allocation formulas

### Quiz System
- Question bank management
- Scoring system (+10/-5 configurable)
- Difficulty levels
- Categories

### Guru Tips
- Trading scenario tips
- Condition-based selection
- Educational messages

### Badge System
- Risk-based badges
- Activity-based badges
- Custom criteria

### Stock Data
- Mock case studies
- Price scenarios
- Volatility factors
- Trend directions

### Portfolio Settings
- Starting balance
- Calculation formulas
- Risk metrics

## API Endpoints

### Main Backend (Port 3000)
**Admin Management:**
- `GET /api/admin/risk-factors` - Get/edit risk scoring factors
- `POST /api/admin/risk-factors` - Add new risk factor
- `GET /api/admin/quiz-questions` - Get/edit quiz questions
- `POST /api/admin/quiz-questions` - Add new question
- `GET /api/admin/guru-tips` - Get/edit guru tips
- `POST /api/admin/guru-tips` - Add new tip

**App Configuration:**
- `GET /api/config/risk-factors` - Get dynamic risk factors
- `GET /api/config/quiz-questions` - Get dynamic quiz questions
- `GET /api/config/guru-tips` - Get dynamic guru tips
- `GET /api/config/badge-types` - Get dynamic badge types
- `GET /api/config/stock-cases` - Get dynamic stock cases
- `GET /api/config/portfolio-settings` - Get dynamic portfolio settings

## Next Steps

1. Update frontend components to use dynamic APIs instead of hardcoded data
2. Implement real-time updates when configurations change
3. Add user authentication for admin access
4. Add data validation and error handling
5. Create backup/restore functionality for configurations