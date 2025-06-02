
import React from 'react';
import { useGlobalContext } from './contexts/GlobalContext';
import WelcomeScreen from './components/WelcomeScreen';
import ConfigScreen from './components/ConfigScreen';
import ChatView from './components/ChatView';
import ReportView from './components/ReportView';
import Footer from './components/Footer';
import Header from './components/Header';
import IntroScreen from './components/IntroScreen'; // Ensured relative path
import { AppStage } from './types'; // Import AppStage enum

// AppStage enum is now imported from types.ts, no need to define here

const App: React.FC = () => {
  const { stage } = useGlobalContext();

  const renderStage = () => {
    switch (stage) {
      case AppStage.Intro: // Add Intro stage
        return <IntroScreen />;
      case AppStage.Welcome:
        return <WelcomeScreen />;
      case AppStage.Config:
        return <ConfigScreen />;
      case AppStage.Chat:
        return <ChatView />;
      case AppStage.Report:
        return <ReportView />;
      default:
        return <IntroScreen />; // Default to Intro screen
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-secondary to-primary">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {renderStage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
