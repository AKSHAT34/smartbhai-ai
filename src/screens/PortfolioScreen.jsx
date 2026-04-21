import { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart, BarChart3, AlertTriangle, Activity, Zap } from 'lucide-react';
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { portfolioHoldings, getSectorAllocation, portfolioPerformance, whatIfScenarios, computeWhatIf } from '../data/mockData';
import './PortfolioScreen.css';

const COLORS = ['#6C2BD9', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function PortfolioScreen({ onAskAI, tier }) {
  const [view, setView] = useState('holdings');
  const [activeScenario, setActiveScenario] = useState(null);
  const sectorData = getSectorAllocation();

  const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.ltp, 0);
  const totalInvested = portfolioHoldings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = ((totalPnL / totalInvested) * 100).toFixed(2);

  const scenarioResults = activeScenario !== null ? computeWhatIf(whatIfScenarios[activeScenario]) : null;
  const scenarioTotalImpact = scenarioResults ? scenarioResults.reduce((s, r) => s + r.impact, 0) : 0;

  const rsiColor = (rsi) => {
    if (rsi > 70) return 'overbought';
    if (rsi < 30) return 'oversold';
    return 'normal';
  };

  return (
    <div className="portfolio-screen">
      <header className="screen-header">
        <h1>Portfolio</h1>
        <button className="ai-analyze-btn" onClick={() => onAskAI('Analyze my portfolio in detail — risk score, sector concentration, and what I should do')}>
          <Sparkles size={14} />
          AI Analysis
        </button>
      </header>

      {/* Value Card */}
      <div className="port-value-card">
        <div className="port-value-row">
          <div>
            <span className="port-label">Current Value</span>
            <h2 className="port-value">₹{totalValue.toLocaleString('en-IN')}</h2>
          </div>
          <div className="port-pnl-box">
            <span className="port-label">Total P&L</span>
            <div className={`port-pnl ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {totalPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              ₹{Math.abs(totalPnL).toLocaleString('en-IN')} ({totalPnLPct}%)
            </div>
          </div>
        </div>

        {/* Mini chart */}
        <div className="port-mini-chart">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={portfolioPerformance}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C2BD9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C2BD9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="url(#colorValue)" strokeWidth={2} />
              <XAxis dataKey="month" hide />
              <YAxis hide domain={['dataMin - 5000', 'dataMax + 5000']} />
              <Tooltip
                contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8, fontSize: 12 }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Value']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Risk Badge */}
        <div className="ai-risk-badge" onClick={() => onAskAI('Explain risk in my portfolio with specific numbers')}>
          <AlertTriangle size={14} />
          <span>Risk Score: 6.5/10 — Moderate-High. IT 32% + Banking 28% = 60% in 2 sectors</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button className={view === 'holdings' ? 'active' : ''} onClick={() => setView('holdings')}>
          <BarChart3 size={14} /> Holdings
        </button>
        <button className={view === 'sectors' ? 'active' : ''} onClick={() => setView('sectors')}>
          <PieChart size={14} /> Sectors
        </button>
        <button className={view === 'whatif' ? 'active' : ''} onClick={() => setView('whatif')}>
          <Zap size={14} /> What-If
        </button>
      </div>

      {view === 'holdings' ? (
        <div className="holdings-list">
          {portfolioHoldings.map((h, i) => {
            const pnl = (h.ltp - h.avgPrice) * h.qty;
            const pnlPct = ((h.ltp - h.avgPrice) / h.avgPrice * 100).toFixed(1);
            return (
              <div key={h.symbol} className="holding-card fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => onAskAI(`Analyze ${h.symbol} — should I hold, sell, or buy more? Show technical indicators and risk.`)}>
                <div className="holding-left">
                  <div className="holding-symbol">{h.symbol}</div>
                  <div className="holding-meta">
                    <span>{h.qty} shares · Avg ₹{h.avgPrice}</span>
                    <span className="holding-sector">{h.sector}</span>
                  </div>
                  {/* Technical indicators row */}
                  <div className="holding-technicals">
                    <span className={`tech-badge rsi-${rsiColor(h.rsi)}`}>RSI {h.rsi}</span>
                    <span className={`tech-badge macd-${h.macdSignal}`}>
                      {h.macdSignal === 'bullish' ? '↑' : h.macdSignal === 'bearish' ? '↓' : '→'} MACD
                    </span>
                    {h.above50DMA ? (
                      <span className="tech-badge above-dma">Above 50D</span>
                    ) : (
                      <span className="tech-badge below-dma">Below 50D</span>
                    )}
                  </div>
                </div>
                <div className="holding-right">
                  <span className="holding-ltp">₹{h.ltp.toLocaleString('en-IN')}</span>
                  <span className={`holding-pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                    {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString('en-IN')} ({pnlPct}%)
                  </span>
                  <span className={`holding-today ${h.change >= 0 ? 'positive' : 'negative'}`}>
                    Today: {h.change >= 0 ? '+' : ''}{h.change}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'sectors' ? (
        <div className="sector-view">
          <div className="sector-chart">
            <ResponsiveContainer width="100%" height={200}>
              <RechartPie>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 8, fontSize: 12 }}
                  formatter={(val) => [`${val}%`, 'Allocation']}
                />
              </RechartPie>
            </ResponsiveContainer>
          </div>
          <div className="sector-legend">
            {sectorData.map((s, i) => (
              <div key={s.name} className="sector-item">
                <div className="sector-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="sector-name">{s.name}</span>
                <span className="sector-pct">{s.value}%</span>
                <span className="sector-amt">₹{s.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="ai-diversify-tip" onClick={() => onAskAI('Which stocks should I diversify into? My IT is 32% and Banking is 28%')}>
            <Sparkles size={14} />
            <span>AI suggests adding Pharma & Infrastructure. IT at 32% is like 32 eggs in one basket.</span>
          </div>
        </div>
      ) : (
        /* What-If Simulator */
        <div className="whatif-view">
          <p className="whatif-desc">
            <Zap size={14} /> See how your portfolio reacts to different market scenarios
          </p>
          <div className="whatif-scenarios">
            {whatIfScenarios.map((s, i) => (
              <button
                key={i}
                className={`whatif-btn ${activeScenario === i ? 'active' : ''}`}
                onClick={() => setActiveScenario(activeScenario === i ? null : i)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {scenarioResults && (
            <div className="whatif-results fade-in-up">
              <div className={`whatif-total ${scenarioTotalImpact >= 0 ? 'positive' : 'negative'}`}>
                <span>Portfolio Impact</span>
                <strong>{scenarioTotalImpact >= 0 ? '+' : ''}₹{scenarioTotalImpact.toLocaleString('en-IN')}</strong>
              </div>
              <div className="whatif-stocks">
                {scenarioResults.filter(r => r.impact !== 0).map(r => (
                  <div key={r.symbol} className="whatif-stock-row">
                    <span className="whatif-symbol">{r.symbol}</span>
                    <span className="whatif-sector">{r.sector}</span>
                    <span className={`whatif-impact ${r.impact >= 0 ? 'positive' : 'negative'}`}>
                      {r.impact >= 0 ? '+' : ''}₹{r.impact.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <button className="whatif-ask-ai" onClick={() => onAskAI(`If ${whatIfScenarios[activeScenario].label}, how should I protect my portfolio? Show me hedging options with exact costs.`)}>
                <Sparkles size={14} /> Ask AI how to hedge this scenario
              </button>
            </div>
          )}

          {!scenarioResults && (
            <div className="whatif-empty">
              <p>Select a scenario above to see the impact on your portfolio</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
