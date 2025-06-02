import React from 'react';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onOptionSelect?: (optionText: string, messageId: string) => void;
  isLastAiMessageWithMcq?: boolean; // Is this the latest AI message that expects an answer?
  isMcqAnswered?: boolean; // Has this specific MCQ been answered?
  selectedOptionText?: string | null; // If answered, which option was selected for this message
}

interface ParsedMcq {
  question: string;
  options: { key: string, text: string }[];
}

// Regex to parse:
// Question text (multiline)
// A) Option A text (multiline)
// B) Option B text (multiline)
// C) Option C text (multiline)
// D) Option D text (multiline)
// It captures the question part before "A)" and then each option.
// Making sure it handles newlines within question and options correctly.
const mcqRegex = /^([\s\S]*?)\n\s*A\)\s*([\s\S]+?)\n\s*B\)\s*([\s\S]+?)\n\s*C\)\s*([\s\S]+?)\n\s*D\)\s*([\s\S]+?)(?:\n|$)/s;


const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onOptionSelect, 
  isLastAiMessageWithMcq, 
  isMcqAnswered,
  selectedOptionText
}) => {
  const isUser = message.sender === 'user';
  const alignment = isUser ? 'items-end' : 'items-start';
  const bubbleColor = isUser ? 'bg-accent text-white' : 'bg-primary text-lightText';
  // User messages slide from right, AI from left
  const animation = isUser ? 'animate-slide-in-left' : 'animate-slide-in-left'; // TODO: Fix user animation to slide from right if desired. Currently both left.

  let parsedMcq: ParsedMcq | null = null;
  if (message.sender === 'ai') {
    const match = message.text.match(mcqRegex);
    if (match) {
      parsedMcq = {
        question: match[1].trim(),
        options: [
          { key: 'A', text: match[2].trim() },
          { key: 'B', text: match[3].trim() },
          { key: 'C', text: match[4].trim() },
          { key: 'D', text: match[5].trim() },
        ],
      };
    }
  }
  
  const handleOptionClick = (optionFullText: string) => {
    if (onOptionSelect && !isMcqAnswered && isLastAiMessageWithMcq) {
      onOptionSelect(optionFullText, message.id);
    }
  };

  return (
    <div className={`flex flex-col ${alignment} ${animation} mb-3 w-full`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-md ${bubbleColor} w-full`}>
        {parsedMcq ? (
          <>
            <p className="text-sm whitespace-pre-wrap mb-3">{parsedMcq.question}</p>
            <div className="space-y-2 mt-2">
              {parsedMcq.options.map((opt) => {
                const optionFullText = `${opt.key}) ${opt.text}`;
                const isSelected = selectedOptionText === optionFullText;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleOptionClick(optionFullText)}
                    disabled={isMcqAnswered || !isLastAiMessageWithMcq}
                    className={`w-full text-left p-2.5 rounded-md transition-all duration-200 ease-in-out
                                      ${isMcqAnswered || !isLastAiMessageWithMcq ? 'cursor-not-allowed' : 'hover:bg-highlight/30'}
                                      ${isSelected ? 'bg-highlight text-darkText ring-2 ring-highlight' : 'bg-secondary hover:bg-opacity-70 text-lightText'}
                                      ${isMcqAnswered && !isSelected ? 'opacity-60' : ''}
                                      `}
                    aria-pressed={isSelected}
                  >
                    <span className="font-semibold">{opt.key})</span> {opt.text}
                  </button>
                );
                })}
            </div>
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
      <p className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} text-gray-400`}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default MessageBubble;