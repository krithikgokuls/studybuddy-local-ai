import React, { useState, useEffect } from 'react';
import { Flashcard, AIProvider } from '../services/ai/types';
import { getActiveProvider } from '../services/ai/aiService';
import { studyStorage, SavedMaterial } from '../services/storage/studyStorage';
import { Brain, Sparkles, RefreshCw, Layers, Check, RefreshCw as LoopIcon, HelpCircle, AlertCircle } from 'lucide-react';

export default function FlashcardViewer() {
  const [materials, setMaterials] = useState<SavedMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  
  // Flashcard States
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Performance Log Trackers for this session
  const [reviewedCards, setReviewedCards] = useState<Record<string, 'known' | 'review'>>({});

  useEffect(() => {
    const list = studyStorage.getMaterials();
    setMaterials(list);
    if (list.length > 0) {
      setSelectedMaterialId(list[0].id);
    }

    // Load saved or default flashcards
    const savedCards = studyStorage.getFlashcards();
    if (savedCards.length > 0) {
      setCards(savedCards);
    }
  }, []);

  const handleGenerateCards = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIsFlipped(false);

    try {
      const activeMat = materials.find(m => m.id === selectedMaterialId);
      const textContent = activeMat ? activeMat.content : '';
      
      const provider = getActiveProvider();
      const generated = await provider.generateFlashcards(textContent, 5);
      
      if (generated && generated.length > 0) {
        setCards(generated);
        studyStorage.saveFlashcards(generated);
        setActiveCardIndex(0);
        setReviewedCards({});
        setSuccessMsg("Generated 5 new flashcards successfully!");
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error("No flashcards were generated. Check model connection.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to generate: ${err.message || 'Make sure Ollama/Demo is connected.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = (status: 'known' | 'review') => {
    const activeCard = cards[activeCardIndex];
    if (!activeCard) return;

    // Track locally in state
    setReviewedCards({
      ...reviewedCards,
      [activeCard.id]: status
    });

    // Write to permanent performance tracking store
    studyStorage.recordFlashcardReview(
      activeCard.id,
      status === 'known',
      activeCard.topic || 'General'
    );

    // Auto advance to next card after brief delay to keep flow snappy
    setTimeout(() => {
      if (activeCardIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => {
          setActiveCardIndex(prev => prev + 1);
        }, 150); // wait for unflip transition to look nice
      } else {
        alert("Awesome! You've reviewed all flashcards in this deck. Review your progress on the Weak Topics tab!");
      }
    }, 400);
  };

  const activeCard = cards[activeCardIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Configuration Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-serif text-base font-semibold text-slate-900">Spaced Repetition Flashcards</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Active recall tool. Test your recall on the front, flip to verify on the back.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 flex-1 md:flex-none"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              disabled={materials.length === 0}
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
              {materials.length === 0 && <option value="">No notes found</option>}
            </select>

            <button
              onClick={handleGenerateCards}
              disabled={materials.length === 0 || isLoading}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 disabled:bg-stone-200 disabled:text-stone-400"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate Cards</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-[11px]">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 text-red-800 bg-red-50 border border-red-100 p-2.5 rounded-lg text-[11px]">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Flashcard Arena */}
      {cards.length > 0 && activeCard ? (
        <div className="space-y-6">
          
          {/* Card Frame wrapper */}
          <div className="flex flex-col items-center">
            
            {/* The 3D flip card */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-lg h-[260px] cursor-pointer group"
              style={{ perspective: '1000px' }}
            >
              <div 
                className={`relative w-full h-full transition-transform duration-500 rounded-xl shadow-md border border-stone-200/60 bg-[#FFFDFB] ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                
                {/* FRONT OF THE CARD */}
                <div 
                  className="absolute inset-0 p-8 flex flex-col justify-between"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                    <span>{activeCard.topic || 'Review Topic'}</span>
                    <span>Card {activeCardIndex + 1} of {cards.length}</span>
                  </div>
                  
                  <div className="text-center font-serif text-base font-semibold text-slate-900 max-w-sm mx-auto self-center">
                    {activeCard.question}
                  </div>
                  
                  <div className="text-center text-[10px] text-stone-400 font-semibold uppercase tracking-wider group-hover:text-orange-500 transition-colors">
                    Click card to flip
                  </div>
                </div>

                {/* BACK OF THE CARD */}
                <div 
                  className="absolute inset-0 p-8 flex flex-col justify-between rotate-y-180"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-emerald-600">
                    <span>Recall Reference Answer</span>
                    <span>Back Of Card</span>
                  </div>
                  
                  <div className="text-center font-serif text-sm text-slate-800 leading-relaxed max-w-sm mx-auto self-center overflow-y-auto max-h-[140px] pr-1">
                    {activeCard.answer}
                  </div>
                  
                  <div className="text-center text-[10px] text-stone-400 font-semibold uppercase tracking-wider group-hover:text-orange-500 transition-colors">
                    Click to show question
                  </div>
                </div>

              </div>
            </div>

            {/* Performance grading bar below the card */}
            <div className="mt-6 flex gap-4 w-full max-w-lg">
              <button
                onClick={() => handleReviewAction('review')}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-800 border border-red-100 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <LoopIcon className="w-4 h-4 text-red-600" />
                <span>Need Revision</span>
              </button>
              <button
                onClick={() => handleReviewAction('known')}
                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>I know this!</span>
              </button>
            </div>

          </div>

          {/* Simple controls: Next, Previous */}
          <div className="flex justify-between items-center max-w-lg mx-auto border-t border-slate-200 pt-5">
            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => setActiveCardIndex(prev => Math.max(0, prev - 1)), 150);
              }}
              disabled={activeCardIndex === 0}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200"
            >
              Previous Card
            </button>

            <div className="text-xs text-stone-500 font-mono">
              Session Status: {Object.keys(reviewedCards).length} / {cards.length} Graded
            </div>

            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => setActiveCardIndex(prev => Math.min(cards.length - 1, prev + 1)), 150);
              }}
              disabled={activeCardIndex === cards.length - 1}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-30 disabled:hover:border-slate-200"
            >
              Next Card
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <Layers className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-semibold text-slate-700">No Flashcard Deck Loaded</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Please choose a note topic from the picker above and click <strong className="text-orange-600">"Generate Cards"</strong> to synthesize active recall drills!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
