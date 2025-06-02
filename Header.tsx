import React from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { APP_TITLE } from '../constants';
import { AppStage } from '../types'; // Import AppStage

const Header: React.FC = () => {
  const { stage, setStage, clearChatHistory, setPersonalityReport, setUserName } = useGlobalContext();

  const handleHomeClick = () => {
    clearChatHistory();
    setPersonalityReport(null);
    setUserName(''); // Reset user name as well
    setStage(AppStage.Intro); // Change to AppStage.Intro
  };

  return (
    <header className="bg-secondary shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          className="text-2xl sm:text-3xl font-bold text-accent cursor-pointer hover:text-highlight transition-colors duration-300"
          onClick={handleHomeClick}
          title="Back to Start"
          aria-label="Back to Start"
        >
          {APP_TITLE}
        </h1>
        {/* Future: Could add language/tone selectors here if desired globally */}
      </div>
    </header>
  );
};

export default Header;