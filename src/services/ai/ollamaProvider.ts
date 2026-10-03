import { AIProvider, ChatMessage, QuizQuestion, Flashcard, StudyTask, WeakTopicAnalysis } from './types';

// Read config from local storage dynamically so user edits take effect instantly
export const getOllamaConfig = () => {
  const endpoint = localStorage.getItem('studybuddy_ollama_endpoint') || 'http://localhost:11434';
  const modelName = localStorage.getItem('studybuddy_ollama_model') || 'llama3.2';
  return { endpoint, modelName };
};

export const ollamaProvider: AIProvider = {
  id: 'ollama',
  name: 'Local Ollama (Open-Weight Models)',
  get modelName() {
    return getOllamaConfig().modelName;
  },

  async chat(messages: ChatMessage[], contextMaterial?: string): Promise<string> {
    const { endpoint, modelName } = getOllamaConfig();

    const systemPrompt = `You are StudyBuddy, an empathetic, highly skilled private AI tutor. 
Your goal is to help students learn with zero stress. 
${contextMaterial ? `Here is the student's study material/notes:\n---\n${contextMaterial}\n---\nIMPORTANT: Rely ONLY on the provided notes above to answer questions. Explain concepts step-by-step, using simple, clear, and relatable real-world analogies. If the answer is not present in the provided notes, say: "I checked your study material, but I couldn't find any mention of that topic. As a local privacy-first tutor, I only teach using your materials to prevent inventing facts!" - do NOT make up or hallucinate information.` : 'Tutor the student based on their pasted material.'}
Keep answers highly conversational, clean, and beautifully structured with bullet points. Avoid complex jargon unless you explain it immediately with a simple analogy.`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: chatMessages,
          stream: false,
          options: {
            temperature: 0.4
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (err: any) {
      console.error('Ollama communication error:', err);
      throw new Error(
        `Failed to reach local Ollama at "${endpoint}". \n\n` +
        `1. Make sure Ollama is running (e.g. \`ollama run ${modelName}\`).\n` +
        `2. Ensure CORS is enabled on your local Ollama server by launching it with:\n` +
        `   Windows: Set system environment variable OLLAMA_ORIGINS="*" and restart Ollama.\n` +
        `   Mac/Linux: run \`OLLAMA_ORIGINS="*" ollama serve\` in your terminal.`
      );
    }
  },

  async summarize(material: string): Promise<string> {
    const { endpoint, modelName } = getOllamaConfig();
    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: `Summarize the following study material in a concise, friendly format. Break it down into key core highlights and a final key takeaway. Material:\n\n${material}`,
          stream: false,
          options: { temperature: 0.3 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      return data.response || 'Failed to summarize notes.';
    } catch (err: any) {
      console.error(err);
      throw new Error(`Ollama summary failed: ${err.message}`);
    }
  },

  async generateQuiz(material: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<QuizQuestion[]> {
    const { endpoint, modelName } = getOllamaConfig();
    
    const prompt = `Generate a high-quality study quiz containing exactly ${count} multiple-choice questions about the topic "${topic}" (Difficulty: ${difficulty}) based on the following material:
---
${material}
---

Your response MUST be valid JSON matching this schema exactly, with NO markdown formatting or surrounding text, just the raw JSON:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Brief explanation of why this option is correct."
  }
]`;

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.2 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const content = data.response || '';
      
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as QuizQuestion[];
      }
      throw new Error("Ollama returned JSON, but it's not a list of questions.");
    } catch (err: any) {
      console.error('Ollama quiz parse failed, using fallback:', err);
      // Let's fallback gracefully or rethrow with clear error
      throw new Error(`Failed to generate custom quiz with Ollama. Verify your model supports JSON output and is loaded properly. Error: ${err.message}`);
    }
  },

  async generateFlashcards(material: string, count: number): Promise<Flashcard[]> {
    const { endpoint, modelName } = getOllamaConfig();

    const prompt = `Create exactly ${count} flashcards from this study material. Focus on the most important concepts, terms, and dates.
---
${material}
---

Your response MUST be valid JSON matching this schema exactly, with NO markdown formatting or surrounding text, just the raw JSON:
[
  {
    "id": "fc_1",
    "question": "Short front-of-card question?",
    "answer": "Concise back-of-card answer explanation.",
    "topic": "Topic category name"
  }
]`;

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.3 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.response || '');
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: item.id || `fc_${idx + 1}`,
          question: item.question || 'N/A',
          answer: item.answer || 'N/A',
          topic: item.topic || 'General'
        })) as Flashcard[];
      }
      throw new Error("Ollama did not return a valid list of flashcards.");
    } catch (err: any) {
      console.error('Ollama flashcard parse failed:', err);
      throw new Error(`Failed to generate custom flashcards with Ollama. Error: ${err.message}`);
    }
  },

  async generateStudyPlan(goal: string, hoursPerDay: number, examDate: string, subjects: string[]): Promise<StudyTask[]> {
    const { endpoint, modelName } = getOllamaConfig();

    const prompt = `Create a realistic, structured 5-day daily study plan leading to an exam on ${examDate} for the goal: "${goal}".
Subjects to study: ${subjects.join(', ')}. Available hours per day: ${hoursPerDay} hours.

Your response MUST be valid JSON matching this schema exactly, with NO markdown formatting or surrounding text, just the raw JSON:
[
  {
    "id": "task_1",
    "day": "Day 1",
    "title": "Task title (e.g. Read Chapter 1 & take notes)",
    "topic": "The specific subject/topic",
    "durationMinutes": 60,
    "isCompleted": false
  }
]`;

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.3 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.response || '');
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: item.id || `task_${idx + 1}`,
          day: item.day || `Day ${idx + 1}`,
          title: item.title || 'Review core notes',
          topic: item.topic || 'General',
          durationMinutes: item.durationMinutes || 45,
          isCompleted: false
        })) as StudyTask[];
      }
      throw new Error("Ollama did not return a valid list of tasks.");
    } catch (err: any) {
      console.error('Ollama study plan failed:', err);
      throw new Error(`Failed to generate custom study plan with Ollama. Error: ${err.message}`);
    }
  },

  async analyzeWeakTopics(
    quizScores: { topic: string; score: number; total: number }[],
    flashcardPerformance: { cardId: string; correct: boolean; topic: string }[]
  ): Promise<WeakTopicAnalysis> {
    const { endpoint, modelName } = getOllamaConfig();

    const prompt = `Analyze this student's performance data and generate a structured diagnostic report.
Quiz Scores:
${JSON.stringify(quizScores, null, 2)}

Flashcard Practice Performance:
${JSON.stringify(flashcardPerformance, null, 2)}

Your response MUST be valid JSON matching this schema exactly, with NO markdown formatting or surrounding text, just the raw JSON:
{
  "strongTopics": ["Topic Name 1"],
  "weakTopics": ["Topic Name 2"],
  "recommendations": ["A friendly action recommendation for the weak topic."],
  "suggestedPracticeQuestions": [
    { "question": "A custom diagnostic question to test their understanding?", "topic": "Topic Name 2" }
  ]
}`;

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.2 }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(data.response || '');
      return {
        strongTopics: parsed.strongTopics || [],
        weakTopics: parsed.weakTopics || [],
        recommendations: parsed.recommendations || [],
        suggestedPracticeQuestions: parsed.suggestedPracticeQuestions || []
      };
    } catch (err: any) {
      console.error('Ollama weak topic analysis failed:', err);
      throw new Error(`Failed to analyze performance with Ollama. Error: ${err.message}`);
    }
  }
};
