# SmartBhai AI 🇮🇳

> **An AI trading assistant built for Bharat — for the 60%+ of Indian retail investors from Tier-2 and Tier-3 cities who speak Hinglish, think in analogies, and are drowning in jargon.**

SmartBhai AI is an open-source prototype showing what an in-app, Hinglish-native, memory-aware AI copilot looks like for Indian retail traders. Every big discount broker has either shipped developer-only MCP servers, rate-limited chatbots, or English-only research tools. **SmartBhai fills the gap — a conversational AI bhai that actually explains options, sentiment, and risk in the language Bharat speaks.**

---

## ✨ What it does

| Feature | What it means for a Tier-2/3 trader |
|---|---|
| 🧠 **Conversational AI with Memory** | Remembers your goals, past questions, and risk comfort across sessions |
| 👤 **Adaptive Investor Profiling** | Classifies you as Safe / Moderate / Risky from 15 behavioral signals — no questionnaire |
| 📊 **Portfolio Analyzer** | Health score, sector concentration, stock-level RSI/MACD, plain-English commentary |
| 📈 **Options Chain Simplifier** | Reduces 15 columns × 30 strikes to **4 key levels** (Max Pain, Support, Resistance, IV %ile) |
| 🎯 **Strategy Builder** | Bull/Bear Spreads, Covered Calls, Iron Condor, Protective Put — with Max Profit/Loss/Breakeven |
| 💰 **P&L Simulator** | "If NIFTY falls 5%, you lose ₹X" — with probability-weighted scenarios |
| 🌡️ **9 Market Indicators** | VIX, PCR, FII/DII, RSI, MACD, Bollinger, MAs, Max Pain, IV — explained with cricket analogies |
| ⚠️ **Risk Gate** | Real-time warnings before naked selling, all-in trades, unlimited-risk positions |
| 🗣️ **Hinglish-First** | "Aapke portfolio mein IT stocks 32% hain — ye ek basket mein zyada ande hain" |
| 📚 **Learn Hub** | Micro-lessons, AI glossary, streaks, knowledge graph |

---

## 🏗️ Tech Stack

- **Frontend:** React 19 + Vite 8 (mobile-first PWA)
- **AI:** OpenRouter → Llama 3.3 70B / Gemma 3 27B (6-model fallback chain, all free)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Persistence:** localStorage (memory, profile, tiers — zero backend needed)
- **Styling:** CSS variables, dark theme

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR-USERNAME/smartbhai-ai.git
cd smartbhai-ai

# 2. Install
npm install

# 3. Add your free OpenRouter key
cp .env.example .env
# Edit .env and paste your key from https://openrouter.ai/keys

# 4. Run
npm run dev
# Open http://localhost:5173
```

No backend. No database. No server costs. Runs entirely in your browser.

---

## 📁 Project Structure

```
smartbhai-ai/
├── src/
│   ├── screens/          # Home, Chat, Portfolio, Options, Learn
│   ├── components/       # BottomNav, Onboarding
│   ├── services/         # aiService, tierService
│   ├── data/             # mockData (simulated holdings, options chain)
│   ├── App.jsx
│   └── main.jsx
├── public/               # Favicon, icons
├── PRODUCT_PROPOSAL.md           # Short-form product proposal
├── FLOWCHART_AND_PROPOSAL.md     # Deep architectural flowcharts
├── SmartBhai_AI_BRD.html         # Business Requirements Document
├── proposal.html                 # Interactive proposal (open in browser)
└── .env.example
```

---

## 📖 Docs

- **`PRODUCT_PROPOSAL.md`** — The why, what, and how in 5 minutes
- **`FLOWCHART_AND_PROPOSAL.md`** — ASCII flowcharts, user journeys, personas
- **`SmartBhai_AI_BRD.html`** — Full BRD with competitive analysis, unit economics, ROI, roadmap
- **`proposal.html`** — Interactive, animated walkthrough (open in a browser)

---

## 🤝 Who is this for?

- **Product managers** exploring AI in fintech
- **Indian broker teams** evaluating AI copilot features
- **Builders** who want a reference architecture for LLM + RAG + memory + profiling
- **Anyone** who thinks Bharat deserves financial AI in its own language

---

## 📜 License

MIT. Fork it, ship it, build on top of it. Just don't sell advice you can't back up — always add SEBI disclaimers on anything that faces real users.

---

## 🙏 Built With

Open-source LLMs via OpenRouter · React · Vite · Recharts · and a lot of chai ☕
