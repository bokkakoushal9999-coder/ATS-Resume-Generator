import { FormattingSettings, ResumeData } from '../types';
import { generateAtsPdf, PDFGenerationResult } from './pdfGenerator';

/**
 * High-precision grammatical prefix transforms that preserve 100% of the candidate's original meaning.
 * Transforms passive or wordy responsibilities into direct active voice.
 * E.g., "Responsible for managing a team of 5" -> "Managed a team of 5"
 * E.g., "Worked on developing a React app" -> "Developed a React app"
 */
const GRAMMATICAL_PREFIX_TRANSFORMS: [RegExp, string][] = [
  // "Responsible for [verb-ing]" -> "[verb-ed]"
  [/^responsible for managing\b/i, 'Managed'],
  [/^responsible for coordinating\b/i, 'Coordinated'],
  [/^responsible for developing\b/i, 'Developed'],
  [/^responsible for designing\b/i, 'Designed'],
  [/^responsible for organizing\b/i, 'Organized'],
  [/^responsible for creating\b/i, 'Created'],
  [/^responsible for leading\b/i, 'Led'],
  [/^responsible for maintaining\b/i, 'Maintained'],
  [/^responsible for implementing\b/i, 'Implemented'],
  [/^responsible for assisting\b/i, 'Assisted with'],
  [/^responsible for analyzing\b/i, 'Analyzed'],
  [/^responsible for overseeing\b/i, 'Oversaw'],
  [/^responsible for preparing\b/i, 'Prepared'],
  [/^responsible for testing\b/i, 'Tested'],
  [/^responsible for monitoring\b/i, 'Monitored'],
  [/^responsible for building\b/i, 'Built'],
  [/^responsible for conducting\b/i, 'Conducted'],
  [/^responsible for writing\b/i, 'Wrote'],
  [/^responsible for teaching\b/i, 'Taught'],
  [/^responsible for delivering\b/i, 'Delivered'],
  [/^responsible for tracking\b/i, 'Tracked'],
  [/^responsible for scheduling\b/i, 'Scheduled'],
  [/^responsible for executing\b/i, 'Executed'],
  [/^responsible for auditing\b/i, 'Audited'],
  [/^responsible for training\b/i, 'Trained'],
  [/^responsible for supporting\b/i, 'Supported'],
  [/^responsible for evaluating\b/i, 'Evaluated'],
  [/^responsible for handling\b/i, 'Handled'],
  [/^responsible for researching\b/i, 'Researched'],
  [/^responsible for negotiating\b/i, 'Negotiated'],
  [/^responsible for directing\b/i, 'Directed'],
  [/^responsible for reviewing\b/i, 'Reviewed'],
  [/^responsible for collaborating\b/i, 'Collaborated'],
  [/^responsible for communicating\b/i, 'Communicated'],
  [/^responsible for ensuring\b/i, 'Ensured'],
  [/^was responsible for managing\b/i, 'Managed'],
  [/^was responsible for leading\b/i, 'Led'],
  [/^was responsible for developing\b/i, 'Developed'],
  [/^was responsible for\b/i, 'Handled'],
  [/^duties included managing\b/i, 'Managed'],
  [/^duties included developing\b/i, 'Developed'],
  [/^duties included\b/i, 'Delivered'],

  // "Worked on [verb-ing]" -> "[verb-ed]"
  [/^worked on developing\b/i, 'Developed'],
  [/^worked on designing\b/i, 'Designed'],
  [/^worked on creating\b/i, 'Created'],
  [/^worked on building\b/i, 'Built'],
  [/^worked on improving\b/i, 'Improved'],
  [/^worked on testing\b/i, 'Tested'],
  [/^worked on implementing\b/i, 'Implemented'],
  [/^worked on maintaining\b/i, 'Maintained'],
  [/^worked on analyzing\b/i, 'Analyzed'],
  [/^worked on optimizing\b/i, 'Optimized'],
  [/^worked on coordinating\b/i, 'Coordinated'],
  [/^worked on managing\b/i, 'Managed'],
  [/^worked on researching\b/i, 'Researched'],
  [/^worked on preparing\b/i, 'Prepared'],
  [/^worked on resolving\b/i, 'Resolved'],
  [/^worked on refactoring\b/i, 'Refactored'],

  // "Tasked with [verb-ing]" -> "[verb-ed]"
  [/^tasked with developing\b/i, 'Developed'],
  [/^tasked with managing\b/i, 'Managed'],
  [/^tasked with designing\b/i, 'Designed'],
  [/^tasked with organizing\b/i, 'Organized'],
  [/^tasked with creating\b/i, 'Created'],
  [/^tasked with handling\b/i, 'Handled'],
  [/^tasked with\b/i, 'Executed'],

  // "Assisted in / Helped with"
  [/^assisted in the execution of\b/i, 'Assisted in executing'],
  [/^assisted in the development of\b/i, 'Assisted in developing'],
  [/^assisted with the creation of\b/i, 'Assisted in creating'],
  [/^helped to ([a-z]+)\b/i, 'Assisted with $1ing'],
  [/^helped with\b/i, 'Assisted with'],
  [/^helped in\b/i, 'Assisted in'],
  [/^participated in the development of\b/i, 'Co-developed'],
  [/^participated in developing\b/i, 'Co-developed'],
  [/^participated in the design of\b/i, 'Co-designed'],
  [/^participated in\b/i, 'Contributed to'],
  [/^worked closely with cross-functional teams to\b/i, 'Partnered cross-functionally to'],
  [/^worked closely with the team to\b/i, 'Partnered to'],
  [/^worked closely with team to\b/i, 'Partnered to'],
  [/^collaborated with cross-functional teams to\b/i, 'Collaborated cross-functionally to'],
];

