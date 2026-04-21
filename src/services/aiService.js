import { portfolioHoldings, getSectorAllocation, optionsChainData, marketSummary, stockOptionsData } from '../data/mockData';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MEMORY_STORAGE_KEY = 'smartbhai_ai_memory';
const PROFILE_STORAGE_KEY = 'smartbhai_investor_profile';

// ============================================================
// RISK GATE — Detects dangerous trading intent
// ============================================================
const RISK_PATTERNS = [
  { pattern: /naked\s*(put|call|option|sell)/i, level: 'critical', warning: 'Naked option selling has UNLIMITED loss potential. Your entire account can be wiped out.' },
  { pattern: /sell\s*(naked|without\s*hedge)/i, level: 'critical', warning: 'Selling without a hedge means unlimited risk. Consider a credit spread instead — same income, capped risk.' },
  { pattern: /short\s*straddle/i, level: 'high', warning: 'Short straddle has unlimited risk on both sides. Consider an Iron Condor instead — defined risk.' },
  { pattern: /(all\s*in|full\s*margin|maximum\s*leverage|100%\s*capital)/i, level: 'high', warning: 'Using all your capital in one trade is extremely risky. Never risk more than 2-5% per trade.' },
  { pattern: /(intraday|scalp).*(option|f&o)/i, level: 'medium', warning: 'Intraday options trading is very risky — 91% of retail F&O traders lose money (SEBI data).' },
  { pattern: /margin\s*(trade|fund|borrow)/i, level: 'medium', warning: 'Trading on margin amplifies both gains AND losses. Make sure you understand margin calls.' },
];

export function detectRiskLevel(message) {
  const msg = message.toLowerCase();
  for (const { pattern, level, warning } of RISK_PATTERNS) {
    if (pattern.test(msg)) {
      return { detected: true, level, warning };
    }
  }
  return { detected: false, level: null, warning: null };
}

// ============================================================
// MEMORY SYSTEM — Persists across sessions via localStorage
// ============================================================
class InvestorMemory {
  constructor() {
    this.memories = this._load();
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY)) || this._defaultMemory();
    } catch { return this._defaultMemory(); }
  }

  _defaultMemory() {
    return {
      facts: [],           // Key facts learned about the user
      preferences: {},     // Language, risk appetite signals, favorite sectors
      conversationCount: 0,
      topicsDiscussed: [],  // Track what they've asked about
      riskSignals: [],      // Signals that indicate risk appetite
      goals: [],            // Financial goals (retirement, children, house, etc.)
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  }

  save() {
    this.memories.lastActiveAt = Date.now();
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memories));
  }

  addFact(fact) {
    if (!this.memories.facts.includes(fact)) {
      this.memories.facts.push(fact);
      if (this.memories.facts.length > 50) this.memories.facts.shift();
      this.save();
    }
  }

  addGoal(goal) {
    if (!this.memories.goals) this.memories.goals = [];
    if (!this.memories.goals.includes(goal)) {
      this.memories.goals.push(goal);
      if (this.memories.goals.length > 10) this.memories.goals.shift();
      this.save();
    }
  }

  addTopic(topic) {
    if (!this.memories.topicsDiscussed.includes(topic)) {
      this.memories.topicsDiscussed.push(topic);
      if (this.memories.topicsDiscussed.length > 20) this.memories.topicsDiscussed.shift();
      this.save();
    }
  }

  addRiskSignal(signal) {
    this.memories.riskSignals.push({ signal, timestamp: Date.now() });
    if (this.memories.riskSignals.length > 30) this.memories.riskSignals.shift();
    this.save();
  }

  incrementConversation() {
    this.memories.conversationCount++;
    this.save();
  }

  setPreference(key, value) {
    this.memories.preferences[key] = value;
    this.save();
  }

  getMemoryContext() {
    const m = this.memories;
    if (m.facts.length === 0 && m.topicsDiscussed.length === 0 && (!m.goals || m.goals.length === 0)) return '';

    let ctx = '\n=== USER MEMORY (learned from past conversations) ===\n';
    ctx += `Sessions: ${m.conversationCount} | First seen: ${new Date(m.createdAt).toLocaleDateString()}\n`;
    ctx += `Last active: ${new Date(m.lastActiveAt).toLocaleDateString()}\n`;

    if (m.goals && m.goals.length > 0) {
      ctx += `\n🎯 Financial Goals:\n${m.goals.map(g => `  • ${g}`).join('\n')}\n`;
      ctx += `IMPORTANT: Reference these goals when giving advice. Tailor suggestions to help achieve them.\n`;
    }
    if (m.facts.length > 0) {
      ctx += `\nKey facts about this user:\n${m.facts.map(f => `  • ${f}`).join('\n')}\n`;
    }
    if (m.topicsDiscussed.length > 0) {
      ctx += `\nTopics they've explored: ${m.topicsDiscussed.join(', ')}\n`;
    }
    if (Object.keys(m.preferences).length > 0) {
      ctx += `\nPreferences: ${JSON.stringify(m.preferences)}\n`;
    }
    if (m.riskSignals.length > 0) {
      const recentSignals = m.riskSignals.slice(-5).map(s => s.signal);
      ctx += `\nRecent risk behavior signals: ${recentSignals.join(', ')}\n`;
    }
    return ctx;
  }

  clear() {
    this.memories = this._defaultMemory();
    this.save();
  }
}

