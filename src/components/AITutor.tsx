import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AIProvider } from '../services/ai/types';
import { getActiveProvider } from '../services/ai/aiService';
import { studyStorage, SavedMaterial } from '../services/storage/studyStorage';
import { MessageSquare, Sparkles, Send, Trash2, Shield, Brain, HelpCircle, ArrowRight } from 'lucide-react';

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [materials, setMaterials] = useState<SavedMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProvider | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load config and notes
    const loadedMaterials = studyStorage.getMaterials();
    setMaterials(loadedMaterials);
    if (loadedMaterials.length > 0) {
      setSelectedMaterialId(loadedMaterials[0].id);
    }

    const provider = getActiveProvider();
    setActiveProvider(provider);

    // Retrieve chat logs
    const savedChat = studyStorage.getChatHistory();
    if (savedChat.length > 0) {
      setMessages(savedChat);
    } else {
      // Default welcome message based on selected material
      const initialWelcome = [
        {
          role: 'assistant' as const,
          content: `Hi there! I'm your private StudyBuddy AI tutor. 🦉\n\nI can help you review your study materials step-by-step using simple analogies and clear real-world examples. Under local privacy-first rules, everything you share remains completely offline.\n\nWhich topic can I help you understand today?`
        }
      ];
      setMessages(initialWelcome);
      studyStorage.saveChatHistory(initialWelcome);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getSelectedMaterialText = (): string => {
    const mat = materials.find(m => m.id === selectedMaterialId);
    return mat ? mat.content : '';
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    studyStorage.saveChatHistory(updatedMessages);

    try {
      const provider = getActiveProvider();
      const currentMaterialText = getSelectedMaterialText();
      
      const responseText = await provider.chat(updatedMessages, currentMaterialText);
      
      const assistantMsg: ChatMessage = { role: 'assistant', content: responseText };
      const finalMessages = [...updatedMessages, assistantMsg];
      
      setMessages(finalMessages);
      studyStorage.saveChatHistory(finalMessages);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ **Connection Error**: ${err.message || 'Failed to reach AI provider.'}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear your tutoring history and start fresh?")) {
      studyStorage.clearChatHistory();
      const initialWelcome = [
        {
          role: 'assistant' as const,
          content: `Hi there! I'm your private StudyBuddy AI tutor. 🦉\n\nI can help you review your study materials step-by-step using simple analogies and clear real-world examples. Under local privacy-first rules, everything you share remains completely offline.\n\nWhich topic can I help you understand today?`
        }
      ];
      setMessages(initialWelcome);
      studyStorage.saveChatHistory(initialWelcome);
    }
  };

  const triggerQuickAction = (actionType: 'simpler' | 'example' | 'test') => {
    let text = '';
    const activeMat = materials.find(m => m.id === selectedMaterialId);
    const contextStr = activeMat ? `about "${activeMat.title}"` : '';

    if (actionType === 'simpler') {
      text = `Please explain the core difficult concept ${contextStr} in much simpler terms, like I'm 8 years old. Use a cozy, real-world comparison!`;
    } else if (actionType === 'example') {
      text = `Could you give me a clear real-world example of how these concepts work in everyday life ${contextStr}?`;
    } else if (actionType === 'test') {
      text = `Test me! Ask me a single targeted question ${contextStr} to check if I understand the core concepts.`;
    }
    handleSendMessage(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in py-4 h-[calc(100vh-160px)] min-h-[550px]">
      
      {/* Sidebar - Context Control Panel */}
      <div className="lg:col-span-4 space-y-5 flex flex-col h-full justify-between">
        <div className="space-y-5">
          {/* Active Tutoring Context Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Brain className="w-5 h-5 text-orange-600" />
              <span>Tutor Grounding Context</span>
            </h3>
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Study Material</label>
              {materials.length === 0 ? (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-3 rounded-lg mt-1">
                  You have no study materials stored. The AI Tutor will run in general knowledge mode. 
                  <strong className="block mt-1">Tip: Click "Try Demo" to auto-load sample notes!</strong>
                </div>
              ) : (
                <select
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.subject})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="text-xs text-stone-500 bg-slate-50 p-3.5 rounded-lg border border-slate-100 leading-relaxed">
              <span className="font-semibold text-slate-700 block mb-0.5">How Grounding Works:</span>
              The tutor extracts rules, steps, and protocols directly from your selected notes. This limits hallucinations and keeps study topics strictly tailored to what's on your upcoming exam.
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Tutor Shortcuts</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => triggerQuickAction('simpler')}
                className="w-full text-left p-3 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/10 rounded-lg font-medium transition-all text-slate-700 flex justify-between items-center group"
                disabled={materials.length === 0}
              >
                <span>Explain Simpler</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600" />
              </button>
              <button
                onClick={() => triggerQuickAction('example')}
                className="w-full text-left p-3 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/10 rounded-lg font-medium transition-all text-slate-700 flex justify-between items-center group"
                disabled={materials.length === 0}
              >
                <span>Give me an Example</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600" />
              </button>
              <button
                onClick={() => triggerQuickAction('test')}
                className="w-full text-left p-3 border border-slate-200 hover:border-orange-500 hover:bg-orange-50/10 rounded-lg font-medium transition-all text-slate-700 flex justify-between items-center group"
                disabled={materials.length === 0}
              >
                <span>Test me (Quick Question)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Clear chat logs action */}
        <button
          onClick={clearChat}
          className="w-full py-2 bg-slate-100 hover:bg-red-50 text-stone-500 hover:text-red-600 border border-slate-200 hover:border-red-100 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Tutoring History</span>
        </button>
      </div>

      {/* Right Column: Chat Screen */}
      <div className="lg:col-span-8 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden">
        
        {/* Chat Status Header */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-800">StudyBuddy AI Active</span>
          </div>

          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-800 px-3 py-1 rounded-full border border-orange-100 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-orange-600" />
            <span>Active Model: {activeProvider?.modelName || 'Built-in Llama'}</span>
          </div>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[calc(100%-110px)]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 select-none ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-brand-beige text-orange-700 border border-orange-100'
                }`}
              >
                {msg.role === 'user' ? 'ME' : '🦉'}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-[#FAF6F0]/60 text-slate-950 border border-orange-100/30 rounded-tl-none font-serif'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-[80%] mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full bg-brand-beige border border-orange-100 flex items-center justify-center text-xs text-orange-700 select-none">
                🦉
              </div>
              <div className="p-4 bg-[#FAF6F0]/40 text-stone-500 border border-orange-100/20 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 font-sans">Generating explanation...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-100 p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2.5"
          >
            <input
              type="text"
              placeholder={materials.length === 0 ? "Paste some study material first to guide the tutor..." : "Ask your local tutor a question about your study guides..."}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs text-slate-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 bg-[#D96A43] hover:bg-[#c25a34] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
