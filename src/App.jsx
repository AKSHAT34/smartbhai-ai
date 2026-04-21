import { useState, useMemo } from 'react';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import OptionsScreen from './screens/OptionsScreen';
import LearnScreen from './screens/LearnScreen';
import BottomNav from './components/BottomNav';
import Onboarding, { shouldShowOnboarding } from './components/Onboarding';
import { calculateTier, getUserTierData, getTierInfo, getTierProgress } from './services/tierService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [chatInitialQuestion, setChatInitialQuestion] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());

  const tierData = useMemo(() => {
    const userData = getUserTierData();
    const tierId = calculateTier(userData);
    return {
      tierId,
      tierInfo: getTierInfo(tierId),
      progress: getTierProgress(userData),
      userData,
    };
  }, [activeTab]);

  const openChatWith = (question) => {
    setChatInitialQuestion(question);
    setActiveTab('chat');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onAskAI={openChatWith} onNavigate={setActiveTab} tier={tierData} />;
      case 'chat':
        return <ChatScreen initialQuestion={chatInitialQuestion} onClearInitial={() => setChatInitialQuestion(null)} tier={tierData} />;
      case 'portfolio':
        return <PortfolioScreen onAskAI={openChatWith} tier={tierData} />;
      case 'options':
        return <OptionsScreen onAskAI={openChatWith} tier={tierData} />;
      case 'learn':
        return <LearnScreen onAskAI={openChatWith} tier={tierData} />;
      default:
        return <HomeScreen onAskAI={openChatWith} onNavigate={setActiveTab} tier={tierData} />;
    }
  };

  return (
    <div className="app">
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <div className="screen-container">
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
