import React, { useState, useCallback, useRef } from 'react';
import {
  FileText,
  Download,
  Upload,
  Eye,
  Edit3,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  FormattingSettings,
  OptimizationMetrics,
  ResumeData,
} from './types';
import {
  getSampleSoftwareEngineer,
  getSampleProductManager,
  getSampleShortResume,
  getSampleLongResume,
  getDefaultFormatting,
  validateFormattingSettings,
  validateResumeData,
} from './utils/sampleData';
import {
  fullAutoFitToOnePage,
  optimizeResumeContent,
} from './utils/atsOptimizer';
import { evaluateATSCompliance } from './utils/atsScorer';
import { ResumePreview } from './components/ResumePreview';
import { ResumeEditor } from './components/ResumeEditor';
import { OnePageOptimizerBar } from './components/OnePageOptimizerBar';
import { ATSScoreModal } from './components/ATSScoreModal';
import { ExportModal } from './components/ExportModal';

export const App: React.FC = () => {
  // State — initialize with isolated deep copies to keep demonstration profiles immutable
  const [resumeData, setResumeData] = useState<ResumeData>(getSampleSoftwareEngineer);
  const [formattingSettings, setFormattingSettings] = useState<FormattingSettings>(getDefaultFormatting);
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [scale, setScale] = useState<number>(0.85);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');

  // Modals & Feedback
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [optimizationSummary, setOptimizationSummary] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // File upload input ref for importing JSON
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronous height metrics callback from ResumePreview
  const handleMetricsCalculated = useCallback((newMetrics: OptimizationMetrics) => {
    setMetrics(newMetrics);
  }, []);

  // Safe formatting update handler ensuring all values match ATS bounds
  const handleUpdateSettings = useCallback((newSettings: FormattingSettings) => {
    setFormattingSettings(validateFormattingSettings(newSettings));
  }, []);

  // One-Click Intelligent Full Auto-Fit to Exactly 1 Page
  const handleAutoFitToOnePage = useCallback(() => {
    const result = fullAutoFitToOnePage(resumeData, formattingSettings);

    setResumeData(result.data);
    setFormattingSettings(result.settings);
    setOptimizationSummary(result.summary);

    if (!result.isFitted && result.actionRequired) {
      setActionAlert(result.actionRequired);
    } else {
      setActionAlert(null);
      setTimeout(() => setOptimizationSummary(null), 6000);
    }
  }, [resumeData, formattingSettings]);

  // Condense all bullets across the entire resume
  const handleCondenseAllContent = useCallback(() => {
    const condensed = optimizeResumeContent(resumeData);
    setResumeData(condensed);
    setOptimizationSummary('Optimized all bullet points: removed fluff phrases and upgraded weak verbs.');
    setTimeout(() => setOptimizationSummary(null), 5000);
  }, [resumeData]);

  // Reset to default formatting
  const handleResetSettings = useCallback(() => {
    setFormattingSettings(getDefaultFormatting());
    setOptimizationSummary('Reset layout and typography to recommended ATS defaults.');
    setActionAlert(null);
    setTimeout(() => setOptimizationSummary(null), 4000);
  }, []);

  // Keyword application from ATS Scanner
  const handleApplyKeyword = useCallback((keyword: string) => {
    setResumeData((prev) => {
      if (prev.skills.length === 0) {
        return {
          ...prev,
          skills: [{ id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, categoryName: 'Core Competencies', skills: keyword }],
        };
      }
      const newSkills = [...prev.skills];
      if (!newSkills[0].skills.toLowerCase().includes(keyword.toLowerCase())) {
        newSkills[0] = {
          ...newSkills[0],
          skills: `${newSkills[0].skills}, ${keyword}`,
        };
      }
      return { ...prev, skills: newSkills };
    });
    setOptimizationSummary(`Added keyword "${keyword}" to skills.`);
    setTimeout(() => setOptimizationSummary(null), 4000);
  }, []);

  // Load sample resumes — always load fresh isolated clones so user edits don't contaminate demonstrations
  const handleLoadSample = (sample: 'swe' | 'pm' | 'short' | 'long' | 'blank') => {
    setActionAlert(null);
    if (sample === 'swe') setResumeData(getSampleSoftwareEngineer());
    else if (sample === 'pm') setResumeData(getSampleProductManager());
    else if (sample === 'short') setResumeData(getSampleShortResume());
    else if (sample === 'long') setResumeData(getSampleLongResume());
    else {
      setResumeData({
        contact: {
          fullName: 'FIRSTNAME LASTNAME',
          professionalTitle: 'Professional Title',
          email: 'email@example.com',
          phone: '+1 (555) 000-0000',
          location: 'City, State',
          linkedIn: 'linkedin.com/in/username',
        },
        summary: 'Brief professional overview highlighting key skills and career goals.',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
      });
    }
    setFormattingSettings(getDefaultFormatting());
    setOptimizationSummary(`Loaded ${sample.toUpperCase()} demonstration profile.`);
    setTimeout(() => setOptimizationSummary(null), 4000);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const jsonStr = JSON.stringify({ resumeData, formattingSettings }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (resumeData.contact?.fullName || 'resume').trim().replace(/\s+/g, '_');
    a.download = `${safeName}_resume_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup — validate and sanitize thoroughly
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.resumeData) setResumeData(validateResumeData(parsed.resumeData));
        if (parsed.formattingSettings) setFormattingSettings(validateFormattingSettings(parsed.formattingSettings));
        setOptimizationSummary('Imported resume successfully!');
        setActionAlert(null);
        setTimeout(() => setOptimizationSummary(null), 4000);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ATS score summary
  const atsResult = evaluateATSCompliance(
    resumeData,
    formattingSettings,
    metrics?.fillPercentage ?? 95
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 1. TOP NAVBAR */}
      <header className="bg-slate-900 text-white px-4 py-3 shadow-md z-30 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  ATS Resume Generator
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Strict 1-Page A4 Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Auto-fit wording, spacing, and typography to fit exactly one A4 page (210 × 297 mm)
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Scenario Profiles Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mr-2 border-r border-slate-700 pr-3 overflow-x-auto max-w-full">
              <span className="text-slate-400 font-medium hidden sm:inline">Scenarios:</span>
              <button
                onClick={() => handleLoadSample('swe')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                title="Normal Standard SWE Profile (Fits 1 page, ~73% fill)"
              >
                Standard SWE
              </button>
              <button
                onClick={() => handleLoadSample('pm')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                title="Product Manager Profile (Fits 1 page, ~58% fill)"
              >
                Product Manager
              </button>
              <button
                onClick={() => handleLoadSample('short')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                title="TEST 1: Short Fresher Profile (~52% fill)"
              >
                Short
              </button>
              <button
                onClick={() => handleLoadSample('long')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                title="TEST 3: Long Senior Architect Profile (Tests Overflows & Auto-Fit)"
              >
                Long (Auto-Fit)
              </button>
              <button
                onClick={() => handleLoadSample('blank')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                title="Clear all fields and start from a blank template"
              >
                Blank
              </button>
            </div>

            {/* ATS Score Button */}
            <button
              onClick={() => setIsAtsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              title="Inspect ATS compliance checklist and job description keyword matcher"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>ATS Score:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold ${
                  atsResult.score >= 85
                    ? 'bg-emerald-500 text-white'
                    : atsResult.score >= 70
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-red-500 text-white'
                }`}
              >
                {atsResult.score}/100
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all ${
                metrics?.isOverflowing
                  ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export 1-Page PDF</span>
            </button>

            {/* Backup / Load JSON */}
            <div className="flex items-center gap-1 ml-1 text-slate-400">
              <button
                onClick={handleExportJson}
                title="Backup resume data (JSON)"
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Load resume data (JSON)"
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. STICKY ONE-PAGE OPTIMIZER CONTROL BAR */}
      <div className="no-print">
        <OnePageOptimizerBar
          metrics={metrics}
          settings={formattingSettings}
          onUpdateSettings={handleUpdateSettings}
          onAutoFitToOnePage={handleAutoFitToOnePage}
          onResetSettings={handleResetSettings}
          scale={scale}
          onUpdateScale={setScale}
          optimizationSummary={optimizationSummary}
        />
      </div>

      {/* Actionable User Shortening Advice if Content Exceeds Maximum Capacity */}
      {actionAlert && (
        <div className="no-print max-w-7xl mx-auto w-full px-4 pt-3">
          <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-xs flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-sm block">Action Required to Fit Exactly 1 Page:</span>
              <p className="mt-0.5 leading-relaxed">{actionAlert}</p>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. MOBILE VIEW TOGGLE */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white no-print">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            mobileView === 'editor'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" /> Edit Content
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
            mobileView === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview A4 Page
        </button>
      </div>

      {/* 4. MAIN DUAL-PANE WORKSPACE */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Resume Content Editor (5 Cols on Large Screens) */}
        <section
          className={`lg:col-span-5 h-[calc(100vh-140px)] sticky top-[75px] no-print ${
            mobileView === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumeEditor
            data={resumeData}
            onChange={setResumeData}
            onCondenseAllContent={handleCondenseAllContent}
          />
        </section>

        {/* RIGHT PANE: Live A4 Resume Preview (7 Cols on Large Screens) */}
        <section
          className={`lg:col-span-7 flex flex-col items-center justify-start bg-slate-200/60 rounded-xl p-4 sm:p-6 border border-slate-300/80 min-h-[calc(100vh-140px)] overflow-x-auto ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Visual Indicator of A4 Page Boundaries */}
          <div className="w-full max-w-[210mm] mb-2 flex items-center justify-between text-xs text-slate-600 px-1 no-print">
            <div className="flex items-center gap-1 font-semibold">
              <span>Template:</span>
              <span className="capitalize text-slate-900 font-bold">{formattingSettings.template} ATS</span>
              <span className="text-slate-400">•</span>
              <span>{formattingSettings.fontFamily}</span>
              <span className="text-slate-400">•</span>
              <span>{formattingSettings.bodyFontSizePt}pt</span>
            </div>
            <div className="font-semibold text-xs">
              {metrics?.isOverflowing ? (
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Overflows Page 1 ({metrics.fillPercentage}% — Cutoff at 297 mm)
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  Page 1 of 1 (A4: 210 × 297 mm — {metrics?.fillPercentage ?? 95}% Filled)
                </span>
              )}
            </div>
          </div>

          {/* Resume A4 Component */}
          <div className="relative">
            <ResumePreview
              data={resumeData}
              settings={formattingSettings}
              scale={scale}
              onMetricsCalculated={handleMetricsCalculated}
            />
          </div>
        </section>
      </main>

      {/* 5. MODALS */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={resumeData}
        settings={formattingSettings}
        metrics={metrics}
        onAutoFitToOnePage={handleAutoFitToOnePage}
      />

      <ATSScoreModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        data={resumeData}
        settings={formattingSettings}
        fillPercentage={metrics?.fillPercentage ?? 95}
        onApplyKeyword={handleApplyKeyword}
      />
    </div>
  );
};
