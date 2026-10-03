import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, Flame, User, Sliders, Sparkles, MessageSquare, Brain, CalendarDays, Layers, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { studyStorage } from './services/storage/studyStorage';
import { getSelectedProviderId, getActiveProvider } from './services/ai/aiService';

// Import Views
import Dashboard from './components/Dashboard';
import Materials from './components/Materials';
import AITutor from './components/AITutor';
import QuizGenerator from './components/QuizGenerator';
import FlashcardViewer from './components/FlashcardViewer';
import StudyPlanView from './components/StudyPlanView';
import WeakTopicAnalysisView from './components/WeakTopicAnalysisView';
import SettingsPanel from './components/SettingsPanel';
import AboutProject from './components/AboutProject';

type ActiveTab = 'dashboard' | 'materials' | 'tutor' | 'quiz' | 'flashcards' | 'plan' | 'insights' | 'settings' | 'about';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeProviderName, setActiveProviderName] = useState('Demo Engine');
  const [friendName, setFriendName] = useState('Arun');
  
  // centralized trigger state to force children views to fetch refreshed storage values
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Set initial configuration
    syncProfileDetails();
  }, []);

  const syncProfileDetails = () => {
    const profile = studyStorage.getProfile();
    setFriendName(profile.name);
    
    const provider = getActiveProvider();
    setActiveProviderName(provider.name);
  };

  const handleRefreshAll = () => {
    setRefreshTrigger(prev => prev + 1);
    syncProfileDetails();
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            onTabChange={(tab) => {
              setActiveTab(tab);
              handleRefreshAll();
            }} 
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefreshAll}
          />
        );
      case 'materials':
        return <Materials onMaterialsChanged={handleRefreshAll} />;
      case 'tutor':
        return <AITutor />;
      case 'quiz':
        return <QuizGenerator />;
      case 'flashcards':
        return <FlashcardViewer />;
      case 'plan':
        return <StudyPlanView onPlanChanged={handleRefreshAll} />;
      case 'insights':
        return <WeakTopicAnalysisView />;
      case 'settings':
        return (
          <SettingsPanel 
            onProfileUpdated={handleRefreshAll} 
            onProviderChanged={handleRefreshAll} 
          />
        );
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard onTabChange={setActiveTab} refreshTrigger={refreshTrigger} onRefresh={handleRefreshAll} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      
      {/* HEADER: Conforming to the strict 1-row, 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* ZONE 1: Single text element wordmark in beautiful serif */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setActiveTab('dashboard'); handleRefreshAll(); }}
            className="text-lg md:text-xl font-serif font-black tracking-tight text-[#2A2521] hover:opacity-90 cursor-pointer"
          >
            StudyBuddy
          </button>
          
          {/* Quick inline indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-100 text-[10px] font-bold">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Local AI</span>
          </div>
        </div>

        {/* ZONE 2: Clean, single-line typography navigation tab links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-500">
          <button
            onClick={() => { setActiveTab('dashboard'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'dashboard' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('materials'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'materials' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Materials
          </button>
          <button
            onClick={() => { setActiveTab('tutor'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'tutor' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            AI Tutor
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'quiz' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => { setActiveTab('flashcards'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'flashcards' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => { setActiveTab('plan'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'plan' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Study Plan
          </button>
          <button
            onClick={() => { setActiveTab('insights'); handleRefreshAll(); }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
              activeTab === 'insights' ? 'text-orange-600 border-orange-500 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Diagnostics
          </button>
        </nav>

        {/* ZONE 3: 1-2 primary actions (Settings gear + About info clicker) */}
        <div className="flex items-center gap-2">
          {/* Active provider badge */}
          <div className="hidden md:block text-[10px] text-stone-500 bg-stone-100 border border-stone-200/60 px-2.5 py-1 rounded-lg truncate max-w-[160px] font-mono select-none">
            {activeProviderName}
          </div>

          <button
            onClick={() => { setActiveTab('about'); handleRefreshAll(); }}
            className={`p-2 rounded-lg text-xs font-semibold hover:bg-stone-100 text-stone-500 transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'about' ? 'bg-stone-100 text-orange-600' : ''
            }`}
            title="About local AI"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Philosophy</span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); handleRefreshAll(); }}
            className={`p-2 rounded-lg text-xs font-semibold hover:bg-stone-100 text-stone-500 transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'settings' ? 'bg-stone-100 text-orange-600 font-bold' : ''
            }`}
            title="Personalization settings"
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

      </header>

      {/* MOBILE SCROLL NAVIGATION (Ensures full accessibility on smaller viewports) */}
      <div className="lg:hidden bg-white border-b border-slate-200/40 overflow-x-auto flex items-center gap-4 py-2.5 px-4 scrollbar-none text-[11px] font-bold text-stone-500 whitespace-nowrap">
        <button
          onClick={() => { setActiveTab('dashboard'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'dashboard' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => { setActiveTab('materials'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'materials' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Materials
        </button>
        <button
          onClick={() => { setActiveTab('tutor'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'tutor' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          AI Tutor
        </button>
        <button
          onClick={() => { setActiveTab('quiz'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'quiz' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Quiz
        </button>
        <button
          onClick={() => { setActiveTab('flashcards'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'flashcards' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Flashcards
        </button>
        <button
          onClick={() => { setActiveTab('plan'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'plan' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Study Plan
        </button>
        <button
          onClick={() => { setActiveTab('insights'); handleRefreshAll(); }}
          className={`px-1 py-0.5 ${activeTab === 'insights' ? 'text-orange-600' : 'hover:text-slate-900'}`}
        >
          Diagnostics
        </button>
      </div>

      {/* CORE VIEWPORT: Clean, responsive layout bounds */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {renderActiveView()}
      </main>

      {/* FOOTER: Minimal, conforming to Anti-Slop Guidelines (No fake engines, clean links) */}
      <footer className="bg-white border-t border-slate-200/60 py-5 text-center text-[10px] text-stone-400 font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <span>StudyBuddy AI Companion for My Friend {friendName} · Stored Locally</span>
          </div>
          <div>
            <span>Built with ❤️ in 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