// ============================================================
// INVESTOR PROFILE — Adaptive risk profiling (enhanced)
// ============================================================
class InvestorProfile {
  constructor() {
    this.profile = this._load();
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || this._defaultProfile();
    } catch { return this._defaultProfile(); }
  }

  _defaultProfile() {
    return {
      riskCategory: 'unknown',  // safe, moderate, risky, unknown
      riskScore: 50,            // 0-100 scale
      signals: {
        asksAboutRisk: 0,
        asksAboutOptions: 0,
        asksAboutHedging: 0,
        asksAboutAggressive: 0,
        asksAboutSIP: 0,
        asksAboutStopLoss: 0,
        asksAboutNakedOptions: 0,
        asksAboutDiversification: 0,
        asksAboutLearning: 0,
        asksAboutCoveredCalls: 0,
        asksAboutSpreads: 0,
        asksAboutIncome: 0,
        asksAboutTechnicals: 0,
        asksAboutSentiment: 0,
        triggeredRiskGate: 0,
      },
      tradingStyle: 'unknown',  // investor, trader, learner
      experienceLevel: 'unknown', // beginner, intermediate, advanced
      languagePreference: 'auto',
      hinglishStrength: 0,       // 0-10 how much Hinglish they use
      totalMessages: 0,
      lastUpdated: Date.now(),
    };
  }

  save() {
    this.profile.lastUpdated = Date.now();
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
  }

  // Analyze user message to update profile signals
  analyzeMessage(message) {
    const msg = message.toLowerCase();
    const s = this.profile.signals;
    this.profile.totalMessages = (this.profile.totalMessages || 0) + 1;

    // Risk-averse signals
    if (/risk|safe|protect|hedge|stop.?loss|insurance/i.test(msg)) { s.asksAboutRisk++; s.asksAboutHedging++; }
    if (/sip|long.?term|mutual.?fund|safe.*invest|fd|fixed.?deposit/i.test(msg)) { s.asksAboutSIP++; }
    if (/diversif|spread.*risk|reduce.*risk|balance|rebalance/i.test(msg)) { s.asksAboutDiversification++; }
    if (/stop.?loss|trailing|protect.*profit|exit.*strategy/i.test(msg)) { s.asksAboutStopLoss++; }

    // Risk-seeking signals
    if (/option|call|put|strike|expiry|premium|chain/i.test(msg)) { s.asksAboutOptions++; }
    if (/naked|sell.*option|short.*straddle|aggressive|unlimited/i.test(msg)) { s.asksAboutNakedOptions++; s.asksAboutAggressive++; }
    if (/intraday|scalp|leverage|margin|f&o|futures|yolo/i.test(msg)) { s.asksAboutAggressive++; }

    // Moderate / income signals
    if (/covered.?call|sell.*call.*holding|income.*option/i.test(msg)) { s.asksAboutCoveredCalls++; s.asksAboutIncome++; }
    if (/spread|condor|butterfly|collar|credit.*spread/i.test(msg)) { s.asksAboutSpreads++; }
    if (/income|dividend|earn.*from|premium.*collect/i.test(msg)) { s.asksAboutIncome++; }

    // Technical / sentiment signals
    if (/rsi|macd|bollinger|moving.*average|technical|chart|pattern/i.test(msg)) { s.asksAboutTechnicals++; }
    if (/sentiment|vix|pcr|fii|dii|mood|outlook/i.test(msg)) { s.asksAboutSentiment++; }

    // Learning signals
    if (/kya.*hai|what.*is|explain|samjha|teach|learn|basic|beginner|101|simple/i.test(msg)) { s.asksAboutLearning++; }

    // Language detection — track Hinglish strength
    const hinglishWords = (msg.match(/kya|kaise|hai|mera|kaisa|samjha|karu|hota|aur|nahi|karo|batao|dikhao|kitna|accha|theek|pehle|baad|abhi|agar|toh|bhi|mein|se|ko|ka|ki|ke|yeh|woh|kuch|sab|bohot|zyada|kam|acha|bura|paisa|rupee|lagao|nikalo|rakho|dekho/gi) || []).length;
    if (hinglishWords >= 2) {
      this.profile.languagePreference = 'hinglish';
      this.profile.hinglishStrength = Math.min(10, (this.profile.hinglishStrength || 0) + 1);
    }

    // Recalculate risk score
    this._recalculate();
    this.save();
  }

  recordRiskGate() {
    this.profile.signals.triggeredRiskGate = (this.profile.signals.triggeredRiskGate || 0) + 1;
    this.save();
  }

  _recalculate() {
    const s = this.profile.signals;
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    if (total < 3) { this.profile.riskCategory = 'unknown'; return; }

    // Risk score: 0 = very safe, 100 = very risky
    const safeSignals = s.asksAboutRisk + s.asksAboutHedging + s.asksAboutSIP + s.asksAboutDiversification + s.asksAboutStopLoss;
    const riskySignals = s.asksAboutNakedOptions + s.asksAboutAggressive;
    const moderateSignals = s.asksAboutOptions + s.asksAboutCoveredCalls + s.asksAboutSpreads + s.asksAboutIncome;

    const score = Math.round(
      ((riskySignals * 3 + moderateSignals * 1.5) / (safeSignals * 2 + moderateSignals * 1.5 + riskySignals * 3 + 1)) * 100
    );

    // Smooth the score — don't jump too fast (weighted average with previous)
    const prevScore = this.profile.riskScore;
    this.profile.riskScore = Math.min(100, Math.max(0, Math.round(prevScore * 0.3 + score * 0.7)));

    if (this.profile.riskScore < 30) this.profile.riskCategory = 'safe';
    else if (this.profile.riskScore < 65) this.profile.riskCategory = 'moderate';
    else this.profile.riskCategory = 'risky';

    // Trading style — more nuanced
    const learningRatio = s.asksAboutLearning / (total || 1);
    const tradingRatio = (s.asksAboutOptions + s.asksAboutAggressive + s.asksAboutTechnicals) / (total || 1);
    const investingRatio = (s.asksAboutSIP + s.asksAboutDiversification + s.asksAboutIncome) / (total || 1);

    if (learningRatio > 0.35) this.profile.tradingStyle = 'learner';
    else if (tradingRatio > investingRatio) this.profile.tradingStyle = 'trader';
    else this.profile.tradingStyle = 'investor';

    // Experience level — more granular
    if (s.asksAboutLearning > 3 && s.asksAboutOptions < 2 && s.asksAboutSpreads === 0) {
      this.profile.experienceLevel = 'beginner';
    } else if (s.asksAboutNakedOptions > 0 || s.asksAboutAggressive > 3 || (s.asksAboutSpreads > 2 && s.asksAboutTechnicals > 2)) {
      this.profile.experienceLevel = 'advanced';
    } else {
      this.profile.experienceLevel = 'intermediate';
    }
  }

  getProfileContext() {
    const p = this.profile;
    if (p.riskCategory === 'unknown') return '';

    const emoji = { safe: '🛡️', moderate: '⚖️', risky: '🔥' }[p.riskCategory] || '❓';
    const hinglishLevel = (p.hinglishStrength || 0) > 3 ? 'STRONG — respond primarily in Hinglish' : (p.hinglishStrength || 0) > 0 ? 'MODERATE — mix Hindi and English naturally' : 'ENGLISH preferred';

    return `
=== INVESTOR PROFILE (learned from ${p.totalMessages || 0} messages) ===
Risk Category: ${emoji} ${p.riskCategory.toUpperCase()} (Score: ${p.riskScore}/100)
Trading Style: ${p.tradingStyle}
Experience Level: ${p.experienceLevel}
Language: ${p.languagePreference} (Hinglish strength: ${hinglishLevel})
Risk Gates Triggered: ${p.signals.triggeredRiskGate || 0} times

ADAPTATION RULES based on this profile:
${p.riskCategory === 'safe' ? `- This user is RISK-AVERSE. Emphasize safety, SIPs, diversification, stop-losses.
- Warn STRONGLY about risky trades. Suggest conservative strategies only.
- Use reassuring language: "Aapka portfolio safe hai" / "Risk kam karne ke liye..."
- Recommend: Covered calls (safest selling), protective puts, SIPs, diversification.
- AVOID suggesting: Naked options, intraday, high leverage, aggressive strategies.` : ''}
${p.riskCategory === 'moderate' ? `- This user is BALANCED. They understand some risk but want guardrails.
- Suggest defined-risk strategies: Bull/Bear spreads, Iron Condors, Covered Calls.
- Educate about both opportunities AND risks in every suggestion.
- Show Max Loss prominently. Compare risky vs safe alternatives.
- Gradually introduce more complex concepts as they learn.` : ''}
${p.riskCategory === 'risky' ? `- This user is RISK-COMFORTABLE but still needs guardrails.
- Show advanced strategies but ALWAYS highlight max loss in ₹ amounts.
- If they ask about naked selling, suggest credit spreads as safer alternative.
- Never encourage reckless behavior. Always show the downside scenario.
- Use data-driven language: exact numbers, probabilities, risk-reward ratios.` : ''}
${p.experienceLevel === 'beginner' ? `- Use VERY simple language. Explain every term.
- Use analogies: cricket (batting average = consistency), movie tickets (options = right not obligation), FD (SIP = recurring deposit for stocks).
- Break complex topics into 2-3 simple steps.
- End with "Koi aur sawaal?" to encourage learning.` : ''}
${p.experienceLevel === 'intermediate' ? `- Can use some technical terms but still explain key concepts.
- Focus on practical application: "Here's exactly what you can do..."
- Show comparisons: "Strategy A gives X return with Y risk vs Strategy B..."` : ''}
${p.experienceLevel === 'advanced' ? `- Can use technical terms freely. Focus on actionable data and numbers.
- Show Greeks, probability of profit, risk-reward ratios.
- Discuss multi-leg strategies, IV analysis, sector rotation.` : ''}
`;
  }

  getProfile() { return this.profile; }

  clear() {
    this.profile = this._defaultProfile();
    this.save();
  }
}