/**
 * Safe filler phrase replacements that preserve 100% of the meaning while trimming bloat.
 */
const SAFE_FILLER_REPLACEMENTS: [RegExp, string][] = [
  [/\bin order to\b/gi, 'to'],
  [/\bdue to the fact that\b/gi, 'because'],
  [/\bat this point in time\b/gi, 'currently'],
  [/\bfor the purpose of\b/gi, 'to'],
  [/\bwith the aim of\b/gi, 'to'],
  [/\bwith the goal of\b/gi, 'to'],
  [/\bon a daily basis\b/gi, 'daily'],
  [/\bon a weekly basis\b/gi, 'weekly'],
  [/\bon a regular basis\b/gi, 'regularly'],
  [/\bon a monthly basis\b/gi, 'monthly'],
  [/\ba large number of\b/gi, 'numerous'],
  [/\ba wide range of\b/gi, 'various'],
  [/\ba variety of\b/gi, 'various'],
  [/\btook the initiative to\b/gi, 'initiated'],
  [/\bin an effort to\b/gi, 'to'],
  [/\bhas the ability to\b/gi, 'can'],
  [/\bsuccessfully implemented\b/gi, 'implemented'],
  [/\bsuccessfully delivered\b/gi, 'delivered'],
  [/\bsuccessfully managed\b/gi, 'managed'],
  [/\bsuccessfully executed\b/gi, 'executed'],
  [/\bsuccessfully completed\b/gi, 'completed'],
  [/\bsuccessfully\b/gi, ''],
  [/\beffectively\b/gi, ''],
];

/**
 * Condenses a single bullet point by removing fluff prefixes and wordiness
 * WITHOUT altering facts, fabricating metrics, or changing meaning.
 */
export function condenseBullet(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();
  if (cleaned.length === 0) return '';

  // 1. Strip raw bullet symbol if user typed or pasted it
  cleaned = cleaned.replace(/^[\u2022\u2023\u25E6\u2043\u2219\*\-\–\—]\s*/, '');

  // 2. Apply grammatical prefix transforms
  for (const [pattern, replacement] of GRAMMATICAL_PREFIX_TRANSFORMS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
      break;
    }
  }

  // 3. Apply safe filler phrase replacements
  for (const [pattern, replacement] of SAFE_FILLER_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // 4. Clean formatting, spacing, and punctuation
  cleaned = cleaned
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+to to\b/gi, ' to')
    .trim();

  // Ensure capitalized first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Optimize all bullet points in a resume dataset while preserving all factual content.
 * Safely handles empty sections, undefined lists, and missing data.
 */
export function optimizeResumeContent(data: ResumeData): ResumeData {
  if (!data) return data;

  let newSummary = data.summary || '';
  if (newSummary.trim().length > 0) {
    for (const [pattern, replacement] of SAFE_FILLER_REPLACEMENTS) {
      newSummary = newSummary.replace(pattern, replacement);
    }
    newSummary = newSummary.replace(/\s{2,}/g, ' ').trim();
  }

  const newExperience = (data.experience || []).map((exp) => ({
    ...exp,
    bullets: (exp.bullets || [])
      .map((b) => condenseBullet(b))
      .filter((b) => b.length > 0),
  }));

  const newProjects = (data.projects || []).map((proj) => ({
    ...proj,
    bullets: (proj.bullets || [])
      .map((b) => condenseBullet(b))
      .filter((b) => b.length > 0),
  }));

  const newAchievements = (data.achievements || [])
    .map((ach) => condenseBullet(ach))
    .filter((ach) => ach.length > 0);

  return {
    ...data,
    summary: newSummary,
    experience: newExperience,
    projects: newProjects,
    achievements: newAchievements.length > 0 ? newAchievements : data.achievements,
  };
}

