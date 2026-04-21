// ============================================================
// FREEMIUM TIER SYSTEM — Free / Smart / Elite
// ============================================================
// Based on proposal: tiers unlock based on wallet balance,
// trades/month, portfolio value, or subscription pack.
// For the prototype, we simulate with localStorage toggles.

const TIER_STORAGE_KEY = 'smartbhai_user_tier';
const NOTIF_STORAGE_KEY = 'smartbhai_notifications';

export const TIERS = {
  free: {
    id: 'free',
    name: 'AI Lite',
    label: 'FREE',
    emoji: '🆓',
    color: 'muted',
    chatLimit: 3,
    features: [
      'Market summary (daily AI briefing)',
      '3 AI chat messages per day',
      'Portfolio health score (number only)',
      'Basic glossary & 2 micro-lessons/week',
      'Options chain view (raw data)',
    ],
    locked: [
      'Unlimited AI chat',
      'Full options AI interpretation',
      'Strategy Builder (Buy & Sell)',
      'P&L Simulator',
      'Full portfolio risk analysis',
      'Market sentiment (9 indicators)',
    ],
  },
  smart: {
    id: 'smart',
    name: 'AI Pro',
    label: 'SMART',
    emoji: '⚡',
    color: 'amber',
    chatLimit: Infinity,
    unlockConditions: [
      '₹50,000+ wallet balance',
      '20+ trades/month',
      '₹2,00,000+ portfolio value',
      'Power Investor Pack (₹399/mo)',
    ],
    features: [
      'Unlimited AI chat with memory & profiling',
      'Full options chain AI interpretation',
      'Strategy Builder — Buy AND Sell strategies',
      'P&L Simulator (unlimited scenarios)',
      'Full portfolio risk analysis',
      'All micro-lessons & AI Tutor',
      'Market sentiment with 9 indicators',
    ],
    locked: [
      'AI-powered trade ideas',
      'Advanced Greeks explanation',
      'Multi-leg strategy builder',
      'Portfolio hedging recommendations',
      'Earnings impact simulator',
      'Export AI analysis as PDF',
    ],
  },
  elite: {
    id: 'elite',
    name: 'AI Ultra',
    label: 'ELITE',
    emoji: '🏆',
    color: 'purple',
    chatLimit: Infinity,
    unlockConditions: [
      '₹5,00,000+ portfolio value',
      '50+ trades/month',
      'Ultra Trader Pack (₹899/mo)',
      '₹2,00,000+ wallet balance',
    ],
    features: [
      'Everything in Smart Tier',
      'AI-powered trade ideas (educational)',
      'Advanced Greeks per position',
      'Multi-leg strategy builder (Iron Condor, Butterfly)',
      'Portfolio-level hedging recommendations',
      'Earnings impact simulator',
      'Priority AI model (faster responses)',
      'Export AI analysis as PDF',
    ],
    locked: [],
  },
};

// Simulated user data for tier calculation
const SIMULATED_USER = {
  walletBalance: 35000,   // Below ₹50K — Free tier by default
  tradesThisMonth: 8,
  portfolioValue: 332500, // Above ₹2L — qualifies for Smart
  subscription: null,     // null | 'power' | 'ultra'
};

export function getUserTierData() {
  try {
    const stored = JSON.parse(localStorage.getItem(TIER_STORAGE_KEY));
    if (stored) return stored;
  } catch {}
  return SIMULATED_USER;
}

export function setUserTierData(data) {
  localStorage.setItem(TIER_STORAGE_KEY, JSON.stringify(data));
}

export function calculateTier(userData) {
  const d = userData || getUserTierData();
  if (d.subscription === 'ultra' || d.walletBalance >= 200000 || d.portfolioValue >= 500000 || d.tradesThisMonth >= 50) {
    return 'elite';
  }
  if (d.subscription === 'power' || d.walletBalance >= 50000 || d.portfolioValue >= 200000 || d.tradesThisMonth >= 20) {
    return 'smart';
  }
  return 'free';
}

export function getTierInfo(tierId) {
  return TIERS[tierId] || TIERS.free;
}

export function getNextTierInfo(currentTier) {
  if (currentTier === 'free') return TIERS.smart;
  if (currentTier === 'smart') return TIERS.elite;
  return null;
}

