import { ATSCategoryScore, ATSValidationResult, FormattingSettings, ResumeData } from '../types';

const COMMON_ACTION_VERBS = new Set([
  'spearheaded', 'engineered', 'architected', 'developed', 'designed', 'built',
  'optimized', 'refactored', 'streamlined', 'deployed', 'implemented', 'orchestrated',
  'automated', 'scaled', 'managed', 'led', 'delivered', 'achieved', 'accelerated',
  'established', 'formulated', 'collaborated', 'generated', 'reduced', 'increased',
  'negotiated', 'trained', 'mentored', 'analyzed', 'audited', 'directed', 'executed',
  'authored', 'conducted', 'resolved', 'coordinated', 'administered', 'programmed',
  'researched', 'constructed', 'maintained', 'evaluated', 'facilitated', 'guided'
]);

export function evaluateATSCompliance(
  data: ResumeData,
  settings: FormattingSettings,
  fillPercentage: number,
  jobDescription?: string
): ATSValidationResult {
  const checks: ATSValidationResult['checks'] = [];

  // ==========================================
  // Category 1: Contact Information (15%)
  // ==========================================
  const hasName = Boolean(data.contact?.fullName?.trim());
  const hasEmail = Boolean(data.contact?.email?.trim() && /@/.test(data.contact.email));
  const hasPhone = Boolean(data.contact?.phone?.trim());
  const hasLocation = Boolean(data.contact?.location?.trim());
  const hasTitle = Boolean(data.contact?.professionalTitle?.trim());

  let contactPassedCount = 0;
  if (hasName) contactPassedCount++;
  if (hasEmail) contactPassedCount++;
  if (hasPhone) contactPassedCount++;
  if (hasLocation) contactPassedCount++;
  if (hasTitle) contactPassedCount++;

  const contactScore = Math.round((contactPassedCount / 5) * 100);

  checks.push({
    id: 'contact_essentials',
    label: 'Contact Essentials (Name, Email, Phone, Location)',
    category: 'Contact & Header',
    passed: hasName && hasEmail && hasPhone && hasLocation,
    recommendation: hasName && hasEmail && hasPhone && hasLocation
      ? 'All essential contact channels are complete and clearly formatted.'
      : 'Ensure full name, email with @, phone number, and location are fully specified.',
  });

  // ==========================================
  // Category 2: Core Section Architecture (25%)
  // ==========================================
  const hasSummary = Boolean(data.summary?.trim());
  const hasExperience = Boolean(data.experience && data.experience.length > 0);
  const hasProjects = Boolean(data.projects && data.projects.length > 0);
  const hasEducation = Boolean(data.education && data.education.length > 0);
  const hasSkills = Boolean(data.skills && data.skills.length > 0);

  // Freshers/Students may substitute deep projects for corporate experience
  const hasWorkOrProjects = hasExperience || hasProjects;

  let sectionPassedCount = 0;
  if (hasSummary) sectionPassedCount++;
  if (hasWorkOrProjects) sectionPassedCount += 2;
  if (hasEducation) sectionPassedCount++;
  if (hasSkills) sectionPassedCount++;

  const sectionScore = Math.round((sectionPassedCount / 5) * 100);

  checks.push({
    id: 'core_sections',
    label: 'Standard Section Architecture',
    category: 'Sections & Structure',
    passed: hasWorkOrProjects && hasEducation && hasSkills,
    recommendation: hasWorkOrProjects && hasEducation && hasSkills
      ? 'Standard ATS sections (Experience/Projects, Education, Skills) are present.'
      : 'Include Experience/Projects, Education, and Skills sections for ATS indexing.',
  });

  // ==========================================
  // Category 3: Content Quality & Action Verbs (25%)
  // ==========================================
  const allBullets = [
    ...(data.experience || []).flatMap((e) => e.bullets || []),
    ...(data.projects || []).flatMap((p) => p.bullets || []),
    ...(data.achievements || []),
  ];

  let actionVerbCount = 0;
  let metricCount = 0;

  allBullets.forEach((b) => {
    if (!b) return;
    const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstWord && COMMON_ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }
    // Check for quantifiable metrics: numbers, percentages, currency, KPI multipliers
    if (/(\d+%|\$\d+|\d+\+|\b\d+\s*(users|customers|clients|members|teams|services|projects|accounts)\b|\b\d+\b)/i.test(b)) {
      metricCount++;
    }
  });

  const verbRatio = allBullets.length > 0 ? actionVerbCount / allBullets.length : 1;
  const metricRatio = allBullets.length > 0 ? metricCount / allBullets.length : 1;

  let contentScore = Math.round(((verbRatio * 0.6) + (metricRatio * 0.4)) * 100);
  contentScore = Math.min(100, Math.max(30, contentScore));

  checks.push({
    id: 'action_verbs',
    label: 'Action-Oriented Bullet Openers',
    category: 'Content & Impact',
    passed: verbRatio >= 0.5,
    recommendation: verbRatio >= 0.5
      ? `${actionVerbCount} of ${allBullets.length} bullets open with impactful action verbs.`
      : 'Begin bullets with active power verbs like Developed, Managed, Spearheaded, Coordinated.',
  });

  checks.push({
    id: 'metrics_impact',
    label: 'Measurable Achievements & Metrics',
    category: 'Content & Impact',
    passed: metricRatio >= 0.3,
    recommendation: metricRatio >= 0.3
      ? `${metricCount} bullet points include measurable statistics or KPI results.`
      : 'Include numbers, percentages, or concrete team/user counts to demonstrate measurable impact.',
  });

  // ==========================================
  // Category 4: Page Length & ATS Formatting (25%)
  // ==========================================
  const isOnePage = fillPercentage <= 100;
  const allowedFonts = ['Calibri', 'Arial', 'Times New Roman', 'Georgia'];
  const hasAtsFont = allowedFonts.includes(settings.fontFamily);
  const isBodyFontValid = settings.bodyFontSizePt >= 9.0 && settings.bodyFontSizePt <= 10.0;
  const isMarginsValid = settings.marginInches >= 0.40 && settings.marginInches <= 0.55;

  let formatPassedCount = 0;
  if (isOnePage) formatPassedCount += 2;
  if (hasAtsFont) formatPassedCount++;
  if (isBodyFontValid) formatPassedCount++;
  if (isMarginsValid) formatPassedCount++;

  let formatScore = Math.round((formatPassedCount / 5) * 100);
  if (!isOnePage) {
    formatScore = Math.min(formatScore, 40);
  }

  checks.push({
    id: 'page_length',
    label: 'Strict 1-Page A4 Dimension (210 × 297 mm)',
    category: 'Formatting & Layout',
    passed: isOnePage,
    recommendation: isOnePage
      ? `Resume fits within single A4 page (${Math.round(fillPercentage)}% fill).`
      : `Resume overflows 1 A4 page (${Math.round(fillPercentage)}% fill). Run Auto-Fit to compact into 1 page.`,
  });

  checks.push({
    id: 'typography_rules',
    label: 'Standard ATS Typography & Readable Sizing',
    category: 'Formatting & Layout',
    passed: hasAtsFont && isBodyFontValid && isMarginsValid,
    recommendation: hasAtsFont && isBodyFontValid && isMarginsValid
      ? `Using ${settings.fontFamily} (${settings.bodyFontSizePt}pt body, ${settings.marginInches.toFixed(2)}in margins).`
      : 'Ensure font is Calibri or Arial, body is 9–10pt, and margins are 0.4–0.55 inches.',
  });

  // ==========================================
  // Category 5: Keywords & Role Alignment (10%)
  // ==========================================
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  let keywordScore = 85;

  if (jobDescription && jobDescription.trim().length > 20) {
    const rawTokens = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9#+.\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'you',
      'will', 'our', 'team', 'work', 'experience', 'years', 'role', 'looking',
      'ability', 'skills', 'must', 'candidate', 'company', 'position', 'requirements',
      'responsibilities', 'join', 'about', 'help', 'each', 'other', 'their', 'such'
    ]);

    const freq: Record<string, number> = {};
    rawTokens.forEach((t) => {
      if (!stopWords.has(t) && !/^\d+$/.test(t)) {
        freq[t] = (freq[t] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([w]) => w);

    const fullResumeText = [
      data.summary,
      ...(data.experience || []).map((e) => `${e.company} ${e.role} ${(e.bullets || []).join(' ')}`),
      ...(data.projects || []).map((p) => `${p.name} ${p.technologies} ${(p.bullets || []).join(' ')}`),
      ...(data.skills || []).map((s) => `${s.categoryName} ${s.skills}`),
      ...(data.education || []).map((ed) => `${ed.degree} ${ed.field} ${ed.institution}`),
      data.languages || '',
    ].join(' ').toLowerCase();

    topKeywords.forEach((kw) => {
      if (fullResumeText.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    if (topKeywords.length > 0) {
      keywordScore = Math.round((matchedKeywords.length / topKeywords.length) * 100);
    }
  }

  // ==========================================
  // Category Breakdown
  // ==========================================
  const categoryScores: ATSCategoryScore[] = [
    {
      name: 'Contact & Header',
      score: contactScore,
      weight: 15,
      status: contactScore >= 80 ? 'passed' : contactScore >= 60 ? 'warning' : 'failed',
      details: `${contactPassedCount} of 5 essential header fields completed.`,
    },
    {
      name: 'Section Architecture',
      score: sectionScore,
      weight: 25,
      status: sectionScore >= 80 ? 'passed' : sectionScore >= 60 ? 'warning' : 'failed',
      details: hasWorkOrProjects ? 'Experience/Projects, Education, and Skills present.' : 'Missing core sections.',
    },
    {
      name: 'Content & Impact',
      score: contentScore,
      weight: 25,
      status: contentScore >= 75 ? 'passed' : contentScore >= 55 ? 'warning' : 'failed',
      details: `${Math.round(verbRatio * 100)}% action verbs, ${Math.round(metricRatio * 100)}% quantifiable bullets.`,
    },
    {
      name: 'Formatting & 1-Page',
      score: formatScore,
      weight: 25,
      status: formatScore >= 80 ? 'passed' : 'failed',
      details: isOnePage ? 'Fits exactly 1 page.' : 'Overflows 1 A4 page.',
    },
    {
      name: 'Keywords & Alignment',
      score: keywordScore,
      weight: 10,
      status: keywordScore >= 70 ? 'passed' : 'warning',
      details: jobDescription ? `${matchedKeywords.length} matching keywords detected.` : 'No job description provided (baseline score).',
    },
  ];

  // Weighted overall calculation
  let overallScore = Math.round(
    contactScore * 0.15 +
    sectionScore * 0.25 +
    contentScore * 0.25 +
    formatScore * 0.25 +
    keywordScore * 0.10
  );

  if (!isOnePage) {
    overallScore = Math.min(overallScore, 65); // Hard cap if multi-page
  }

  return {
    score: overallScore,
    categoryScores,
    checks,
    matchedKeywords,
    missingKeywords,
    disclaimer:
      'Disclaimer: This ATS score is an estimate based on standard applicant tracking system heuristics, formatting compliance, and keyword density. It does not guarantee job selection or employer hiring decisions.',
  };
}
