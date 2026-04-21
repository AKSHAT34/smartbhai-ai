import { useState, useEffect } from 'react';
import { Sparkles, Clock, ChevronRight, BookOpen, Play, Award, CheckCircle, Lock, GitBranch } from 'lucide-react';
import { educationalContent } from '../data/mockData';
import './LearnScreen.css';

const categories = ['All', 'Basics', 'Fundamentals', 'Options', 'Investing', 'Technical'];

const STREAK_KEY = 'smartbhai_learn_streak';
const COMPLETED_KEY = 'smartbhai_completed_lessons';

// Knowledge graph — concept relationships
const conceptGraph = [
  { concept: 'Options Basics', emoji: '📈', related: ['Call Option', 'Put Option', 'Strike Price', 'Premium'], nextConcept: 'Options Chain', description: 'Start here — understand what options are before diving deeper.' },
  { concept: 'Options Chain', emoji: '📊', related: ['Open Interest', 'PCR', 'Max Pain', 'IV'], nextConcept: 'Strategy Builder', description: 'Learn to read the options chain — the dashboard of options trading.' },
  { concept: 'Strategy Builder', emoji: '🎯', related: ['Bull Call Spread', 'Bear Put Spread', 'Iron Condor', 'Covered Call'], nextConcept: 'P&L Simulation', description: 'Build strategies based on your market view.' },
  { concept: 'P&L Simulation', emoji: '💰', related: ['Max Profit', 'Max Loss', 'Breakeven', 'Risk-Reward'], nextConcept: 'Risk Management', description: 'See exactly how much you can make or lose before trading.' },
  { concept: 'Risk Management', emoji: '🛡️', related: ['Stop-Loss', 'Position Sizing', 'Hedging', 'Diversification'], nextConcept: 'Portfolio Analysis', description: 'The #1 skill — protect your capital first, profit second.' },
  { concept: 'Portfolio Analysis', emoji: '💼', related: ['Sector Allocation', 'Risk Score', 'P&L Tracking', 'Rebalancing'], nextConcept: 'Technical Analysis', description: 'Understand your portfolio health and where to improve.' },
  { concept: 'Technical Analysis', emoji: '📐', related: ['RSI', 'MACD', 'Moving Averages', 'Bollinger Bands'], nextConcept: 'Market Sentiment', description: 'Read charts and indicators to time your entries and exits.' },
  { concept: 'Market Sentiment', emoji: '🌡️', related: ['VIX', 'FII/DII Flows', 'PCR', 'IV Percentile'], nextConcept: 'Options Basics', description: 'Understand the market mood before making decisions.' },
];

const glossaryTerms = [
  { term: 'P/E Ratio', simple: 'Price you pay for every ₹1 of company earnings. Lower = cheaper stock.', hinglish: 'Agar P/E 20 hai, toh aap ₹20 de rahe ho har ₹1 ki kamai ke liye.' },
  { term: 'Stop-Loss', simple: 'An automatic sell order to limit your loss. Like a safety net for your trade.', hinglish: 'Jaise cricket mein helmet pehnte ho — protection hai, use karo.' },
  { term: 'SIP', simple: 'Systematic Investment Plan — invest a fixed amount regularly, like a recurring deposit for stocks.', hinglish: 'Har mahine thoda thoda invest karo — timing ki tension nahi.' },
  { term: 'Open Interest', simple: 'Total number of active option contracts. High OI = more market interest at that price.', hinglish: 'Jitne zyada log ek price pe bet laga rahe, utna important hai woh level.' },
  { term: 'Max Pain', simple: 'The price where most option buyers lose money. Market often gravitates here at expiry.', hinglish: 'Market ka gravity point — expiry pe NIFTY yahan aane ki koshish karta hai.' },
  { term: 'IV (Implied Volatility)', simple: 'How much the market expects a stock to move. High IV = expensive options.', hinglish: 'Agar IV high hai toh options mehnge hain — selling ka time. Low IV = buying ka time.' },
  { term: 'PCR (Put-Call Ratio)', simple: 'Puts divided by Calls. Above 1 = bearish bets dominate. Below 1 = bullish bets dominate.', hinglish: 'Cricket match mein umbrella count — zyada umbrellas = baarish nahi aati usually.' },
  { term: 'Beta', simple: 'How much a stock moves vs the market. Beta 1.5 = stock moves 50% more than NIFTY.', hinglish: 'Agar NIFTY 1% gira aur stock 1.5% gira, toh beta 1.5 hai — zyada volatile.' },
  { term: 'Covered Call', simple: 'Sell a call option on stocks you own to earn income. Safest options selling strategy.', hinglish: 'Apne shares se income kamao — jaise ghar rent pe dena, shares bhi rent pe do.' },
  { term: 'Bull Call Spread', simple: 'Buy a call + sell a higher call. Same upside, but max loss is capped.', hinglish: 'Bullish ho? Sirf call mat kharido — spread banao, risk kam hoga.' },
  { term: 'Iron Condor', simple: 'Sell both a call spread and put spread. Earn when market stays in a range.', hinglish: 'Market flat rahega? Dono taraf se premium kamao — range-bound strategy.' },
  { term: 'Greeks (Delta, Theta)', simple: 'Delta = how much option moves per ₹1 stock move. Theta = how much value option loses per day.', hinglish: 'Delta = speed, Theta = time decay. Har din option ki value thodi kam hoti hai.' },
];

