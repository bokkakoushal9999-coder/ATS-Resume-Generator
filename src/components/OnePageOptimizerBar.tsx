import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { ATS_CONSTRAINTS } from '../utils/atsOptimizer';
import { FormattingSettings, OptimizationMetrics } from '../types';

interface OnePageOptimizerBarProps {
  metrics: OptimizationMetrics | null;
  settings: FormattingSettings;
  onUpdateSettings: (settings: FormattingSettings) => void;
  onAutoFitToOnePage: () => void;
  onResetSettings: () => void;
  scale: number;
  onUpdateScale: (scale: number) => void;
  optimizationSummary: string | null;
}

export const OnePageOptimizerBar: React.FC<OnePageOptimizerBarProps> = ({
  metrics,
  settings,
  onUpdateSettings,
  onAutoFitToOnePage,
  onResetSettings,
  scale,
  onUpdateScale,
  optimizationSummary,
}) => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const fillPercent = metrics?.fillPercentage ?? 95;
  const isOverflow = metrics?.isOverflowing ?? false;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: 1-Page Status Indicator & Height Meter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">A4 Height:</span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                isOverflow
                  ? 'bg-red-50 text-red-700 border border-red-200 ring-2 ring-red-400/20'
                  : fillPercent >= 88
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isOverflow ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>
                    {fillPercent}% Filled — 2nd Page Overflow (+{metrics?.overflowPx}px)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {fillPercent}% Filled — Exact 1 A4 Page
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar of Page 1 Capacity */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverflow ? 'bg-red-500' : fillPercent >= 88 ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, fillPercent)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500">297mm target</span>
          </div>
        </div>

        {/* Center: Primary Auto-Fit Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoFitToOnePage}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
              isOverflow
                ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-400/30 animate-bounce'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Intelligently adjusts wording, spacing, and font within ATS bounds to fit exactly 1 page"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Fit to Exactly 1 Page</span>
          </button>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showSettingsDrawer
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Layout Controls</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showSettingsDrawer ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Right: Zoom & Preview Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => onUpdateScale(Math.max(0.6, scale - 0.1))}
              className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => onUpdateScale(Math.min(1.4, scale + 0.1))}
              className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateScale(0.85)}
              className="px-2 py-1 hover:bg-slate-200 text-slate-600 border-l border-slate-200 text-[11px] font-medium"
              title="Fit to Window"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* Optimization Notification Banner */}
      {optimizationSummary && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{optimizationSummary}</span>
          </div>
          <button
            onClick={onResetSettings}
            className="text-blue-700 hover:underline font-semibold flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
        </div>
      )}

      {/* Overflow Warning Banner */}
      {isOverflow && (
        <div className="max-w-7xl mx-auto mt-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">
              <strong>Critical Requirement Alert:</strong> Resume content spills past the single A4 page boundary. Click &apos;Auto-Fit to Exactly 1 Page&apos; or reduce font/margins below.
            </span>
          </div>
        </div>
      )}

      {/* Dropdown Layout & ATS Formatting Drawer */}
      {showSettingsDrawer && (
        <div className="max-w-7xl mx-auto mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
          {/* Group 1: Typography (Prompt: Body 9-10pt, Headings 10-12pt, Name 18-22pt) */}
          <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Typography</span>
              <span className="text-[10px] text-blue-600 font-semibold">Strict ATS</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">
                Font Family (Calibri / Arial preferred)
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onUpdateSettings({ ...settings, fontFamily: e.target.value as any })}
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-medium bg-white"
              >
                <option value="Calibri">Calibri (Standard ATS)</option>
                <option value="Arial">Arial (Clean Sans-Serif)</option>
                <option value="Times New Roman">Times New Roman (Classic Serif)</option>
                <option value="Georgia">Georgia (Executive Serif)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Body Font (9–10 pt)</span>
                <span className="font-bold text-slate-900">{settings.bodyFontSizePt} pt</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.bodyFontPt.min}
                max={ATS_CONSTRAINTS.bodyFontPt.max}
                step={0.1}
                value={settings.bodyFontSizePt}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, bodyFontSizePt: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Headings (10–12 pt)</span>
                <span className="font-bold text-slate-900">{settings.headingFontSizePt} pt</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.headingFontPt.min}
                max={ATS_CONSTRAINTS.headingFontPt.max}
                step={0.5}
                value={settings.headingFontSizePt}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, headingFontSizePt: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Name Size (18–22 pt)</span>
                <span className="font-bold text-slate-900">{settings.nameFontSizePt} pt</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.nameFontPt.min}
                max={ATS_CONSTRAINTS.nameFontPt.max}
                step={1}
                value={settings.nameFontSizePt}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, nameFontSizePt: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Group 2: Margins & Padding (Prompt: 0.4 - 0.55 inches) */}
          <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Margins & Line Height</span>
              <span className="text-[10px] text-slate-500">A4 Boundaries</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Page Margins (0.4–0.55 in)</span>
                <span className="font-bold text-slate-900">{settings.marginInches.toFixed(2)} in</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.margins.min}
                max={ATS_CONSTRAINTS.margins.max}
                step={0.01}
                value={settings.marginInches}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, marginInches: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Line Height (1.15–1.35)</span>
                <span className="font-bold text-slate-900">{settings.lineSpacing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.lineSpacing.min}
                max={ATS_CONSTRAINTS.lineSpacing.max}
                step={0.02}
                value={settings.lineSpacing}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, lineSpacing: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Section Spacing (5–12 pt)</span>
                <span className="font-bold text-slate-900">{settings.sectionSpacingPt} pt</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.sectionSpacingPt.min}
                max={ATS_CONSTRAINTS.sectionSpacingPt.max}
                step={1}
                value={settings.sectionSpacingPt}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, sectionSpacingPt: parseInt(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Item Spacing (2.5–6 pt)</span>
                <span className="font-bold text-slate-900">{settings.itemSpacingPt} pt</span>
              </div>
              <input
                type="range"
                min={ATS_CONSTRAINTS.itemSpacingPt.min}
                max={ATS_CONSTRAINTS.itemSpacingPt.max}
                step={0.5}
                value={settings.itemSpacingPt}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, itemSpacingPt: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Group 3: Template & Styling */}
          <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800">ATS Template</div>

            <div className="grid grid-cols-2 gap-1.5">
              {(['classic', 'modern', 'executive', 'technical'] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => onUpdateSettings({ ...settings, template: tmpl })}
                  className={`px-2 py-1.5 rounded text-xs font-semibold capitalize border text-left transition-colors ${
                    settings.template === tmpl
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>

            <div className="pt-1 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDividers}
                  onChange={(e) => onUpdateSettings({ ...settings, showDividers: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span className="text-slate-700 font-medium">Show Section Dividers</span>
              </label>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Header Align:</span>
                <div className="flex rounded border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, headerAlignment: 'center' })}
                    className={`px-2 py-0.5 text-[11px] font-semibold ${
                      settings.headerAlignment === 'center' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, headerAlignment: 'left' })}
                    className={`px-2 py-0.5 text-[11px] font-semibold ${
                      settings.headerAlignment === 'left' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'
                    }`}
                  >
                    Left
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Group 4: Quick Actions & Reset */}
          <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 mb-1">Preset Tightness</div>
              <p className="text-[11px] text-slate-500 mb-2">
                Instantly toggle between comfortable and high-density 1-page presets.
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      marginInches: 0.50,
                      bodyFontSizePt: 9.8,
                      headingFontSizePt: 11.5,
                      sectionSpacingPt: 8,
                      itemSpacingPt: 4,
                      lineSpacing: 1.25,
                    })
                  }
                  className="w-full text-left px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-medium"
                >
                  Comfortable Spacing (for shorter content)
                </button>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      marginInches: 0.42,
                      bodyFontSizePt: 9.1,
                      headingFontSizePt: 10.0,
                      sectionSpacingPt: 5,
                      itemSpacingPt: 2.5,
                      lineSpacing: 1.16,
                    })
                  }
                  className="w-full text-left px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-medium text-blue-700"
                >
                  High Density (for extensive careers)
                </button>
              </div>
            </div>

            <button
              onClick={onResetSettings}
              className="w-full py-1.5 text-center text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded font-medium flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Recommended Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
