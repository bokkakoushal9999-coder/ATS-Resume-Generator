import { jsPDF } from 'jspdf';
import { FormattingSettings, ResumeData, ResumeSectionId } from '../types';

export interface PDFGenerationResult {
  success: boolean;
  pdf: jsPDF;
  pageCount: number;
  renderedHeightPt: number;
  maxAllowedHeightPt: number;
  overflowPt: number;
  error: string | null;
}

/**
 * Maps ATS font families to standard PDF Type 1 core vector fonts
 */
function getPdfFontFamily(fontFamily: FormattingSettings['fontFamily']): 'helvetica' | 'times' {
  switch (fontFamily) {
    case 'Times New Roman':
    case 'Georgia':
      return 'times';
    case 'Arial':
    case 'Calibri':
    default:
      return 'helvetica';
  }
}

/**
 * Generates a 100% vector, searchable, selectable A4 PDF resume with strict 1-page validation.
 * Verifies that the ACTUAL exported PDF contains exactly ONE page.
 */
export function generateAtsPdf(data: ResumeData, settings: FormattingSettings): PDFGenerationResult {
  // A4 dimensions in points: 210mm x 297mm = 595.28pt x 841.89pt
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [A4_WIDTH_PT, A4_HEIGHT_PT],
  });

  const font = getPdfFontFamily(settings.fontFamily);
  const marginPt = settings.marginInches * 72;
  const contentWidth = A4_WIDTH_PT - marginPt * 2;
  const maxAllowedY = A4_HEIGHT_PT - marginPt;

  let currentY = marginPt;

  // Helper: line spacing multiplier
  const lineGap = (fontSize: number) => fontSize * (settings.lineSpacing - 1);

  // 1. HEADER: Candidate Name
  doc.setFont(font, 'bold');
  doc.setFontSize(settings.nameFontSizePt);
  doc.setTextColor(15, 23, 42); // slate-900

  const nameText = (data.contact?.fullName || 'YOUR NAME').toUpperCase();
  if (settings.headerAlignment === 'center') {
    doc.text(nameText, A4_WIDTH_PT / 2, currentY + settings.nameFontSizePt * 0.8, { align: 'center' });
  } else {
    doc.text(nameText, marginPt, currentY + settings.nameFontSizePt * 0.8);
  }
  currentY += settings.nameFontSizePt + lineGap(settings.nameFontSizePt) + 2;

  // Professional Title
  if (data.contact?.professionalTitle && data.contact.professionalTitle.trim().length > 0) {
    doc.setFont(font, 'bold');
    doc.setFontSize(settings.bodyFontSizePt + 0.5);
    doc.setTextColor(51, 65, 85); // slate-700
    if (settings.headerAlignment === 'center') {
      doc.text(data.contact.professionalTitle, A4_WIDTH_PT / 2, currentY + settings.bodyFontSizePt * 0.8, {
        align: 'center',
      });
    } else {
      doc.text(data.contact.professionalTitle, marginPt, currentY + settings.bodyFontSizePt * 0.8);
    }
    currentY += settings.bodyFontSizePt + lineGap(settings.bodyFontSizePt) + 2;
  }

  // Contact Info Row
  const contactParts: string[] = [];
  if (data.contact?.email) contactParts.push(data.contact.email);
  if (data.contact?.phone) contactParts.push(data.contact.phone);
  if (data.contact?.location) contactParts.push(data.contact.location);
  if (data.contact?.linkedIn) contactParts.push(data.contact.linkedIn.replace(/^https?:\/\/(www\.)?/, ''));
  if (data.contact?.github) contactParts.push(data.contact.github.replace(/^https?:\/\/(www\.)?/, ''));
  if (data.contact?.website) contactParts.push(data.contact.website.replace(/^https?:\/\/(www\.)?/, ''));

  if (contactParts.length > 0) {
    doc.setFont(font, 'normal');
    doc.setFontSize(settings.bodyFontSizePt - 0.5);
    doc.setTextColor(71, 85, 105); // slate-600
    const contactLine = contactParts.join('  |  ');
    if (settings.headerAlignment === 'center') {
      doc.text(contactLine, A4_WIDTH_PT / 2, currentY + (settings.bodyFontSizePt - 0.5) * 0.8, {
        align: 'center',
      });
    } else {
      doc.text(contactLine, marginPt, currentY + (settings.bodyFontSizePt - 0.5) * 0.8);
    }
    currentY += settings.bodyFontSizePt + settings.sectionSpacingPt;
  }

  // Helper: Section Header
  const renderSectionHeader = (title: string) => {
    currentY += settings.sectionSpacingPt;
    doc.setFont(font, 'bold');
    doc.setFontSize(settings.headingFontSizePt);
    doc.setTextColor(15, 23, 42); // slate-900

    doc.text(title, marginPt, currentY + settings.headingFontSizePt * 0.8);
    currentY += settings.headingFontSizePt + 2;

    if (settings.showDividers) {
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setLineWidth(settings.template === 'modern' ? 1.2 : 0.6);
      doc.line(marginPt, currentY, marginPt + contentWidth, currentY);
      currentY += 3;
    }
  };

  // Section Rendering Handlers
  const sectionRenderers: Record<ResumeSectionId, () => void> = {
    summary: () => {
      if (data.summary && data.summary.trim().length > 0) {
        renderSectionHeader('PROFESSIONAL SUMMARY');
        doc.setFont(font, 'normal');
        doc.setFontSize(settings.bodyFontSizePt);
        doc.setTextColor(30, 41, 59);

        const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
        summaryLines.forEach((line: string) => {
          doc.text(line, marginPt, currentY + settings.bodyFontSizePt * 0.8);
          currentY += settings.bodyFontSizePt * settings.lineSpacing;
        });
      }
    },

    skills: () => {
      if (data.skills && data.skills.length > 0) {
        renderSectionHeader('TECHNICAL & DOMAIN SKILLS');
        doc.setFontSize(settings.bodyFontSizePt);

        data.skills.forEach((sk) => {
          if (!sk.categoryName && !sk.skills) return;
          const categoryPrefix = `${sk.categoryName || 'Skills'}: `;
          doc.setFont(font, 'bold');
          doc.setTextColor(15, 23, 42);
          const prefixWidth = doc.getTextWidth(categoryPrefix);

          doc.setFont(font, 'normal');
          doc.setTextColor(51, 65, 85);
          const availableSkillWidth = contentWidth - prefixWidth;
          const skillLines = doc.splitTextToSize(sk.skills || '', availableSkillWidth);

          doc.setFont(font, 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(categoryPrefix, marginPt, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'normal');
          doc.setTextColor(51, 65, 85);
          if (skillLines.length > 0) {
            doc.text(skillLines[0], marginPt + prefixWidth, currentY + settings.bodyFontSizePt * 0.8);
            currentY += settings.bodyFontSizePt * settings.lineSpacing;
          }

          for (let i = 1; i < skillLines.length; i++) {
            doc.text(skillLines[i], marginPt + prefixWidth, currentY + settings.bodyFontSizePt * 0.8);
            currentY += settings.bodyFontSizePt * settings.lineSpacing;
          }
          currentY += 1.5;
        });
      }
    },

    experience: () => {
      if (data.experience && data.experience.length > 0) {
        renderSectionHeader('WORK EXPERIENCE');

        data.experience.forEach((exp) => {
          currentY += settings.itemSpacingPt;

          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt);
          doc.setTextColor(15, 23, 42);
          const roleText = exp.role || 'Role';
          doc.text(roleText, marginPt, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'normal');
          doc.setTextColor(51, 65, 85);
          const companyText = exp.company ? ` — ${exp.company}` : '';
          const roleWidth = doc.getTextWidth(roleText);
          doc.text(companyText, marginPt + roleWidth, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt - 0.5);
          doc.setTextColor(71, 85, 105);
          const dateText = `${exp.startDate || ''} – ${exp.isCurrent ? 'Present' : exp.endDate || ''}${
            exp.location ? ` | ${exp.location}` : ''
          }`;
          doc.text(dateText, marginPt + contentWidth, currentY + settings.bodyFontSizePt * 0.8, { align: 'right' });

          currentY += settings.bodyFontSizePt * settings.lineSpacing + 1;

          if (exp.bullets && exp.bullets.length > 0) {
            doc.setFont(font, 'normal');
            doc.setFontSize(settings.bodyFontSizePt);
            doc.setTextColor(30, 41, 59);

            const bulletIndent = 12;
            const bulletTextWidth = contentWidth - bulletIndent;

            exp.bullets.forEach((bullet) => {
              if (!bullet.trim()) return;
              const bulletLines = doc.splitTextToSize(bullet, bulletTextWidth);
              doc.text('•', marginPt + 3, currentY + settings.bodyFontSizePt * 0.8);

              bulletLines.forEach((bLine: string) => {
                doc.text(bLine, marginPt + bulletIndent, currentY + settings.bodyFontSizePt * 0.8);
                currentY += settings.bodyFontSizePt * settings.lineSpacing;
              });
              currentY += settings.bulletSpacingPt;
            });
          }
        });
      }
    },

    projects: () => {
      if (data.projects && data.projects.length > 0) {
        renderSectionHeader('PROJECTS & INITIATIVES');

        data.projects.forEach((proj) => {
          currentY += settings.itemSpacingPt;

          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.name || 'Project', marginPt, currentY + settings.bodyFontSizePt * 0.8);

          const nameWidth = doc.getTextWidth(proj.name || 'Project');
          if (proj.technologies) {
            doc.setFont(font, 'italic');
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(settings.bodyFontSizePt - 0.5);
            doc.text(` (${proj.technologies})`, marginPt + nameWidth, currentY + settings.bodyFontSizePt * 0.8);
          }

          if (proj.link) {
            doc.setFont(font, 'normal');
            doc.setFontSize(settings.bodyFontSizePt - 0.5);
            doc.setTextColor(37, 99, 235);
            doc.text(proj.link.replace(/^https?:\/\//, ''), marginPt + contentWidth, currentY + settings.bodyFontSizePt * 0.8, {
              align: 'right',
            });
          }

          currentY += settings.bodyFontSizePt * settings.lineSpacing + 1;

          if (proj.bullets && proj.bullets.length > 0) {
            doc.setFont(font, 'normal');
            doc.setFontSize(settings.bodyFontSizePt);
            doc.setTextColor(30, 41, 59);

            const bulletIndent = 12;
            const bulletTextWidth = contentWidth - bulletIndent;

            proj.bullets.forEach((bullet) => {
              if (!bullet.trim()) return;
              const bulletLines = doc.splitTextToSize(bullet, bulletTextWidth);
              doc.text('•', marginPt + 3, currentY + settings.bodyFontSizePt * 0.8);

              bulletLines.forEach((bLine: string) => {
                doc.text(bLine, marginPt + bulletIndent, currentY + settings.bodyFontSizePt * 0.8);
                currentY += settings.bodyFontSizePt * settings.lineSpacing;
              });
              currentY += settings.bulletSpacingPt;
            });
          }
        });
      }
    },

    education: () => {
      if (data.education && data.education.length > 0) {
        renderSectionHeader('EDUCATION');

        data.education.forEach((edu) => {
          currentY += 2;
          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt);
          doc.setTextColor(15, 23, 42);
          const schoolText = edu.institution || 'University';
          doc.text(schoolText, marginPt, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'normal');
          doc.setTextColor(51, 65, 85);
          const degText = ` — ${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}${
            edu.gpaOrHonors ? ` (${edu.gpaOrHonors})` : ''
          }`;
          const schoolWidth = doc.getTextWidth(schoolText);
          doc.text(degText, marginPt + schoolWidth, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt - 0.5);
          doc.setTextColor(71, 85, 105);
          const eduDate = `${edu.graduationDate || ''}${edu.location ? ` | ${edu.location}` : ''}`;
          doc.text(eduDate, marginPt + contentWidth, currentY + settings.bodyFontSizePt * 0.8, { align: 'right' });

          currentY += settings.bodyFontSizePt * settings.lineSpacing + 1;
        });
      }
    },

    certifications: () => {
      if (data.certifications && data.certifications.length > 0) {
        renderSectionHeader('CERTIFICATIONS & CREDENTIALS');

        data.certifications.forEach((cert) => {
          currentY += 2;
          doc.setFont(font, 'bold');
          doc.setFontSize(settings.bodyFontSizePt);
          doc.setTextColor(15, 23, 42);
          doc.text(cert.name || 'Certification', marginPt, currentY + settings.bodyFontSizePt * 0.8);

          const nameWidth = doc.getTextWidth(cert.name || 'Certification');
          doc.setFont(font, 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(` — ${cert.issuer || ''}`, marginPt + nameWidth, currentY + settings.bodyFontSizePt * 0.8);

          doc.setFont(font, 'normal');
          doc.setFontSize(settings.bodyFontSizePt - 0.5);
          doc.setTextColor(71, 85, 105);
          doc.text(cert.date || '', marginPt + contentWidth, currentY + settings.bodyFontSizePt * 0.8, { align: 'right' });

          currentY += settings.bodyFontSizePt * settings.lineSpacing + 1;
        });
      }
    },

    achievements: () => {
      if (data.achievements && data.achievements.length > 0) {
        renderSectionHeader('HONORS & ACHIEVEMENTS');
        doc.setFont(font, 'normal');
        doc.setFontSize(settings.bodyFontSizePt);
        doc.setTextColor(30, 41, 59);

        const bulletIndent = 12;
        const bulletTextWidth = contentWidth - bulletIndent;

        data.achievements.forEach((ach) => {
          if (!ach.trim()) return;
          const achLines = doc.splitTextToSize(ach, bulletTextWidth);
          doc.text('•', marginPt + 3, currentY + settings.bodyFontSizePt * 0.8);

          achLines.forEach((aLine: string) => {
            doc.text(aLine, marginPt + bulletIndent, currentY + settings.bodyFontSizePt * 0.8);
            currentY += settings.bodyFontSizePt * settings.lineSpacing;
          });
          currentY += settings.bulletSpacingPt;
        });
      }
    },

    languages: () => {
      if (data.languages && data.languages.trim().length > 0) {
        renderSectionHeader('LANGUAGES');
        doc.setFont(font, 'normal');
        doc.setFontSize(settings.bodyFontSizePt);
        doc.setTextColor(30, 41, 59);

        const langLines = doc.splitTextToSize(data.languages, contentWidth);
        langLines.forEach((line: string) => {
          doc.text(line, marginPt, currentY + settings.bodyFontSizePt * 0.8);
          currentY += settings.bodyFontSizePt * settings.lineSpacing;
        });
      }
    },
  };

  // Determine section ordering (default or candidate custom order)
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

  // Render sections in exact order
  effectiveOrder.forEach((secId) => {
    if (sectionRenderers[secId]) {
      sectionRenderers[secId]();
    }
  });

  // Verify PDF page count and vertical margin boundary
  const actualPdfPageCount = doc.getNumberOfPages();
  const overflowPt = Math.max(0, currentY - maxAllowedY);
  const isWithinSinglePage = actualPdfPageCount === 1 && currentY <= maxAllowedY;

  return {
    success: isWithinSinglePage,
    pdf: doc,
    pageCount: actualPdfPageCount,
    renderedHeightPt: currentY,
    maxAllowedHeightPt: maxAllowedY,
    overflowPt,
    error: isWithinSinglePage
      ? null
      : `Resume overflows 1 A4 page: rendered ${currentY.toFixed(1)}pt (max ${maxAllowedY.toFixed(
          1
        )}pt, +${overflowPt.toFixed(1)}pt overflow). Please run Auto-Fit before export.`,
  };
}