// ============================================================
// MARKET INDICATORS — Sentiment & Technical Analysis Context
// ============================================================
function buildMarketIndicatorsContext() {
  const ms = marketSummary;
  const oc = optionsChainData;

  // Compute aggregate PCR
  const totalCallOI = oc.data.reduce((s, r) => s + r.callOI, 0);
  const totalPutOI = oc.data.reduce((s, r) => s + r.putOI, 0);
  const aggregatePCR = (totalPutOI / totalCallOI).toFixed(2);

  // Determine sentiment from multiple indicators
  const signals = [];

  // VIX Signal
  if (ms.vix.value < 13) signals.push({ indicator: 'India VIX', reading: ms.vix.value, signal: 'BULLISH', reason: 'Very low fear — market complacency, good for bulls' });
  else if (ms.vix.value < 18) signals.push({ indicator: 'India VIX', reading: ms.vix.value, signal: 'NEUTRAL', reason: 'Normal volatility range' });
  else if (ms.vix.value < 25) signals.push({ indicator: 'India VIX', reading: ms.vix.value, signal: 'CAUTIOUS', reason: 'Elevated fear — expect bigger swings' });
  else signals.push({ indicator: 'India VIX', reading: ms.vix.value, signal: 'BEARISH', reason: 'High fear — market under stress' });

  // PCR Signal
  if (aggregatePCR > 1.2) signals.push({ indicator: 'NIFTY PCR', reading: aggregatePCR, signal: 'BULLISH', reason: 'Heavy put writing = writers confident market won\'t fall' });
  else if (aggregatePCR > 0.9) signals.push({ indicator: 'NIFTY PCR', reading: aggregatePCR, signal: 'NEUTRAL', reason: 'Balanced call-put activity' });
  else signals.push({ indicator: 'NIFTY PCR', reading: aggregatePCR, signal: 'BEARISH', reason: 'More calls than puts = limited upside expected' });

  // FII Signal
  if (ms.fiiActivity.net > 500) signals.push({ indicator: 'FII Flow', reading: `+₹${ms.fiiActivity.net} Cr`, signal: 'BULLISH', reason: 'Strong foreign buying supports market' });
  else if (ms.fiiActivity.net > 0) signals.push({ indicator: 'FII Flow', reading: `+₹${ms.fiiActivity.net} Cr`, signal: 'NEUTRAL', reason: 'Mild foreign buying' });
  else signals.push({ indicator: 'FII Flow', reading: `₹${ms.fiiActivity.net} Cr`, signal: 'BEARISH', reason: 'Foreign investors selling' });

  // Max Pain proximity
  const maxPainDist = ((ms.nifty.value - oc.maxPain) / oc.maxPain * 100).toFixed(2);
  signals.push({ indicator: 'Max Pain Distance', reading: `${maxPainDist}%`, signal: Math.abs(maxPainDist) < 0.5 ? 'NEUTRAL' : (maxPainDist > 0 ? 'SLIGHT BEARISH PULL' : 'SLIGHT BULLISH PULL'), reason: `NIFTY is ${maxPainDist}% from Max Pain ${oc.maxPain}. Market tends to gravitate toward Max Pain near expiry.` });

  // IV Percentile
  if (oc.ivPercentile > 75) signals.push({ indicator: 'IV Percentile', reading: `${oc.ivPercentile}%`, signal: 'OPTIONS EXPENSIVE', reason: 'High IV = options are expensive. Better to sell options than buy.' });
  else if (oc.ivPercentile > 40) signals.push({ indicator: 'IV Percentile', reading: `${oc.ivPercentile}%`, signal: 'MODERATE', reason: 'IV is in normal range. Both buying and selling strategies viable.' });
  else signals.push({ indicator: 'IV Percentile', reading: `${oc.ivPercentile}%`, signal: 'OPTIONS CHEAP', reason: 'Low IV = options are cheap. Good time to buy options for protection.' });

  // Simulated technical indicators for key stocks
  const technicalIndicators = `
=== TECHNICAL INDICATORS (Simulated for prototype) ===
NIFTY 50:
  RSI (14): 58.3 — Neutral (not overbought/oversold)
  MACD: Bullish crossover 2 days ago — Positive momentum
  20-DMA: 22,320 (NIFTY above it = short-term bullish)
  50-DMA: 22,180 (NIFTY above it = medium-term bullish)
  200-DMA: 21,650 (NIFTY well above = long-term uptrend intact)
  Bollinger Bands: Upper 22,680 | Middle 22,380 | Lower 22,080 — NIFTY near middle band
  Support Levels: 22,380 → 22,200 → 22,000
  Resistance Levels: 22,520 → 22,680 → 22,800

BANK NIFTY:
  RSI (14): 62.1 — Mildly bullish
  MACD: Strong bullish — Banking sector leading

Key Holdings Technical Snapshot:
  RELIANCE: RSI 55, above 50-DMA ✅ — Steady uptrend
  TCS: RSI 42, below 20-DMA ⚠️ — Weak momentum, watch for reversal
  HDFCBANK: RSI 64, above all MAs ✅ — Strong trend
  TATAMOTORS: RSI 71, near overbought ⚠️ — Consider trailing stop-loss
  INFY: RSI 38, below 50-DMA 🔴 — Underperforming, needs catalyst
`;

  const sentimentSummary = signals.map(s => `  ${s.indicator}: ${s.reading} → ${s.signal} (${s.reason})`).join('\n');

  // Overall sentiment
  const bullishCount = signals.filter(s => s.signal.includes('BULLISH')).length;
  const bearishCount = signals.filter(s => s.signal.includes('BEARISH')).length;
  let overallSentiment = 'NEUTRAL';
  if (bullishCount > bearishCount + 1) overallSentiment = 'BULLISH';
  else if (bearishCount > bullishCount + 1) overallSentiment = 'BEARISH';
  else if (bullishCount > bearishCount) overallSentiment = 'MILDLY BULLISH';
  else if (bearishCount > bullishCount) overallSentiment = 'MILDLY BEARISH';

  return `
=== MARKET SENTIMENT ANALYSIS ===
Overall Sentiment: ${overallSentiment}

Individual Indicators:
${sentimentSummary}

${technicalIndicators}

WHEN USER ASKS ABOUT MARKET SENTIMENT OR INDICATORS:
- Explain each indicator in simple terms with analogies
- Give the overall picture first, then details
- Relate it to their portfolio specifically
- For RSI: "Think of it as a speedometer — above 70 means the stock is running too fast (overbought), below 30 means it's too slow (oversold)"
- For MACD: "Think of it as two runners — when the fast runner crosses ahead of the slow runner, it's a buy signal"
- For Bollinger Bands: "Think of it as a rubber band — price tends to snap back to the middle when it stretches too far"
- For Moving Averages: "Think of it as the stock's average mood over X days — if price is above it, mood is positive"
`;
}

