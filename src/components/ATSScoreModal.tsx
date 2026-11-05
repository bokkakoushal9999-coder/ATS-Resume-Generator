import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Target, Copy, Check } from 'lucide-react';
import { evaluateATSCompliance } from '../utils/atsScorer';
import { FormattingSettings, ResumeData } from '../types';

interface ATSScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  settings: FormattingSettings;
  fillPercentage: number;
  onApplyKeyword?: (keyword: string) => void;
}

export const ATSScoreModal: React.FC<ATSScoreModalProps> = ({
  isOpen,
  onClose,
  data,
  settings,
  fillPercentage,
  onApplyKeyword,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const result = evaluateATSCompliance(data, settings, fillPercentage, jobDescription);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm ${
                result.score >= 85
                  ? 'bg-emerald-600'
                  : result.score >= 70
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            >
              {result.score}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">ATS Compliance &amp; Keyword Analyzer</h2>
              <p className="text-xs text-slate-500">
                Deterministic ATS parsing audit &amp; single-page validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top Score Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              result.score >= 85
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : result.score >= 70
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-red-50/70 border-red-200 text-red-900'
            }`}
          >
            <div>
              <span className="font-bold text-sm">
                {result.score >= 85
                  ? 'Excellent ATS Machine-Readability'
                  : result.score >= 70
                  ? 'Good ATS Compatibility (Optimization Suggested)'
                  : 'Action Needed for ATS Pass Rate'}
              </span>
              <p className="text-xs mt-0.5 opacity-90">
                {fillPercentage > 100
                  ? 'CRITICAL: Resume exceeds 1 page. Major applicant tracking systems (Taleo, Workday, Greenhouse) favor single-page concise formats.'
                  : 'Single-column structure, standard section headings, and vector selectable text ensure standard parser extraction.'}
              </p>
            </div>
          </div>

          {/* Category Breakdown (Weighted Metrics) */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Category Breakdown (Weighted Evaluation)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.categoryScores.map((cat) => {
                const color =
                  cat.score >= 80
                    ? 'emerald'
                    : cat.score >= 60
                    ? 'amber'
                    : 'red';
                return (
                  <div
                    key={cat.name}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-xs">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({cat.weight}%)</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          color === 'emerald'
                            ? 'bg-emerald-100 text-emerald-800'
                            : color === 'amber'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cat.score}/100
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          color === 'emerald'
                            ? 'bg-emerald-500'
                            : color === 'amber'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{cat.details}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 1: Strict ATS Rule Checks */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              ATS Rule Checklist
            </h3>
            <div className="space-y-2">
              {result.checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    check.passed
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                      : 'bg-red-50/40 border-red-100 text-slate-800'
                  }`}
                >
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">{check.label}</span>
                    <p className="text-slate-600 mt-0.5">{check.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Job Description Keyword Matcher */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Job Description Matcher
              </h3>
            </div>
            <p className="text-slate-500">
              Paste the target job description to verify that your 1-page resume contains the exact keywords required by automated filters.
            </p>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting text here (e.g. 'Looking for a Senior Full Stack Engineer with Go, Kafka, React, AWS, Docker, Kubernetes...')"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />

            {jobDescription.trim().length > 20 && (
              <div className="space-y-2.5 pt-1">
                {result.matchedKeywords.length > 0 && (
                  <div>
                    <span className="font-semibold text-emerald-800 block mb-1">
                      Matched Keywords ({result.matchedKeywords.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.missingKeywords.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-800">
                        Missing Keywords to Consider ({result.missingKeywords.length}):
                      </span>
                      <button
                        onClick={() => handleCopy(result.missingKeywords.join(', '))}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === result.missingKeywords.join(', ') ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied All
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy All
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => {
                            if (onApplyKeyword) {
                              onApplyKeyword(kw);
                            }
                            handleCopy(kw);
                          }}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded font-medium text-[11px] transition-colors flex items-center gap-1"
                          title="Click to copy keyword"
                        >
                          <span>+ {kw}</span>
                          {copiedKey === kw && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-slate-100 rounded-lg text-slate-500 text-[11px] leading-relaxed border border-slate-200">
            {result.disclaimer}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
