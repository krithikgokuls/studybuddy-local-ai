import React from 'react';
import { Shield, Sparkles, Code, Cpu, Flame, CheckCircle, Heart } from 'lucide-react';

export default function AboutProject() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Intro Header Section */}
      <div className="bg-brand-cream border border-orange-100 rounded-xl p-6 text-center space-y-3 shadow-sm">
        <Heart className="w-10 h-10 text-rose-500 mx-auto fill-rose-100" />
        <div className="space-y-1 max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-[#2A2521] font-bold">About StudyBuddy</h2>
          <p className="text-xs text-stone-500">
            A bespoke, highly personalized AI education platform built with love to support a friend through their toughest technical examinations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Why it was built */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            The Backstory: Designed for a Friend
          </h3>
          <p className="text-stone-600 leading-relaxed text-xs">
            Preparing for certification exams like the Cisco CCNA or final network engineering assessments can be an isolating and high-stress experience. Materials are dense, vocabulary is rigid, and typical textbook paragraphs feel disconnected from reality.
          </p>
          <p className="text-stone-600 leading-relaxed text-xs">
            We built <strong>StudyBuddy</strong> specifically to act as a supportive study partner for a friend struggling to synthesize notes, revise consistently, and stay confident. It strips out corporate telemetry and replaces dry documentation with relatable analogies, structured daily action items, and zero-stress conversational tutorials.
          </p>

          <div className="bg-[#FAF6F0] p-4 rounded-lg border border-orange-100/50 space-y-1.5 leading-normal">
            <span className="font-serif font-bold text-[#D96A43] text-xs">Key Project Milestones:</span>
            <ul className="space-y-1 text-[11px] text-stone-600">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#D96A43]"></span>
                <span>Upload lecture notes & PDFs seamlessly</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#D96A43]"></span>
                <span>Explain difficult layers with real-world analogies</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#D96A43]"></span>
                <span>Pinpoint weak components through diagnostic histories</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Local / Open weights matter */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            The Philosophy of Open-Weight AI
          </h3>
          <p className="text-stone-600 leading-relaxed text-xs">
            Most modern AI tools are locked behind proprietary, expensive cloud APIs. This comes with three severe drawbacks for students:
          </p>
          
          <div className="space-y-3.5 pt-1">
            <div className="flex gap-2.5 items-start">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 text-xs">Absolute Privacy & Data Sovereignty</span>
                <p className="text-stone-500 text-[11px] leading-normal">
                  Study materials, code guides, and class essays contain private thoughts, school records, and personal documents. Local models like Llama 3.2 guarantee that no notes are transmitted to third-party telemetry networks.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Cpu className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 text-xs">100% Offline Capability</span>
                <p className="text-stone-500 text-[11px] leading-normal">
                  Students study on trains, airplanes, or in library basements with poor cellular signal. Running a model locally on your own laptop CPU/GPU means your personal tutor is always active and accessible, with zero dependency on the internet.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Code className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 text-xs">Swappable and Customizable Models</span>
                <p className="text-stone-500 text-[11px] leading-normal">
                  Through Ollama, students can easily hot-swap their runtime model from Llama 3.2, Mistral, to Gemma, or even download specialized fine-tuned models tailored for programming or medical sciences.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Offline indicators block */}
      <div className="bg-[#FAF6F0] border border-orange-100 p-5 rounded-xl text-center max-w-xl mx-auto space-y-2">
        <Sparkles className="w-6 h-6 text-orange-500 mx-auto" />
        <h4 className="font-serif text-sm font-semibold text-slate-900">Empowering Students Everywhere</h4>
        <p className="text-stone-500 text-[11px] leading-relaxed">
          Open-source AI represents the democratization of educational tutoring. StudyBuddy shows how easy it is to architect fully decentralized, zero-cost, private AI systems that perform at the highest limits of software quality.
        </p>
      </div>

    </div>
  );
}