// ============================================================
// PORTFOLIO CONTEXT BUILDER
// ============================================================
function buildPortfolioContext() {
  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.ltp, 0);
  const totalInvested = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const totalPnL = totalValue - totalInvested;
  const sectors = getSectorAllocation();

  const holdingsStr = portfolioHoldings.map(h => {
    const pnl = (h.ltp - h.avgPrice) * h.qty;
    const pnlPct = ((h.ltp - h.avgPrice) / h.avgPrice * 100).toFixed(1);
    return `  - ${h.symbol} (${h.name}): ${h.qty} shares, Avg ₹${h.avgPrice}, LTP ₹${h.ltp}, P&L ₹${pnl} (${pnlPct}%), Sector: ${h.sector}, Today: ${h.change > 0 ? '+' : ''}${h.change}%`;
  }).join('\n');

  const sectorStr = sectors.map(s => `  - ${s.name}: ${s.value}% (₹${s.amount.toLocaleString('en-IN')})`).join('\n');

  const oc = optionsChainData;
  const optionsStr = oc.data.map(r =>
    `  Strike ${r.strike}: Call OI ${(r.callOI/100000).toFixed(1)}L (Chg ${r.callChange > 0 ? '+' : ''}${(r.callChange/1000).toFixed(0)}K), Call LTP ₹${r.callLTP} | Put OI ${(r.putOI/100000).toFixed(1)}L (Chg ${r.putChange > 0 ? '+' : ''}${(r.putChange/1000).toFixed(0)}K), Put LTP ₹${r.putLTP} | PCR: ${r.pcr}`
  ).join('\n');

  const ms = marketSummary;

  return `
=== USER'S LIVE PORTFOLIO ===
Total Invested: ₹${totalInvested.toLocaleString('en-IN')}
Current Value: ₹${totalValue.toLocaleString('en-IN')}
Total P&L: ₹${totalPnL.toLocaleString('en-IN')} (${((totalPnL/totalInvested)*100).toFixed(2)}%)

Holdings:
${holdingsStr}

Sector Allocation:
${sectorStr}

=== TODAY'S MARKET DATA ===
NIFTY 50: ${ms.nifty.value} (${ms.nifty.change > 0 ? '+' : ''}${ms.nifty.change}%), High: ${ms.nifty.high}, Low: ${ms.nifty.low}
SENSEX: ${ms.sensex.value} (${ms.sensex.change > 0 ? '+' : ''}${ms.sensex.change}%)
BANK NIFTY: ${ms.bankNifty.value} (${ms.bankNifty.change > 0 ? '+' : ''}${ms.bankNifty.change}%)
India VIX: ${ms.vix.value} (${ms.vix.change}%)
FII Activity: Buy ₹${ms.fiiActivity.buy} Cr, Sell ₹${ms.fiiActivity.sell} Cr, Net ₹${ms.fiiActivity.net > 0 ? '+' : ''}${ms.fiiActivity.net} Cr
DII Activity: Buy ₹${ms.diiActivity.buy} Cr, Sell ₹${ms.diiActivity.sell} Cr, Net ₹${ms.diiActivity.net > 0 ? '+' : ''}${ms.diiActivity.net} Cr

=== NIFTY OPTIONS CHAIN (Expiry: ${oc.expiry}) ===
Spot Price: ${oc.spotPrice}
Max Pain: ${oc.maxPain}
IV Percentile: ${oc.ivPercentile}%
${optionsStr}

=== STOCK OPTIONS DATA (for covered calls & stock-specific strategies) ===
${Object.entries(stockOptionsData).map(([symbol, opts]) => {
  const holding = portfolioHoldings.find(h => h.symbol === symbol);
  const holdingQty = holding ? holding.qty : 0;
  const ivStatus = opts.iv < opts.historicalIV ? 'CHEAP (good time to buy options)' : 'EXPENSIVE (good time to sell options)';
  return `${symbol}: Spot ₹${opts.spotPrice}, Lot Size ${opts.lotSize}, IV ${opts.iv}% vs Historical ${opts.historicalIV}% → ${ivStatus}
  User holds: ${holdingQty} shares
  Calls: ${opts.calls.map(c => `${c.strike} CE @ ₹${c.ltp}`).join(', ')}
  Puts: ${opts.puts.map(p => `${p.strike} PE @ ₹${p.ltp}`).join(', ')}
  ${holdingQty > 0 ? `COVERED CALL OPPORTUNITY: User can sell ${opts.calls[1].strike} CE at ₹${opts.calls[1].ltp} to earn ₹${opts.calls[1].ltp * opts.lotSize} income. Risk: shares called away above ${opts.calls[1].strike}.` : ''}`;
}).join('\n\n')}

=== STOCK-LEVEL TECHNICAL INDICATORS ===
${portfolioHoldings.map(h => {
  const rsiStatus = h.rsi > 70 ? '⚠️ OVERBOUGHT — consider trailing stop-loss' : h.rsi < 30 ? '🔵 OVERSOLD — potential buying opportunity' : '✅ Normal range';
  return `${h.symbol}: RSI ${h.rsi} (${rsiStatus}), MACD ${h.macdSignal}, ${h.above50DMA ? 'Above' : 'Below'} 50-DMA`;
}).join('\n')}
`;
}

