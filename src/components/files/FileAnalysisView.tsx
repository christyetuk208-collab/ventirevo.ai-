import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UploadRecord, BusinessMemoryReliability } from '../../types';
import {
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Layers,
  Brain,
  FileCheck,
  Zap,
  TrendingUp,
  Tag,
  Clock,
  X,
  FileSpreadsheet,
  FileImage,
  HelpCircle,
} from 'lucide-react';

interface FileAnalysisViewProps {
  onNavigateToGrowth?: () => void;
  onNavigateToMemory?: () => void;
  onNavigateToStudio?: () => void;
}

export const FileAnalysisView: React.FC<FileAnalysisViewProps> = ({
  onNavigateToGrowth,
  onNavigateToMemory,
  onNavigateToStudio,
}) => {
  const { token, activeBusiness } = useAuth();

  const [files, setFiles] = useState<UploadRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<string>('landing_page');
  const [notification, setNotification] = useState<string | null>(null);

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    if (!token || !activeBusiness) return;
    try {
      const res = await fetch(`/api/businesses/${activeBusiness.id}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        if (data.length > 0 && !selectedFile) {
          setSelectedFile(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token, activeBusiness]);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !activeBusiness || !token) return;
    const file = fileList[0];

    // Check size limit (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds maximum allowed limit (25MB).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('business_id', activeBusiness.id);
    formData.append('analysis_lens', activeLens);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'File upload failed');
      }

      const newUpload: UploadRecord = await res.json();
      setFiles((prev) => [newUpload, ...prev]);
      setSelectedFile(newUpload);
      setNotification(`"${file.name}" uploaded successfully. Running AI audit...`);

      // Trigger automatic deep analysis
      analyzeFile(newUpload.id, activeLens);
    } catch (err: any) {
      setUploadError(err.message || 'File upload and validation failed');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeFile = async (fileId: string, lens: string) => {
    if (!token) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/files/${fileId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lens }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const updated: UploadRecord = await res.json();
      setSelectedFile(updated);
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setNotification(`Audit complete with ${updated.findings?.length || 0} high-leverage findings.`);
    } catch (err: any) {
      setUploadError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToMemory = async (finding: { observation: string; confidence?: string; category?: string }) => {
    if (!selectedFile || !token) return;
    try {
      const res = await fetch(`/api/files/${selectedFile.id}/save-to-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: `${finding.category || 'Audit Finding'} (${selectedFile.file_name})`,
          value: finding.observation,
          category: 'market_learnings',
          reliability: finding.confidence || 'verified_fact',
        }),
      });

      if (res.ok) {
        setNotification('Insight verified and saved to Business Memory Bank.');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save to memory');
      }
    } catch (err) {
      console.error('Save memory error:', err);
    }
  };

  const handleCreateTask = async (taskTitle: string) => {
    if (!selectedFile || !token) return;
    try {
      const res = await fetch(`/api/files/${selectedFile.id}/create-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: `Derived from audit of ${selectedFile.file_name}.`,
          category: 'marketing',
          priority: 'highest_leverage',
          leverage_score: 92,
        }),
      });

      if (res.ok) {
        setNotification('Task scheduled into active 30-Day Growth Sprint.');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Task creation error:', err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!token || !confirm('Permanently delete this collateral and its audit findings?')) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (selectedFile?.id === fileId) {
          const remaining = files.filter((f) => f.id !== fileId);
          setSelectedFile(remaining.length > 0 ? remaining[0] : null);
        }
        setNotification('File and associated audit metadata deleted.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getReliabilityBadge = (rel?: string) => {
    switch (rel) {
      case 'verified_fact':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Verified Fact
          </span>
        );
      case 'estimate':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <Zap className="h-3 w-3 text-blue-400" /> Measured Benchmark
          </span>
        );
      case 'user_provided':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Tag className="h-3 w-3 text-amber-400" /> Provided Asset
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/60">
            <Sparkles className="h-3 w-3 text-purple-400" /> Diagnostic Hypothesis
          </span>
        );
    }
  };

  const lenses = [
    { id: 'landing_page', label: 'Landing Page & Copy Audit', desc: 'Identifies bounce friction, weak value hooks, and CTA leakage' },
    { id: 'financial_pl', label: 'Financial Unit Economics & P&L', desc: 'Audits CAC payback, gross margins, and subscription pricing elasticity' },
    { id: 'competitor_collateral', label: 'Competitor Collateral Teardown', desc: 'Maps competitor feature claims against their unaddressed customer complaints' },
    { id: 'customer_feedback', label: 'Customer Sentiment & Transcripts', desc: 'Extracts exact verbatim pain triggers and purchasing hesitations' },
    { id: 'general_business', label: 'General Diagnostic Audit', desc: 'Comprehensive operational, market fit, and offer leverage audit' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              Multimodal Audit Core
            </span>
            <span className="text-xs text-neutral-400">Zero-Hallucination OCR & Document Teardowns</span>
          </div>
          <h1 className="text-xl font-bold font-display text-neutral-100 mt-1">
            File & Collateral Intelligence
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl">
            Upload pitch decks, screenshots, landing pages, financial spreadsheets, or customer transcripts.
            Venturevo AI extracts high-leverage vulnerabilities and converts them directly into tasks and business memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="browse-files-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-emerald-900/20"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.json,.txt,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Analysis Lens Selection Row */}
      <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
          Diagnostic Audit Lens
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {lenses.map((lens) => {
            const isSelected = activeLens === lens.id;
            return (
              <button
                key={lens.id}
                id={`lens-${lens.id}`}
                onClick={() => {
                  setActiveLens(lens.id);
                  if (selectedFile) {
                    analyzeFile(selectedFile.id, lens.id);
                  }
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-600/80 text-neutral-100 shadow-sm'
                    : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate">{lens.label}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {lens.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Workspace: File Explorer on Left, Audit Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Upload Zone & Asset Library (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-950/30'
                : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50'
            }`}
          >
            <div className="h-10 w-10 mx-auto rounded-xl bg-neutral-800 flex items-center justify-center text-emerald-400 mb-2">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-200">
              Drop file here or click to browse
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">
              Supports PDF, PNG, JPG, CSV, DOCX (Max 25MB)
            </p>
            {isUploading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Validating and indexing document...</span>
              </div>
            )}
          </div>

          {/* Uploaded Files Library */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Uploaded Collateral ({files.length})
              </span>
              <button
                onClick={fetchFiles}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                <FileText className="h-8 w-8 mx-auto text-neutral-600 mb-2 opacity-50" />
                No documents uploaded yet.
                <br />
                Upload marketing collateral or financial manifests to run diagnostic audits.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {files.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const isPdf = file.file_type.includes('pdf');
                  const isImage = file.file_type.includes('image');

                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-600/70 shadow-sm'
                          : 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-900/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 truncate">
                          <div className="p-1.5 rounded-lg bg-neutral-900 text-emerald-400 flex-shrink-0 mt-0.5">
                            {isPdf ? (
                              <FileText className="h-4 w-4" />
                            ) : isImage ? (
                              <FileImage className="h-4 w-4" />
                            ) : (
                              <FileSpreadsheet className="h-4 w-4" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-neutral-200 truncate">{file.file_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                              <span>{((file.file_size_bytes || 0) / 1024).toFixed(0)} KB</span>
                              <span>•</span>
                              <span className="capitalize">{(file.lens || 'general').replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Status Tag */}
                      <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-400">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            file.processed_status === 'indexed'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {file.processed_status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deep Diagnostic Audit Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedFile ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-6">
              {/* Document Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      Audit Inspection
                    </span>
                    <span className="text-xs text-neutral-400">
                      Lens: <strong className="text-neutral-200 capitalize">{(selectedFile.lens || 'general').replace('_', ' ')}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-100 mt-1">
                    {selectedFile.file_name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="re-analyze-btn"
                    onClick={() => analyzeFile(selectedFile.id, activeLens)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
                    {isAnalyzing ? 'Auditing...' : 'Re-Run Audit'}
                  </button>
                </div>
              </div>

              {/* Executive Summary Box */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <Sparkles className="h-4 w-4" />
                  Executive Audit Summary
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedFile.summary || 'Click "Re-Run Audit" to generate an in-depth diagnostic breakdown.'}
                </p>
              </div>

              {/* Audit Findings & Vulnerabilities */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Diagnostic Findings & Actionable Prescriptions ({selectedFile.findings?.length || 0})</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Evidence-grounded observations</span>
                </h3>

                {(!selectedFile.findings || selectedFile.findings.length === 0) ? (
                  <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-800 text-center text-xs text-neutral-500">
                    No findings generated yet. Select a lens and click "Re-Run Audit".
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFile.findings.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-emerald-400" />
                            {f.category}
                          </span>
                          {getReliabilityBadge(f.confidence)}
                        </div>

                        {/* Observation */}
                        <div className="text-xs text-neutral-300 leading-relaxed pl-2 border-l-2 border-emerald-500/50">
                          <span className="text-neutral-500 font-semibold uppercase text-[10px] block">
                            Observation:
                          </span>
                          {f.observation}
                        </div>

                        {/* Flaw vs Recommendation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs">
                            <span className="text-rose-400 font-bold uppercase text-[10px] block mb-1">
                              Flaw / Friction Trigger:
                            </span>
                            <p className="text-rose-200/90 text-[11px] leading-snug">
                              {f.flaw_or_vulnerability}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
                            <span className="text-emerald-400 font-bold uppercase text-[10px] block mb-1">
                              Leverage Recommendation:
                            </span>
                            <p className="text-emerald-200/90 text-[11px] leading-snug">
                              {f.leverage_recommendation}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-850">
                          <button
                            onClick={() => handleSaveToMemory(f)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-emerald-300 text-[11px] font-medium transition-colors"
                          >
                            <Brain className="h-3 w-3 text-emerald-400" />
                            Save to Memory
                          </button>

                          <button
                            onClick={() => handleCreateTask(f.leverage_recommendation)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-colors"
                          >
                            <Plus className="h-3 w-3 text-emerald-400" />
                            Schedule as Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actionable Tasks Checklist */}
              {selectedFile.actionable_tasks && selectedFile.actionable_tasks.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      Extracted Actionable Tasks
                    </h4>
                    <span className="text-[10px] text-neutral-400">1-Click Sprint Assignment</span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedFile.actionable_tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs"
                      >
                        <span className="text-neutral-300 font-medium">{task}</span>
                        <button
                          onClick={() => handleCreateTask(task)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold uppercase hover:bg-emerald-900 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add Task
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-center text-neutral-500 space-y-3">
              <FileCheck className="h-10 w-10 mx-auto text-neutral-600 opacity-60" />
              <h3 className="text-sm font-semibold text-neutral-300">
                Select a Collateral File to Inspect
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Upload marketing collateral, pitch decks, landing pages, or financial spreadsheets on the left to review automated teardowns and high-leverage recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