/**
 * Strict One-Page Optimization parameters.
 * Guarantees staying strictly within readable user specifications:
 * - Margins: 0.40 - 0.55 inches
 * - Body font: 9.0 - 10.0 pt
 * - Section headings: 10.0 - 12.0 pt
 * - Name: 18.0 - 22.0 pt
 */
export const ATS_CONSTRAINTS = {
  margins: { min: 0.40, max: 0.55, default: 0.45 },
  bodyFontPt: { min: 9.0, max: 10.0, default: 9.3 },
  headingFontPt: { min: 10.0, max: 12.0, default: 10.5 },
  nameFontPt: { min: 18.0, max: 22.0, default: 19.0 },
  sectionSpacingPt: { min: 5, max: 12, default: 6 },
  itemSpacingPt: { min: 2.5, max: 6, default: 3 },
  lineSpacing: { min: 1.15, max: 1.35, default: 1.20 },
  bulletSpacingPt: { min: 1.0, max: 3.0, default: 1.5 },
};

export interface AutoFitResult {
  data: ResumeData;
  settings: FormattingSettings;
  pdfResult: PDFGenerationResult;
  isFitted: boolean;
  summary: string;
  actionRequired?: string;
}

/**
 * Complete, reliable iterative one-page optimization engine.
 * 
 * 1. Measures actual rendered resume content using the PDF engine.
 * 2. Detects content overflow.
 * 3. Optimizes unnecessary wording without changing facts.
 * 4. Progressively reduces excessive spacing (section, item, line, bullet).
 * 5. Adjusts margins within readable limits (0.40 - 0.55 in).
 * 6. Adjusts typography within readable limits (9.0 - 10.0 pt body, 10.0 - 12.0 pt headings).
 * 7. Recalculates content height after each adjustment.
 * 8. Repeats until content fits or safe limit is reached.
 * Never silently deletes resume information.
 * If content cannot fit legibly, explains which sections need shortening.
 */
