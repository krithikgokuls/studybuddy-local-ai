import React, { useState, useEffect } from 'react';
import { WeakTopicAnalysis, AIProvider } from '../services/ai/types';
import { getActiveProvider } from '../services/ai/aiService';
import { studyStorage, QuizHistory, FlashcardPerformance } from '../services/storage/studyStorage';
import { Brain, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle, BookOpen } from 'lucide-react';

export default function WeakTopicAnalysisView() {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [fcPerformance, setFcPerformance] = useState<FlashcardPerformance[]>([]);
  const [analysis, setAnalysis] = useState<WeakTopicAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = () => {
    const qh = studyStorage.getQuizHistory();
    setQuizHistory(qh);

    const fcp = studyStorage.getFlashcardPerformance();
    setFcPerformance(fcp);

    // Initial simple static fallback if they haven't run diagnosis yet
    if (qh.length > 0 || fcp.length > 0) {
      // Let's analyze simply
      const strongs: string[] = [];
      const weaks: string[] = [];
      
      qh.forEach(q => {
        if (q.score / q.total >= 0.75) {
          if (!strongs.includes(q.topic)) strongs.push(q.topic);
        } else {
          if (!weaks.includes(q.topic)) weaks.push(q.topic);
        }
      });

      setAnalysis({
        strongTopics: strongs.length > 0 ? strongs : ["Physical Transmission Speeds"],
        weakTopics: weaks.length > 0 ? weaks : ["TCP Window Sizing", "OSI Presentation Layer Encoding"],
        recommendations: [
          "Review connection handshake headers. Take note of the sequence numbers.",
          "Try explaining the presentation layer formatting differences to a friend in under 1 minute."
        ],
        suggestedPracticeQuestions: [
          { question: "Why does the client send a FIN-ACK in TCP session termination?", topic: "TCP Session Closure" },
          { question: "Which OSI Layer handles SSL/TLS handshakes?", topic: "OSI Presentation Layer Encoding" }
        ]
      });
    }
  };

  const handleRunDiagnostics = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const provider = getActiveProvider();
      
      const qScores = quizHistory.map(q => ({ topic: q.topic, score: q.score, total: q.total }));
      const fcPerf = fcPerformance.map(f => ({ cardId: f.cardId, correct: f.correct, topic: f.topic }));

      const report = await provider.analyzeWeakTopics(qScores, fcPerf);
      if (report) {
        setAnalysis(report);
      } else {
        throw new Error("No diagnostics analysis was returned by the active model.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Diagnostics failed: ${err.message || 'Make sure Ollama/Demo is connected.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = quizHistory.length > 0 || fcPerformance.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Intro section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-600" />
            <span>AI Knowledge Map & Diagnostics</span>
          </h3>
          <p className="text-stone-500 mt-1 max-w-lg">
            This module processes your quiz history and flashcard performance, identifying concepts you have mastered and highlighting specific topics that need active revision.
          </p>
        </div>

        <button
          onClick={handleRunDiagnostics}
          disabled={isLoading || !hasData}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 shrink-0 disabled:bg-stone-200 disabled:text-stone-400"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-400" />}
          <span>Run AI Diagnostics</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-red-800 bg-red-50 border border-red-100 p-2.5 rounded-lg leading-normal">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!hasData ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <Brain className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-semibold text-slate-700">No Performance Data to Map</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Please attempt some practice quizzes or grade your memory with active recall flashcards to populate historical performance data.
              <strong className="block mt-1.5 text-[#D96A43]">Tip: Click "Try Demo" on the dashboard to populate computer networks stats instantly!</strong>
            </p>
          </div>
        </div>
      ) : (
        analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Topic mapping list */}
            <div className="space-y-6">
              {/* Strong Areas Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mastered Topics ({analysis.strongTopics.length})</span>
                </h4>
                
                <div className="space-y-2">
                  {analysis.strongTopics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-emerald-50/30 rounded-lg border border-emerald-100/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="font-semibold text-slate-800 text-xs">{topic}</span>
                    </div>
                  ))}
                  {analysis.strongTopics.length === 0 && (
                    <p className="text-stone-400 italic">No topics mastered yet. Keep practicing!</p>
                  )}
                </div>
              </div>

              {/* Weak Areas Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Topics Needing Revision ({analysis.weakTopics.length})</span>
                </h4>
                
                <div className="space-y-2">
                  {analysis.weakTopics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-amber-50/30 rounded-lg border border-amber-100/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="font-semibold text-slate-800 text-xs">{topic}</span>
                    </div>
                  ))}
                  {analysis.weakTopics.length === 0 && (
                    <p className="text-stone-400 italic">Excellent! You've mastered all current exam modules!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnostic Recommendations & Suggested Questions */}
            <div className="space-y-6">
              
              {/* Step-by-step Study Suggestions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Revision Strategy Guide</h4>
                <div className="space-y-3 leading-relaxed text-slate-700">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="w-4 h-4 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom AI Practice Questions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3.5">
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span>Custom Diagnostic Challenges</span>
                </h4>
                
                <p className="text-[11px] text-stone-500 leading-normal">
                  Our model generated these active practice probes specifically designed to target gaps in your performance logs:
                </p>

                <div className="space-y-3 pt-1">
                  {analysis.suggestedPracticeQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 border border-slate-200 rounded-lg space-y-1 bg-[#FAF6F0]/30 border-orange-100/40">
                      <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block font-mono">{q.topic}</span>
                      <p className="font-serif text-xs font-semibold text-slate-900 leading-snug">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
}
