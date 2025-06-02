import React from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { AppStage } from '../types';
import { APP_TITLE } from '../constants';

// Hardcoded description based on metadata.json for simplicity
const APP_DESCRIPTION = "An intelligent, voice-adaptive AI by Saqib Sarwar that analyzes personality and psychology through interactive conversation, providing a comprehensive report with insights, strengths, weaknesses, and career suggestions. Supports multiple languages and customizable AI tones.";

const IntroScreen: React.FC = () => {
  const { setStage, translate } = useGlobalContext();

  const handleContinue = () => {
    setStage(AppStage.Welcome);
  };

  return (
    <div className="w-full max-w-lg p-8 bg-secondary shadow-2xl rounded-xl animate-fade-in text-center">
      <h1 className="text-4xl font-bold text-accent mb-6 animate-slide-in-up">
        {APP_TITLE}
      </h1>
      <p className="text-lg text-lightText mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }} role="document" tabIndex={0}>
        {APP_DESCRIPTION}
      </p>
      <button
        onClick={handleContinue}
        className="bg-accent hover:bg-highlight text-darkText font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in-up"
        style={{ animationDelay: '0.6s' }}
        aria-label={translate('continueButton')}
      >
        {translate('continueButton')}
      </button>
    </div>
  );
};

export default IntroScreen;
