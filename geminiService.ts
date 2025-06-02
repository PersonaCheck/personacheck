import { GoogleGenAI, GenerateContentResponse, Chat, GenerateContentParameters } from "@google/genai";
import { ChatMessage, Language, AiTone, AiVoiceGender, PersonalityReport, ReportType } from './types'; // Corrected path
import { GEMINI_TEXT_MODEL, TARGET_QUESTIONS_PER_ASSESSMENT, ALL_QUESTIONS_ASKED_MARKER, APP_TITLE } from './constants'; // Corrected path, Added APP_TITLE

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

const getSystemInstruction = (
    language: Language, 
    tone: AiTone, 
    voiceGender: AiVoiceGender, 
    userName: string, 
    task: "chat" | "report", 
    reportType?: ReportType,
    currentQuestionNumber?: number // For chat task
  ): string => {
  if (task === "chat") {
    return `You are ${APP_TITLE}, a friendly and insightful AI psychologist by Saqib Sarwar, administering a personality assessment.
User's Name: ${userName}. Language: ${language}. Interaction Tone: ${tone}. AI Voice Persona: ${voiceGender}. Chosen Report Focus: ${reportType}.
Your goal: Understand the user's personality by asking exactly ${TARGET_QUESTIONS_PER_ASSESSMENT} multiple-choice questions (MCQs).
Each question must be relevant to the chosen Report Focus: '${reportType}'.
Format each MCQ strictly as follows:
Question text (in ${language})
A) Option A text (in ${language})
B) Option B text (in ${language})
C) Option C text (in ${language})
D) Option D text (in ${language})
Ensure options are distinct, plausible, and cover a range of responses.
You are currently about to ask question number ${currentQuestionNumber} of ${TARGET_QUESTIONS_PER_ASSESSMENT}. Do not repeat questions. Wait for the user's selection (which will be provided in the next user message) before generating the subsequent question.
If the user's response seems off-topic or doesn't select an option, gently guide them back or re-present the question with options.
Do not add any conversational filler before or after the MCQ block. Only provide the question and options in the specified format.`;
  } else { // task === "report"
    return `You are ${APP_TITLE}, an expert AI psychologist by Saqib Sarwar.
User's Name: ${userName}. Language for Report: ${language}. Report Focus: ${reportType}.
Task: Analyze the provided conversation history, which consists of ${TARGET_QUESTIONS_PER_ASSESSMENT} multiple-choice questions and the user's selected answers.
Generate a personality report tailored to the specified focus: ${reportType}.
The report must be in ${language}.
Structure the output as a JSON object with the keys as specified in the user prompt for the given ReportType.
Provide deep, human-style understanding based on the user's MCQ choices. The tone of the report content itself should be insightful and constructive.
The user's answers are their selections from the options A, B, C, or D you provided. Interpret these choices carefully.`;
  }
};