// How close is the user to the next tier?
export function getTierProgress(userData) {
  const d = userData || getUserTierData();
  const currentTier = calculateTier(d);

  if (currentTier === 'elite') return { tier: 'elite', progress: 100, nextTier: null, hint: null };

  if (currentTier === 'free') {
    // Closest path to Smart
    const walletPct = Math.min(100, Math.round((d.walletBalance / 50000) * 100));
    const portfolioPct = Math.min(100, Math.round((d.portfolioValue / 200000) * 100));
    const tradesPct = Math.min(100, Math.round((d.tradesThisMonth / 20) * 100));
    const best = Math.max(walletPct, portfolioPct, tradesPct);
    let hint = '';
    if (portfolioPct >= walletPct && portfolioPct >= tradesPct) {
      hint = `Portfolio ₹${d.portfolioValue.toLocaleString('en-IN')} / ₹2,00,000 — already ${portfolioPct}% there!`;
    } else if (walletPct >= tradesPct) {
      hint = `Deposit ₹${(50000 - d.walletBalance).toLocaleString('en-IN')} more to unlock AI Pro`;
    } else {
      hint = `${20 - d.tradesThisMonth} more trades this month to unlock AI Pro`;
    }
    return { tier: 'free', progress: best, nextTier: 'smart', hint };
  }

  // Smart → Elite
  const walletPct = Math.min(100, Math.round((d.walletBalance / 200000) * 100));
  const portfolioPct = Math.min(100, Math.round((d.portfolioValue / 500000) * 100));
  const tradesPct = Math.min(100, Math.round((d.tradesThisMonth / 50) * 100));
  const best = Math.max(walletPct, portfolioPct, tradesPct);
  let hint = '';
  if (portfolioPct >= walletPct && portfolioPct >= tradesPct) {
    hint = `Portfolio ₹${d.portfolioValue.toLocaleString('en-IN')} / ₹5,00,000`;
  } else if (tradesPct >= walletPct) {
    hint = `${50 - d.tradesThisMonth} more trades this month for Elite`;
  } else {
    hint = `Deposit ₹${(200000 - d.walletBalance).toLocaleString('en-IN')} more for Elite`;
  }
  return { tier: 'smart', progress: best, nextTier: 'elite', hint };
}

// ============================================================
// DAILY NOTIFICATIONS — Simulated push notifications
// ============================================================
export function getDailyNotifications() {
  const hour = new Date().getHours();
  const notifications = [];

  // Morning briefing (before market open)
  if (hour < 15) {
    notifications.push({
      id: 'morning',
      type: 'briefing',
      emoji: '🤖',
      title: 'SmartBhai AI Daily Report',
      body: 'AI Market Outlook: Mildly Bullish today. VIX low, FIIs buying. Your HDFCBANK may benefit.',
      cta: 'Tap for strategy →',
      time: '9:00 AM',
    });
  }

  // Profit notification
  notifications.push({
    id: 'profit',
    type: 'profit',
    emoji: '📊',
    title: 'AI Traders Daily Update',
    body: 'Today, AI-assisted traders using SmartBhai made:',
    stats: {
      totalProfit: '₹2.4 Cr',
      trades: '12,400',
      topStrategy: 'Bull Call Spread (+68% win rate)',
      yourPnL: '+₹1,240',
    },
    cta: 'See what AI suggests for tomorrow →',
    time: '4:00 PM',
  });

  // Weekly summary (if Sunday-ish)
  notifications.push({
    id: 'weekly',
    type: 'weekly',
    emoji: '📈',
    title: 'Your Weekly AI Summary',
    body: 'AI-assisted traders had 64% win rate this week. Top strategy: Covered Calls.',
    stats: {
      winRate: '64%',
      topStrategy: 'Covered Calls',
      topicsExplored: 3,
      streak: '3 days 🔥',
    },
    cta: 'Keep your streak going →',
    time: 'Sunday',
  });

  // Milestone
  notifications.push({
    id: 'milestone',
    type: 'milestone',
    emoji: '🎉',
    title: 'Milestone Reached!',
    body: 'You\'ve explored 10+ topics with AI this month. You\'re becoming a confident investor!',
    cta: 'Share your journey →',
    time: 'Today',
  });

  return notifications;
}

// Upgrade nudge for free tier users
export function getUpgradeNudge(currentTier) {
  if (currentTier !== 'free') return null;
  const nudges = [
    { text: 'AI Pro traders made ₹2.4 Cr today. Deposit ₹50K to unlock AI Pro →', type: 'profit' },
    { text: 'Unlock unlimited AI chat, Strategy Builder & P&L Simulator. You\'re 66% there!', type: 'progress' },
    { text: 'Your portfolio qualifies for AI Pro! Just ₹15K more in wallet to unlock →', type: 'close' },
  ];
  return nudges[Math.floor(Math.random() * nudges.length)];
}
