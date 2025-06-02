import React from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { Language, AiTone, AiVoiceGender, AppStage, ReportType, ChatMessage } from '../types';
import { AVAILABLE_LANGUAGES, AVAILABLE_TONES, AVAILABLE_VOICE_GENDERS, AVAILABLE_REPORT_TYPES } from '../constants';
import { getNextAiQuestion } from '../geminiService';

const ConfigScreen: React.FC = () => {
  const { 
    language, setLanguage, 
    tone, setTone, 
    voiceGender, setVoiceGender, 
    reportType, setReportType,
    setStage, userName, translate,
    addChatMessage, isLoading, setIsLoading, setError, // Added isLoading here
    chatHistory
  } = useGlobalContext();

  const handleStartChat = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Add an initial user message to set the context for the AI. This message won't be an answer.
      const assessmentStartUserMessage: ChatMessage = {
        id: Date.now().toString() + '_user_start',
        sender: 'user',
        text: translate('assessmentStartMessage', { userName, reportType: translate(`reportType_${reportType}`), language, tone: tone.toString()}),
        timestamp: new Date(),
      };
      addChatMessage(assessmentStartUserMessage);

      // Fetch the first MCQ from the AI
      const firstAiQuestionText = await getNextAiQuestion(
        [...chatHistory, assessmentStartUserMessage], // Pass current history including the new start message
        language,
        tone,
        voiceGender,
        userName,
        reportType
      );
      
      addChatMessage({
        id: Date.now().toString() + '_ai_q1',
        sender: 'ai',
        text: firstAiQuestionText,
        timestamp: new Date(),
      });

      setStage(AppStage.Chat);
    } catch (e) {
      console.error("Error starting MCQ assessment:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(translate('nextQuestionError') + ` Details: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };


  const SelectField = <T extends string,>({ label, value, onChange, options, idPrefix }: {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    idPrefix: string;
  }) => (
    <div className="animate-slide-in-left">
      <label htmlFor={`${idPrefix}-select`} className="block text-lg font-medium text-lightText mb-2">
        {label}
      </label>
      <select
        id={`${idPrefix}-select`}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-4 py-3 bg-primary border border-gray-600 rounded-lg text-lightText focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-300"
        aria-label={label}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-primary text-lightText">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full max-w-lg p-8 bg-secondary shadow-2xl rounded-xl animate-fade-in">
      <h2 className="text-3xl font-bold text-accent mb-8 text-center animate-slide-in-up">
        {translate('configTitle')}
      </h2>
      <div className="space-y-6">
        <SelectField
          idPrefix="lang"
          label={translate('languageSelect')}
          value={language}
          onChange={(val) => setLanguage(val as Language)}
          options={AVAILABLE_LANGUAGES}
        />
        <SelectField
          idPrefix="tone"
          label={translate('toneSelect')}
          value={tone}
          onChange={(val) => setTone(val as AiTone)}
          options={AVAILABLE_TONES}
        />
        <SelectField
          idPrefix="voice"
          label={translate('voiceGenderSelect')}
          value={voiceGender}
          onChange={(val) => setVoiceGender(val as AiVoiceGender)}
          options={AVAILABLE_VOICE_GENDERS}
        />
        <SelectField
          idPrefix="report"
          label={translate('reportTypeSelect')}
          value={reportType}
          onChange={(val) => setReportType(val as ReportType)}
          options={AVAILABLE_REPORT_TYPES(translate)}
        />
        <button
          onClick={handleStartChat}
          className="w-full mt-8 bg-accent hover:bg-highlight text-darkText font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '0.5s' }}
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? translate('loading') : translate('startChat')}
        </button>
      </div>
    </div>
  );
};

export default ConfigScreen;