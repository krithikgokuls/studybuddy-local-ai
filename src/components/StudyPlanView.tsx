import React, { useState, useEffect } from 'react';
import { StudyTask, AIProvider } from '../services/ai/types';
import { getActiveProvider } from '../services/ai/aiService';
import { studyStorage, FriendProfile } from '../services/storage/studyStorage';
import { Calendar, CheckCircle2, Clock, CalendarDays, RefreshCw, Sliders, Sparkles } from 'lucide-react';

interface StudyPlanViewProps {
  onPlanChanged: () => void;
}

export default function StudyPlanView({ onPlanChanged }: StudyPlanViewProps) {
  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  
  // Local planner parameters
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState(2);
  const [examDate, setExamDate] = useState('');
  const [subjectsText, setSubjectsText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = () => {
    const activeProfile = studyStorage.getProfile();
    setProfile(activeProfile);
    setGoal(activeProfile.goal);
    setHours(activeProfile.hoursPerDay);
    setExamDate(activeProfile.examDate);
    setSubjectsText(activeProfile.subjects.join(', '));

    const activePlan = studyStorage.getStudyPlan();
    setTasks(activePlan);
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const provider = getActiveProvider();
      const subjectsList = subjectsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const generated = await provider.generateStudyPlan(goal, hours, examDate, subjectsList);
      if (generated && generated.length > 0) {
        studyStorage.saveStudyPlan(generated);
        setTasks(generated);
        setSuccessMsg("Generated custom study calendar successfully!");
        setTimeout(() => setSuccessMsg(''), 3000);
        onPlanChanged();
      } else {
        throw new Error("No study tasks were generated. Verify API availability.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to plan schedule: ${err.message || 'Make sure Ollama/Demo is connected.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (id: string) => {
    const updated = studyStorage.toggleStudyTask(id);
    setTasks(updated);
    onPlanChanged();
  };

  // Group tasks by Day
  const daysMap: Record<string, StudyTask[]> = {};
  tasks.forEach(task => {
    if (!daysMap[task.day]) {
      daysMap[task.day] = [];
    }
    daysMap[task.day].push(task);
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4 text-xs">
      
      {/* Planner Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <CalendarDays className="w-5 h-5 text-orange-600" />
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900">AI Daily Study Planner</h3>
            <p className="text-xs text-stone-500 mt-0.5">Generate a personalized daily preparation roadmap structured directly leading up to your exam.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Study Goal</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Subjects (Comma Separated)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Exam / Interview Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 font-mono"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Study Hours / Day</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 border border-stone-200 p-3 rounded-lg">
              <strong>Calendar Mode:</strong> Generates daily bite-sized tasks, and allocates topics so you cover everything incrementally before the exam.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-red-800 bg-red-50 border border-red-100 p-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="w-full py-3 bg-[#D96A43] hover:bg-[#c25a34] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-stone-200"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Rebuild AI Study Schedule</span>
          </button>
        </div>
      </div>

      {/* Daily Schedule Timeline Display */}
      {tasks.length > 0 ? (
        <div className="space-y-6">
          {/* Progress Overview Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h4 className="font-serif text-base font-semibold text-slate-900">Preparation Progress</h4>
              <p className="text-stone-500 mt-0.5">Check off completed steps to log your study sessions.</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Progress bar */}
              <div className="flex-1 sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="font-mono font-semibold text-slate-700 whitespace-nowrap">
                {progressPercent}% Complete ({completedTasks}/{totalTasks})
              </span>
            </div>
          </div>

          {/* Calendar timeline mapping */}
          <div className="space-y-4">
            {Object.entries(daysMap).map(([day, dayTasks]) => (
              <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Day title bar */}
                <div className="bg-[#FAF6F0] px-5 py-3 border-b border-orange-100/40 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="font-serif text-sm font-bold text-slate-900">{day} Focus Block</span>
                  </div>
                  
                  {/* Status Indicator for the day */}
                  <span className="text-[10px] font-semibold text-slate-500 font-mono">
                    {dayTasks.filter(t => t.isCompleted).length} / {dayTasks.length} Completed
                  </span>
                </div>

                {/* Day tasks listing */}
                <div className="divide-y divide-slate-100">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => handleToggleTask(task.id)}
                      className={`px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors group ${
                        task.isCompleted ? 'bg-stone-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 max-w-[85%]">
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.isCompleted 
                            ? 'bg-emerald-500 border-emerald-600 text-white' 
                            : 'border-slate-300 group-hover:border-slate-400 bg-white'
                        }`}>
                          {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <div className="space-y-0.5">
                          <span className={`font-semibold text-slate-900 text-xs transition-all ${
                            task.isCompleted ? 'line-through text-stone-400 font-normal' : ''
                          }`}>
                            {task.title}
                          </span>
                          
                          <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                            <span className="font-medium text-[#D96A43]">{task.topic}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {task.durationMinutes} minutes
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-semibold text-slate-700">No Active Study Schedule</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Input study specifications above and click <strong className="text-orange-600">"Rebuild AI Study Schedule"</strong> to generate a comprehensive preparation plan!
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
