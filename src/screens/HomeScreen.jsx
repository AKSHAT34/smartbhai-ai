import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sparkles, ChevronRight, Bell, ArrowUpRight, ArrowDownRight, Shield, Lightbulb, AlertTriangle, BookOpen, Activity, ChevronDown, ChevronUp, X, Lock, Zap, Award, Share2 } from 'lucide-react';
import { marketSummary, aiInsights, portfolioHoldings, marketIndicators, getOverallSentiment } from '../data/mockData';
import { tier2Tier3Scenarios } from '../services/aiService';
import { getDailyNotifications, getUpgradeNudge, getNextTierInfo } from '../services/tierService';
import './HomeScreen.css';

export default function HomeScreen({ onAskAI, onNavigate, tier }) {
  const [greeting, setGreeting] = useState('');
  const [expandedIndicator, setExpandedIndicator] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.ltp, 0);
  const totalInvested = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = ((totalPnL / totalInvested) * 100).toFixed(2);
  const overallSentiment = getOverallSentiment();
  const notifications = getDailyNotifications();
  const upgradeNudge = tier ? getUpgradeNudge(tier.tierId) : null;
  const nextTier = tier ? getNextTierInfo(tier.tierId) : null;

  const insightIcon = (type) => {
    switch (type) {
      case 'risk': return <AlertTriangle size={16} />;
      case 'opportunity': return <TrendingUp size={16} />;
      case 'education': return <BookOpen size={16} />;
      default: return <Lightbulb size={16} />;
    }
  };

  const sentimentColor = (color) => {
    switch (color) {
      case 'green': return 'sentiment-green';
      case 'red': return 'sentiment-red';
      case 'amber': return 'sentiment-amber';
      default: return 'sentiment-amber';
    }
  };

  return (
    <div className="home-screen">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <div className="logo-mark">SB</div>
          <div>
            <p className="greeting">{greeting} 👋</p>
            <h1 className="user-name">Investor</h1>
          </div>
        </div>
        <div className="header-right-group">
          {/* Tier Badge */}
          {tier && (
            <div className={`tier-badge tier-${tier.tierInfo.color}`}>
              <span>{tier.tierInfo.emoji}</span>
              <span>{tier.tierInfo.label}</span>
            </div>
          )}
          <button className="notification-btn" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <span className="notif-dot" />
          </button>
        </div>
      </header>

      {/* Upgrade Nudge for Free Tier */}
      {upgradeNudge && !dismissedNudge && (
        <div className="upgrade-nudge fade-in-up">
          <div className="nudge-content">
            <Zap size={14} />
            <span>{upgradeNudge.text}</span>
          </div>
          <button className="nudge-dismiss" onClick={() => setDismissedNudge(true)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tier Progress Bar (for non-elite users) */}
      {tier && tier.progress.nextTier && (
        <div className="tier-progress-card fade-in-up">
          <div className="tier-progress-header">
            <span className="tier-progress-label">
              {tier.tierInfo.emoji} {tier.tierInfo.name} → {getNextTierInfo(tier.tierId)?.emoji} {getNextTierInfo(tier.tierId)?.name}
            </span>
            <span className="tier-progress-pct">{tier.progress.progress}%</span>
          </div>
          <div className="tier-progress-bar">
            <div className="tier-progress-fill" style={{ width: `${tier.progress.progress}%` }} />
          </div>
          <p className="tier-progress-hint">{tier.progress.hint}</p>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <div className="notification-panel fade-in-up">
          <div className="notif-panel-header">
            <h3>🔔 AI Notifications</h3>
            <button onClick={() => setShowNotifications(false)} aria-label="Close"><X size={16} /></button>
          </div>
          {notifications.map(n => (
            <div key={n.id} className={`notif-card notif-${n.type}`} onClick={() => { setShowNotifications(false); onAskAI('What is the overall market sentiment today?'); }}>
              <div className="notif-top">
                <span className="notif-emoji">{n.emoji}</span>
                <div className="notif-info">
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-time">{n.time}</span>
                </div>
              </div>
              <p className="notif-body">{n.body}</p>
              {n.stats && (
                <div className="notif-stats">
                  {n.stats.totalProfit && <div className="notif-stat"><span className="ns-label">Total Profit</span><span className="ns-value positive">{n.stats.totalProfit}</span></div>}
                  {n.stats.trades && <div className="notif-stat"><span className="ns-label">Trades</span><span className="ns-value">{n.stats.trades}</span></div>}
                  {n.stats.topStrategy && <div className="notif-stat"><span className="ns-label">Top Strategy</span><span className="ns-value">{n.stats.topStrategy}</span></div>}
                  {n.stats.yourPnL && <div className="notif-stat"><span className="ns-label">Your P&L</span><span className="ns-value positive">{n.stats.yourPnL}</span></div>}
                  {n.stats.winRate && <div className="notif-stat"><span className="ns-label">Win Rate</span><span className="ns-value">{n.stats.winRate}</span></div>}
                  {n.stats.streak && <div className="notif-stat"><span className="ns-label">Streak</span><span className="ns-value">{n.stats.streak}</span></div>}
                </div>
              )}
              <span className="notif-cta">{n.cta}</span>
              {n.type === 'milestone' && (
                <button className="notif-share-btn" onClick={(e) => e.stopPropagation()}>
                  <Share2 size={12} /> Share
                </button>
              )}
            </div>
          ))}
          {tier?.tierId === 'free' && (
            <div className="notif-upgrade-banner">
              <Lock size={14} />
              <span>AI Pro traders made ₹2.4 Cr today. <strong>Deposit ₹50K to unlock AI Pro →</strong></span>
            </div>
          )}
        </div>
      )}

      {/* AI Morning Briefing */}
      <section className="ai-briefing-card fade-in-up" onClick={() => onAskAI('What is the overall market sentiment today?')}>
        <div className="briefing-header">
          <Sparkles size={14} className="sparkle-icon" />
          <span>AI Market Briefing</span>
        </div>
        <p className="briefing-text">
          Market is <span className={sentimentColor(overallSentiment.color)}>{overallSentiment.emoji} {overallSentiment.label}</span>. 
          VIX low at {marketSummary.vix.value}, FIIs buying ₹{marketSummary.fiiActivity.net} Cr. 
          Banking leading (+{marketSummary.bankNifty.change}%). Your HDFCBANK & SBIN benefit. 
          <span className="briefing-cta">Tap for full analysis →</span>
        </p>
      </section>

      {/* Portfolio Summary Card */}
      <section className="portfolio-summary-card fade-in-up" onClick={() => onNavigate('portfolio')}>
        <div className="summary-header">
          <span className="summary-label">Portfolio Value</span>
          <ChevronRight size={16} className="chevron" />
        </div>
        <h2 className="summary-value">₹{totalValue.toLocaleString('en-IN')}</h2>
        <div className={`summary-pnl ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
          {totalPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>₹{Math.abs(totalPnL).toLocaleString('en-IN')} ({totalPnLPct}%)</span>
        </div>
        <div className="summary-sparkle">
          <Sparkles size={14} />
          <span>AI says: Risk Score 6.5/10. IT overweight at 32%. Tap for insights.</span>
        </div>
      </section>

      {/* Market Pulse */}
      <section className="section fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="section-title">Market Pulse</h3>
        <div className="market-cards">
          {[
            { label: 'NIFTY 50', ...marketSummary.nifty },
            { label: 'SENSEX', ...marketSummary.sensex },
            { label: 'BANK NIFTY', ...marketSummary.bankNifty },
          ].map(idx => (
            <div key={idx.label} className="market-card">
              <span className="market-label">{idx.label}</span>
              <span className="market-value">{idx.value.toLocaleString('en-IN')}</span>
              <span className={`market-change ${idx.change >= 0 ? 'positive' : 'negative'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change}%
              </span>
            </div>
          ))}
        </div>
        <div className="vix-bar">
          <Shield size={14} />
          <span>India VIX: {marketSummary.vix.value} ({marketSummary.vix.change}%) — Low volatility</span>
        </div>
      </section>

      {/* Market Sentiment — 9 Indicators */}
      <section className="section fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="section-header">
          <h3 className="section-title">
            <Activity size={16} className="sparkle-icon" /> Market Sentiment
          </h3>
          <div className={`sentiment-badge ${sentimentColor(overallSentiment.color)}`}>
            {overallSentiment.emoji} {overallSentiment.label}
          </div>
        </div>
        <div className="indicators-grid">
          {marketIndicators.map((ind) => (
            <div
              key={ind.id}
              className={`indicator-chip ${expandedIndicator === ind.id ? 'expanded' : ''}`}
              onClick={() => setExpandedIndicator(expandedIndicator === ind.id ? null : ind.id)}
            >
              <div className="indicator-top">
                <span className="indicator-emoji">{ind.emoji}</span>
                <div className="indicator-info">
                  <span className="indicator-name">{ind.name}</span>
                  <span className={`indicator-signal ${sentimentColor(ind.color)}`}>{ind.signal}</span>
                </div>
                {expandedIndicator === ind.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              {expandedIndicator === ind.id && (
                <div className="indicator-detail">
                  <p className="indicator-ranges">{ind.ranges}</p>
                  <p className="indicator-analogy">💡 {ind.analogy}</p>
                  <button className="indicator-ask-btn" onClick={(e) => { e.stopPropagation(); onAskAI(`Explain ${ind.name} in detail and what it means for my portfolio`); }}>
                    Ask AI more →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Insights */}
      <section className="section fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h3 className="section-title">
            <Sparkles size={16} className="sparkle-icon" /> AI Insights
          </h3>
          <span className="badge">{aiInsights.length} new</span>
        </div>
        <div className="insights-list">
          {aiInsights.map((insight, i) => (
            <div
              key={insight.id}
              className={`insight-card ${insight.severity}`}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              onClick={() => onAskAI(insight.title)}
            >
              <div className="insight-icon-wrap">
                {insightIcon(insight.type)}
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
              </div>
              <ChevronRight size={16} className="insight-chevron" />
            </div>
          ))}
        </div>
      </section>

      {/* Ask AI — Tier 2/3 Scenarios */}
      <section className="section fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="section-title">
          <Sparkles size={16} className="sparkle-icon" /> Ask AI Assistant
        </h3>
        {tier2Tier3Scenarios.slice(0, 4).map((cat, ci) => (
          <div key={ci} className="home-scenario-group">
            <span className="home-scenario-label">{cat.category}</span>
            <div className="quick-questions">
              {cat.questions.slice(0, 2).map((q, i) => (
                <button key={i} className="quick-q-btn" onClick={() => onAskAI(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FII/DII Activity */}
      <section className="section fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="section-title">Institutional Activity</h3>
        <div className="fii-dii-row">
          <div className="fii-card">
            <span className="inst-label">FII</span>
            <span className="inst-value positive">+₹{marketSummary.fiiActivity.net} Cr</span>
            <span className="inst-sub">Net Buyers</span>
          </div>
          <div className="fii-card">
            <span className="inst-label">DII</span>
            <span className="inst-value positive">+₹{marketSummary.diiActivity.net} Cr</span>
            <span className="inst-sub">Net Buyers</span>
          </div>
        </div>
      </section>

      <div style={{ height: 20 }} />
    </div>
  );
}
