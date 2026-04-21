import { useState } from 'react';
import { Sparkles, Info, TrendingUp, TrendingDown, Target, Activity, Shield, DollarSign, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { optionsChainData, stockOptionsData, portfolioHoldings } from '../data/mockData';
import './OptionsScreen.css';

export default function OptionsScreen({ onAskAI, tier }) {
  const { underlying, spotPrice, expiry, data, maxPain, ivPercentile } = optionsChainData;
  const [strategyTab, setStrategyTab] = useState('buy');

  // Find holdings that have stock options available
  const holdingsWithOptions = portfolioHoldings.filter(h => stockOptionsData[h.symbol]);

  return (
    <div className="options-screen">
      <header className="screen-header">
        <h1>Options AI</h1>
        <button className="ai-analyze-btn" onClick={() => onAskAI('Explain NIFTY options chain — key levels, PCR, and what it means for my portfolio')}>
          <Sparkles size={14} />
          Explain
        </button>
      </header>

      {/* Underlying Info */}
      <div className="underlying-bar">
        <div>
          <span className="underlying-name">{underlying}</span>
          <span className="underlying-price">₹{spotPrice.toLocaleString('en-IN')}</span>
        </div>
        <span className="expiry-badge">Expiry: {expiry}</span>
      </div>

      {/* AI Key Levels */}
      <div className="ai-levels-card">
        <div className="ai-levels-header">
          <Sparkles size={14} className="sparkle-icon" />
          <span>AI Key Levels</span>
        </div>
        <div className="levels-grid">
          <div className="level-item">
            <Target size={16} className="level-icon target" />
            <div>
              <span className="level-label">Max Pain</span>
              <span className="level-value">{maxPain.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="level-item">
            <Activity size={16} className="level-icon iv" />
            <div>
              <span className="level-label">IV Percentile</span>
              <span className="level-value">{ivPercentile}%</span>
            </div>
          </div>
          <div className="level-item">
            <TrendingUp size={16} className="level-icon support" />
            <div>
              <span className="level-label">Support (Put OI)</span>
              <span className="level-value">22,600</span>
            </div>
          </div>
          <div className="level-item">
            <TrendingDown size={16} className="level-icon resist" />
            <div>
              <span className="level-label">Resistance (Call OI)</span>
              <span className="level-value">22,500</span>
            </div>
          </div>
        </div>
        <div className="ai-interpretation" onClick={() => onAskAI('What does the current options chain tell us about NIFTY direction?')}>
          <Info size={14} />
          <span>Market expects NIFTY to stay in 22,400-22,600 range. PCR at 0.93 is neutral. Tap to learn more.</span>
        </div>
      </div>

      {/* Options Chain Table */}
      <div className="chain-table-wrap">
        <div className="chain-header-row">
          <div className="chain-side calls-side"><span>CALLS</span></div>
          <div className="chain-strike-header">Strike</div>
          <div className="chain-side puts-side"><span>PUTS</span></div>
        </div>
        <div className="chain-subheader">
          <span>OI</span><span>Chg</span><span>LTP</span>
          <span className="strike-col">Strike</span>
          <span>LTP</span><span>Chg</span><span>OI</span>
        </div>
        {data.map((row) => {
          const isATM = row.strike === 22400 || row.strike === 22500;
          const isITMCall = row.strike < spotPrice;
          const isITMPut = row.strike > spotPrice;
          return (
            <div key={row.strike} className={`chain-row ${isATM ? 'atm-row' : ''}`}>
              <div className={`chain-cell ${isITMCall ? 'itm' : ''}`}>{(row.callOI / 100000).toFixed(1)}L</div>
              <div className={`chain-cell oi-change ${row.callChange > 0 ? 'positive' : 'negative'}`}>
                {row.callChange > 0 ? '+' : ''}{(row.callChange / 1000).toFixed(0)}K
              </div>
              <div className="chain-cell ltp">{row.callLTP}</div>
              <div className="chain-cell strike-cell">
                {row.strike.toLocaleString('en-IN')}
                {row.pcr && (
                  <span className={`pcr-mini ${row.pcr > 1 ? 'bullish' : row.pcr < 0.8 ? 'bearish' : 'neutral'}`}>
                    {row.pcr.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="chain-cell ltp">{row.putLTP}</div>
              <div className={`chain-cell oi-change ${row.putChange > 0 ? 'positive' : 'negative'}`}>
                {row.putChange > 0 ? '+' : ''}{(row.putChange / 1000).toFixed(0)}K
              </div>
              <div className={`chain-cell ${isITMPut ? 'itm' : ''}`}>{(row.putOI / 100000).toFixed(1)}L</div>
            </div>
          );
        })}
      </div>

      {/* Chain Legend */}
      <div className="chain-legend">
        <div className="legend-item"><span className="legend-dot bullish-dot" /> PCR &gt; 1.0 = Bullish</div>
        <div className="legend-item"><span className="legend-dot neutral-dot" /> PCR 0.8-1.0 = Neutral</div>
        <div className="legend-item"><span className="legend-dot bearish-dot" /> PCR &lt; 0.8 = Bearish</div>
      </div>

      {/* AI Strategy Builder — Buy & Sell Tabs */}
      <div className="options-strategy-section">
        <h3><Sparkles size={14} /> AI Strategy Builder</h3>
        <p className="strategy-desc">Tell AI your market view, get a strategy with P&L breakdown</p>
        
        <div className="strategy-tabs">
          <button className={strategyTab === 'buy' ? 'active' : ''} onClick={() => setStrategyTab('buy')}>
            <TrendingUp size={14} /> Buy Strategies
          </button>
          <button className={strategyTab === 'sell' ? 'active' : ''} onClick={() => setStrategyTab('sell')}>
            <DollarSign size={14} /> Sell for Income
          </button>
        </div>

        {strategyTab === 'buy' ? (
          <div className="strategy-cards">
            <div className="strategy-card bullish" onClick={() => onAskAI("I'm bullish on NIFTY, suggest a Bull Call Spread with exact strikes from the options chain, max profit, max loss and breakeven")}>
              <TrendingUp size={18} />
              <span>Bullish</span>
              <small>Bull Call Spread, Long Call</small>
            </div>
            <div className="strategy-card bearish" onClick={() => onAskAI("I'm bearish on NIFTY, suggest a Bear Put Spread with exact strikes, max profit, max loss and breakeven")}>
              <TrendingDown size={18} />
              <span>Bearish</span>
              <small>Bear Put Spread, Long Put</small>
            </div>
            <div className="strategy-card neutral" onClick={() => onAskAI("Suggest an Iron Condor strategy if NIFTY stays range-bound between 22400-22600 with exact strikes, max profit, max loss and breakeven")}>
              <Activity size={18} />
              <span>Range-bound</span>
              <small>Iron Condor, Short Straddle</small>
            </div>
            <div className="strategy-card hedge" onClick={() => onAskAI("How to protect my portfolio from a 10% market crash using NIFTY puts? Show exact strikes, costs and protection level for my ₹3.3L portfolio")}>
              <Shield size={18} />
              <span>Hedge Portfolio</span>
              <small>Protective Put, Collar</small>
            </div>
          </div>
        ) : (
          <div className="strategy-cards">
            <div className="strategy-card income" onClick={() => onAskAI("I hold 15 RELIANCE shares. Suggest a covered call strategy — which strike to sell, premium I'll earn, and what happens if RELIANCE goes above that strike")}>
              <DollarSign size={18} />
              <span>Covered Call</span>
              <small>Earn income from your RELIANCE holdings</small>
            </div>
            <div className="strategy-card credit" onClick={() => onAskAI("Suggest a credit spread on NIFTY — sell a put spread to earn premium with capped risk. Show exact strikes, net credit, max loss")}>
              <TrendingDown size={18} />
              <span>Credit Spread</span>
              <small>Sell premium, capped risk</small>
            </div>
            <div className="strategy-card cash-put" onClick={() => onAskAI("Explain cash-secured put strategy. If I want to buy HDFCBANK cheaper, how can I sell puts to get paid while waiting?")}>
              <Target size={18} />
              <span>Cash-Secured Put</span>
              <small>Get paid to buy stocks cheaper</small>
            </div>
            <div className="strategy-card collar" onClick={() => onAskAI("I hold TATAMOTORS at ₹750 with 10.3% profit. Suggest a collar strategy to protect my gains while still earning some income")}>
              <Shield size={18} />
              <span>Collar Strategy</span>
              <small>Protect gains + earn income</small>
            </div>
          </div>
        )}
      </div>

      {/* Covered Call Opportunities from Holdings */}
      {holdingsWithOptions.length > 0 && (
        <div className="covered-call-section">
          <h3><DollarSign size={14} /> Covered Call Opportunities</h3>
          <p className="strategy-desc">Earn income from stocks you already own</p>
          {holdingsWithOptions.map(h => {
            const opts = stockOptionsData[h.symbol];
            const otmCall = opts.calls[1]; // First OTM call
            const income = otmCall.ltp * opts.lotSize;
            const ivStatus = opts.iv < opts.historicalIV ? 'cheap' : 'expensive';
            return (
              <div key={h.symbol} className="covered-call-card" onClick={() => onAskAI(`I hold ${h.qty} ${h.symbol} shares. Explain covered call strategy — sell ${otmCall.strike} CE at ₹${otmCall.ltp}. What's my income, risk, and what happens if ${h.symbol} goes above ${otmCall.strike}?`)}>
                <div className="cc-header">
                  <span className="cc-symbol">{h.symbol}</span>
                  <span className={`cc-iv ${ivStatus}`}>IV {opts.iv}% {ivStatus === 'cheap' ? '(cheap vs ' + opts.historicalIV + '%)' : '(expensive vs ' + opts.historicalIV + '%)'}</span>
                </div>
                <div className="cc-details">
                  <div className="cc-detail">
                    <span className="cc-label">Sell</span>
                    <span className="cc-value">{otmCall.strike} CE @ ₹{otmCall.ltp}</span>
                  </div>
                  <div className="cc-detail">
                    <span className="cc-label">Income</span>
                    <span className="cc-value cc-income">₹{income.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cc-detail">
                    <span className="cc-label">Risk</span>
                    <span className="cc-value">Shares called away above {otmCall.strike}</span>
                  </div>
                </div>
                <div className="cc-cta">
                  <Sparkles size={12} /> Ask AI to explain →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Leg Strategy Visualizer */}
      <div className="multileg-section">
        <h3><Activity size={14} /> Multi-Leg Strategy Visual</h3>
        <p className="strategy-desc">See how advanced strategies work with payoff diagrams</p>
        <div className="multileg-cards">
          <div className="multileg-card" onClick={() => onAskAI("Explain Iron Condor on NIFTY with exact strikes from the options chain. Show all 4 legs, max profit, max loss, breakeven points, and a simple payoff explanation")}>
            <div className="ml-header">
              <span className="ml-name">🦅 Iron Condor</span>
              <span className="ml-tag ml-neutral">Range-bound</span>
            </div>
            <div className="ml-legs">
              <div className="ml-leg sell"><span>Sell</span> 22300 PE @ ₹88</div>
              <div className="ml-leg buy"><span>Buy</span> 22200 PE @ ₹62</div>
              <div className="ml-leg sell"><span>Sell</span> 22600 CE @ ₹78</div>
              <div className="ml-leg buy"><span>Buy</span> 22700 CE @ ₹48</div>
            </div>
            <div className="ml-payoff">
              <div className="ml-payoff-bar">
                <div className="ml-zone ml-loss-zone" style={{width:'20%'}}><span>Loss</span></div>
                <div className="ml-zone ml-profit-zone" style={{width:'60%'}}><span>Profit ₹56</span></div>
                <div className="ml-zone ml-loss-zone" style={{width:'20%'}}><span>Loss</span></div>
              </div>
              <div className="ml-payoff-labels">
                <span>22,200</span><span>22,300</span><span className="ml-spot">Spot</span><span>22,600</span><span>22,700</span>
              </div>
            </div>
            <div className="ml-stats">
              <div><span className="ml-stat-label">Max Profit</span><span className="ml-stat-value positive">₹56/lot</span></div>
              <div><span className="ml-stat-label">Max Loss</span><span className="ml-stat-value negative">₹44/lot</span></div>
              <div><span className="ml-stat-label">Breakeven</span><span className="ml-stat-value">22,244 — 22,656</span></div>
            </div>
          </div>

          <div className="multileg-card" onClick={() => onAskAI("Explain Butterfly Spread on NIFTY with exact strikes. Show all 3 legs, max profit at center strike, max loss, and when to use this strategy")}>
            <div className="ml-header">
              <span className="ml-name">🦋 Butterfly Spread</span>
              <span className="ml-tag ml-neutral">Pinpoint</span>
            </div>
            <div className="ml-legs">
              <div className="ml-leg buy"><span>Buy</span> 22300 CE @ ₹235</div>
              <div className="ml-leg sell"><span>Sell 2x</span> 22450 CE @ ₹172</div>
              <div className="ml-leg buy"><span>Buy</span> 22600 CE @ ₹78</div>
            </div>
            <div className="ml-payoff">
              <div className="ml-payoff-bar">
                <div className="ml-zone ml-loss-zone" style={{width:'30%'}}><span>Loss</span></div>
                <div className="ml-zone ml-profit-zone" style={{width:'40%'}}><span>Profit ₹141</span></div>
                <div className="ml-zone ml-loss-zone" style={{width:'30%'}}><span>Loss</span></div>
              </div>
              <div className="ml-payoff-labels">
                <span>22,300</span><span className="ml-spot">22,450 (center)</span><span>22,600</span>
              </div>
            </div>
            <div className="ml-stats">
              <div><span className="ml-stat-label">Max Profit</span><span className="ml-stat-value positive">₹141/lot (at 22,450)</span></div>
              <div><span className="ml-stat-label">Max Loss</span><span className="ml-stat-value negative">₹9/lot</span></div>
              <div><span className="ml-stat-label">Best When</span><span className="ml-stat-value">NIFTY pins at 22,450</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Impact Simulator */}
      <div className="earnings-section">
        <h3><Calendar size={14} /> Earnings Impact Simulator</h3>
        <p className="strategy-desc">See how upcoming earnings could affect your holdings</p>
        <div className="earnings-cards">
          {portfolioHoldings.filter(h => h.sector === 'IT').map(h => (
            <div key={h.symbol} className="earnings-card" onClick={() => onAskAI(`${h.symbol} earnings are coming next week. I hold ${h.qty} shares at ₹${h.avgPrice}. Show me: 1) What happens if earnings beat expectations (+5%), 2) What happens if earnings miss (-8%), 3) How to hedge with options before earnings`)}>
              <div className="earn-header">
                <span className="earn-symbol">{h.symbol}</span>
                <span className="earn-date">📅 Next week</span>
              </div>
              <div className="earn-scenarios">
                <div className="earn-scenario positive">
                  <span className="earn-label">Beat (+5%)</span>
                  <span className="earn-impact">+₹{Math.round(h.qty * h.ltp * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="earn-scenario negative">
                  <span className="earn-label">Miss (-8%)</span>
                  <span className="earn-impact">-₹{Math.round(h.qty * h.ltp * 0.08).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="earn-cta">
                <Sparkles size={12} /> Ask AI how to hedge <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* P&L Simulator */}
      <div className="options-pnl-section">
        <h3><Sparkles size={14} /> P&L Simulator</h3>
        <p className="strategy-desc">See what happens to your money in different scenarios</p>
        <div className="options-q-list">
          {[
            "If NIFTY falls 5%, how much will my portfolio lose?",
            "Show P&L if I buy NIFTY 22500 CE at ₹118",
            "Compare buying a call vs bull call spread for NIFTY",
            "How much can I lose selling a naked NIFTY 22200 put?",
            "If I sell RELIANCE 2750 CE covered call, show all scenarios",
          ].map((q, i) => (
            <button key={i} className="options-q-btn" onClick={() => onAskAI(q)}>{q}</button>
          ))}
        </div>
      </div>

      {/* Learn Options Basics */}
      <div className="options-ai-questions">
        <h3><BookOpen size={14} /> Learn Options Basics</h3>
        <div className="options-q-list">
          {[
            "Options trading kya hota hai? Simple mein samjhao",
            "What is Max Pain and why does it matter?",
            "PCR kya hai aur isse kaise use kare?",
            "Covered call kya hai? Meri holdings se income kaise kamau?",
            "Naked option selling kitna risky hai?",
            "Bull Call Spread vs buying a call — kya better hai?",
          ].map((q, i) => (
            <button key={i} className="options-q-btn" onClick={() => onAskAI(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
