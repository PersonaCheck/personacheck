export enum Language {
  English = "en",
  Hindi = "hi",
  Urdu = "ur",
  Kashmiri = "ks",
  Hinglish = "hi-en",
}

export enum AiTone {
  Cheerful = "Cheerful",
  Calm = "Calm",
  Serious = "Serious",
  Motivational = "Motivational",
}

export enum AiVoiceGender {
  Male = "Male",
  Female = "Female",
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export enum ReportType {
  QuickSummary = "QuickSummary",
  DetailedMBTI = "DetailedMBTI",
  CareerFocus = "CareerFocus",
  EmotionalIntelligenceFocus = "EmotionalIntelligenceFocus",
  FullAnalysis = "FullAnalysis",
}

export interface PersonalityReport {
  // Core fields, always attempt to populate for any report type if possible,
  // but might be more concise for summary reports.
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  personalGrowthAdvice?: string[];
  motivationalQuote?: string;

  // MBTI & General Personality
  mbti?: string; // MBTI Personality Type (e.g., INFJ, ESTP, etc.)
  introvertExtrovertAmbivert?: string; // Introvert / Extrovert / Ambivert nature
  
  // Cognitive & Learning
  iqEstimate?: string; // IQ estimate (logical reasoning, pattern analysis)
  intelligenceType?: string; // Type of intelligence (logical, emotional, creative, etc.)
  creativityLevel?: string; // Creativity level
  learningStyle?: string; // Learning style (visual, auditory, kinesthetic)
  memoryAttentionSpan?: string; // Memory & attention span

  // Emotional & Social
  emotionalIntelligence?: string; // Emotional intelligence (EQ)
  socialBehavior?: string; // Social behavior (friendly, reserved, assertive, etc.)
  confidenceLevel?: string; // Confidence level
  stressManagement?: string; // Stress management ability
  communicationStyle?: string; // Communication style
  optimismPessimismScale?: string; // Optimism vs pessimism scale
  empathyLevel?: string; 

  // Behavioral & Lifestyle
  patienceConsistency?: string; // Patience and consistency
  decisionMakingPattern?: string; // Decision-making pattern (impulsive, analytical, balanced)
  habitAnalysis?: string; // Habit analysis (healthy/unhealthy)
  riskTakingBehavior?: string; // Risk-taking behavior

  // Career & Growth
  leadershipQuality?: string; // Leadership quality
  suggestedCareerPaths?: string[]; // Suggested career paths
  motivationSource?: string; // Motivation based on their strongest trait
  skillsToDevelopForCareer?: string[]; 
  
  // Other
  suggestionsForImprovement?: string[]; 
  funInsights?: string;
}

export enum AppStage {
  Intro,
  Welcome,
  Config,
  Chat,
  Report,
}