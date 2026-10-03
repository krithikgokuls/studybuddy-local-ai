import React, { useState, useEffect } from 'react';
import { FriendProfile, studyStorage } from '../services/storage/studyStorage';
import { getProviders, getSelectedProviderId, setSelectedProviderId, getOllamaConfig } from '../services/ai/aiService';
import { Shield, HelpCircle, Sliders, User, Server } from 'lucide-react';

interface SettingsPanelProps {
  onProfileUpdated: () => void;
  onProviderChanged: () => void;
}

export default function SettingsPanel({ onProfileUpdated, onProviderChanged }: SettingsPanelProps) {
  const [profile, setProfile] = useState<FriendProfile>({
    name: '',
    goal: '',
    subjects: [],
    streak: 0,
    examDate: '',
    hoursPerDay: 1,
  });

  const [subjectsText, setSubjectsText] = useState('');
  const [activeProvider, setActiveProvider] = useState<'ollama' | 'demo'>('demo');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load state
    const currentProfile = studyStorage.getProfile();
    setProfile(currentProfile);
    setSubjectsText(currentProfile.subjects.join(', '));

    setActiveProvider(getSelectedProviderId());
    
    const { endpoint, modelName } = getOllamaConfig();
    setOllamaEndpoint(endpoint);
    setOllamaModel(modelName);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSubjects = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updated = {
      ...profile,
      subjects: cleanSubjects,
    };

    studyStorage.saveProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onProfileUpdated();
  };

  const handleSaveProviderConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('studybuddy_ollama_endpoint', ollamaEndpoint);
    localStorage.setItem('studybuddy_ollama_model', ollamaModel);
    setSelectedProviderId(activeProvider);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onProviderChanged();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Header and Privacy Ribbon */}
      <div className="bg-brand-cream border border-orange-100 rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-serif text-[#2A2521] font-semibold">Personalization & AI Settings</h2>
          <p className="text-sm text-stone-500 mt-1">Configure study parameters and switch between local or demo engines.</p>
        </div>
        
        {/* Privacy Indicator */}
        <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg border border-emerald-100 text-xs font-semibold whitespace-nowrap">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Privacy-First / Local AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Friend Customization Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-orange-600" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">Personalize "Built for My Friend"</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Friend's Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Exam / Interview Goal</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 min-h-[80px]"
                value={profile.goal}
                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Exam/Target Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 font-mono"
                  value={profile.examDate}
                  onChange={(e) => setProfile({ ...profile, examDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Daily Study Target</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
                  value={profile.hoursPerDay}
                  onChange={(e) => setProfile({ ...profile, hoursPerDay: Number(e.target.value) })}
                >
                  <option value={1}>1 Hour / day</option>
                  <option value={2}>2 Hours / day</option>
                  <option value={3}>3 Hours / day</option>
                  <option value={4}>4 Hours / day</option>
                  <option value={6}>6 Hours / day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Subjects (Comma Separated)</label>
              <input
                type="text"
                placeholder="Computer Networks, Chemistry, Algorithms"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800"
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 bg-[#D96A43] text-white rounded-lg font-medium hover:bg-[#c25a34] transition-colors focus:ring-4 focus:ring-orange-500/20"
              >
                Update Friend Parameters
              </button>
            </div>
          </form>
        </div>

        {/* AI Provider Config Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-orange-600" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">AI Model & Swappable Runtime</h3>
          </div>

          <form onSubmit={handleSaveProviderConfig} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Active AI Engine</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveProvider('demo')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    activeProvider === 'demo'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Demo/Simulated (No Setup)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProvider('ollama')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    activeProvider === 'ollama'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Local Ollama (Llama 3.2)
                </button>
              </div>
            </div>

            {activeProvider === 'ollama' ? (
              <div className="space-y-4 border border-orange-100 bg-orange-50/20 p-4 rounded-xl animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Ollama Connection URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 font-mono"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Default local address: http://localhost:11434</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Model Name</label>
                  <input
                    type="text"
                    placeholder="llama3.2 or mistral"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 font-mono"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Make sure you have downloaded this model (e.g. `ollama pull llama3.2` or run `ollama run llama3.2`).</p>
                </div>

                <div className="text-[11px] text-stone-600 bg-white border border-stone-200 rounded-lg p-3 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-orange-600" />
                    <span>CORS Configuration Required:</span>
                  </div>
                  <p>Local browsers block connection requests unless Ollama permits them. Launch Ollama in your terminal using:</p>
                  <code className="block bg-slate-100 p-1 rounded border border-slate-200 font-mono text-slate-700 mt-1 select-all text-[10px]">
                    OLLAMA_ORIGINS="*" ollama serve
                  </code>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">About the Demo/Simulated Engine:</p>
                <p>Perfect for testing immediately! It parses your uploaded materials in real time and uses pre-configured semantic matchers to explain concepts, generate quizzes, flashcards, and study schedules with zero server setup required.</p>
                <p><strong>100% Offline:</strong> No network requests or external dependencies.</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Apply AI Configuration
              </button>
            </div>
          </form>
        </div>

      </div>

      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2 animate-bounce">
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}
