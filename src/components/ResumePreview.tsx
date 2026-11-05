import React, { useEffect, useMemo, useRef } from 'react';
import { FormattingSettings, OptimizationMetrics, ResumeData, ResumeSectionId } from '../types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { generateAtsPdf } from '../utils/pdfGenerator';

interface ResumePreviewProps {
  data: ResumeData;
  settings: FormattingSettings;
  scale?: number;
  onMetricsCalculated?: (metrics: OptimizationMetrics) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  settings,
  scale = 1,
  onMetricsCalculated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Ground-Truth Synchronous PDF Measurement Engine
  const metrics: OptimizationMetrics = useMemo(() => {
    const pdfRes = generateAtsPdf(data, settings);
    const fillPercentage = Math.round((pdfRes.renderedHeightPt / pdfRes.maxAllowedHeightPt) * 100);
    const isOverflowing = !pdfRes.success || pdfRes.pageCount > 1 || pdfRes.renderedHeightPt > pdfRes.maxAllowedHeightPt;
    const overflowPx = Math.round(pdfRes.overflowPt * (96 / 72));
    const totalA4HeightPx = Math.round(pdfRes.maxAllowedHeightPt * (96 / 72));
    const renderedHeightPx = Math.round(pdfRes.renderedHeightPt * (96 / 72));

    let pageStatus: OptimizationMetrics['pageStatus'] = 'perfect';
    if (isOverflowing) {
      pageStatus = 'overflow';
    } else if (fillPercentage < 80) {
      pageStatus = 'sparse';
    } else if (fillPercentage >= 90 && fillPercentage <= 100) {
      pageStatus = 'perfect';
    } else {
      pageStatus = 'near-full';
    }

    return {
      totalA4HeightPx,
      renderedHeightPx,
      fillPercentage,
      isOverflowing,
      overflowPx,
      estimatedPageCount: pdfRes.pageCount,
      pageStatus,
    };
  }, [data, settings]);

  useEffect(() => {
    onMetricsCalculated?.(metrics);
  }, [metrics, onMetricsCalculated]);

  const marginPx = `${settings.marginInches}in`;
  const bodyFontPx = `${settings.bodyFontSizePt}pt`;
  const headingFontPx = `${settings.headingFontSizePt}pt`;
  const nameFontPx = `${settings.nameFontSizePt}pt`;
  const sectionGapPx = `${settings.sectionSpacingPt}pt`;
  const itemGapPx = `${settings.itemSpacingPt}pt`;
  const bulletGapPx = `${settings.bulletSpacingPt}pt`;

  const fontClass = {
    Calibri: 'font-calibri',
    Arial: 'font-arial',
    'Times New Roman': 'font-times',
    Georgia: 'font-georgia',
  }[settings.fontFamily] || 'font-calibri';