export const getNextAiQuestion = async (
  chatHistory: ChatMessage[],
  language: Language,
  tone: AiTone,
  voiceGender: AiVoiceGender,
  userName: string,
  reportType: ReportType
): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Cannot fetch question.";

  const model = GEMINI_TEXT_MODEL;
  
  const userResponses = chatHistory.filter(msg => msg.sender === 'user');
  const aiMcqMessagesCount = chatHistory.filter(msg => msg.sender === 'ai' && msg.text.includes("A)") && msg.text.includes("B)")).length;
  const currentQuestionNumber = aiMcqMessagesCount + 1;

  if (currentQuestionNumber > TARGET_QUESTIONS_PER_ASSESSMENT) {
    return ALL_QUESTIONS_ASKED_MARKER;
  }
  
  const systemInstruction = getSystemInstruction(language, tone, voiceGender, userName, "chat", reportType, currentQuestionNumber);
  
  const contents: GenerateContentParameters['contents'] = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  let instructionForAi = "";
  if (currentQuestionNumber === 1) {
    instructionForAi = `This is the first question (1 of ${TARGET_QUESTIONS_PER_ASSESSMENT}) for the '${reportType}' assessment. Please provide this multiple-choice question with options A, B, C, D in ${language}, formatted as specified in the system instructions.`;
  } else {
    const lastUserAnswer = userResponses.length > 0 ? userResponses[userResponses.length - 1].text : "No previous answer (this should not happen after Q1)";
    instructionForAi = `The user's previous answer was: "${lastUserAnswer}". Now, provide question ${currentQuestionNumber} of ${TARGET_QUESTIONS_PER_ASSESSMENT} for the '${reportType}' assessment. Please provide this multiple-choice question with options A, B, C, D in ${language}, formatted as specified.`;
  }
  contents.push({
    role: 'user', 
    parts: [{ text: instructionForAi }]
  });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75, 
        topP: 0.95,
        topK: 40,
      }
    });
    const responseText = response.text.trim();
    if (!/A\).*B\).*C\).*D\)/s.test(responseText)) {
        console.warn("AI response does not look like an MCQ:", responseText);
    }
    return responseText;
  } catch (error) {
    console.error("Error getting next AI question:", error);
    throw new Error(`Failed to get next question from AI. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generatePersonalityReport = async (
  chatHistory: ChatMessage[],
  language: Language,
  tone: AiTone, 
  voiceGender: AiVoiceGender, 
  userName: string,
  reportType: ReportType
): Promise<PersonalityReport> => {
  if (!API_KEY) {
      console.error("API Key not configured. Cannot generate report.");
      throw new Error("API Key not configured.");
  }

  const model = GEMINI_TEXT_MODEL;
  const systemInstruction = getSystemInstruction(language, tone, voiceGender, userName, "report", reportType);
  
  const conversationSummary = chatHistory.map(msg => {
    return `${msg.sender === 'user' ? userName : APP_TITLE}: ${msg.text}`; // Use APP_TITLE for AI name
  }).join('\n\n');

  let promptKeysDefinition = "";
  let specificInstructions = `Based on the user's selections in the preceding ${TARGET_QUESTIONS_PER_ASSESSMENT} multiple-choice questions, provide a comprehensive analysis.`;

  const commonFieldsNote = `\nFor any field, if a trait cannot be reasonably assessed from the MCQ answers, provide a thoughtful note like "Insufficient data from MCQs to assess this trait reliably." or "This aspect was not explored in enough detail by the MCQs." or similar, rather than guessing. Do not omit keys; use the thoughtful note as their value if data is unavailable. For array values, provide at least one item if data is available, or an empty array [] if not. The entire response must be a single JSON object.`;
  
  switch (reportType) {
    case ReportType.QuickSummary:
      specificInstructions += " Focus on brevity and actionable insights from the MCQs. Provide a high-level overview.";
      promptKeysDefinition = `
{
  "summary": "string (A concise overview of the user's core personality profile based on MCQ answers, max 3-4 sentences)",
  "strengths": ["string (Top 2-3 strengths inferred from MCQs)"],
  "weaknesses": ["string (Top 2-3 weaknesses or areas for growth inferred from MCQs)"],
  "personalGrowthAdvice": ["string (One or two most impactful pieces of advice based on MCQs)"],
  "motivationalQuote": "string (A relevant motivational quote reflecting MCQ themes)"
}`;
      break;
    case ReportType.DetailedMBTI:
      specificInstructions += " Provide a deep dive into the user's likely MBTI type, explaining its facets and implications based on their MCQ choices.";
      promptKeysDefinition = `
{
  "mbti": "string (e.g., INFJ - with detailed explanation of functions, inferred from MCQs)",
  "introvertExtrovertAmbivert": "string (Elaborate based on MBTI and MCQ patterns)",
  "communicationStyle": "string (How their MBTI type might influence communication, as suggested by MCQs)",
  "decisionMakingPattern": "string (How their MBTI type might influence decision making, as suggested by MCQs)",
  "socialBehavior": "string (Social tendencies linked to MBTI, as suggested by MCQs)",
  "strengths": ["string (Strengths associated with this MBTI type, inferred from MCQs)"],
  "weaknesses": ["string (Potential weaknesses or challenges of this MBTI type, inferred from MCQs)"],
  "suggestedCareerPaths": ["string (Careers often suiting this MBTI type, based on inferred profile from MCQs)"]
}`;
      break;
    case ReportType.CareerFocus:
      specificInstructions += " Analyze personality traits specifically relevant to career development and job suitability, based on MCQ answers.";
      promptKeysDefinition = `
{
  "summary": "string (Brief summary of personality relevant to career, based on MCQs)",
  "suggestedCareerPaths": ["string (Provide 3-5 diverse career paths with brief reasoning why they fit based on MCQs)"],
  "strengths": ["string (Work-related strengths like problem-solving, teamwork, creativity, inferred from MCQs)"],
  "weaknesses": ["string (Work-related areas for development inferred from MCQs)"],
  "leadershipQuality": "string (Assessment of leadership potential and style, if inferable from MCQs)",
  "communicationStyle": "string (Effectiveness in a professional communication context, if inferable from MCQs)",
  "skillsToDevelopForCareer": ["string (Specific skills to enhance career prospects, based on MCQ insights)"],
  "motivationSource": "string (What likely motivates them in a work environment, inferred from MCQs)"
}`;
      break;
    case ReportType.EmotionalIntelligenceFocus:
      specificInstructions += " Focus deeply on aspects of emotional intelligence (EQ). Analyze self-awareness, self-regulation, social awareness, and relationship management based on MCQ answers.";
      promptKeysDefinition = `
{
  "summary": "string (Brief summary of EQ profile based on MCQs)",
  "emotionalIntelligence": "string (Detailed analysis: self-awareness, self-regulation, social awareness, relationship management components inferred from MCQs)",
  "stressManagement": "string (How they likely handle stress, and EQ's role, inferred from MCQs)",
  "communicationStyle": "string (Interpersonal communication style, reflecting EQ, inferred from MCQs)",
  "empathyLevel": "string (Assessed level of empathy and understanding of others' emotions, based on MCQs)",
  "socialBehavior": "string (How EQ influences social interactions, based on MCQs)",
  "personalGrowthAdvice": ["string (Specifically for enhancing EQ components, based on MCQ observations)"]
}`;
      break;
    case ReportType.FullAnalysis:
    default:
      specificInstructions += " Provide a comprehensive, holistic personality analysis covering all specified aspects based on the user's MCQ answers.";
      promptKeysDefinition = `
{
  "summary": "string (Comprehensive summary based on MCQs)",
  "mbti": "string (e.g., INFJ, based on MCQs)",
  "iqEstimate": "string (IQ related insights if inferable from MCQs, otherwise note unavailability)",
  "intelligenceType": "string (Type of intelligence shown through MCQs)",
  "introvertExtrovertAmbivert": "string (Inferred from MCQs)",
  "creativityLevel": "string (Inferred from MCQs)",
  "learningStyle": "string (Inferred from MCQs)",
  "emotionalIntelligence": "string (EQ assessment from MCQs)",
  "socialBehavior": "string (Inferred from MCQs)",
  "confidenceLevel": "string (Inferred from MCQs)",
  "stressManagement": "string (Inferred from MCQs)",
  "communicationStyle": "string (Inferred from MCQs)",
  "patienceConsistency": "string (Inferred from MCQs)",
  "decisionMakingPattern": "string (Inferred from MCQs)",
  "habitAnalysis": "string (Habits suggested by MCQ answers)",
  "leadershipQuality": "string (Inferred from MCQs)",
  "memoryAttentionSpan": "string (If inferable from MCQs, otherwise note unavailability)",
  "optimismPessimismScale": "string (Inferred from MCQs)",
  "riskTakingBehavior": "string (Inferred from MCQs)",
  "suggestedCareerPaths": ["string (Based on overall MCQ profile)"],
  "personalGrowthAdvice": ["string (Based on overall MCQ profile)"],
  "motivationSource": "string (Inferred from MCQs)",
  "strengths": ["string (Overall strengths from MCQs)"],
  "weaknesses": ["string (Overall weaknesses from MCQs)"],
  "suggestionsForImprovement": ["string (Overall suggestions from MCQs)"],
  "funInsights": "string (Interesting patterns or fun observations from MCQs)",
  "motivationalQuote": "string (Relevant quote based on MCQ profile)",
  "skillsToDevelopForCareer": ["string (Based on overall MCQ profile)"],
  "empathyLevel": "string (Inferred from MCQs)"
}`;
      break;
  }
  
  const fullPrompt = `${specificInstructions}\n\nCONVERSATION HISTORY (User's answers to MCQs):\n${conversationSummary}\n\nREQUIRED JSON OUTPUT STRUCTURE (ensure all keys are present, use notes for unavailable data, do not add comments in the JSON itself):\n${promptKeysDefinition}\n${commonFieldsNote}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{text: fullPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, 
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    try {
      const parsedReport: PersonalityReport = JSON.parse(jsonStr);
      return parsedReport;
    } catch (e) {
      console.error("Failed to parse JSON response from AI:", e, "Raw response:", jsonStr);
      return { summary: `Error: Could not parse the AI's response into a valid report. Raw text: ${jsonStr.substring(0,500)}...` };
    }

  } catch (error) {
    console.error("Error generating personality report:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { summary: `Error generating report: ${errorMessage}` };
  }
};