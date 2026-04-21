import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Key, X, ChevronRight, Zap, Shield, Flame, Scale, Brain, Trash2, ThumbsUp, ThumbsDown, AlertTriangle, Lock } from 'lucide-react';
import { sendMessageToAI, detectRiskLevel, tier2Tier3Scenarios, investorProfile, investorMemory } from '../services/aiService';
import { quickQuestions, chatResponses, defaultResponse } from '../data/mockData';
import './ChatScreen.css';

const API_KEY_STORAGE = 'smartbhai_openrouter_key';

export default function ChatScreen({ initialQuestion, onClearInitial, tier }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) return stored;
    // Auto-load from env for development
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (envKey) {
      localStorage.setItem(API_KEY_STORAGE, envKey);
      return envKey;
    }
    return '';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showScenarios, setShowScenarios] = useState(false);
  const [activeScenarioCategory, setActiveScenarioCategory] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(investorProfile.getProfile());
  const [feedback, setFeedback] = useState({}); // { messageId: 'up' | 'down' }
  const [riskWarning, setRiskWarning] = useState(null); // { level, warning }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialQuestionHandled = useRef(false);

  const isAIMode = !!apiKey;

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: 0,
      role: 'assistant',
      text: isAIMode
        ? `Namaste! 🙏 Main hoon aapka **SmartBhai AI** — powered by real AI.\n\nMain aapke portfolio ko samajhta hoon, options chain simplify karta hoon, aur aapko confident investor banane mein madad karta hoon.\n\nAap mujhse Hindi, English ya Hinglish mein baat kar sakte hain!\n\n💡 Neeche ke scenarios try karein ya kuch bhi poochein.`
        : `Namaste! 🙏 I'm **SmartBhai AI** — your trading bhai.\n\nI can help you understand your portfolio, simplify market data, explain options trading, and guide your investment decisions.\n\n🔑 **Connect AI:** Tap the key icon to add your free OpenRouter API key for real AI-powered responses.\n\nOr try the quick questions below for a demo!`,
      suggestions: isAIMode ? null : quickQuestions.slice(0, 3),
    }]);
  }, [isAIMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initial question from other screens
  useEffect(() => {
    if (initialQuestion && !initialQuestionHandled.current) {
      initialQuestionHandled.current = true;
      // Small delay to let the component mount
      setTimeout(() => {
        handleSend(initialQuestion);
        onClearInitial();
      }, 300);
    }
  }, [initialQuestion]);

  // Reset the ref when initialQuestion changes to null
  useEffect(() => {
    if (!initialQuestion) {
      initialQuestionHandled.current = false;
    }
  }, [initialQuestion]);

  const saveApiKey = () => {
    const key = keyInput.trim();
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
      setApiKey(key);
      setShowKeyModal(false);
      setKeyInput('');
      setError(null);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setShowKeyModal(false);
  };

  const handleSend = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isTyping) return;

    setError(null);
    const userMessage = { id: Date.now(), role: 'user', text: userMsg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setShowScenarios(false);
    setRiskWarning(null);
    setIsTyping(true);

    if (isAIMode) {
      // Real AI mode — send to OpenRouter
      const conversationHistory = updatedMessages
        .filter(m => m.id !== 0) // skip welcome message
        .map(m => ({ role: m.role, text: m.text }));

      const result = await sendMessageToAI(conversationHistory, apiKey);

      if (result.error) {
        setError(result.error);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          text: `⚠️ AI se connect nahi ho paya: ${result.error}\n\nPlease check your API key or try again.`,
          isError: true,
        }]);
      } else {
        if (result.model) setActiveModel(result.model);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          text: result.text,
        }]);
        // Refresh profile after each AI interaction
        setProfileData({ ...investorProfile.getProfile() });
      }
      setIsTyping(false);
    } else {
      // Demo mode — use static responses
      setTimeout(() => {
        const q = userMsg.toLowerCase();
        let response = defaultResponse;
        for (const [key, value] of Object.entries(chatResponses)) {
          const keyWords = key.toLowerCase().split(' ');
          const matchCount = keyWords.filter(w => q.includes(w.toLowerCase())).length;
          if (matchCount >= 2) { response = value; break; }
        }
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          text: response.text,
          suggestions: response.followUp,
        }]);
        setIsTyping(false);
      }, 1000 + Math.random() * 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="chat-screen">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="ai-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <h2>SmartBhai AI</h2>
            <span className="ai-status">
              <span className={`status-dot ${isAIMode ? 'live' : 'demo'}`} />
              {isAIMode ? `AI Connected${activeModel ? ` · ${activeModel.split('/')[1]?.split(':')[0] || activeModel}` : ''}` : 'Demo Mode'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {/* Tier Badge */}
          {tier && (
            <div className={`tier-chip tier-${tier.tierInfo.color}`} title={tier.tierInfo.name}>
              {tier.tierInfo.emoji} {tier.tierInfo.label}
            </div>
          )}
          {/* Investor Profile Badge */}
          {isAIMode && profileData.riskCategory !== 'unknown' && (
            <div className={`profile-badge ${profileData.riskCategory}`} title={`Risk Score: ${profileData.riskScore}/100`}>
              {profileData.riskCategory === 'safe' && <Shield size={13} />}
              {profileData.riskCategory === 'moderate' && <Scale size={13} />}
              {profileData.riskCategory === 'risky' && <Flame size={13} />}
              <span>{profileData.riskCategory}</span>
            </div>
          )}
          <button
            className={`key-btn ${isAIMode ? 'connected' : ''}`}
            onClick={() => setShowKeyModal(true)}
            aria-label="API Key Settings"
          >
            <Key size={16} />
          </button>
        </div>
      </header>

      {/* Scenario Drawer */}
      {showScenarios && (
        <div className="scenarios-drawer">
          <div className="scenarios-header">
            <h3><Zap size={14} /> Tier-2/3 Investor Scenarios</h3>
            <button onClick={() => setShowScenarios(false)} aria-label="Close scenarios"><X size={16} /></button>
          </div>
          <div className="scenario-categories">
            {tier2Tier3Scenarios.map((cat, i) => (
              <div key={i} className="scenario-category">
                <button
                  className={`scenario-cat-btn ${activeScenarioCategory === i ? 'active' : ''}`}
                  onClick={() => setActiveScenarioCategory(activeScenarioCategory === i ? null : i)}
                >
                  <span>{cat.category}</span>
                  <ChevronRight size={14} className={activeScenarioCategory === i ? 'rotated' : ''} />
                </button>
                {activeScenarioCategory === i && (
                  <div className="scenario-questions">
                    {cat.questions.map((q, j) => (
                      <button key={j} className="scenario-q-btn" onClick={() => handleSend(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {/* Free tier chat limit banner */}
        {tier?.tierId === 'free' && isAIMode && (
          <div className="chat-limit-banner">
            <Lock size={12} />
            <span>Free Tier: {Math.max(0, tier.tierInfo.chatLimit - messages.filter(m => m.role === 'user').length)}/{tier.tierInfo.chatLimit} messages remaining today. <strong>Deposit ₹50K for unlimited →</strong></span>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role} ${msg.isError ? 'error-msg' : ''}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="message-bubble">
              <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
              />
              {msg.suggestions && (
                <div className="follow-up-btns">
                  {msg.suggestions.map((q, i) => (
                    <button key={i} className="follow-up-btn" onClick={() => handleSend(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {/* Feedback buttons for AI messages */}
              {msg.role === 'assistant' && msg.id !== 0 && !msg.isError && (
                <div className="feedback-row">
                  <button
                    className={`feedback-btn ${feedback[msg.id] === 'up' ? 'active-up' : ''}`}
                    onClick={() => {
                      setFeedback(prev => ({ ...prev, [msg.id]: 'up' }));
                      investorMemory.addFact('User found a response helpful (thumbs up)');
                    }}
                    aria-label="Helpful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    className={`feedback-btn ${feedback[msg.id] === 'down' ? 'active-down' : ''}`}
                    onClick={() => {
                      setFeedback(prev => ({ ...prev, [msg.id]: 'down' }));
                      investorMemory.addFact('User found a response unhelpful (thumbs down)');
                    }}
                    aria-label="Not helpful"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-bubble typing-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        {/* Risk Gate Warning Banner */}
        {riskWarning && (
          <div className={`risk-gate-banner risk-${riskWarning.level}`}>
            <AlertTriangle size={14} />
            <span>{riskWarning.warning}</span>
          </div>
        )}
        <div className="chat-input-row">
          <button
            className={`scenarios-toggle ${showScenarios ? 'active' : ''}`}
            onClick={() => setShowScenarios(!showScenarios)}
            aria-label="Show scenarios"
          >
            <Zap size={18} />
          </button>
          <div className="chat-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={isAIMode ? "Kuch bhi poochein... Hindi/English" : "Ask me anything..."}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Real-time risk detection
                if (e.target.value.length > 5) {
                  const risk = detectRiskLevel(e.target.value);
                  setRiskWarning(risk.detected ? risk : null);
                } else {
                  setRiskWarning(null);
                }
              }}
              onKeyDown={handleKeyDown}
              aria-label="Type your message"
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="disclaimer-text">
          {isAIMode ? `🤖 AI-powered${activeModel ? ` by ${activeModel.split('/')[1]?.split(':')[0] || 'free model'}` : ''} via OpenRouter` : '📋 Demo mode — connect API key for real AI'}
          {' · Not financial advice'}
        </p>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Key size={16} /> OpenRouter API Key</h3>
              <button onClick={() => setShowKeyModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">
                Connect a free OpenRouter API key to power the AI chat with Llama 3.3 70B — a powerful open-source model, completely free.
              </p>
              <div className="modal-steps">
                <div className="step">
                  <span className="step-num">1</span>
                  <span>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a></span>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <span>Sign up (free) and create an API key</span>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <span>Paste the key below</span>
                </div>
              </div>
              <input
                type="password"
                className="key-input"
                placeholder="sk-or-v1-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
              />
              <div className="modal-actions">
                <button className="modal-save-btn" onClick={saveApiKey} disabled={!keyInput.trim()}>
                  Connect AI
                </button>
                {isAIMode && (
                  <button className="modal-clear-btn" onClick={clearApiKey}>
                    Disconnect
                  </button>
                )}
              </div>
              {isAIMode && (
                <div className="modal-status connected">
                  <span className="status-dot live" /> Currently connected
                </div>
              )}
              <p className="modal-note">
                Your key is stored locally in your browser. We never send it to any server except OpenRouter.
              </p>
              {/* Memory & Profile Controls */}
              <div className="modal-memory-section">
                <h4><Brain size={14} /> AI Memory & Profile</h4>
                <div className="memory-stats">
                  <div className="memory-stat">
                    <span className="stat-label">Sessions</span>
                    <span className="stat-value">{investorMemory.memories.conversationCount}</span>
                  </div>
                  <div className="memory-stat">
                    <span className="stat-label">Topics</span>
                    <span className="stat-value">{investorMemory.memories.topicsDiscussed.length}</span>
                  </div>
                  <div className="memory-stat">
                    <span className="stat-label">Risk Profile</span>
                    <span className={`stat-value profile-${profileData.riskCategory}`}>
                      {profileData.riskCategory === 'unknown' ? 'Learning...' : `${profileData.riskCategory} (${profileData.riskScore}/100)`}
                    </span>
                  </div>
                </div>
                {investorMemory.memories.goals && investorMemory.memories.goals.length > 0 && (
                  <div className="memory-goals">
                    <span className="goals-label">🎯 Your Goals:</span>
                    <div className="goals-tags">
                      {investorMemory.memories.goals.map((g, i) => (
                        <span key={i} className="goal-tag">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="memory-desc">
                  AI learns from your conversations to adapt responses to your style. It remembers topics you've explored and builds your investor profile over time.
                </p>
                <button className="modal-clear-memory-btn" onClick={() => {
                  investorMemory.clear();
                  investorProfile.clear();
                  setProfileData(investorProfile.getProfile());
                }}>
                  <Trash2 size={13} /> Reset Memory & Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
