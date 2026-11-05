import { AtsFontFamily, FormattingSettings, ResumeData } from '../types';

/**
 * Helper to deep-freeze objects in development/runtime to ensure demonstration
 * samples are never mutated by candidate edits or optimization passes.
 */
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach((prop) => {
    const val = (obj as any)[prop];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return Object.freeze(obj);
}

/**
 * Deep clones a ResumeData structure safely without shared references.
 */
export function cloneResumeData(data: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Deep clones FormattingSettings safely.
 */
export function cloneFormattingSettings(settings: FormattingSettings): FormattingSettings {
  return JSON.parse(JSON.stringify(settings));
}

/**
 * Strict Default Formatting Specification.
 * Conforms 100% to A4 dimensions (210 x 297 mm), Calibri font, and ATS safe typography ranges.
 */
export const DEFAULT_FORMATTING: FormattingSettings = deepFreeze({
  pageWidthMm: 210, // A4 width
  pageHeightMm: 297, // A4 height
  fontFamily: 'Calibri',
  bodyFontSizePt: 9.3, // Safe readable range: 9.0 - 10.5 pt
  headingFontSizePt: 10.5, // Safe readable range: 10.0 - 12.0 pt
  nameFontSizePt: 19.0, // Prominent candidate name: 18.0 - 22.0 pt
  marginInches: 0.45, // ATS recommended margins: 0.40 - 0.55 in
  sectionSpacingPt: 6, // Section spacing: 4.0 - 10.0 pt
  itemSpacingPt: 3, // Item spacing: 2.0 - 6.0 pt
  lineSpacing: 1.20, // Line height multiplier: 1.15 - 1.35
  bulletSpacingPt: 1.5, // Bullet gap: 1.0 - 4.0 pt
  template: 'classic',
  showDividers: true,
  dividerStyle: 'solid',
  headerAlignment: 'center',
});

/**
 * Validates and clamps formatting settings to guarantee valid, readable, and strictly ATS-safe values.
 * Prevents invalid, NaN, negative, or out-of-range formatting values from breaking the layout.
 */
export function validateFormattingSettings(settings?: Partial<FormattingSettings> | null): FormattingSettings {
  if (!settings) {
    return cloneFormattingSettings(DEFAULT_FORMATTING);
  }

  const validFonts: AtsFontFamily[] = [
    'Calibri',
    'Arial',
    'Times New Roman',
    'Georgia',
  ];

  const validTemplates: FormattingSettings['template'][] = ['classic', 'modern', 'executive', 'technical'];
  const validDividerStyles: FormattingSettings['dividerStyle'][] = ['solid', 'subtle', 'none'];
  const validAlignments: FormattingSettings['headerAlignment'][] = ['left', 'center'];

  const clamp = (val: unknown, min: number, max: number, fallback: number): number => {
    if (typeof val !== 'number' || isNaN(val)) return fallback;
    return Math.min(Math.max(val, min), max);
  };

  return {
    pageWidthMm: 210, // Strict A4 dimension
    pageHeightMm: 297, // Strict A4 dimension
    fontFamily: validFonts.includes(settings.fontFamily as any)
      ? (settings.fontFamily as FormattingSettings['fontFamily'])
      : 'Calibri',
    bodyFontSizePt: clamp(settings.bodyFontSizePt, 9.0, 10.5, 9.3),
    headingFontSizePt: clamp(settings.headingFontSizePt, 10.0, 12.0, 10.5),
    nameFontSizePt: clamp(settings.nameFontSizePt, 18.0, 22.0, 19.0),
    marginInches: clamp(settings.marginInches, 0.40, 0.55, 0.45),
    sectionSpacingPt: clamp(settings.sectionSpacingPt, 4.0, 10.0, 6.0),
    itemSpacingPt: clamp(settings.itemSpacingPt, 2.0, 6.0, 3.0),
    bulletSpacingPt: clamp(settings.bulletSpacingPt, 1.0, 4.0, 1.5),
    lineSpacing: clamp(settings.lineSpacing, 1.15, 1.35, 1.20),
    template: validTemplates.includes(settings.template as any) ? settings.template! : 'classic',
    showDividers: typeof settings.showDividers === 'boolean' ? settings.showDividers : true,
    dividerStyle: validDividerStyles.includes(settings.dividerStyle as any) ? settings.dividerStyle! : 'solid',
    headerAlignment: validAlignments.includes(settings.headerAlignment as any) ? settings.headerAlignment! : 'center',
  };
}

/**
 * Validates and sanitizes resume data to prevent undefined or missing fields from breaking renderers.
 * Preserves all unique IDs and guarantees deep data integrity.
 */
export function validateResumeData(data?: Partial<ResumeData> | null): ResumeData {
  if (!data) {
    return cloneResumeData(SAMPLE_SOFTWARE_ENGINEER);
  }

  return {
    contact: {
      fullName: data.contact?.fullName?.trim() || 'CANDIDATE NAME',
      professionalTitle: data.contact?.professionalTitle?.trim() || '',
      email: data.contact?.email?.trim() || '',
      phone: data.contact?.phone?.trim() || '',
      location: data.contact?.location?.trim() || '',
      linkedIn: data.contact?.linkedIn?.trim() || undefined,
      github: data.contact?.github?.trim() || undefined,
      website: data.contact?.website?.trim() || undefined,
    },
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp, idx) => ({
          id: exp.id || `exp-${Date.now()}-${idx}`,
          company: exp.company || '',
          role: exp.role || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrent: Boolean(exp.isCurrent),
          bullets: Array.isArray(exp.bullets) ? exp.bullets.filter((b) => typeof b === 'string' && b.trim().length > 0) : [],
        }))
      : [],
    education: Array.isArray(data.education)
      ? data.education.map((edu, idx) => ({
          id: edu.id || `edu-${Date.now()}-${idx}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          field: edu.field || '',
          location: edu.location || '',
          graduationDate: edu.graduationDate || '',
          gpaOrHonors: edu.gpaOrHonors || undefined,
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.map((proj, idx) => ({
          id: proj.id || `proj-${Date.now()}-${idx}`,
          name: proj.name || '',
          role: proj.role || undefined,
          technologies: proj.technologies || '',
          link: proj.link || undefined,
          bullets: Array.isArray(proj.bullets) ? proj.bullets.filter((b) => typeof b === 'string' && b.trim().length > 0) : [],
        }))
      : [],
    skills: Array.isArray(data.skills)
      ? data.skills.map((skill, idx) => ({
          id: skill.id || `sk-${Date.now()}-${idx}`,
          categoryName: skill.categoryName || '',
          skills: skill.skills || '',
        }))
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map((cert, idx) => ({
          id: cert.id || `cert-${Date.now()}-${idx}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
        }))
      : [],
    achievements: Array.isArray(data.achievements)
      ? data.achievements.filter((a) => typeof a === 'string' && a.trim().length > 0)
      : undefined,
    languages: typeof data.languages === 'string' && data.languages.trim().length > 0 ? data.languages.trim() : undefined,
    sectionOrder: Array.isArray(data.sectionOrder) ? data.sectionOrder : undefined,
  };
}

