import { useState } from 'react';
import { Sparkles, TrendingUp, Shield, BookOpen, ChevronRight, X } from 'lucide-react';
import './Onboarding.css';

const ONBOARDING_KEY = 'smartbhai_onboarding_done';

const slides = [
  {
    emoji: '🙏',
    title: 'Namaste! Welcome to SmartBhai AI',
    subtitle: 'Your AI-powered investing assistant that speaks your language',
    features: ['Hindi, English, Hinglish — jo bhi comfortable ho', 'Aapke portfolio ko samajhta hai', 'Simple analogies mein complex concepts'],
    color: 'purple',
  },
  {
    emoji: '📊',
    title: 'Smart Portfolio Analysis',
    subtitle: 'AI analyzes your actual holdings with real-time insights',
    features: ['Risk Score with sector breakdown', 'What-if scenarios: "If NIFTY falls 5%..."', 'Stock-level RSI, MACD, Moving Averages'],
    color: 'green',
  },
  {
    emoji: '📈',
    title: 'Options Made Simple',
    subtitle: '91% of F&O traders lose money. AI helps you be in the 9%.',
    features: ['4 Key Levels instead of raw tables', 'Strategy Builder: Bull/Bear/Neutral/Hedge', 'Covered Calls: earn income from your holdings'],
    color: 'amber',
  },
  {
    emoji: '🧠',
    title: 'AI That Remembers You',
    subtitle: 'Every session builds on the last. Your AI grows with you.',
    features: ['Remembers your goals and preferences', 'Adapts to your risk appetite (Safe/Moderate/Risky)', 'Learns your language style over time'],
    color: 'blue',
  },
];

export function shouldShowOnboarding() {
  return !localStorage.getItem(ONBOARDING_KEY);
}

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      markOnboardingDone();
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingDone();
    onComplete();
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <button className="onboarding-skip" onClick={handleSkip}>
          Skip <X size={14} />
        </button>

        <div className="onboarding-slide" key={currentSlide}>
          <div className={`onboarding-emoji-wrap onboarding-${slide.color}`}>
            <span className="onboarding-emoji">{slide.emoji}</span>
          </div>
          <h2 className="onboarding-title">{slide.title}</h2>
          <p className="onboarding-subtitle">{slide.subtitle}</p>
          <div className="onboarding-features">
            {slide.features.map((f, i) => (
              <div key={i} className="onboarding-feature">
                <Sparkles size={12} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === currentSlide ? 'active' : ''} ${i < currentSlide ? 'done' : ''}`} />
          ))}
        </div>

        <button className="onboarding-next-btn" onClick={handleNext}>
          {isLast ? 'Start Investing with AI' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
