
import React, { useState } from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { AppStage } from '../types';

const WelcomeScreen: React.FC = () => {
  const { setUserName, setStage, translate } = useGlobalContext();
  const [nameInput, setNameInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setStage(AppStage.Config);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-secondary shadow-2xl rounded-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-accent mb-6 text-center animate-slide-in-up">
        {translate('welcomeTitle')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-lightText mb-2 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            {translate('namePrompt')}
          </label>
          <input
            type="text"
            id="name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={translate('namePlaceholder')}
            className="w-full px-4 py-3 bg-primary border border-gray-600 rounded-lg text-lightText focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-300 animate-slide-in-left"
            style={{ animationDelay: '0.4s' }}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-highlight text-darkText font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          {translate('submitName')}
        </button>
      </form>
    </div>
  );
};

export default WelcomeScreen;