/**
 * DEMONSTRATION PROFILE 1: Senior Full Stack Software Engineer
 * Demonstrates balanced 1-page engineering profile (~73% A4 Fill under Default Formatting).
 * All information is illustrative demonstration data.
 */
export const SAMPLE_SOFTWARE_ENGINEER: ResumeData = deepFreeze({
  contact: {
    fullName: 'ALEXANDER CHEN',
    professionalTitle: 'Senior Full Stack Software Engineer',
    email: 'alex.chen.dev@email.com',
    phone: '+1 (555) 382-9104',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/alexchen-dev',
    github: 'github.com/alexchen',
    website: 'alexchen.tech',
  },
  summary:
    'Full Stack Engineer with 5+ years of experience designing scalable microservices, cloud architectures, and high-throughput web applications. Proven record reducing API latencies by 38% and architecting systems serving 2M+ daily active users.',
  experience: [
    {
      id: 'exp-1',
      company: 'Stripe Innovations',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Spearheaded redesign of core payment reconciliation microservices using Go and PostgreSQL, cutting settlement latency by 38% for 450K+ daily transactions.',
        'Architected event-driven Kafka pipeline processing 15M messages daily with 99.99% uptime, eliminating transaction reconciliation discrepancies.',
        'Mentored 6 engineers through architecture reviews and best practices, elevating sprint delivery velocity by 25%.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Apex Cloud Systems',
      role: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: '2020',
      endDate: '2022',
      isCurrent: false,
      bullets: [
        'Engineered telemetry dashboard in React, TypeScript, and GraphQL, boosting page load speeds by 55% for 80,000 enterprise users.',
        'Automated CI/CD deployment pipelines on AWS ECS and Terraform, slashing rollback incidents from 12% to under 0.8%.',
        'Implemented distributed Redis caching cluster, cutting relational database read load by 60% during high-traffic promotional surges.',
      ],
    },
    {
      id: 'exp-3',
      company: 'Vanguard Digital Solutions',
      role: 'Associate Software Developer',
      location: 'Oakland, CA',
      startDate: '2019',
      endDate: '2020',
      isCurrent: false,
      bullets: [
        'Developed RESTful endpoints in Node.js and Express for ERP integration, accelerating order processing throughput by 30%.',
        'Refactored legacy authentication module into OAuth2/JWT microservice, resolving 14 critical security audit items.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      graduationDate: '2019',
      gpaOrHonors: 'GPA: 3.85 / 4.0 (Dean’s Honor List)',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniStream Analytics Engine',
      role: 'Lead Creator',
      technologies: 'Rust, Apache Kafka, WebSockets, ClickHouse',
      link: 'github.com/alexchen/omnistream',
      bullets: [
        'Constructed real-time log ingestion engine indexing 100,000 events/sec with sub-50ms latency; awarded 1st place at Silicon Valley Hackathon.',
      ],
    },
    {
      id: 'proj-2',
      name: 'CloudCost Optimizer CLI',
      role: 'Author',
      technologies: 'Python, AWS SDK, Docker, Click',
      link: 'github.com/alexchen/cloudcost-cli',
      bullets: [
        'Engineered CLI utility that audits dormant AWS resources, saving $18,000+ annually across 15 production accounts.',
      ],
    },
  ],
  skills: [
    {
      id: 'sk-1',
      categoryName: 'Languages',
      skills: 'Go, TypeScript, JavaScript (ES6+), Python, SQL, Rust, HTML5, CSS3',
    },
    {
      id: 'sk-2',
      categoryName: 'Frameworks & Tools',
      skills: 'React, Next.js, Node.js, Express, Tailwind CSS, GraphQL, REST APIs, Git, Docker, Kubernetes',
    },
    {
      id: 'sk-3',
      categoryName: 'Cloud & Databases',
      skills: 'AWS (ECS, S3, RDS, Lambda), PostgreSQL, Redis, Apache Kafka, Terraform, CI/CD Actions',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Application Developer (CKAD)',
      issuer: 'Cloud Native Computing Foundation',
      date: '2022',
    },
  ],
});

/**
 * DEMONSTRATION PROFILE 2: Senior Technical Product Manager
 * Demonstrates cross-functional non-engineering leadership profile (~58% A4 Fill under Default Formatting).
 * All information is illustrative demonstration data.
 */
export const SAMPLE_PRODUCT_MANAGER: ResumeData = deepFreeze({
  contact: {
    fullName: 'SARAH JENNINGS',
    professionalTitle: 'Senior Technical Product Manager',
    email: 'sarah.jennings@email.com',
    phone: '+1 (555) 492-8172',
    location: 'New York, NY',
    linkedIn: 'linkedin.com/in/sarah-jennings-pm',
    website: 'sarahjennings.co',
  },
  summary:
    'Product Leader with 6+ years driving B2B SaaS roadmaps from inception to $14M ARR. Expert at cross-functional leadership, user discovery, and data-driven prioritization across engineering and go-to-market teams.',
  experience: [
    {
      id: 'pm-exp-1',
      company: 'FinLeap Global',
      role: 'Senior Product Manager',
      location: 'New York, NY',
      startDate: '2022',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Spearheaded enterprise onboarding workflow overhaul, slashing time-to-value from 18 to 4.2 days and growing expansion revenue by $2.4M.',
        'Led agile team of 14 engineers and designers through 8 consecutive releases with 94% on-time milestone delivery.',
        'Defined core analytics dashboard, boosting daily active user retention by 22% within 6 months.',
      ],
    },
    {
      id: 'pm-exp-2',
      company: 'MetricPulse Analytics',
      role: 'Product Manager',
      location: 'Boston, MA',
      startDate: '2019',
      endDate: '2022',
      isCurrent: false,
      bullets: [
        'Launched AI anomaly detection feature adopted by 73% of tier-1 customers, generating $1.1M net new ARR in year one.',
        'Executed 60+ customer interviews synthesizing critical pain points into unified roadmap requirements.',
        'Implemented proactive churn prevention triggers with customer success, lowering gross churn by 3.5%.',
      ],
    },
  ],
  education: [
    {
      id: 'pm-edu-1',
      institution: 'Columbia University',
      degree: 'Master of Science',
      field: 'Technology Management',
      location: 'New York, NY',
      graduationDate: '2019',
    },
    {
      id: 'pm-edu-2',
      institution: 'Boston University',
      degree: 'Bachelor of Science',
      field: 'Business Administration & Analytics',
      location: 'Boston, MA',
      graduationDate: '2017',
      gpaOrHonors: 'Magna Cum Laude',
    },
  ],
  projects: [
    {
      id: 'pm-proj-1',
      name: 'Self-Serve API Monetization Portal',
      technologies: 'Stripe Billing, Segment, Mixpanel, Figma',
      bullets: [
        'Delivered frictionless developer checkout experience resulting in 400+ self-serve customer conversions within 90 days.',
      ],
    },
  ],
  skills: [
    {
      id: 'pm-sk-1',
      categoryName: 'Product Strategy',
      skills: 'Product Discovery, Roadmap Prioritization (RICE), Go-To-Market (GTM), Competitive Analysis',
    },
    {
      id: 'pm-sk-2',
      categoryName: 'Analytics & Tools',
      skills: 'Mixpanel, Amplitude, SQL, Google Analytics, Jira, Confluence, Figma, Segment, Tableau',
    },
    {
      id: 'pm-sk-3',
      categoryName: 'Methodologies',
      skills: 'Agile/Scrum, User Journey Mapping, Sprint Planning, OKRs, A/B Testing, PRD Creation',
    },
  ],
  certifications: [
    {
      id: 'pm-cert-1',
      name: 'Pragmatic Institute Certified (PMC-III)',
      issuer: 'Pragmatic Institute',
      date: '2021',
    },
    {
      id: 'pm-cert-2',
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      date: '2020',
    },
  ],
});

