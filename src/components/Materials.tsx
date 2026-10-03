import React, { useState, useEffect } from 'react';
import { SavedMaterial, studyStorage } from '../services/storage/studyStorage';
import { BookOpen, Trash2, Plus, FileText, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface MaterialsProps {
  onMaterialsChanged: () => void;
}

export default function Materials({ onMaterialsChanged }: MaterialsProps) {
  const [materials, setMaterials] = useState<SavedMaterial[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<SavedMaterial | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const list = studyStorage.getMaterials();
    setMaterials(list);
    if (list.length > 0 && !selectedMaterial) {
      setSelectedMaterial(list[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !content) {
      setErrorMsg("Please fill in all fields before saving.");
      return;
    }

    const newMat = studyStorage.addMaterial(title, subject, content);
    setTitle('');
    setSubject('');
    setContent('');
    setSuccessMsg(`"${title}" added successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
    
    loadMaterials();
    setSelectedMaterial(newMat);
    onMaterialsChanged();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this study material?")) {
      studyStorage.deleteMaterial(id);
      if (selectedMaterial?.id === id) {
        setSelectedMaterial(null);
      }
      loadMaterials();
      onMaterialsChanged();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    const reader = new FileReader();

    if (file.name.endsWith('.pdf')) {
      // PDF Mock/Conversion explaining the extension point
      setTimeout(() => {
        setIsUploading(false);
        const parsedTitle = file.name.replace('.pdf', '');
        const sampleExtractedText = `# Extracted from ${file.name}

## Topic Overview: Network Architectures
Modern enterprise systems rely on highly distributed models. This document summarizes core structures.

1. Hub-and-Spoke topology: Reduces line costs but creates single points of failure.
2. Mesh Topology: Fully redundant, extremely expensive, utilized for mission-critical core nodes.
3. Hybrid architectures: Combines star and bus layouts to accommodate physical office branches.

*Note: Clean text conversion completed successfully from local file.*`;
        
        const newMat = studyStorage.addMaterial(parsedTitle, "Imported Notes", sampleExtractedText);
        loadMaterials();
        setSelectedMaterial(newMat);
        onMaterialsChanged();
        setSuccessMsg(`PDF conversion simulated successfully for "${file.name}"!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }, 1200);
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsedTitle = file.name.replace(/\.(txt|md)$/, '');
        const newMat = studyStorage.addMaterial(parsedTitle, "Uploaded File", text);
        setIsUploading(false);
        loadMaterials();
        setSelectedMaterial(newMat);
        onMaterialsChanged();
        setSuccessMsg(`"${file.name}" uploaded successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsText(file);
    } else {
      setIsUploading(false);
      setErrorMsg("Unsupported file type. Please upload a TXT, Markdown, or PDF file.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in py-4">
      
      {/* Left Column: Material Directory & Import Controls */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Save/Upload Control Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-semibold text-slate-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              <span>Study Notes & Files</span>
            </h3>
          </div>

          {/* Quick File Drag Upload Indicator */}
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-stone-50/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".txt,.md,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
            <div className="space-y-1.5">
              <FileText className="w-8 h-8 text-stone-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-700">
                {isUploading ? "Reading and analyzing file..." : "Upload TXT, MD, or PDF file"}
              </div>
              <p className="text-[10px] text-stone-500 leading-normal max-w-xs mx-auto">
                Files remain completely local inside your browser context. No remote server uploads.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-100 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Manual Entry Accordion form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 text-xs">
            <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Or Paste Notes Manually:</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Title</label>
                <input
                  type="text"
                  placeholder="OSI Network Architecture"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 text-xs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Subject</label>
                <input
                  type="text"
                  placeholder="Computer Networks"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 text-xs"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-500 mb-0.5 font-medium">Content / Markdown Text</label>
              <textarea
                placeholder="Paste exam topics, bullet points, study guides, or copy-pasted slides here..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 text-xs min-h-[120px] font-mono leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Study Guide</span>
            </button>
          </form>
        </div>

        {/* Saved Materials List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Stored Guides ({materials.length})</h4>
          
          {materials.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-xs">
              No materials saved yet. Upload a text file or try clicking <strong className="text-orange-600">"Try Demo"</strong> on the dashboard to populate mock guides!
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between group ${
                    selectedMaterial?.id === mat.id
                      ? 'border-orange-500 bg-orange-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate pr-4">
                    <div className="font-semibold text-slate-900 text-xs truncate">{mat.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{mat.subject}</span>
                      <span>·</span>
                      <span>{mat.createdAt}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(mat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded transition-all"
                    title="Delete Guide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Material Reader View & PDF Extensibility Information */}
      <div className="lg:col-span-7">
        {selectedMaterial ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Material Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{selectedMaterial.subject}</span>
                <h3 className="font-serif text-lg font-semibold text-slate-950 mt-0.5">{selectedMaterial.title}</h3>
              </div>
              <div className="text-xs text-stone-500 font-mono">
                Stored Locally
              </div>
            </div>

            {/* Note Display Canvas */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-serif bg-[#FFFDFB]">
              {selectedMaterial.content}
            </div>

            {/* Extensibility footer block for educational project compliance */}
            <div className="border-t border-slate-100 bg-slate-50 p-4 text-[11px] text-stone-500 leading-normal flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-slate-700">Developer Note: PDF Extraction Extensibility</span>
                <p>
                  To convert this static view into a high-capacity PDF parser, you can integrate a local node script with the client-side parser 
                  using libraries like <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">pdfjs-dist</code> in the React client, 
                  or proxy file buffers via a secure backend endpoint using standard <code className="bg-slate-100 px-1 rounded font-mono text-slate-600">pdf-parse</code> tools.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center flex flex-col justify-center items-center h-full min-h-[500px] text-stone-400 space-y-2">
            <BookOpen className="w-12 h-12 text-stone-300" />
            <h4 className="font-serif text-lg font-semibold text-slate-700">No Material Selected</h4>
            <p className="max-w-md text-xs text-stone-500">
              Select an existing study material from the directory on the left, or input/upload new study parameters to trigger AI-powered tutor analysis.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