// ============================================================
// SYSTEM PROMPT — The brain of the AI assistant
// ============================================================
function buildSystemPrompt(memory, profile) {
  return `You are "SmartBhai AI" — an AI-powered investing assistant built for Tier-2 and Tier-3 retail investors in India who are often new to the stock market. Think of yourself as a trusted bhai (brother/buddy) who explains trading in simple language.

YOUR PERSONALITY:
- Friendly, patient, and encouraging — like a knowledgeable friend who explains finance
- Use simple Hindi-English mix naturally when user speaks Hinglish
- Use emojis to make responses visual and engaging (📊 🟢 🔴 💡 ⚠️ 🎯)
- Always use analogies and real-world examples to explain complex concepts
- Never be condescending — treat every question as valid
- Use cultural references: cricket (batting average, run rate), Bollywood, chai, local examples
- For Tier-2/3 users: "Jaise Jaipur mein property ka rate..." or "Jaise aapki FD mein..."

YOUR CORE CAPABILITIES:
1. PORTFOLIO ANALYSIS — Analyze the user's actual holdings, P&L, sector allocation, risk. Show stock-level RSI, MACD, and 50-DMA status.
2. OPTIONS CHAIN SIMPLIFICATION — Explain OI, PCR, Max Pain, IV in plain language. Extract 4 key levels.
3. OPTIONS STRATEGY BUILDER — Suggest BUY strategies (Bull Call Spread, Protective Put, Iron Condor) AND SELL strategies (Covered Call, Credit Spread, Cash-Secured Put, Collar) based on user's view and holdings. ALWAYS show: Max Profit, Max Loss, Breakeven with actual numbers from the options chain data.
4. COVERED CALL GUIDANCE — When user holds stocks that have options available, proactively suggest covered calls for income. Show exact strike, premium, income amount, and risk (shares called away). Use the stock options data provided.
5. P&L SIMULATION — Show "if NIFTY goes to X, you make/lose Y" scenarios with specific ₹ amounts. For portfolio what-if, use beta-adjusted calculations. When possible, show PROBABILITY-WEIGHTED outcomes: "65% chance NIFTY stays in 22,400-22,600 (you make ₹X), 20% chance breakout above 22,600 (you make ₹Y), 15% chance breakdown below 22,400 (you lose ₹Z)."
6. RISK WARNINGS — Alert before risky trades (naked options, concentrated positions). For naked selling, ALWAYS suggest a defined-risk alternative (spread instead of naked).
7. MARKET SENTIMENT — Analyze all 9 indicators (VIX, PCR, FII/DII, RSI, MACD, Bollinger, Moving Averages, Max Pain, IV Percentile) and explain what they mean together. Use analogies.
8. TECHNICAL ANALYSIS — Explain RSI, MACD, Moving Averages, Bollinger Bands in simple terms with analogies. Reference the user's specific stock RSI/MACD data.
9. FINANCIAL ANALYSIS — P/E ratio, earnings, sector rotation, fundamental analysis simplified
10. EDUCATION — Teach concepts in 1-2 paragraphs with real-world analogies. Use cricket, movie ticket, and everyday analogies for Tier-2/3 users.
11. DIVERSIFICATION ADVICE — Suggest sectors/stocks missing from portfolio. Show the "eggs in basket" analogy.
12. HEDGING GUIDANCE — Explain how to protect portfolio using options with specific strikes and costs from the data provided.
13. STOCK OPTIONS — Guide users on stock-specific options (RELIANCE, TCS, HDFCBANK). After SEBI raised index lot sizes to ₹15-20L, stock options (₹2-5L lot sizes) are more accessible for Tier-2/3 investors.

=== SEBI COMPLIANCE & SAFETY RULES (CRITICAL — NEVER VIOLATE) ===
1. NEVER give direct buy/sell recommendations. ALWAYS frame as educational:
   ❌ "Buy RELIANCE 2750 CE" 
   ✅ "One approach you may consider is a Bull Call Spread on RELIANCE..."
   ✅ "If you're bullish, a strategy to explore could be..."
2. NEVER guarantee returns or profits:
   ❌ "You will make ₹5,000"
   ✅ "Maximum potential profit is ₹5,000 if NIFTY reaches 22,600"
3. ALWAYS include risk disclaimers when discussing specific trades:
   - "This is for educational purposes only, not a trading recommendation."
   - "Past performance doesn't guarantee future results."
4. ALWAYS show Max Loss BEFORE Max Profit when suggesting strategies.
5. When user asks about NAKED option selling:
   - FIRST: Warn about unlimited risk with specific ₹ numbers
   - SECOND: Explain the danger in simple terms ("Aapke ₹50K wallet mein ₹2L+ ka risk hai")
   - THIRD: Suggest a defined-risk alternative (credit spread, covered call)
   - FOURTH: Only then explain the strategy if they still want to learn
6. NEVER encourage overtrading, FOMO, or emotional decisions.
7. If user seems to be making an emotional decision ("market crash ho raha hai, sab bech du?"), calm them down with data.

=== RISK GATE PROTOCOL ===
When user mentions naked selling, unlimited risk, or all-in trades:
- Start response with ⚠️ **Risk Alert** section
- Show the worst-case scenario in ₹ amounts from their portfolio
- Suggest the safer alternative with exact numbers
- Only proceed with explanation after the warning
- Example: "⚠️ **Risk Alert:** Naked put selling ka max loss unlimited hai. Aapke ₹50K wallet mein ₹2L+ ka risk hai. Instead, try a Bull Put Spread — same income direction, max loss capped at ₹54/lot."

=== HINGLISH RESPONSE GUIDELINES ===
When user speaks in Hindi/Hinglish:
- Mirror their language style naturally
- Use common Hinglish patterns: "Aapka portfolio kaafi accha chal raha hai"
- Use ₹ symbol always (not Rs or INR)
- Use cricket analogies: "Jaise Virat Kohli ka batting average — consistency matters"
- Use everyday analogies: "Options jaise movie ticket — use karo ya mat karo, ticket ka paisa gaya"
- Use local references: "Jaise Jaipur mein property invest karte ho — location matters, timing matters"
- End with encouragement: "Aap sahi direction mein hain! 💪"
- Common phrases to use: "Samajh aaya?", "Aur kuch poochna hai?", "Pehle samjho, phir karo"

MEMORY & ADAPTATION:
- You remember past conversations with this user (see memory section below)
- You have built a profile of this user's risk appetite and trading style
- ADAPT your responses based on their profile — more cautious for safe investors, more detailed for advanced traders
- If you learn something new about the user (their goals, preferences, concerns), mention it naturally
- Reference past topics they've discussed to show continuity
- If user has financial goals (retirement, children's education, house), relate advice to those goals

RESPONSE RULES:
- Keep responses concise but complete — aim for 150-300 words
- Use markdown formatting: **bold** for key numbers, bullet points for lists
- Always end with a 💡 actionable tip or suggestion
- When discussing options strategies, ALWAYS show: Max Profit, Max Loss, Breakeven
- When discussing risk, give specific ₹ numbers from the user's portfolio
- Include "In simple terms:" section when explaining complex topics
- If user asks in Hindi/Hinglish, respond in the same style
- When discussing technical indicators, always explain what the number MEANS, not just the number
- For P&L simulations, show probability-weighted scenarios when possible
- ALWAYS show Max Loss first, then Max Profit (safety-first framing)

${buildPortfolioContext()}

${buildMarketIndicatorsContext()}

${memory.getMemoryContext()}

${profile.getProfileContext()}

Remember: Your goal is to make this investor feel confident and educated, not overwhelmed. Every response should leave them knowing more than before. Adapt to their level and style. "Pehle samjho, phir karo" — understand first, then act.`;
}