/**
 * DEMONSTRATION PROFILE 3: College Student / Fresher Profile
 * Demonstrates junior entry-level structure (~52% A4 Fill under Default Formatting).
 * All information is illustrative demonstration data.
 */
export const SAMPLE_SHORT_RESUME: ResumeData = deepFreeze({
  contact: {
    fullName: 'EMILY ZHANG',
    professionalTitle: 'Junior Frontend Developer',
    email: 'emily.zhang@email.com',
    phone: '+1 (555) 721-4490',
    location: 'Austin, TX',
    linkedIn: 'linkedin.com/in/emilyzhang',
    github: 'github.com/emilyzhang',
  },
  summary:
    'Frontend Developer with strong foundation in React, TypeScript, and responsive web design. Passionate about building accessible, performant user interfaces with clean architecture.',
  experience: [
    {
      id: 'short-exp-1',
      company: 'TechStart Studio',
      role: 'Frontend Engineering Intern',
      location: 'Austin, TX',
      startDate: '2023',
      endDate: '2024',
      isCurrent: false,
      bullets: [
        'Built accessible UI components in React and Tailwind CSS, increasing accessibility audit scores from 82 to 98.',
        'Collaborated with design team to migrate design system tokens, reducing duplicate CSS rules by 35%.',
      ],
    },
  ],
  education: [
    {
      id: 'short-edu-1',
      institution: 'University of Texas at Austin',
      degree: 'Bachelor of Science',
      field: 'Informatics & Software Development',
      location: 'Austin, TX',
      graduationDate: '2024',
      gpaOrHonors: 'GPA: 3.90 / 4.0',
    },
  ],
  projects: [
    {
      id: 'short-proj-1',
      name: 'DevPalette — Design Token Explorer',
      technologies: 'React, TypeScript, Vite, CSS Modules',
      link: 'github.com/emilyzhang/devpalette',
      bullets: [
        'Created interactive color contrast compliance checker adopted by 1,200+ developer community members.',
      ],
    },
  ],
  skills: [
    {
      id: 'short-sk-1',
      categoryName: 'Frontend Skills',
      skills: 'React, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Next.js, Redux Toolkit',
    },
    {
      id: 'short-sk-2',
      categoryName: 'Developer Tools',
      skills: 'Git, GitHub, Vite, Jest, Figma, Chrome DevTools, REST APIs, Vercel',
    },
  ],
  certifications: [
    {
      id: 'short-cert-1',
      name: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Coursera / Meta',
      date: '2023',
    },
  ],
});

