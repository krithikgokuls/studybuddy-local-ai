import React, { useState, useEffect } from 'react';
import { QuizQuestion, AIProvider } from '../services/ai/types';
import { getActiveProvider } from '../services/ai/aiService';
import { studyStorage, SavedMaterial } from '../services/storage/studyStorage';
import { Brain, HelpCircle, AlertCircle, Award, CheckCircle2, XCircle, ChevronRight, Sliders, RefreshCw } from 'lucide-react';

export default function QuizGenerator() {
  const [materials, setMaterials] = useState<SavedMaterial[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  
  // Quiz Options
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(3);
  
  // Quiz State
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const list = studyStorage.getMaterials();
    setMaterials(list);
    
    const profile = studyStorage.getProfile();
    setSubjects(profile.subjects);
    if (profile.subjects.length > 0) {
      setSelectedSubject(profile.subjects[0]);
    }

    // Default topic suggestion from materials if available
    if (list.length > 0) {
      setTopic(list[0].title);
    } else {
      setTopic('General Concepts');
    }
  }, []);

  const handleStartQuiz = async () => {
    if (!topic.trim()) {
      setErrorMessage("Please enter a study topic.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setQuestions([]);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setActiveQuestionIndex(0);

    try {
      const provider = getActiveProvider();
      
      // Load current note content if matches title
      const matText = materials.find(m => m.title === topic || m.subject === selectedSubject)?.content || '';
      
      const generated = await provider.generateQuiz(matText, topic, difficulty, questionCount);
      if (generated && generated.length > 0) {
        setQuestions(generated);
      } else {
        throw new Error("No quiz questions were returned by the active model.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to generate quiz: ${err.message || 'Make sure Ollama/Demo engine is configured correctly.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [activeQuestionIndex]: optionIndex
    });
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    setQuizSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    // Save to study performance logs
    studyStorage.addQuizResult(topic, selectedSubject, correctCount, questions.length, difficulty);

    // Write card review equivalents for each incorrect item to map weak points
    questions.forEach((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
      studyStorage.recordFlashcardReview(
        `q_${topic}_${idx}`,
        isCorrect,
        topic
      );
    });
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    const question = questions[Number(qIdx)];
    if (question && question.correctAnswerIndex === ansIdx) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Quiz Customizer and Settings Header */}
      {!questions.length && !isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-900">Custom Quiz Generator</h3>
              <p className="text-xs text-stone-500 mt-0.5">Test your comprehension with structured questions built by AI from your materials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Subject</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  {subjects.length === 0 && <option value="General">General Study</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Study Topic / Resource Title</label>
                {materials.length === 0 ? (
                  <input
                    type="text"
                    placeholder="e.g. TCP Handshakes, Cellular Chemistry"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.title}>{m.title}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Difficulty</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                  >
                    <option value="easy">Easy (Definitions)</option>
                    <option value="medium">Medium (Concepts & Analogies)</option>
                    <option value="hard">Hard (Practical Problems)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">No. of Questions</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 border border-stone-200 p-3.5 rounded-lg">
                <strong>Local Generation:</strong> The active model processes the study guide and synthesizes original multiple-choice assessments. Your materials are processed locally and securely.
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-red-800 bg-red-50 border border-red-100 p-3 rounded-lg text-xs leading-normal">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <button
              onClick={handleStartQuiz}
              className="w-full py-3 bg-[#D96A43] hover:bg-[#c25a34] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Generate Practice Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading Canvas */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <RefreshCw className="w-10 h-10 text-orange-500 mx-auto animate-spin" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-semibold text-slate-800">Compiling Practice Quiz...</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              The AI is reading your notes and constructing multiple-choice questions with balanced options and step-by-step diagnostic feedback.
            </p>
          </div>
        </div>
      )}

      {/* Active Quiz Gameplay Screen */}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Question Index Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Quiz Roadmap</h4>
              <div className="grid grid-cols-4 gap-2 lg:flex lg:flex-col lg:gap-1.5">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`p-2 rounded-lg text-center lg:text-left text-xs font-semibold transition-all border ${
                      activeQuestionIndex === idx
                        ? 'bg-orange-50 text-orange-800 border-orange-400'
                        : selectedAnswers[idx] !== undefined
                        ? 'bg-slate-50 text-slate-700 border-slate-200'
                        : 'bg-white text-stone-500 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <span>Q {idx + 1}</span>
                    <span className="hidden lg:inline ml-2 font-normal text-[10px]">
                      {selectedAnswers[idx] !== undefined ? '· Answered' : '· Unanswered'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score Summary Box (Only shown after submit) */}
            {quizSubmitted && (
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl text-center space-y-3">
                <Award className="w-10 h-10 text-[#D96A43] mx-auto" />
                <div>
                  <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Results Analysis</div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                    {score} / {questions.length}
                  </h3>
                  <div className="text-[10px] text-stone-500 mt-1">
                    Score: {Math.round((score / questions.length) * 100)}%
                  </div>
                </div>
                
                <button
                  onClick={() => setQuestions([])}
                  className="w-full py-1.5 bg-[#D96A43] text-white rounded-lg text-[10px] font-semibold hover:bg-[#c25a34] transition-colors"
                >
                  Configure New Quiz
                </button>
              </div>
            )}
          </div>

          {/* Core Question Slider */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Question text */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  Question {activeQuestionIndex + 1} of {questions.length}
                </span>
                <h3 className="font-serif text-base font-semibold text-slate-900 leading-snug">
                  {questions[activeQuestionIndex].question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {questions[activeQuestionIndex].options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[activeQuestionIndex] === optIdx;
                  const isCorrect = questions[activeQuestionIndex].correctAnswerIndex === optIdx;
                  
                  let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                  
                  if (isSelected && !quizSubmitted) {
                    optionStyle = 'border-orange-500 bg-orange-50/10 text-slate-950 font-semibold';
                  } else if (quizSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50/20 text-emerald-950 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50/20 text-red-950';
                    } else {
                      optionStyle = 'border-slate-100 bg-slate-50/40 text-stone-400';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(optIdx)}
                      disabled={quizSubmitted}
                      className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{option}</span>
                      
                      {quizSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {quizSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Diagnostic Explanations */}
              {quizSubmitted && (
                <div className="p-4 border border-slate-100 bg-slate-50 rounded-lg space-y-2 leading-relaxed text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>AI Diagnostic Review:</span>
                  </div>
                  <p className="text-stone-600">{questions[activeQuestionIndex].explanation}</p>
                </div>
              )}

              {/* Navigation Bar */}
              <div className="flex justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestionIndex === 0}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-stone-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:hover:border-slate-200"
                >
                  Previous Question
                </button>

                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                  >
                    Submit Quiz Answers
                  </button>
                )}

                <button
                  onClick={() => setActiveQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={activeQuestionIndex === questions.length - 1}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-stone-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:hover:border-slate-200"
                >
                  Next Question
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