// ============================================================
// SCENARIO CATEGORIES
// ============================================================
export const tier2Tier3Scenarios = [
  {
    category: '📊 Portfolio',
    questions: [
      "Mera portfolio kaisa chal raha hai?",
      "Which of my stocks are risky?",
      "How to reduce risk in my portfolio?",
      "Should I book profit in Tata Motors?",
      "My IT stocks are not performing, kya karu?",
    ]
  },
  {
    category: '📈 Options Simplified',
    questions: [
      "Options trading kya hota hai? Simple mein samjhao",
      "NIFTY options chain samjhao",
      "What is Max Pain and why does it matter?",
      "PCR kya hai aur isse kaise use kare?",
      "Is it a good time to buy NIFTY options?",
    ]
  },
  {
    category: '🎯 Strategy Builder',
    questions: [
      "I'm bullish on NIFTY, suggest a low-risk options strategy",
      "How to protect my portfolio from a market crash?",
      "Suggest a strategy if NIFTY stays range-bound",
      "I want to earn income from my holdings using options",
      "Bull Call Spread kaise kaam karta hai?",
    ]
  },
  {
    category: '💰 P&L Simulator',
    questions: [
      "If NIFTY falls 5%, how much will I lose?",
      "What happens to my portfolio if IT sector crashes 10%?",
      "Show me P&L if I buy NIFTY 22500 CE",
      "How much can I lose selling a naked put?",
      "Compare buying call vs bull call spread",
    ]
  },
  {
    category: '📉 Market Sentiment',
    questions: [
      "What is the overall market sentiment today?",
      "Explain all technical indicators for NIFTY",
      "RSI kya hai aur isse kaise use kare?",
      "Is the market overbought or oversold right now?",
      "What are FIIs and DIIs doing and what does it mean?",
    ]
  },
  {
    category: '⚠️ Risk & Safety',
    questions: [
      "Is my portfolio safe right now?",
      "What is stop-loss and how to set it?",
      "Naked option selling kitna risky hai?",
      "How much money can I lose in F&O?",
      "Earnings season mein kya precaution lu?",
    ]
  },
  {
    category: '📚 Learn Basics',
    questions: [
      "P/E ratio kya hota hai?",
      "SIP vs lumpsum — kya better hai?",
      "What is diversification? Simple example do",
      "Candlestick chart kaise padhe?",
      "FII aur DII kya hote hain?",
    ]
  },
];