/**
 * DEMONSTRATION PROFILE 4: Senior Systems Architect
 * Demonstrates high-density resume exceeding 1 page (~115% A4 Fill) to showcase intelligent Auto-Fit.
 * All information is illustrative demonstration data.
 */
export const SAMPLE_LONG_RESUME: ResumeData = deepFreeze({
  contact: {
    fullName: 'MARCUS V. STERLING',
    professionalTitle: 'Principal Distributed Systems Architect',
    email: 'marcus.sterling.eng@email.com',
    phone: '+1 (555) 902-3144',
    location: 'Seattle, WA',
    linkedIn: 'linkedin.com/in/marcussterling',
    github: 'github.com/msterling',
    website: 'msterling.io',
  },
  summary:
    'Distinguished Systems Architect with 12+ years of experience engineering high-scale distributed backends, streaming event pipelines, and cloud-native Kubernetes infrastructure serving 50M+ global users across enterprise tier-1 platforms.',
  experience: [
    {
      id: 'long-exp-1',
      company: 'Amazon Web Services (AWS)',
      role: 'Principal Systems Architect',
      location: 'Seattle, WA',
      startDate: '2021',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Spearheaded architecture of global multi-region telemetry pipeline processing 40B events daily with sub-second analytical latency.',
        'Architected fault-tolerant consensus engine using Raft protocol in Rust, guaranteeing 99.999% availability during region failure drills.',
        'Led technical steering committee of 35 principal engineers, defining cloud migration standards across 140+ internal services.',
      ],
    },
    {
      id: 'long-exp-2',
      company: 'Datadog Platforms',
      role: 'Staff Infrastructure Engineer',
      location: 'New York, NY',
      startDate: '2017',
      endDate: '2021',
      isCurrent: false,
      bullets: [
        'Engineered distributed query execution engine in Go and C++, reducing p99 tail latency across 200,000 customer clusters by 44%.',
        'Built dynamic load shedding proxy saving $4.2M in annual cloud compute egress costs across Kubernetes node pools.',
        'Mentored 18 senior engineers and authored 6 widely referenced internal architecture RFCs.',
      ],
    },
    {
      id: 'long-exp-3',
      company: 'Twitter / X Infrastructure',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2014',
      endDate: '2017',
      isCurrent: false,
      bullets: [
        'Scaled distributed timeline cache cluster handling 800,000 queries per second with 99.95% cache hit ratio.',
        'Refactored legacy JVM garbage collection parameters and memory buffer pools, slashing GC pause stalls by 68%.',
      ],
    },
    {
      id: 'long-exp-4',
      company: 'Oracle Enterprise Systems',
      role: 'Software Development Engineer',
      location: 'Redwood Shores, CA',
      startDate: '2012',
      endDate: '2014',
      isCurrent: false,
      bullets: [
        'Engineered high-throughput relational database connection pooling library adopted across 12 product lines.',
      ],
    },
  ],
  education: [
    {
      id: 'long-edu-1',
      institution: 'University of Washington',
      degree: 'Master of Science',
      field: 'Computer Engineering & Systems',
      location: 'Seattle, WA',
      graduationDate: '2012',
    },
    {
      id: 'long-edu-2',
      institution: 'Purdue University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'West Lafayette, IN',
      graduationDate: '2010',
      gpaOrHonors: 'Summa Cum Laude',
    },
  ],
  projects: [
    {
      id: 'long-proj-1',
      name: 'HyperRaft — Asynchronous Distributed Consensus',
      role: 'Lead Architect',
      technologies: 'Rust, Tokio, gRPC, Protobuf',
      link: 'github.com/msterling/hyperraft',
      bullets: [
        'Authored high-performance Raft implementation achieving 240,000 committed state entries per second.',
      ],
    },
    {
      id: 'long-proj-2',
      name: 'ZeroMesh Service Proxy',
      role: 'Creator',
      technologies: 'Go, eBPF, Linux Kernel, Envoy',
      link: 'github.com/msterling/zeromesh',
      bullets: [
        'Implemented kernel-level packet redirection proxy cutting microservice hop overhead by 32%.',
      ],
    },
  ],
  skills: [
    {
      id: 'long-sk-1',
      categoryName: 'Core Languages',
      skills: 'Rust, Go, C++, Python, Java, SQL, Assembly, Bash/Shell, TypeScript',
    },
    {
      id: 'long-sk-2',
      categoryName: 'Distributed Systems',
      skills: 'Raft/Paxos Consensus, Kafka, gRPC, Protobuf, Redis, ClickHouse, Cassandra, PostgreSQL',
    },
    {
      id: 'long-sk-3',
      categoryName: 'Cloud & Infrastructure',
      skills: 'AWS, Kubernetes, Docker, Terraform, eBPF, Linux Kernel Internals, CI/CD, Microservices',
    },
  ],
  certifications: [
    {
      id: 'long-cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'long-cert-2',
      name: 'Certified Kubernetes Security Specialist (CKS)',
      issuer: 'Linux Foundation',
      date: '2022',
    },
  ],
});