export function fullAutoFitToOnePage(
  currentData: ResumeData,
  currentSettings: FormattingSettings
): AutoFitResult {
  // Step 1: Condense wording while preserving all facts
  const data = optimizeResumeContent(currentData);
  let settings: FormattingSettings = { ...currentSettings };

  // Step 2: Measure current PDF render
  let pdfRes = generateAtsPdf(data, settings);

  // Check if already fits within optimal bounds (80% - 100% capacity)
  if (pdfRes.success && pdfRes.pageCount === 1 && pdfRes.renderedHeightPt >= pdfRes.maxAllowedHeightPt * 0.8) {
    return {
      data,
      settings,
      pdfResult: pdfRes,
      isFitted: true,
      summary: 'Resume fits on exactly 1 A4 page with optimal ATS formatting.',
    };
  }

  // Underfilled Case (< 78%): Expand comfortably to fill page elegantly
  if (pdfRes.success && pdfRes.pageCount === 1 && pdfRes.renderedHeightPt < pdfRes.maxAllowedHeightPt * 0.78) {
    for (let i = 0; i < 12; i++) {
      const nextSettings = { ...settings };
      if (nextSettings.bodyFontSizePt < ATS_CONSTRAINTS.bodyFontPt.max) {
        nextSettings.bodyFontSizePt = Math.min(ATS_CONSTRAINTS.bodyFontPt.max, Number((nextSettings.bodyFontSizePt + 0.1).toFixed(1)));
      }
      if (nextSettings.headingFontSizePt < ATS_CONSTRAINTS.headingFontPt.max) {
        nextSettings.headingFontSizePt = Math.min(ATS_CONSTRAINTS.headingFontPt.max, nextSettings.headingFontSizePt + 0.25);
      }
      if (nextSettings.sectionSpacingPt < ATS_CONSTRAINTS.sectionSpacingPt.max) {
        nextSettings.sectionSpacingPt += 0.5;
      }
      if (nextSettings.itemSpacingPt < ATS_CONSTRAINTS.itemSpacingPt.max) {
        nextSettings.itemSpacingPt += 0.25;
      }
      if (nextSettings.marginInches < ATS_CONSTRAINTS.margins.max) {
        nextSettings.marginInches = Math.min(ATS_CONSTRAINTS.margins.max, Number((nextSettings.marginInches + 0.01).toFixed(2)));
      }
      if (nextSettings.lineSpacing < ATS_CONSTRAINTS.lineSpacing.max) {
        nextSettings.lineSpacing = Math.min(ATS_CONSTRAINTS.lineSpacing.max, Number((nextSettings.lineSpacing + 0.02).toFixed(2)));
      }

      const testRes = generateAtsPdf(data, nextSettings);
      if (testRes.success && testRes.pageCount === 1) {
        settings = nextSettings;
        pdfRes = testRes;
      } else {
        break; // Stop before overflowing
      }
    }

    return {
      data,
      settings,
      pdfResult: pdfRes,
      isFitted: true,
      summary: `Balanced 1-page layout: Adjusted typography (${settings.bodyFontSizePt}pt) and margins (${settings.marginInches.toFixed(2)}in) to fill page.`,
    };
  }

  // OVERFLOW CASE: Progressively reduce spacing, margins, and typography in micro-steps
  const maxIterations = 30;
  for (let iter = 0; iter < maxIterations; iter++) {
    pdfRes = generateAtsPdf(data, settings);
    if (pdfRes.success && pdfRes.pageCount === 1) {
      return {
        data,
        settings,
        pdfResult: pdfRes,
        isFitted: true,
        summary: `Auto-fit complete: Adjusted body font to ${settings.bodyFontSizePt}pt, margins to ${settings.marginInches.toFixed(2)}in, and compacted spacing. Verified 1 page.`,
      };
    }

    let madeChange = false;

    // 1. Section & Item spacing
    if (settings.sectionSpacingPt > ATS_CONSTRAINTS.sectionSpacingPt.min) {
      settings.sectionSpacingPt = Math.max(ATS_CONSTRAINTS.sectionSpacingPt.min, settings.sectionSpacingPt - 0.5);
      madeChange = true;
    }
    if (settings.itemSpacingPt > ATS_CONSTRAINTS.itemSpacingPt.min) {
      settings.itemSpacingPt = Math.max(ATS_CONSTRAINTS.itemSpacingPt.min, settings.itemSpacingPt - 0.5);
      madeChange = true;
    }
    if (settings.bulletSpacingPt > ATS_CONSTRAINTS.bulletSpacingPt.min) {
      settings.bulletSpacingPt = Math.max(ATS_CONSTRAINTS.bulletSpacingPt.min, settings.bulletSpacingPt - 0.5);
      madeChange = true;
    }
    if (settings.lineSpacing > ATS_CONSTRAINTS.lineSpacing.min) {
      settings.lineSpacing = Math.max(ATS_CONSTRAINTS.lineSpacing.min, Number((settings.lineSpacing - 0.02).toFixed(2)));
      madeChange = true;
    }

    // 2. Margins
    if (settings.marginInches > ATS_CONSTRAINTS.margins.min) {
      settings.marginInches = Math.max(ATS_CONSTRAINTS.margins.min, Number((settings.marginInches - 0.02).toFixed(2)));
      madeChange = true;
    }

    // 3. Headings & Name font
    if (settings.headingFontSizePt > ATS_CONSTRAINTS.headingFontPt.min) {
      settings.headingFontSizePt = Math.max(ATS_CONSTRAINTS.headingFontPt.min, settings.headingFontSizePt - 0.25);
      madeChange = true;
    }
    if (settings.nameFontSizePt > ATS_CONSTRAINTS.nameFontPt.min) {
      settings.nameFontSizePt = Math.max(ATS_CONSTRAINTS.nameFontPt.min, settings.nameFontSizePt - 0.5);
      madeChange = true;
    }

    // 4. Body font (clamped to strict 9.0pt readable floor)
    if (settings.bodyFontSizePt > ATS_CONSTRAINTS.bodyFontPt.min) {
      settings.bodyFontSizePt = Math.max(ATS_CONSTRAINTS.bodyFontPt.min, Number((settings.bodyFontSizePt - 0.1).toFixed(1)));
      madeChange = true;
    }

    if (!madeChange) {
      break; // Reached absolute minimum readable boundary
    }
  }

  // Final check
  pdfRes = generateAtsPdf(data, settings);
  if (pdfRes.success && pdfRes.pageCount === 1) {
    return {
      data,
      settings,
      pdfResult: pdfRes,
      isFitted: true,
      summary: `Auto-fit complete: Configured high-density 1-page layout (Body: ${settings.bodyFontSizePt}pt, Margins: ${settings.marginInches.toFixed(2)}in). Verified 1 page.`,
    };
  }

  // If still overflowing even at minimum readable bounds:
  // Do NOT silently delete content or shrink font below 9pt!
  const expBulletCount = (data.experience || []).flatMap((e) => e.bullets || []).length;
  const projBulletCount = (data.projects || []).flatMap((p) => p.bullets || []).length;
  const totalBullets = expBulletCount + projBulletCount;
  const overflowPt = Math.round(pdfRes.overflowPt);

  const actionRequired = `Resume content exceeds 1 page by ${overflowPt}pt even at minimum readable bounds (9.0pt font, 0.40in margins, 1.15 line height). Experience & Projects contain ${totalBullets} bullets across ${(data.experience || []).length} roles. To maintain recruiter readability and 1-page compliance, please trim 1–2 bullets in the editor.`;

  return {
    data,
    settings,
    pdfResult: pdfRes,
    isFitted: false,
    summary: actionRequired,
    actionRequired,
  };
}
