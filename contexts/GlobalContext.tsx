import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, AiTone, AiVoiceGender, ChatMessage, PersonalityReport, AppStage, ReportType } from '../types';
import { LOCALES } from '../constants';

interface GlobalContextType {
  stage: AppStage;
  setStage: (stage: AppStage) => void;
  userName: string;
  setUserName: (name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  tone: AiTone;
  setTone: (tone: AiTone) => void;
  voiceGender: AiVoiceGender;
  setVoiceGender: (gender: AiVoiceGender) => void;
  reportType: ReportType;
  setReportType: (type: ReportType) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  personalityReport: PersonalityReport | null;
  setPersonalityReport: (report: PersonalityReport | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  translate: (key: string, params?: Record<string, string>) => string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<AppStage>(AppStage.Intro); // Changed initial stage
  const [userName, setUserName] = useState<string>('');
  const [language, setLanguage] = useState<Language>(Language.English);
  const [tone, setTone] = useState<AiTone>(AiTone.Calm);
  const [voiceGender, setVoiceGender] = useState<AiVoiceGender>(AiVoiceGender.Female);
  const [reportType, setReportType] = useState<ReportType>(ReportType.FullAnalysis); // Default report type
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [personalityReport, setPersonalityReport] = useState<PersonalityReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
  };
  
  const translate = (key: string, params: Record<string, string> = {}): string => {
    let translation = LOCALES[language]?.[key] || LOCALES[Language.English]?.[key] || key;
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(`{${paramKey}}`, params[paramKey]);
    });
    return translation;
  };

  return (
    <GlobalContext.Provider value={{
      stage, setStage,
      userName, setUserName,
      language, setLanguage,
      tone, setTone,
      voiceGender, setVoiceGender,
      reportType, setReportType,
      chatHistory, addChatMessage, clearChatHistory,
      personalityReport, setPersonalityReport,
      isLoading, setIsLoading,
      error, setError,
      translate
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  return context;
};
