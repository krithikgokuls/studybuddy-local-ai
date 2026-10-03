export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic?: string;
}

export interface StudyTask {
  id: string;
  day: string; // e.g., "Day 1", "Day 2"
  title: string;
  topic: string;
  durationMinutes: number;
  isCompleted: boolean;
}

export interface WeakTopicAnalysis {
  strongTopics: string[];
  weakTopics: string[];
  recommendations: string[];
  suggestedPracticeQuestions: { question: string; topic: string }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  id: 'ollama' | 'demo';
  name: string;
  modelName: string;
  chat(messages: ChatMessage[], contextMaterial?: string): Promise<string>;
  summarize(material: string): Promise<string>;
  generateQuiz(material: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<QuizQuestion[]>;
  generateFlashcards(material: string, count: number): Promise<Flashcard[]>;
  generateStudyPlan(goal: string, hoursPerDay: number, examDate: string, subjects: string[]): Promise<StudyTask[]>;
  analyzeWeakTopics(quizScores: { topic: string; score: number; total: number }[], flashcardPerformance: { cardId: string; correct: boolean; topic: string }[]): Promise<WeakTopicAnalysis>;
}
