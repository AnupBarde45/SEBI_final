# 📘 SaralNivesh – SEBI Education, Risk & Portfolio Assessment Platform

**Please go through this project explanation which has a well-explained documentation and Demonstration Video:**
🔗 [View Demo & Documentation](https://drive.google.com/drive/folders/1Uhl0bor-E88NKLXcFxSfT7aDc3rpHpFp?usp=sharing)

---

## 🚀 Project Overview

SaralNivesh is a **comprehensive financial education and risk assessment platform** designed to empower retail investors with **SEBI-compliant learning, tutorials, risk profiling, portfolio analysis, and chatbot assistance**.

It integrates:

* 📱 **Mobile Apps (React Native Expo)** for learning, quizzes, portfolio evaluation, and risk analysis.
* 📊 **Risk & Portfolio Assessment Module** for profiling, market scenario simulation, and investment analysis.
* 📈 **Stock Market Analysis Tools** for understanding market movements in real time.
* 🎓 **Tutorials** for guided learning about investments and SEBI regulations.
* 🤖 **SEBI Chatbot (RAG System)** for answering queries about SEBI regulations.

---

## 🔹 Core Features

### 1. **Risk Assessment Module**

* Multi-step **Risk Profiling Quiz** (age, income, horizon, volatility tolerance)
* Risk Score Calculator (0–100) with **gauge visualization**
* Dashboard metrics:

  * **Volatility** (price fluctuation %)
  * **Beta** (market sensitivity)
  * **Sharpe Ratio** (risk-adjusted return)
  * **VaR** (Value at Risk at 95% confidence)
* **Scenario Simulator** to test portfolio impact of market shocks (-50% to +50%)
* **Gamification** with badges

---

### 2. **Portfolio Assessment**

* Track **virtual portfolio performance**
* Identify **asset allocation balance**
* Evaluate risk vs return for current holdings
* Suggest diversification strategies
* Interactive **portfolio health score**

---

### 3. **Stock Market Analysis**

* Real-time stock data visualization
* AI-assisted commentary on trends (bullish/bearish, momentum, volatility)
* Simple explanations of technical patterns and market psychology
* Support for **“what-if” market movement simulations**

---

### 4. **Tutorials**

* Step-by-step **learning modules** on SEBI regulations and financial concepts
* Covers topics like **Mutual Funds, IPOs, Derivatives, ETFs, REITs, and KYC**
* Includes **interactive slides, PDFs, and video explanations**
* Self-paced progress tracking for learners
* Integrated with **quiz modules** to test understanding

---

### 5. **SEBI Chatbot (RAG System)**

* **PDF Processing** – Splits SEBI regulation PDFs into chunks
* **Embedding** – Uses Llama (`nomic-embed-text`) for embeddings
* **Local Storage** – JSON-based, no external DB (fully portable)
* **Query Flow** – User query → embedding → similarity search → Gemini generates final answer
* **Frontend** – React Native Web chat UI
* **APIs** – `POST /api/chat`, plus health & collection endpoints

✅ Example:
*User*: “How do I register as an investment advisor?”
*System*: Embeds question → finds relevant SEBI regulation → Gemini produces answer → displayed in chat.

---

### 6. **Financial Literacy Quiz**

* 170+ curated SEBI-based questions
* Dynamic quiz generation (10 random non-repeating Qs per session)
* Real-time feedback with explanations
* Score & time tracking
* Clean, professional UI

---

## 📊 Risk & Portfolio Formulas

```javascript
// Risk Score
FinalScore = AgeFactor + IncomeStability + Horizon + VolatilityTolerance

// Metrics
volatility = (riskScore / 100) * 0.25 + 0.05
beta = (riskScore / 100) * 1.5 + 0.3
sharpeRatio = max(0.1, 1.5 - (volatility * 2))
var95 = volatility * 1.645 * portfolioValue / sqrt(252)
```

---

## 🏗 Tech Stack

**Frontend**

* React Native (Expo)
* React Navigation
* SVG (custom gauges & charts)
* Axios

**Backend**

* Node.js + Express
* Ollama (Llama embeddings)
* Gemini API (Google Generative AI)
* JSON-based local storage

---

## 📱 App Flow

1. **Home Screen** → Tutorials, Literacy, Risk, Portfolio, Chatbot
2. **Tutorials** → Learn key financial & SEBI topics interactively
3. **Quiz & Modules** → Test your knowledge with real-time feedback
4. **Portfolio Dashboard** → View portfolio metrics & health score
5. **Risk Dashboard** → Risk metrics & scenario simulation
6. **Chatbot** → Get SEBI regulation answers instantly