  // Section Renderers Map
  const renderSection = (sectionId: ResumeSectionId) => {
    switch (sectionId) {
      case 'summary':
        if (!data.summary || data.summary.trim().length === 0) return null;
        return (
          <section key="summary" className="flex flex-col">
            <SectionHeader
              title="PROFESSIONAL SUMMARY"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <p className="text-justify leading-snug mt-0.5" style={{ fontSize: bodyFontPx }}>
              {data.summary}
            </p>
          </section>
        );

      case 'skills':
        if (!data.skills || data.skills.length === 0) return null;
        return (
          <section key="skills" className="flex flex-col">
            <SectionHeader
              title="TECHNICAL & DOMAIN SKILLS"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <div className="flex flex-col mt-0.5" style={{ gap: '1.5pt' }}>
              {data.skills.map((cat) => (
                <div key={cat.id} className="text-left leading-tight" style={{ fontSize: bodyFontPx }}>
                  <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                  <span className="text-slate-800">{cat.skills}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'experience':
        if (!data.experience || data.experience.length === 0) return null;
        return (
          <section key="experience" className="flex flex-col">
            <SectionHeader
              title="WORK EXPERIENCE"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <div className="flex flex-col mt-0.5" style={{ gap: itemGapPx }}>
              {data.experience.map((exp) => (
                <div key={exp.id} className="flex flex-col">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 leading-tight">
                    <div>
                      <span>{exp.role}</span>
                      <span className="font-normal text-slate-700"> — {exp.company}</span>
                    </div>
                    <div className="text-right text-xs font-semibold text-slate-600 whitespace-nowrap ml-2">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                      {exp.location && <span className="font-normal ml-1.5">| {exp.location}</span>}
                    </div>
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5" style={{ gap: bulletGapPx }}>
                      {exp.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="text-slate-800 text-left leading-snug"
                          style={{
                            fontSize: bodyFontPx,
                            marginBottom: idx < exp.bullets.length - 1 ? bulletGapPx : '0',
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!data.projects || data.projects.length === 0) return null;
        return (
          <section key="projects" className="flex flex-col">
            <SectionHeader
              title="PROJECTS & INITIATIVES"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <div className="flex flex-col mt-0.5" style={{ gap: itemGapPx }}>
              {data.projects.map((proj) => (
                <div key={proj.id} className="flex flex-col">
                  <div className="flex justify-between items-baseline leading-tight">
                    <div className="font-bold text-slate-900">
                      <span>{proj.name}</span>
                      {proj.technologies && (
                        <span className="font-normal text-slate-700 text-xs ml-1.5 italic">
                          ({proj.technologies})
                        </span>
                      )}
                    </div>
                    {proj.link && (
                      <div className="text-right text-xs text-slate-600 whitespace-nowrap ml-2">
                        <span>{proj.link.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>

                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5" style={{ gap: bulletGapPx }}>
                      {proj.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="text-slate-800 text-left leading-snug"
                          style={{
                            fontSize: bodyFontPx,
                            marginBottom: idx < proj.bullets.length - 1 ? bulletGapPx : '0',
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (!data.education || data.education.length === 0) return null;
        return (
          <section key="education" className="flex flex-col">
            <SectionHeader
              title="EDUCATION"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <div className="flex flex-col mt-0.5" style={{ gap: '2pt' }}>
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline leading-tight">
                  <div>
                    <span className="font-bold text-slate-900">{edu.institution}</span>
                    <span className="text-slate-800">
                      {' '}
                      — {edu.degree} in {edu.field}
                    </span>
                    {edu.gpaOrHonors && (
                      <span className="text-xs text-slate-600 ml-1.5 italic">({edu.gpaOrHonors})</span>
                    )}
                  </div>
                  <div className="text-right text-xs font-semibold text-slate-600 whitespace-nowrap ml-2">
                    {edu.graduationDate}
                    {edu.location && <span className="font-normal ml-1">| {edu.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!data.certifications || data.certifications.length === 0) return null;
        return (
          <section key="certifications" className="flex flex-col">
            <SectionHeader
              title="CERTIFICATIONS & CREDENTIALS"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <div className="flex flex-col mt-0.5" style={{ gap: '2pt' }}>
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline leading-tight">
                  <div>
                    <span className="font-bold text-slate-900">{cert.name}</span>
                    <span className="text-slate-700"> — {cert.issuer}</span>
                  </div>
                  <div className="text-right text-xs text-slate-600 whitespace-nowrap ml-2">
                    {cert.date}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'achievements':
        if (!data.achievements || data.achievements.length === 0) return null;
        return (
          <section key="achievements" className="flex flex-col">
            <SectionHeader
              title="HONORS & ACHIEVEMENTS"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <ul className="list-disc list-outside ml-4 mt-0.5" style={{ gap: bulletGapPx }}>
              {data.achievements.map((ach, idx) => (
                <li
                  key={idx}
                  className="text-slate-800 text-left leading-snug"
                  style={{
                    fontSize: bodyFontPx,
                    marginBottom: idx < data.achievements!.length - 1 ? bulletGapPx : '0',
                  }}
                >
                  {ach}
                </li>
              ))}
            </ul>
          </section>
        );

      case 'languages':
        if (!data.languages || data.languages.trim().length === 0) return null;
        return (
          <section key="languages" className="flex flex-col">
            <SectionHeader
              title="LANGUAGES"
              headingFontPx={headingFontPx}
              showDivider={settings.showDividers}
              template={settings.template}
            />
            <p className="text-slate-800 mt-0.5 leading-tight" style={{ fontSize: bodyFontPx }}>
              {data.languages}
            </p>
          </section>
        );

      default:
        return null;
    }
  };

  const defaultOrder: ResumeSectionId[] = [
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'achievements',
    'languages',
  ];

  const effectiveOrder = data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : defaultOrder;

  return (
    <div className="flex flex-col items-center">
      {/* Zoom / Scale Container */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="print:transform-none relative"
      >
        {/* Exact A4 Sheet Canvas: 210mm x 297mm */}
        <div
          ref={containerRef}
          id="ats-resume-print-area"
          className={`relative bg-white text-slate-900 shadow-2xl print:shadow-none ${fontClass} print-page`}
          style={{
            width: '210mm',
            minHeight: '296.8mm',
            boxSizing: 'border-box',
            padding: marginPx,
            lineHeight: settings.lineSpacing,
            fontSize: bodyFontPx,
          }}
        >
          {/* Visual A4 Page 1 Boundary Marker on Screen */}
          <div
            className="no-print absolute left-0 right-0 pointer-events-none transition-all duration-200 z-10"
            style={{
              top: '296.8mm',
            }}
          >
            {metrics.isOverflowing ? (
              <div className="relative border-b-2 border-dashed border-red-500 w-full flex items-center justify-center -translate-y-1/2">
                <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-[11px] shadow-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PAGE 1 CUTOFF BOUNDARY (297 mm) — Content below spills onto Page 2!
                </span>
              </div>
            ) : (
              <div className="relative border-b border-dashed border-emerald-400/80 w-full flex items-center justify-center -translate-y-1/2 opacity-70 hover:opacity-100">
                <span className="bg-emerald-600 text-white font-medium px-2.5 py-0.5 rounded-full text-[10px] shadow flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Page 1 Boundary (210 × 297 mm) — Verified 1 Page
                </span>
              </div>
            )}
          </div>

          {/* Actual Resume Content Container */}
          <div
            ref={contentRef}
            className="w-full flex flex-col"
            style={{
              gap: sectionGapPx,
            }}
          >
            {/* Header / Contact Information */}
            <header
              className={`flex flex-col ${
                settings.headerAlignment === 'center' ? 'items-center text-center' : 'items-start text-left'
              }`}
            >
              <h1
                className="font-bold tracking-tight uppercase"
                style={{ fontSize: nameFontPx, lineHeight: 1.1 }}
              >
                {data.contact?.fullName || 'YOUR NAME'}
              </h1>

              {data.contact?.professionalTitle && (
                <div
                  className="font-semibold text-slate-700 tracking-wide mt-0.5"
                  style={{ fontSize: `calc(${bodyFontPx} + 0.5pt)` }}
                >
                  {data.contact.professionalTitle}
                </div>
              )}

              {/* Contact Bar */}
              <div
                className="flex flex-wrap items-center justify-center gap-x-2 text-slate-700 mt-0.5"
                style={{ fontSize: `calc(${bodyFontPx} - 0.5pt)` }}
              >
                {data.contact?.email && (
                  <span>
                    <a href={`mailto:${data.contact.email}`} className="hover:underline">
                      {data.contact.email}
                    </a>
                  </span>
                )}
                {data.contact?.phone && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>{data.contact.phone}</span>
                  </>
                )}
                {data.contact?.location && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>{data.contact.location}</span>
                  </>
                )}
                {data.contact?.linkedIn && (
                  <>
                    <span className="text-slate-400">|</span>
                    <a
                      href={`https://${data.contact.linkedIn.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {data.contact.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/')}
                    </a>
                  </>
                )}
                {data.contact?.github && (
                  <>
                    <span className="text-slate-400">|</span>
                    <a
                      href={`https://${data.contact.github.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {data.contact.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github.com/')}
                    </a>
                  </>
                )}
                {data.contact?.website && (
                  <>
                    <span className="text-slate-400">|</span>
                    <a
                      href={`https://${data.contact.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {data.contact.website.replace(/^https?:\/\//, '')}
                    </a>
                  </>
                )}
              </div>
            </header>

            {/* Dynamic Ordered Sections */}
            {effectiveOrder.map((sectionId) => renderSection(sectionId))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  headingFontPx: string;
  showDivider: boolean;
  template: FormattingSettings['template'];
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  headingFontPx,
  showDivider,
  template,
}) => {
  return (
    <div className="w-full mt-0.5">
      <div className="flex items-center justify-between">
        <h2
          className="font-bold tracking-wider uppercase text-slate-900"
          style={{ fontSize: headingFontPx, lineHeight: 1.15 }}
        >
          {title}
        </h2>
      </div>
      {showDivider && (
        <div
          className={`w-full mt-0.5 ${
            template === 'executive'
              ? 'border-b border-slate-700'
              : template === 'modern'
              ? 'border-b-2 border-slate-800'
              : 'border-b border-slate-900'
          }`}
        />
      )}
    </div>
  );
};
