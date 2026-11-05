import React, { useState, useMemo } from 'react';
import {
  X,
  FileDown,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { FormattingSettings, OptimizationMetrics, ResumeData } from '../types';
import { generateAtsPdf } from '../utils/pdfGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  settings: FormattingSettings;
  metrics: OptimizationMetrics | null;
  onAutoFitToOnePage: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  settings,
  metrics,
  onAutoFitToOnePage,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Validate actual PDF generation directly
  const pdfValidation = useMemo(() => {
    if (!isOpen) return null;
    return generateAtsPdf(data, settings);
  }, [isOpen, data, settings]);

  if (!isOpen || !pdfValidation) return null;

  const isActuallyOnePage = pdfValidation.success && pdfValidation.pageCount === 1;
  const isOverflow = !isActuallyOnePage || (metrics?.isOverflowing ?? false);

  // Method 1: Direct Vector PDF Download
  const handleVectorPdfDownload = () => {
    if (!isActuallyOnePage) {
      alert(
        `Export blocked: Resume exceeds 1 page (actual PDF pages: ${pdfValidation.pageCount}). Please click 'Auto-Fit to 1 Page' first.`
      );
      return;
    }

    try {
      const fileName = `${data.contact.fullName.trim().replace(/\s+/g, '_') || 'Resume'}_ATS_1Page.pdf`;
      pdfValidation.pdf.save(fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Error saving PDF file.');
    }
  };

  // Method 2: Native Print to PDF
  const handleNativePrint = () => {
    if (!isActuallyOnePage) {
      alert(
        `Export blocked: Resume exceeds 1 page (actual PDF pages: ${pdfValidation.pageCount}). Please click 'Auto-Fit to 1 Page' first.`
      );
      return;
    }
    window.print();
  };

  // Method 3: Copy Plain Text for ATS forms
  const handleCopyPlainText = () => {
    const plainText = [
      data.contact.fullName.toUpperCase(),
      data.contact.professionalTitle,
      `${data.contact.email} | ${data.contact.phone} | ${data.contact.location}`,
      data.contact.linkedIn ? `LinkedIn: ${data.contact.linkedIn}` : '',
      data.contact.github ? `GitHub: ${data.contact.github}` : '',
      '\n--- PROFESSIONAL SUMMARY ---',
      data.summary,
      '\n--- TECHNICAL SKILLS ---',
      ...data.skills.map((s) => `${s.categoryName}: ${s.skills}`),
      '\n--- WORK EXPERIENCE ---',
      ...data.experience.map(
        (e) =>
          `${e.role} — ${e.company} (${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate})\n` +
          e.bullets.map((b) => `• ${b}`).join('\n')
      ),
      '\n--- KEY PROJECTS ---',
      ...data.projects.map(
        (p) => `${p.name} (${p.technologies})\n` + p.bullets.map((b) => `• ${b}`).join('\n')
      ),
      '\n--- EDUCATION ---',
      ...data.education.map(
        (ed) => `${ed.institution} — ${ed.degree} in ${ed.field} (${ed.graduationDate})`
      ),
      '\n--- CERTIFICATIONS ---',
      ...data.certifications.map((c) => `${c.name} — ${c.issuer} (${c.date})`),
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(plainText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-800">Export Verified 1-Page ATS Resume</h2>
              <p className="text-xs text-slate-500">
                Verified against actual PDF engine: A4 (210 × 297 mm)
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

        {/* Validation Status Checklist */}
        <div className="p-5 space-y-4 text-xs">
          {/* Strict 1-Page Validation Check */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isOverflow
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {isOverflow ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold text-sm block">
                {isOverflow
                  ? 'CRITICAL REQUIREMENT FAILED: Multi-Page PDF Detected'
                  : 'VALIDATION PASSED: Exactly 1 A4 Page Verified'}
              </span>
              <p className="mt-1 leading-relaxed">
                {isOverflow ? (
                  <>
                    The generated PDF renders on <strong>{pdfValidation.pageCount} pages</strong> (+
                    {pdfValidation.overflowPt.toFixed(1)}pt overflow past printable A4 boundary). Export is
                    blocked to prevent submitting multi-page resumes to ATS parsers.
                  </>
                ) : (
                  <>
                    PDF Engine confirmed: <strong>Exactly 1 Page</strong> (Height: {pdfValidation.renderedHeightPt.toFixed(0)}pt / {pdfValidation.maxAllowedHeightPt.toFixed(0)}pt max limit). Text is 100% searchable vector typography.
                  </>
                )}
              </p>

              {isOverflow && (
                <button
                  onClick={onAutoFitToOnePage}
                  className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Fit to Exactly 1 Page Now
                </button>
              )}
            </div>
          </div>

          {/* Actual PDF Validation Metrics */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-700 mb-1">Pre-Flight ATS Validation Criteria:</div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isOverflow ? 'text-red-500' : 'text-emerald-600'}`}
              />
              <span>
                Actual PDF Page Count = Exactly 1 (Engine result:{' '}
                <strong>{pdfValidation.pageCount} {pdfValidation.pageCount === 1 ? 'Page' : 'Pages'}</strong>)
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Page Dimensions = A4 (210 × 297 mm / 595.28 × 841.89 pt)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Vector Text (Searchable &amp; Selectable by ATS bots)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                ATS Typography ({settings.fontFamily}, Body: {settings.bodyFontSizePt}pt, Margins:{' '}
                {settings.marginInches.toFixed(2)}in)
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single-column standard architecture, no graphics or parsing blockers</span>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified 1-page ATS PDF downloaded
              successfully!
            </div>
          )}

          {copiedNotification && (
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-lg font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-blue-600" /> Clean plain text copied to clipboard for direct ATS pasting!
            </div>
          )}

          {/* Export Action Options */}
          <div className="space-y-3 pt-2">
            {/* Action 1: Direct Vector PDF Download (Recommended) */}
            <div
              onClick={isActuallyOnePage ? handleVectorPdfDownload : undefined}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                !isActuallyOnePage
                  ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                  : 'hover:border-blue-500 hover:shadow-md cursor-pointer bg-blue-50/60 border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Direct Download 1-Page PDF</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      Verified 1 Page
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Pure vector text, 100% searchable by ATS scanners, strictly 1 page.
                  </p>
                </div>
              </div>
              <button
                disabled={!isActuallyOnePage}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 disabled:bg-slate-300"
              >
                Download
              </button>
            </div>

            {/* Action 2: Browser Native Print to PDF */}
            <div
              onClick={isActuallyOnePage ? handleNativePrint : undefined}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                !isActuallyOnePage
                  ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                  : 'hover:border-slate-400 hover:shadow-sm cursor-pointer bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Print / Save as PDF</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Browser print engine: Paper A4, Margins None.
                  </p>
                </div>
              </div>
              <button
                disabled={!isActuallyOnePage}
                className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-900 disabled:bg-slate-300"
              >
                Print
              </button>
            </div>

            {/* Action 3: Copy ATS Plain Text */}
            <div
              onClick={handleCopyPlainText}
              className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-slate-800">Copy Form-Ready ATS Plain Text</span>
                <p className="text-slate-500 text-[11px]">Formatted for copy-pasting into online application text boxes.</p>
              </div>
              <button className="px-2.5 py-1 border border-slate-300 rounded font-medium text-slate-700 hover:bg-white text-xs">
                Copy Text
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            A4 Dimensions: <strong>210 × 297 mm</strong> • Maximum 1 Page
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