/**
 * Accessor functions that return isolated deep copies of demonstration profiles,
 * guaranteeing candidate edits never overwrite or contaminate the sample data constants.
 */
export function getSampleSoftwareEngineer(): ResumeData {
  return cloneResumeData(SAMPLE_SOFTWARE_ENGINEER);
}

export function getSampleProductManager(): ResumeData {
  return cloneResumeData(SAMPLE_PRODUCT_MANAGER);
}

export function getSampleShortResume(): ResumeData {
  return cloneResumeData(SAMPLE_SHORT_RESUME);
}

export function getSampleLongResume(): ResumeData {
  return cloneResumeData(SAMPLE_LONG_RESUME);
}

export function getDefaultFormatting(): FormattingSettings {
  return cloneFormattingSettings(DEFAULT_FORMATTING);
}

/**
 * Metadata list for UI profile selectors.
 */
export interface SampleProfileOption {
  id: 'swe' | 'pm' | 'short' | 'long';
  title: string;
  role: string;
  description: string;
  getData: () => ResumeData;
}

export const SAMPLE_PROFILES: SampleProfileOption[] = [
  {
    id: 'swe',
    title: 'Standard Software Engineer',
    role: 'Alexander Chen',
    description: 'Balanced ~73% 1-page engineering profile with full microservices experience',
    getData: getSampleSoftwareEngineer,
  },
  {
    id: 'pm',
    title: 'Senior Product Manager',
    role: 'Sarah Jennings',
    description: 'Cross-functional SaaS leader profile (~58% 1-page fill)',
    getData: getSampleProductManager,
  },
  {
    id: 'short',
    title: 'College Student / Fresher',
    role: 'Emily Zhang',
    description: 'Junior entry-level profile (~52% 1-page fill) with prioritized education',
    getData: getSampleShortResume,
  },
  {
    id: 'long',
    title: 'Senior Systems Architect',
    role: 'Marcus V. Sterling',
    description: 'High-density multi-role resume (~115% A4 Fill) to demonstrate Auto-Fit',
    getData: getSampleLongResume,
  },
];
