import { Home, MessageCircle, PieChart, BarChart3, GraduationCap } from 'lucide-react';
import './BottomNav.css';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle, isCenter: true },
  { id: 'options', label: 'Options', icon: BarChart3 },
  { id: 'learn', label: 'Learn', icon: GraduationCap },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.isCenter ? 'center-btn' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.isCenter ? (
            <div className="center-icon">
              <tab.icon size={22} />
            </div>
          ) : (
            <tab.icon size={20} />
          )}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
