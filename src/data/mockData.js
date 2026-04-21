// Portfolio Holdings
export const portfolioHoldings = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 15, avgPrice: 2450, ltp: 2680, sector: 'Energy', change: 1.2, rsi: 55, macdSignal: 'bullish', above50DMA: true, lotSize: 250 },
  { symbol: 'TCS', name: 'Tata Consultancy', qty: 10, avgPrice: 3800, ltp: 3950, sector: 'IT', change: -0.5, rsi: 42, macdSignal: 'bearish', above50DMA: false, lotSize: 150 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', qty: 20, avgPrice: 1580, ltp: 1720, sector: 'Banking', change: 0.8, rsi: 64, macdSignal: 'bullish', above50DMA: true, lotSize: 550 },
  { symbol: 'INFY', name: 'Infosys', qty: 25, avgPrice: 1450, ltp: 1520, sector: 'IT', change: -1.1, rsi: 38, macdSignal: 'bearish', above50DMA: false, lotSize: 300 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', qty: 30, avgPrice: 680, ltp: 750, sector: 'Auto', change: 2.3, rsi: 71, macdSignal: 'bullish', above50DMA: true, lotSize: 575 },
  { symbol: 'SBIN', name: 'State Bank of India', qty: 40, avgPrice: 620, ltp: 680, sector: 'Banking', change: 0.4, rsi: 52, macdSignal: 'neutral', above50DMA: true, lotSize: 750 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', qty: 12, avgPrice: 1350, ltp: 1480, sector: 'Telecom', change: 1.5, rsi: 60, macdSignal: 'bullish', above50DMA: true, lotSize: 475 },
  { symbol: 'ITC', name: 'ITC Limited', qty: 50, avgPrice: 420, ltp: 465, sector: 'FMCG', change: 0.3, rsi: 48, macdSignal: 'neutral', above50DMA: true, lotSize: 1600 },
];

// Sector allocation derived from holdings
export const getSectorAllocation = () => {
  const sectors = {};
  portfolioHoldings.forEach(h => {
    const value = h.qty * h.ltp;
    sectors[h.sector] = (sectors[h.sector] || 0) + value;
  });
  const total = Object.values(sectors).reduce((a, b) => a + b, 0);
  return Object.entries(sectors).map(([name, value]) => ({
    name,
    value: Math.round((value / total) * 100),
    amount: value,
  }));
};

// Portfolio performance over time
export const portfolioPerformance = [
  { month: 'Oct', value: 285000 },
  { month: 'Nov', value: 292000 },
  { month: 'Dec', value: 278000 },
  { month: 'Jan', value: 305000 },
  { month: 'Feb', value: 318000 },
  { month: 'Mar', value: 332500 },
];

// Options chain data for NIFTY
export const optionsChainData = {
  underlying: 'NIFTY',
  spotPrice: 22450,
  expiry: '27 Mar 2026',
  data: [
    { strike: 22200, callOI: 1250000, callChange: 125000, callLTP: 310, putOI: 850000, putChange: -45000, putLTP: 62, pcr: 0.68 },
    { strike: 22300, callOI: 980000, callChange: 85000, callLTP: 235, putOI: 1100000, putChange: 95000, putLTP: 88, pcr: 1.12 },
    { strike: 22400, callOI: 1450000, callChange: 210000, callLTP: 172, putOI: 1350000, putChange: 180000, putLTP: 125, pcr: 0.93 },
    { strike: 22500, callOI: 2100000, callChange: 350000, callLTP: 118, putOI: 1800000, putChange: 220000, putLTP: 170, pcr: 0.86 },
    { strike: 22600, callOI: 1650000, callChange: 180000, callLTP: 78, putOI: 2200000, putChange: 310000, putLTP: 230, pcr: 1.33 },
    { strike: 22700, callOI: 1100000, callChange: 95000, callLTP: 48, putOI: 1950000, putChange: 275000, putLTP: 300, pcr: 1.77 },
  ],
  maxPain: 22450,
  ivPercentile: 62,
};

// Stock-specific options data (for covered call / stock options suggestions)
export const stockOptionsData = {
  RELIANCE: {
    spotPrice: 2680,
    lotSize: 250,
    expiry: '27 Mar 2026',
    iv: 22,
    historicalIV: 28,
    calls: [
      { strike: 2700, ltp: 45, oi: 520000 },
      { strike: 2750, ltp: 28, oi: 680000 },
      { strike: 2800, ltp: 15, oi: 450000 },
    ],
    puts: [
      { strike: 2650, ltp: 38, oi: 410000 },
      { strike: 2600, ltp: 22, oi: 550000 },
      { strike: 2550, ltp: 12, oi: 320000 },
    ],
  },
  TCS: {
    spotPrice: 3950,
    lotSize: 150,
    expiry: '27 Mar 2026',
    iv: 25,
    historicalIV: 22,
    calls: [
      { strike: 4000, ltp: 62, oi: 280000 },
      { strike: 4050, ltp: 38, oi: 350000 },
      { strike: 4100, ltp: 20, oi: 220000 },
    ],
    puts: [
      { strike: 3900, ltp: 55, oi: 310000 },
      { strike: 3850, ltp: 35, oi: 420000 },
      { strike: 3800, ltp: 18, oi: 260000 },
    ],
  },
  HDFCBANK: {
    spotPrice: 1720,
    lotSize: 550,
    expiry: '27 Mar 2026',
    iv: 20,
    historicalIV: 24,
    calls: [
      { strike: 1750, ltp: 25, oi: 620000 },
      { strike: 1800, ltp: 12, oi: 780000 },
    ],
    puts: [
      { strike: 1700, ltp: 30, oi: 540000 },
      { strike: 1650, ltp: 15, oi: 650000 },
    ],
  },
};

// Market summary
export const marketSummary = {
  nifty: { value: 22450, change: 0.45, high: 22520, low: 22380 },
  sensex: { value: 73850, change: 0.38, high: 74100, low: 73650 },
  bankNifty: { value: 48200, change: 0.72, high: 48450, low: 47980 },
  vix: { value: 14.2, change: -3.5 },
  fiiActivity: { buy: 4520, sell: 3890, net: 630 },
  diiActivity: { buy: 3200, sell: 2850, net: 350 },
};

// Market Sentiment Indicators (9 indicators as per proposal)
export const marketIndicators = [
  { id: 'vix', name: 'India VIX', emoji: '🌡️', value: 14.2, signal: 'LOW FEAR', sentiment: 'bullish', color: 'green', ranges: '<13 Bullish · 13-18 Neutral · 18-25 Cautious · >25 Bearish', analogy: 'VIX is like a fear thermometer. Right now it\'s reading normal temperature — no fever in the market.' },
  { id: 'pcr', name: 'Put-Call Ratio', emoji: '⚖️', value: 0.93, signal: 'NEUTRAL', sentiment: 'neutral', color: 'amber', ranges: '>1.2 Bullish · 0.9-1.2 Neutral · <0.9 Bearish', analogy: 'Think of PCR as umbrella count at a cricket match. If many carry umbrellas (puts), rain (crash) usually doesn\'t come.' },
  { id: 'fii', name: 'FII/DII Flows', emoji: '🐋', value: '+₹630 Cr', signal: 'FII BUYING', sentiment: 'bullish', color: 'green', ranges: 'FII buying >₹500 Cr = Strong bullish', analogy: 'FIIs are like big whales in the ocean. When they swim in, the tide rises for everyone.' },
  { id: 'rsi', name: 'RSI (14)', emoji: '🏎️', value: 58.3, signal: 'NEUTRAL', sentiment: 'neutral', color: 'green', ranges: '>70 Overbought · 30-70 Normal · <30 Oversold', analogy: 'RSI is like a speedometer. Above 70 means the stock is running too fast and may need to slow down.' },
  { id: 'macd', name: 'MACD', emoji: '🏃', value: 'Crossover', signal: 'BULLISH', sentiment: 'bullish', color: 'green', ranges: 'Bullish crossover 2 days ago', analogy: 'Think of two runners. When the fast runner overtakes the slow one, it\'s a buy signal.' },
  { id: 'bb', name: 'Bollinger Bands', emoji: '📏', value: 'Middle', signal: 'NEUTRAL', sentiment: 'neutral', color: 'amber', ranges: 'Upper 22,680 · Middle 22,380 · Lower 22,080', analogy: 'Like a rubber band — price tends to snap back to the middle when it stretches too far to either side.' },
  { id: 'ma', name: 'Moving Averages', emoji: '📐', value: 'Above All', signal: 'BULLISH', sentiment: 'bullish', color: 'green', ranges: '20-DMA: 22,320 · 50-DMA: 22,180 · 200-DMA: 21,650', analogy: 'Moving averages show the stock\'s average mood. Being above all of them means the mood has been consistently positive.' },
  { id: 'maxpain', name: 'Max Pain', emoji: '🧲', value: '22,450', signal: 'AT MAX PAIN', sentiment: 'neutral', color: 'amber', ranges: 'NIFTY is exactly at Max Pain — 0% deviation', analogy: 'Max Pain is like a gravity point. NIFTY tends to get pulled toward this price as expiry approaches.' },
  { id: 'iv', name: 'IV Percentile', emoji: '💎', value: '62%', signal: 'MODERATE', sentiment: 'neutral', color: 'amber', ranges: '>75% Expensive · 25-75% Normal · <25% Cheap', analogy: 'Think of IV like sale season. When IV is low, options are on sale — good time to buy protection.' },
];

// Compute overall sentiment from indicators
export const getOverallSentiment = () => {
  const bullish = marketIndicators.filter(i => i.sentiment === 'bullish').length;
  const bearish = marketIndicators.filter(i => i.sentiment === 'bearish').length;
  if (bullish > bearish + 2) return { label: 'BULLISH', emoji: '🟢', color: 'green' };
  if (bearish > bullish + 2) return { label: 'BEARISH', emoji: '🔴', color: 'red' };
  if (bullish > bearish) return { label: 'MILDLY BULLISH', emoji: '🟡', color: 'green' };
  if (bearish > bullish) return { label: 'MILDLY BEARISH', emoji: '🟠', color: 'amber' };
  return { label: 'NEUTRAL', emoji: '⚪', color: 'amber' };
};

// AI Insights (enhanced with more detail)
export const aiInsights = [
  {
    id: 1,
    type: 'risk',
    title: 'High IT Sector Concentration',
    description: 'Your portfolio has 32% in IT stocks (TCS + INFY). Like putting 32 eggs in one basket — consider diversifying into Pharma or Infrastructure.',
    severity: 'warning',
    actionable: true,
    action: 'View Suggestions',
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'TATAMOTORS Breakout Signal',
    description: 'RSI at 71 — near overbought. Up 10.3% from your buy. Consider trailing stop-loss at ₹720 to protect ₹2,100 profit.',
    severity: 'success',
    actionable: true,
    action: 'Set Stop-Loss',
  },
  {
    id: 3,
    type: 'education',
    title: 'PCR at 0.93 — What It Means',
    description: 'NIFTY Put-Call Ratio is neutral. Like umbrella count at a cricket match — balanced crowd, no extreme fear or greed.',
    severity: 'info',
    actionable: true,
    action: 'Learn More',
  },
  {
    id: 4,
    type: 'risk',
    title: 'Earnings Season Alert',
    description: 'TCS and INFY report earnings next week. Your IT exposure is ₹1,07,500. Consider hedging with NIFTY IT puts.',
    severity: 'warning',
    actionable: true,
    action: 'Explore Hedging',
  },
  {
    id: 5,
    type: 'opportunity',
    title: 'Covered Call Opportunity',
    description: 'You hold 15 RELIANCE shares. Sell 2750 CE at ₹28 to earn ₹7,000 income. IV is low (22% vs 28% historical) — options are cheap.',
    severity: 'success',
    actionable: true,
    action: 'Learn Covered Calls',
  },
];

// Chat conversation starters
export const quickQuestions = [
  "How is my portfolio doing?",
  "Explain NIFTY options chain",
  "Which stocks should I diversify into?",
  "What's the market outlook today?",
  "Explain risk in my portfolio",
  "What is Put-Call Ratio?",
];


// AI Chat responses (simulated for demo mode)
export const chatResponses = {
  "How is my portfolio doing?": {
    text: `📊 **Portfolio Summary**\n\nYour portfolio is valued at **₹3,32,500** — up **₹16,700 (5.3%)** from your investment of ₹3,15,800.\n\n**Top Performers:**\n🟢 TATAMOTORS: +10.3% (₹2,100 profit)\n🟢 BHARTIARTL: +9.6% (₹1,560 profit)\n🟢 ITC: +10.7% (₹2,250 profit)\n\n**Needs Attention:**\n🔴 INFY: +4.8% (below sector average)\n🔴 TCS: +3.9% (underperforming peers)\n\n💡 **AI Suggestion:** Your IT stocks are underperforming. Consider rebalancing 10-15% into Pharma or Infrastructure sectors which are showing momentum.`,
    followUp: ["Show sector breakdown", "How to rebalance?", "Set alerts for IT stocks"],
  },
  "Explain NIFTY options chain": {
    text: `📈 **NIFTY Options Chain — Simplified**\n\nExpiry: 27 Mar 2026 | Spot: 22,450\n\n**Key Levels:**\n🔵 Max Pain: **22,450** (market likely to stay near this)\n🟢 Highest Put OI: **22,600** (strong support)\n🔴 Highest Call OI: **22,500** (resistance)\n\n**What this means in simple terms:**\n• Market makers expect NIFTY to stay between **22,400-22,600**\n• More puts are being written at 22,600 = traders are bullish below this\n• IV Percentile at 62% = options are moderately expensive\n\n**PCR: 0.93** (Slightly bearish to neutral)\n\n💡 For a beginner: Think of Max Pain as the "magnet" price where NIFTY tends to settle at expiry.`,
    followUp: ["What is Max Pain?", "Should I buy calls or puts?", "Explain IV Percentile"],
  },
  "Which stocks should I diversify into?": {
    text: `🎯 **Diversification Suggestions**\n\nBased on your current portfolio analysis:\n\n**Missing Sectors:**\n🏥 **Pharma** — 0% allocation (Recommended: 10-15%)\n  Suggestions: Sun Pharma, Dr. Reddy's\n\n🏗️ **Infrastructure** — 0% allocation (Recommended: 5-10%)\n  Suggestions: L&T, Adani Ports\n\n⚡ **Power/Green Energy** — 0% allocation (Trending sector)\n  Suggestions: NTPC, Tata Power\n\n**Current Overweight:**\n💻 IT: 32% (Reduce to 20-25%)\n🏦 Banking: 28% (Slightly high, reduce to 20-25%)\n\n💡 **AI Recommendation:** Start with a small SIP in Pharma ETF (₹500/week) to build exposure gradually without timing risk.`,
    followUp: ["Tell me about Sun Pharma", "How to start SIP?", "What is sector rotation?"],
  },
  "What's the market outlook today?": {
    text: `🌅 **Market Pulse — Today**\n\n📊 **Indices:**\n• NIFTY 50: 22,450 (+0.45%)\n• SENSEX: 73,850 (+0.38%)\n• BANK NIFTY: 48,200 (+0.72%)\n\n📉 **India VIX: 14.2** (-3.5%) — Low fear, market is calm\n\n💰 **FII/DII Activity:**\n• FIIs: Net buyers ₹630 Cr (positive signal)\n• DIIs: Net buyers ₹350 Cr\n\n**Sector Movers:**\n🟢 Banking (+0.72%) — Leading the rally\n🟢 Auto (+0.55%) — Continued momentum\n🔴 IT (-0.3%) — Profit booking\n\n💡 **AI Take:** Broad-based buying with FII support. Banking sector leading — your HDFCBANK and SBIN holdings benefit. Keep trailing stop-losses on auto stocks after recent run-up.`,
    followUp: ["Impact on my portfolio?", "Should I buy more bank stocks?", "What are FIIs doing?"],
  },
  "Explain risk in my portfolio": {
    text: `⚠️ **Portfolio Risk Analysis**\n\n**Risk Score: 6.5/10** (Moderate-High)\n\n**Key Risks Identified:**\n\n1️⃣ **Sector Concentration** 🔴\n   IT (32%) + Banking (28%) = 60% in just 2 sectors\n   Impact: A sector downturn could hit hard\n\n2️⃣ **No Defensive Allocation** 🟡\n   0% in Pharma, FMCG is only 7%\n   Impact: No cushion during market falls\n\n3️⃣ **Earnings Risk** 🔴\n   TCS & INFY earnings next week\n   Impact: Could swing ₹10,000+ in portfolio value\n\n4️⃣ **No Hedging** 🟡\n   No options or stop-losses set\n   Impact: Full downside exposure\n\n**Risk-Adjusted Return: 12.8%** (Market avg: 14.2%)\n\n💡 **Action Plan:**\n• Set stop-loss on TATAMOTORS at ₹720 (protect 5.9% gain)\n• Consider NIFTY 22200 PE as portfolio hedge (₹62/lot)\n• Gradually shift 10% from IT to Pharma`,
    followUp: ["How to set stop-loss?", "Explain hedging with puts", "What is risk-adjusted return?"],
  },
  "What is Put-Call Ratio?": {
    text: `📚 **Put-Call Ratio (PCR) — Explained Simply**\n\n**What is it?**\nPCR = Total Put Open Interest ÷ Total Call Open Interest\n\nThink of it as a "crowd mood meter" for the market.\n\n**How to read it:**\n• **PCR > 1.0** → More puts being bought → Crowd is hedging → Often **bullish** (contrarian signal)\n• **PCR < 0.7** → More calls being bought → Crowd is greedy → Often **bearish** warning\n• **PCR 0.8-1.0** → Neutral zone\n\n**Current NIFTY PCR: 0.93** → Slightly below neutral\n\n**Real-world analogy:**\nImagine PCR as an umbrella count at a cricket match. If many people carry umbrellas (puts), it often means the rain (crash) doesn't come. If nobody has umbrellas, that's when it pours!\n\n💡 **For your portfolio:** Current PCR suggests no extreme fear or greed. Safe to hold positions but keep stop-losses active.`,
    followUp: ["What is Open Interest?", "How to use PCR for trading?", "Show me NIFTY PCR trend"],
  },
};

// Default response for unmatched queries
export const defaultResponse = {
  text: `I understand your question! Let me help you with that.\n\n🤖 As your AI assistant, I can help with:\n\n📊 **Portfolio Analysis** — How your investments are performing\n📈 **Market Insights** — What's happening in the market today\n🎯 **Options Analysis** — Simplified options chain interpretation\n📚 **Education** — Learn trading concepts in simple language\n⚠️ **Risk Alerts** — Understand and manage your portfolio risk\n\nTry asking me something specific like:\n• "How is my portfolio doing?"\n• "Explain NIFTY options chain"\n• "What's the market outlook today?"`,
  followUp: ["Show my portfolio", "Market summary", "Teach me about options"],
};

// Educational content (expanded per proposal)
export const educationalContent = [
  { id: 1, title: 'What is a Stop-Loss?', category: 'Basics', duration: '2 min', emoji: '🛡️', description: 'An automatic sell order to limit your loss. Like a safety net for your trade.' },
  { id: 2, title: 'Understanding P/E Ratio', category: 'Fundamentals', duration: '3 min', emoji: '📊', description: 'Price you pay for every ₹1 of company earnings.' },
  { id: 3, title: 'Options Trading 101', category: 'Options', duration: '5 min', emoji: '📈', description: 'Options ka matlab hai — aapko right milta hai, obligation nahi.' },
  { id: 4, title: 'SIP vs Lumpsum', category: 'Investing', duration: '2 min', emoji: '💰', description: 'Which is better for Tier-2/3 investors? The answer may surprise you.' },
  { id: 5, title: 'Reading Candlestick Charts', category: 'Technical', duration: '4 min', emoji: '🕯️', description: 'Green candle = buyers won. Red candle = sellers won. Simple.' },
  { id: 6, title: 'What is Diversification?', category: 'Basics', duration: '2 min', emoji: '🎯', description: 'Don\'t put all eggs in one basket — but how many baskets?' },
  { id: 7, title: 'Bull Call Spread Explained', category: 'Options', duration: '4 min', emoji: '🐂', description: 'Same upside as buying a call, but with capped risk. The smart way to be bullish.' },
  { id: 8, title: 'Covered Calls for Income', category: 'Options', duration: '3 min', emoji: '💵', description: 'Earn income from stocks you already own. The safest options selling strategy.' },
  { id: 9, title: 'What is Max Pain?', category: 'Options', duration: '2 min', emoji: '🧲', description: 'The price where most option buyers lose money. Market\'s gravity point.' },
  { id: 10, title: 'FII vs DII — Who Moves Markets?', category: 'Fundamentals', duration: '3 min', emoji: '🐋', description: 'Foreign whales vs domestic dolphins. Who should you follow?' },
  { id: 11, title: 'Risk Management 101', category: 'Basics', duration: '3 min', emoji: '⚠️', description: 'The #1 skill that separates winners from losers in the market.' },
  { id: 12, title: 'Iron Condor Strategy', category: 'Options', duration: '5 min', emoji: '🦅', description: 'Earn when market stays flat. Advanced but powerful income strategy.' },
];

// What-if scenarios for P&L simulation
export const whatIfScenarios = [
  { label: 'NIFTY falls 5%', niftyChange: -5, description: 'Market correction scenario' },
  { label: 'IT sector crashes 10%', sectorImpact: { IT: -10 }, description: 'Sector-specific downturn' },
  { label: 'Banking rallies 8%', sectorImpact: { Banking: 8 }, description: 'Banking sector boom' },
  { label: 'Broad market rally 3%', niftyChange: 3, description: 'Bull run continues' },
];

// Compute what-if P&L
export const computeWhatIf = (scenario) => {
  return portfolioHoldings.map(h => {
    let changePercent = 0;
    if (scenario.niftyChange) {
      // Beta-adjusted impact (simplified)
      const beta = { Energy: 0.9, IT: 1.2, Banking: 1.1, Auto: 1.3, Telecom: 0.8, FMCG: 0.6 };
      changePercent = scenario.niftyChange * (beta[h.sector] || 1);
    }
    if (scenario.sectorImpact && scenario.sectorImpact[h.sector]) {
      changePercent = scenario.sectorImpact[h.sector];
    }
    const currentValue = h.qty * h.ltp;
    const impact = Math.round(currentValue * changePercent / 100);
    return { symbol: h.symbol, sector: h.sector, currentValue, changePercent: changePercent.toFixed(1), impact };
  });
};