// ============================================================
// SINGLETONS
// ============================================================
export const investorMemory = new InvestorMemory();
export const investorProfile = new InvestorProfile();

// ============================================================
// MODEL FALLBACK CHAIN
// ============================================================
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'google/gemma-3-4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

let currentModelIndex = 0;

async function tryModel(model, formattedMessages, apiKey) {
  let messagesToSend = formattedMessages;
  const isGoogleModel = model.startsWith('google/');
  if (isGoogleModel && formattedMessages[0]?.role === 'system') {
    const systemContent = formattedMessages[0].content;
    const rest = formattedMessages.slice(1);
    if (rest.length > 0 && rest[0].role === 'user') {
      messagesToSend = [
        { role: 'user', content: `[INSTRUCTIONS]\n${systemContent}\n[/INSTRUCTIONS]\n\nUser question: ${rest[0].content}` },
        ...rest.slice(1),
      ];
    } else {
      messagesToSend = [
        { role: 'user', content: `[INSTRUCTIONS]\n${systemContent}\n[/INSTRUCTIONS]\n\nPlease introduce yourself.` },
        ...rest,
      ];
    }
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SmartBhai AI',
    },
    body: JSON.stringify({
      model,
      messages: messagesToSend,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || `Model ${model} failed`);

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response');

  return { text: content, model };
}

// ============================================================
// MAIN API — Send message with memory + profiling
// ============================================================
export async function sendMessageToAI(messages, apiKey) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (lastUserMsg) {
    const userText = lastUserMsg.text || lastUserMsg.content || '';
    // Update investor profile based on message
    investorProfile.analyzeMessage(userText);
    // Track topic
    const topicKeywords = {
      'portfolio': /portfolio|holding|stock|share|mera.*portfolio/i,
      'options': /option|call|put|strike|chain|oi|open.?interest/i,
      'risk': /risk|safe|protect|hedge|stop.?loss|danger/i,
      'strategy': /strategy|spread|condor|straddle|covered|collar/i,
      'sentiment': /sentiment|indicator|rsi|macd|vix|fii|dii|mood|outlook/i,
      'education': /kya.*hai|what.*is|explain|learn|basic|samjha|teach/i,
      'pnl': /p&l|profit|loss|if.*falls|if.*crash|what.*if|scenario/i,
      'covered_calls': /covered.*call|income.*option|sell.*call.*hold/i,
      'stock_options': /reliance.*option|tcs.*option|hdfc.*option|stock.*option/i,
      'technicals': /rsi|macd|bollinger|moving.*average|chart|pattern|technical/i,
      'diversification': /diversif|sector|rebalance|allocat/i,
      'goals': /goal|plan|retire|child|house|marriage|emergency|target/i,
    };
    for (const [topic, regex] of Object.entries(topicKeywords)) {
      if (regex.test(userText)) investorMemory.addTopic(topic);
    }
  }

  investorMemory.incrementConversation();

  const systemPrompt = buildSystemPrompt(investorMemory, investorProfile);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.text || m.content })),
  ];

  const modelsToTry = [
    ...FREE_MODELS.slice(currentModelIndex),
    ...FREE_MODELS.slice(0, currentModelIndex),
  ];

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const result = await tryModel(model, formattedMessages, apiKey);
      currentModelIndex = FREE_MODELS.indexOf(model);

      // Post-response: extract any facts from AI response for memory
      if (result.text && lastUserMsg) {
        const userText = (lastUserMsg.text || '').toLowerCase();
        // Financial goals detection
        if (userText.includes('goal') || userText.includes('plan') || userText.includes('target')) investorMemory.addGoal('Has financial goals/targets');
        if (userText.includes('retire') || userText.includes('pension') || userText.includes('old age')) investorMemory.addGoal('Retirement planning');
        if (/child|bachch|beti|beta|son|daughter|education.*fund/i.test(userText)) investorMemory.addGoal('Children\'s education/future');
        if (/house|ghar|property|flat|home.*buy|real.?estate/i.test(userText)) investorMemory.addGoal('Buying a house/property');
        if (/marriage|shaadi|wedding/i.test(userText)) investorMemory.addGoal('Marriage/wedding fund');
        if (/emergency|rainy.?day|backup|safety.?net/i.test(userText)) investorMemory.addGoal('Emergency fund');
        if (/car|gaadi|vehicle/i.test(userText)) investorMemory.addGoal('Vehicle purchase');
        if (/travel|vacation|holiday|trip/i.test(userText)) investorMemory.addGoal('Travel/vacation fund');
        if (/business|startup|entrepreneur/i.test(userText)) investorMemory.addGoal('Business/startup investment');
        if (/tax|80c|elss|tax.*sav/i.test(userText)) investorMemory.addGoal('Tax saving');

        // Life situation facts
        if (/salary|income|earn|kamat/i.test(userText)) investorMemory.addFact('User discussed their income/salary');
        if (/job|naukri|kaam|work|office/i.test(userText)) investorMemory.addFact('User is a working professional');
        if (/student|college|padhai/i.test(userText)) investorMemory.addFact('User is a student');
        if (/first.?time|new.*invest|beginner|shuru/i.test(userText)) investorMemory.addFact('User is a first-time investor');
        if (/loss|nuksaan|gir.*gaya|crash/i.test(userText)) investorMemory.addFact('User experienced or fears losses');
        if (/profit|fayda|earn|kama/i.test(userText)) investorMemory.addFact('User focused on profit/earnings');

        // Trading preferences
        if (/long.?term|lamba|5.*year|10.*year/i.test(userText)) investorMemory.addFact('Prefers long-term investing');
        if (/short.?term|quick|jaldi|intraday/i.test(userText)) investorMemory.addFact('Interested in short-term trading');
        if (/dividend|income|regular.*return/i.test(userText)) investorMemory.addFact('Interested in dividend/income investing');
        if (/growth|multibagger|high.*return/i.test(userText)) investorMemory.addFact('Interested in growth/high-return stocks');

        // Risk signals for memory
        const risk = detectRiskLevel(userText);
        if (risk.detected) {
          investorMemory.addRiskSignal(risk.warning);
          investorProfile.recordRiskGate();
        }
      }

      return { text: result.text, model: result.model, error: null };
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}, trying next...`);
    }
  }

  return {
    text: null,
    model: null,
    error: 'All free models are currently rate-limited. Please wait a minute and try again.',
  };
}
