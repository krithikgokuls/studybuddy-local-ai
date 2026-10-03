import React, { useState, useEffect } from 'react';
import { studyStorage, FriendProfile, loadDemoData } from '../services/storage/studyStorage';
import { getActiveProvider } from '../services/ai/aiService';
import { 
  Flame, Award, CheckCircle2, AlertTriangle, Play, BookOpen, 
  MessageSquare, Brain, CalendarDays, Heart, Sparkles, HelpCircle 
} from 'lucide-react';

interface DashboardProps {
  onTabChange: (tab: 'dashboard' | 'materials' | 'tutor' | 'quiz' | 'flashcards' | 'plan' | 'insights' | 'settings' | 'about') => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function Dashboard({ onTabChange, refreshTrigger, onRefresh }: DashboardProps) {
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [nextTaskTitle, setNextTaskTitle] = useState('No tasks scheduled');
  const [activeModel, setActiveModel] = useState('Built-in Llama');
  const [demoLoaded, setDemoLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = () => {
    // 1. Get Friend Profile
    const activeProfile = studyStorage.getProfile();
    setProfile(activeProfile);

    // 2. Get Completed Topics
    const comp = studyStorage.getCompletedTopics();
    setCompletedTopics(comp);

    // 3. Compute Study Tasks Progress
    const plan = studyStorage.getStudyPlan();
    const totalTasks = plan.length;
    const completedTasks = plan.filter(t => t.isCompleted).length;
    setProgressPercent(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

    // 4. Get Next Incomplete Task
    const nextTask = plan.find(t => !t.isCompleted);
    if (nextTask) {
      setNextTaskTitle(`[${nextTask.topic}] ${nextTask.title}`);
    } else if (totalTasks > 0) {
      setNextTaskTitle("🎉 All study tasks completed for this block!");
    } else {
      setNextTaskTitle("No tasks generated. Go to 'Study Plan' to build one.");
    }

    // 5. Get Weak Topics
    const quizHistory = studyStorage.getQuizHistory();
    const badQuizTopics = quizHistory.filter(q => q.score / q.total < 0.75).map(q => q.topic);
    
    const fcPerformance = studyStorage.getFlashcardPerformance();
    const badFcTopics = fcPerformance.filter(f => !f.correct).map(f => f.topic);

    const mergedWeaks = Array.from(new Set([...badQuizTopics, ...badFcTopics]));
    setWeakTopics(mergedWeaks.length > 0 ? mergedWeaks : ["None identified yet!"]);

    // 6. Active AI model indicator
    const provider = getActiveProvider();
    setActiveModel(`${provider.name} (${provider.modelName})`);
  };

  const handleTryDemo = () => {
    loadDemoData();
    setDemoLoaded(true);
    onRefresh();
    setTimeout(() => setDemoLoaded(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Upper Section: Custom Visual Hero Graphic Banner & Mascot Badge */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-orange-100/30">
        {/* Generated Backdrop Study Header */}
        <img 
          src="/src/assets/images/dashboard_study_header_1790990146953.jpg" 
          alt="Warm Study Companion Desk" 
          className="w-full h-[200px] object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

        {/* Content Inside Hero */}
        <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Exam Preparation Companion
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                {activeModel}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-white font-bold tracking-tight">
              StudyBuddy for {profile.name}
            </h2>
            <p className="text-xs text-stone-200 line-clamp-1 max-w-xl font-serif italic">
              "Goal: {profile.goal}"
            </p>
          </div>

          <button
            onClick={handleTryDemo}
            className="px-5 py-2.5 bg-[#D96A43] hover:bg-[#c25a34] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-orange-200 animate-pulse" />
            <span>Try Demo (Computer Networks)</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: High Fidelity Stats scoreboard & Action Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Diagnostic Metrics Scoreboard (Single elevation) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Streak card */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Flame className="w-5 h-5 fill-orange-500" />
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Study Streak</span>
                <span className="font-mono text-base font-bold text-slate-900">{profile.streak} Days</span>
              </div>
            </div>

            {/* Progress Task Complete card */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Block Completed</span>
                <span className="font-mono text-base font-bold text-slate-900">{progressPercent}%</span>
              </div>
            </div>

            {/* Mastered Topics count */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Mastered Modules</span>
                <span className="font-mono text-base font-bold text-slate-900">{completedTopics.length} Topics</span>
              </div>
            </div>

            {/* Target Hours */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Daily Target</span>
                <span className="font-mono text-base font-bold text-slate-900">{profile.hoursPerDay} Hours</span>
              </div>
            </div>
          </div>

          {/* Next Task Pointer and Action Trigger Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#D96A43] uppercase tracking-wider block font-mono">Current Milestone</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{nextTaskTitle}</span>
              </div>
              <button
                onClick={() => onTabChange('plan')}
                className="px-4 py-1.5 border border-slate-200 hover:border-slate-300 text-stone-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <span>View Full Plan</span>
              </button>
            </div>

            {/* Action launcher grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onTabChange('tutor')}
                className="p-3 bg-[#FAF6F0] hover:bg-[#FAF6F0]/90 border border-orange-100 text-left rounded-lg transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#D96A43] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-900 text-xs block">Ask AI Tutor</span>
                  <p className="text-stone-500 text-[10px] truncate">Explain concepts with simple step-by-step analogies</p>
                </div>
              </button>

              <button
                onClick={() => onTabChange('quiz')}
                className="p-3 bg-[#FAF6F0] hover:bg-[#FAF6F0]/90 border border-orange-100 text-left rounded-lg transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#D96A43] group-hover:scale-105 transition-transform">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-900 text-xs block">Generate Practice Quiz</span>
                  <p className="text-stone-500 text-[10px] truncate">Validate your logic with diagnostic multiple choice questions</p>
                </div>
              </button>
            </div>
          </div>

          {/* Built for a Friend personal tag card (Requested) */}
          <div className="bg-[#FAF6F0]/50 border border-orange-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 border-b border-orange-100/40 pb-2">
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              <h3 className="font-serif text-sm font-semibold text-[#2A2521]">Built for My Friend ❤️</h3>
            </div>
            <p className="text-stone-600 leading-relaxed text-xs">
              This system was crafted specifically to reduce the stress of memorizing rigid protocols, ports, and layers for <strong>{profile.name}</strong>. By focusing on active recall, simplified language, and local AI execution, it creates a personal, private study workspace that builds exam confidence day by day.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
              <span>Need to change target subjects or goals?</span>
              <button 
                onClick={() => onTabChange('settings')} 
                className="font-bold text-orange-600 hover:underline hover:text-orange-700"
              >
                Customize parameters here →
              </button>
            </div>
          </div>

        </div>

        {/* Right Hand Sidebar: Mascot Character Card & Topic Summaries */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mascot character card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center text-center space-y-4">
            {/* Generated Mascot Avatar */}
            <div className="relative">
              <img 
                src="/src/assets/images/studybuddy_mascot_1790990128291.jpg" 
                alt="StudyBuddy Mascot Owl" 
                className="w-20 h-20 rounded-full border-2 border-orange-100 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-base font-semibold text-slate-900">Your AI Study Buddy</h4>
              <p className="text-[10px] text-stone-500 font-medium">ALWAYS ACTIVE · SECURE & OFFLINE</p>
            </div>

            <p className="text-stone-600 leading-relaxed text-[11px]">
              "Hey there! I've loaded your notes. Let's break down these complex network concepts. Ready to run a quick active recall flashcard drill?"
            </p>

            <button 
              onClick={() => onTabChange('flashcards')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all"
            >
              Start Flashcard Drill
            </button>
          </div>

          {/* Key Topics List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Concept Diagnostic Gaps</h4>
            <div className="space-y-2">
              {weakTopics.map((topic, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    topic.includes('None') 
                      ? 'border-emerald-100 bg-emerald-50/10 text-emerald-800' 
                      : 'border-amber-100 bg-amber-50/10 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {topic.includes('None') ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold truncate">{topic}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-[10px] text-stone-400 leading-normal flex items-start gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-stone-300 shrink-0 mt-0.5" />
              <span>Diagnostic gaps are populated automatically from incorrect quiz answers and flashcard marks.</span>
            </div>
          </div>

        </div>

      </div>

      {demoLoaded && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Demo Data loaded! Enjoy reviewing "Arun's" profile.</span>
        </div>
      )}

    </div>
  );
}
