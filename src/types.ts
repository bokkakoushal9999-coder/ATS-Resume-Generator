export interface ContactInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  graduationDate: string;
  gpaOrHonors?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  technologies: string;
  link?: string;
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string; // Comma-separated or bullet list
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  urlOrId?: string;
}

export type ResumeSectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'achievements'
  | 'languages';

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  achievements?: string[];
  languages?: string;
  sectionOrder?: ResumeSectionId[];
}

export type AtsFontFamily = 'Calibri' | 'Arial' | 'Times New Roman' | 'Georgia';

export interface FormattingSettings {
  // Strict A4
  pageWidthMm: number; // 210
  pageHeightMm: number; // 297

  // Typography (Prompt: Body font 9-10pt, Section headings 10-12pt, Name 18-22pt)
  fontFamily: AtsFontFamily;
  bodyFontSizePt: number; // 9.0 to 10.0
  headingFontSizePt: number; // 10.0 to 12.0
  nameFontSizePt: number; // 18.0 to 22.0

  // Spacing (Prompt: Margins 0.4-0.55 inches)
  marginInches: number; // 0.40 to 0.55
  sectionSpacingPt: number; // 5 to 12
  itemSpacingPt: number; // 2.5 to 6
  lineSpacing: number; // 1.15 to 1.35
  bulletSpacingPt: number; // 1.0 to 3.0

  // Visual options (Strictly ATS compliant)
  template: 'classic' | 'modern' | 'executive' | 'technical';
  showDividers: boolean;
  dividerStyle: 'solid' | 'subtle' | 'none';
  headerAlignment: 'left' | 'center';
}

export interface OptimizationMetrics {
  totalA4HeightPx: number;
  renderedHeightPx: number;
  fillPercentage: number;
  isOverflowing: boolean;
  overflowPx: number;
  estimatedPageCount: number;
  pageStatus: 'perfect' | 'near-full' | 'overflow' | 'sparse';
}

export interface ATSCategoryScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // percentage
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface ATSValidationResult {
  score: number; // 0 - 100
  categoryScores: ATSCategoryScore[];
  checks: {
    id: string;
    label: string;
    category: string;
    passed: boolean;
    recommendation: string;
  }[];
  matchedKeywords: string[];
  missingKeywords: string[];
  disclaimer: string;
}
