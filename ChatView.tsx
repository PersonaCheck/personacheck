import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { AppStage, ChatMessage } from '../types';
import { getNextAiQuestion, generatePersonalityReport } from '../geminiService';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { ALL_QUESTIONS_ASKED_MARKER, TARGET_QUESTIONS_PER_ASSESSMENT } from '../constants'; // Added TARGET_QUESTIONS_PER_ASSESSMENT

// Regex to check if an AI message contains MCQ options
const mcqRegex = /\bA\)\s*.*\bB\)\s*.*\bC\)\s*.*\bD\)\s*.*/s;

const ChatView: React.FC = () => {
  const {
    userName, language, tone, voiceGender, reportType,
    chatHistory, addChatMessage,
    setStage, setPersonalityReport,
    isLoading, setIsLoading,
    error, setError,
    translate
  } = useGlobalContext();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [allQuestionsConcluded, setAllQuestionsConcluded] = useState(false);
  const [answeredMcqIds, setAnsweredMcqIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Determine the ID of the last AI message that is an MCQ and not yet answered
  const lastUnansweredAiMcqId = React.useMemo(() => {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const msg = chatHistory[i];
      if (msg.sender === 'ai' && mcqRegex.test(msg.text) && !answeredMcqIds.has(msg.id)) {
        return msg.id;
      }
    }
    return null;
  }, [chatHistory, answeredMcqIds]);


  const handleMcqOptionSelect = async (optionText: string, questionMessageId: string) => {
    if (isLoading || answeredMcqIds.has(questionMessageId)) return;

    // Add user's selection to chat
    const userResponseMessage: ChatMessage = {
      id: Date.now().toString() + '_user_resp',
      sender: 'user',
      text: `${translate('selectedOptionText')}${optionText}`,
      timestamp: new Date(),
    };
    addChatMessage(userResponseMessage);
    
    // Mark this MCQ as answered
    setAnsweredMcqIds(prev => new Set(prev).add(questionMessageId));
    
    setIsLoading(true);
    setError(null);

    try {
      // Pass the full chat history up to and including the user's latest response
      const currentChatHistory = [...chatHistory, userResponseMessage];
      const aiResponseText = await getNextAiQuestion(
        currentChatHistory, 
        language,
        tone,
        voiceGender,
        userName,
        reportType // Pass reportType
      );

      if (aiResponseText === ALL_QUESTIONS_ASKED_MARKER) {
        setAllQuestionsConcluded(true);
        addChatMessage({
          id: Date.now().toString() + '_ai_conclude',
          sender: 'ai',
          text: translate('allQuestionsAnswered'),
          timestamp: new Date(),
        });
      } else {
        addChatMessage({
          id: Date.now().toString() + '_ai_q',
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      console.error("Error processing MCQ selection or getting next AI question:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(translate('nextQuestionError') + ` ${errorMessage}`);
      addChatMessage({
        id: Date.now().toString() + '_ai_error',
        sender: 'ai',
        text: translate('nextQuestionError'),
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const report = await generatePersonalityReport(chatHistory, language, tone, voiceGender, userName, reportType);
      setPersonalityReport(report);
      setStage(AppStage.Report);
    } catch (err) {
      console.error("Error generating report:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(translate('reportGenerationError') + ` ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectedOptionForMcq = (aiQuestionId: string): string | null => {
    const questionMsgIndex = chatHistory.findIndex(msg => msg.id === aiQuestionId);
    if (questionMsgIndex === -1 || questionMsgIndex + 1 >= chatHistory.length) return null;
    
    const nextMessage = chatHistory[questionMsgIndex + 1];
    if (nextMessage.sender === 'user' && nextMessage.text.startsWith(translate('selectedOptionText'))) {
        return nextMessage.text.substring(translate('selectedOptionText').length);
    }
    return null;
  };


  return (
    <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-secondary shadow-2xl rounded-xl animate-fade-in overflow-hidden">
      <div className="flex-grow p-6 space-y-4 overflow-y-auto" role="log" aria-live="polite">
        {chatHistory.map((msg) => {
          const isMcq = msg.sender === 'ai' && mcqRegex.test(msg.text);
          const isThisMcqAnswered = isMcq && answeredMcqIds.has(msg.id);
          const isThisLastUnansweredMcq = isMcq && msg.id === lastUnansweredAiMcqId;
          
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg}
              onOptionSelect={isMcq ? handleMcqOptionSelect : undefined}
              isMcqAnswered={isThisMcqAnswered}
              isLastAiMessageWithMcq={isThisLastUnansweredMcq} // Only the latest unanswered MCQ has active options
              selectedOptionText={isThisMcqAnswered ? getSelectedOptionForMcq(msg.id) : null}
            />
          );
        })}
        {isLoading && <LoadingSpinner text={translate('loading')} />}
        {error && <p className="text-red-400 text-center p-2" role="alert">{error}</p>}
        <div ref={chatEndRef} />
      </div>

      {allQuestionsConcluded && !isLoading && (
         <div className="p-4 border-t border-primary text-center">
            <button
                onClick={handleGenerateReport}
                className="w-full bg-highlight hover:bg-accent text-darkText font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
                {translate('generateReportButton')}
            </button>
        </div>
      )}
    </div>
  );
};

export default ChatView;