function getStreakData() {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY));
    if (!data) return { count: 0, lastDate: null };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === today) return data;
    if (data.lastDate === yesterday) return data; // streak still alive
    return { count: 0, lastDate: null }; // streak broken
  } catch { return { count: 0, lastDate: null }; }
}

function updateStreak() {
  const today = new Date().toDateString();
  const current = getStreakData();
  if (current.lastDate === today) return current; // already counted today
  const newStreak = {
    count: current.lastDate === new Date(Date.now() - 86400000).toDateString() ? current.count + 1 : 1,
    lastDate: today,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
  return newStreak;
}

function getCompletedLessons() {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY)) || [];
  } catch { return []; }
}

function toggleLessonComplete(id) {
  const completed = getCompletedLessons();
  const updated = completed.includes(id) ? completed.filter(c => c !== id) : [...completed, id];
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
  return updated;
}

export default function LearnScreen({ onAskAI, tier }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('lessons');
  const [streak, setStreak] = useState(getStreakData());
  const [completed, setCompleted] = useState(getCompletedLessons());

  useEffect(() => {
    // Update streak on screen visit
    const updated = updateStreak();
    setStreak(updated);
  }, []);

  const filtered = activeCategory === 'All'
    ? educationalContent
    : educationalContent.filter(c => c.category === activeCategory);

  const progress = Math.round((completed.length / educationalContent.length) * 100);

  const handleLessonClick = (lesson) => {
    onAskAI(`Teach me: ${lesson.title}. Explain in simple terms with analogies and examples. Use Hinglish if possible.`);
    if (!completed.includes(lesson.id)) {
      const updated = toggleLessonComplete(lesson.id);
      setCompleted(updated);
    }
  };

  return (
    <div className="learn-screen">
      <header className="screen-header">
        <h1>Learn</h1>
        <div className="learn-streak">
          <Award size={14} />
          <span>{streak.count > 0 ? `${streak.count} day streak 🔥` : 'Start your streak!'}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="learn-progress-card">
        <div className="progress-header">
          <span className="progress-label">{completed.length}/{educationalContent.length} lessons explored</span>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* AI Tutor Card */}
      <div className="ai-tutor-card" onClick={() => onAskAI("Main ek beginner hoon. Mujhe investing ke basics samjhao — kahan se shuru karu?")}>
        <div className="tutor-left">
          <div className="tutor-avatar">
            <Sparkles size={20} />
          </div>
          <div>
            <h3>AI Tutor</h3>
            <p>Ask me anything about investing in simple Hindi or English</p>
          </div>
        </div>
        <ChevronRight size={18} />
      </div>

      {/* Tabs */}
      <div className="learn-tabs">
        <button className={activeTab === 'lessons' ? 'active' : ''} onClick={() => setActiveTab('lessons')}>
          <BookOpen size={14} /> Lessons
        </button>
        <button className={activeTab === 'glossary' ? 'active' : ''} onClick={() => setActiveTab('glossary')}>
          <Sparkles size={14} /> Glossary
        </button>
        <button className={activeTab === 'path' ? 'active' : ''} onClick={() => setActiveTab('path')}>
          <GitBranch size={14} /> Path
        </button>
      </div>

      {activeTab === 'lessons' && (
        <>
          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lessons */}
          <div className="lessons-list">
            {filtered.map((lesson, i) => {
              const isCompleted = completed.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className={`lesson-card fade-in-up ${isCompleted ? 'completed' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className="lesson-emoji">{lesson.emoji}</div>
                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    {lesson.description && <p className="lesson-desc">{lesson.description}</p>}
                    <div className="lesson-meta">
                      <span className="lesson-cat">{lesson.category}</span>
                      <span className="lesson-dur"><Clock size={10} /> {lesson.duration}</span>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle size={16} className="lesson-check" />
                  ) : (
                    <Play size={16} className="lesson-play" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'glossary' && (
        <div className="glossary-list">
          <p className="glossary-intro">
            <Sparkles size={14} /> Complex terms explained in one line + Hinglish. Tap any term to ask AI for more.
          </p>
          {glossaryTerms.map((item, i) => (
            <div
              key={i}
              className="glossary-card fade-in-up"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => onAskAI(`${item.term} kya hota hai? Simple mein samjhao with examples and analogies.`)}
            >
              <h4 className="glossary-term">{item.term}</h4>
              <p className="glossary-simple">{item.simple}</p>
              {item.hinglish && <p className="glossary-hinglish">🗣️ {item.hinglish}</p>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'path' && (
        <div className="learning-path">
          <p className="path-intro">
            <GitBranch size={14} /> Your learning journey — each concept connects to the next. Tap to explore.
          </p>
          <div className="path-graph">
            {conceptGraph.map((node, i) => (
              <div key={i} className="path-node fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="path-node-main" onClick={() => onAskAI(`Teach me about ${node.concept}. Explain in simple terms with analogies. What should I know before learning this, and what comes next?`)}>
                  <div className="path-node-icon">{node.emoji}</div>
                  <div className="path-node-content">
                    <h4>{node.concept}</h4>
                    <p>{node.description}</p>
                  </div>
                  <ChevronRight size={14} />
                </div>
                <div className="path-related">
                  {node.related.map((r, j) => (
                    <button key={j} className="path-related-btn" onClick={() => onAskAI(`${r} kya hota hai? Simple mein samjhao.`)}>
                      {r}
                    </button>
                  ))}
                </div>
                {i < conceptGraph.length - 1 && (
                  <div className="path-connector">
                    <div className="path-line" />
                    <span className="path-arrow">↓</span>
                    <span className="path-next-label">Next: {node.nextConcept}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
