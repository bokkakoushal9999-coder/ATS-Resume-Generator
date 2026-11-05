import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  User,
  Plus,
  Trash2,
  Sparkles,
  Trophy,
  Globe2,
  ArrowUpDown,
} from 'lucide-react';
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SkillCategory,
  CertificationItem,
  ResumeSectionId,
} from '../types';
import { condenseBullet } from '../utils/atsOptimizer';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onCondenseAllContent: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onCondenseAllContent,
}) => {
  const [activeTab, setActiveTab] = useState<
    'contact' | 'summary' | 'experience' | 'skills' | 'projects' | 'education' | 'certifications' | 'achievements' | 'languages' | 'order'
  >('contact');

  // Contact update helper
  const updateContact = (field: keyof typeof data.contact, value: string) => {
    onChange({
      ...data,
      contact: {
        ...data.contact,
        [field]: value,
      },
    });
  };

  // Experience helpers
  const updateExperience = (id: string, updated: Partial<ExperienceItem>) => {
    onChange({
      ...data,
      experience: (data.experience || []).map((item) => (item.id === id ? { ...item, ...updated } : item)),
    });
  };

  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      company: 'Company / Organization',
      role: 'Job Title / Role',
      location: 'City, State',
      startDate: '2023',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Managed core team initiative improving operational throughput by 25%.',
        'Coordinated cross-functional projects resolving client deliverables on schedule.',
      ],
    };
    onChange({ ...data, experience: [newItem, ...(data.experience || [])] });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: (data.experience || []).filter((item) => item.id !== id),
    });
  };

  const handleCondenseBullet = (
    sectionType: 'experience' | 'projects' | 'achievements',
    itemId: string,
    bulletIdx: number
  ) => {
    if (sectionType === 'experience') {
      const exp = (data.experience || []).find((e) => e.id === itemId);
      if (!exp) return;
      const newBullets = [...exp.bullets];
      newBullets[bulletIdx] = condenseBullet(newBullets[bulletIdx]);
      updateExperience(itemId, { bullets: newBullets });
    } else if (sectionType === 'projects') {
      const proj = (data.projects || []).find((p) => p.id === itemId);
      if (!proj) return;
      const newBullets = [...proj.bullets];
      newBullets[bulletIdx] = condenseBullet(newBullets[bulletIdx]);
      updateProject(itemId, { bullets: newBullets });
    } else {
      const newAchievements = [...(data.achievements || [])];
      newAchievements[bulletIdx] = condenseBullet(newAchievements[bulletIdx]);
      onChange({ ...data, achievements: newAchievements });
    }
  };

  // Projects helpers
  const updateProject = (id: string, updated: Partial<ProjectItem>) => {
    onChange({
      ...data,
      projects: (data.projects || []).map((item) => (item.id === id ? { ...item, ...updated } : item)),
    });
  };

  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Project / Initiative Title',
      technologies: 'Tools / Tech Stack / Methodology',
      link: 'github.com/username/project',
      bullets: ['Developed high-performance solution serving 10,000+ monthly active users.'],
    };
    onChange({ ...data, projects: [...(data.projects || []), newItem] });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: (data.projects || []).filter((item) => item.id !== id),
    });
  };

  // Skills helpers
  const updateSkillCategory = (id: string, updated: Partial<SkillCategory>) => {
    onChange({
      ...data,
      skills: (data.skills || []).map((item) => (item.id === id ? { ...item, ...updated } : item)),
    });
  };

  const addSkillCategory = () => {
    const newItem: SkillCategory = {
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      categoryName: 'Category Name',
      skills: 'Skill 1, Skill 2, Skill 3',
    };
    onChange({ ...data, skills: [...(data.skills || []), newItem] });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...data,
      skills: (data.skills || []).filter((item) => item.id !== id),
    });
  };

  // Education helpers
  const updateEducation = (id: string, updated: Partial<EducationItem>) => {
    onChange({
      ...data,
      education: (data.education || []).map((item) => (item.id === id ? { ...item, ...updated } : item)),
    });
  };

  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      institution: 'University / College Name',
      degree: 'Bachelor of Science / Degree',
      field: 'Major / Field of Study',
      location: 'City, State',
      graduationDate: '2024',
      gpaOrHonors: 'GPA: 3.8 / 4.0',
    };
    onChange({ ...data, education: [...(data.education || []), newItem] });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: (data.education || []).filter((item) => item.id !== id),
    });
  };

  // Certifications helpers
  const updateCert = (id: string, updated: Partial<CertificationItem>) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).map((item) => (item.id === id ? { ...item, ...updated } : item)),
    });
  };

  const addCert = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Certification Title',
      issuer: 'Issuing Organization',
      date: '2023',
    };
    onChange({ ...data, certifications: [...(data.certifications || []), newItem] });
  };

  const removeCert = (id: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).filter((item) => item.id !== id),
    });
  };

  // Achievements helpers
  const addAchievement = () => {
    const newAchievements = [
      ...(data.achievements || []),
      'Awarded 1st place in National Innovation Competition out of 150 teams.',
    ];
    onChange({ ...data, achievements: newAchievements });
  };

  const updateAchievement = (idx: number, value: string) => {
    const newAchievements = [...(data.achievements || [])];
    newAchievements[idx] = value;
    onChange({ ...data, achievements: newAchievements });
  };

  const removeAchievement = (idx: number) => {
    onChange({
      ...data,
      achievements: (data.achievements || []).filter((_, i) => i !== idx),
    });
  };

  // Section Order presets
  const setPresetOrder = (preset: 'experienced' | 'student') => {
    if (preset === 'experienced') {
      onChange({
        ...data,
        sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'languages'],
      });
    } else {
      // Students / Freshers: Education & Projects placed first!
      onChange({
        ...data,
        sectionOrder: ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'languages'],
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'contact'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Contact
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'experience'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Experience ({data.experience?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'skills'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Skills
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" /> Projects ({data.projects?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'education'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Education
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'certifications'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Certifications
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'achievements'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Honors
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'languages'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" /> Languages
        </button>
        <button
          onClick={() => setActiveTab('order')}
          className={`flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'order'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
          title="Section Ordering & Layout Structure"
        >
          <ArrowUpDown className="w-3.5 h-3.5" /> Layout Order
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {/* CONTACT INFO */}
        {activeTab === 'contact' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Personal & Contact Info</h3>
              <span className="text-xs text-slate-500">ATS Best Practice: Single line clean header</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.contact?.fullName || ''}
                  onChange={(e) => updateContact('fullName', e.target.value)}
                  placeholder="e.g. ALEXANDER CHEN"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={data.contact?.professionalTitle || ''}
                  onChange={(e) => updateContact('professionalTitle', e.target.value)}
                  placeholder="e.g. Senior Software Engineer / Marketing Specialist"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={data.contact?.email || ''}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder="e.g. alex.chen@example.com"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={data.contact?.phone || ''}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 382-9104"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={data.contact?.location || ''}
                  onChange={(e) => updateContact('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={data.contact?.linkedIn || ''}
                  onChange={(e) => updateContact('linkedIn', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={data.contact?.github || ''}
                  onChange={(e) => updateContact('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Website</label>
                <input
                  type="text"
                  value={data.contact?.website || ''}
                  onChange={(e) => updateContact('website', e.target.value)}
                  placeholder="yourname.com"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Professional Summary</h3>
                <p className="text-xs text-slate-500">
                  Keep to 2–3 punchy lines (30–45 words) highlighting key strengths and domain focus.
                </p>
              </div>
              <button
                onClick={() => {
                  if (data.summary) {
                    onChange({
                      ...data,
                      summary: condenseBullet(data.summary),
                    });
                  }
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                title="Tighten summary wording"
              >
                <Sparkles className="w-3.5 h-3.5" /> Condense
              </button>
            </div>
            <textarea
              rows={4}
              value={data.summary || ''}
              onChange={(e) => onChange({ ...data, summary: e.target.value })}
              placeholder="e.g. Results-oriented professional with experience delivering high-impact solutions..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* WORK EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Work Experience</h3>
                <p className="text-xs text-slate-500">
                  Use action verbs and measurable results (% / $ / scale metrics).
                </p>
              </div>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            {(data.experience || []).map((exp, expIdx) => (
              <div
                key={exp.id}
                className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2.5 relative group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Role #{expIdx + 1}
                  </span>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Company Name</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                        placeholder="2021"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="Present"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-700">Achievement Bullets</label>
                    <button
                      onClick={() => {
                        const newBullets = [...exp.bullets, 'Delivered strategic initiative resulting in measurable improvements.'];
                        updateExperience(exp.id, { bullets: newBullets });
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 text-xs mt-1">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[bIdx] = e.target.value;
                          updateExperience(exp.id, { bullets: newBullets });
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleCondenseBullet('experience', exp.id, bIdx)}
                          title="Smart Condense bullet"
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const newBullets = exp.bullets.filter((_, idx) => idx !== bIdx);
                            updateExperience(exp.id, { bullets: newBullets });
                          }}
                          title="Delete bullet"
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TECHNICAL SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Skills Matrix</h3>
                <p className="text-xs text-slate-500">
                  Group skills by domain (e.g., Languages, Tools, Industry Knowledge).
                </p>
              </div>
              <button
                onClick={addSkillCategory}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {(data.skills || []).map((sk) => (
              <div
                key={sk.id}
                className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-col md:flex-row gap-2 items-start md:items-center"
              >
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    value={sk.categoryName}
                    onChange={(e) => updateSkillCategory(sk.id, { categoryName: e.target.value })}
                    placeholder="Category (e.g. Tools)"
                    className="w-full px-2 py-1 text-xs font-semibold border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div className="flex-1 w-full flex items-center gap-1.5">
                  <input
                    type="text"
                    value={sk.skills}
                    onChange={(e) => updateSkillCategory(sk.id, { skills: e.target.value })}
                    placeholder="Comma-separated skills (e.g. SQL, Excel, Python)"
                    className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                  />
                  <button
                    onClick={() => removeSkillCategory(sk.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Projects & Key Work</h3>
                <p className="text-xs text-slate-500">
                  Great for students, freshers, engineers, and portfolio-driven roles.
                </p>
              </div>
              <button
                onClick={addProject}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {(data.projects || []).map((proj) => (
              <div key={proj.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="Project Name"
                    className="font-bold text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none w-1/2"
                  />
                  <button onClick={() => removeProject(proj.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, { technologies: e.target.value })}
                    placeholder="Tools / Tech Stack"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={proj.link || ''}
                    onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                    placeholder="Link (optional)"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                {/* Bullets */}
                <div className="space-y-1 pt-1">
                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 text-xs mt-1">•</span>
                      <textarea
                        rows={1}
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...proj.bullets];
                          newBullets[bIdx] = e.target.value;
                          updateProject(proj.id, { bullets: newBullets });
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                      />
                      <button
                        onClick={() => handleCondenseBullet('projects', proj.id, bIdx)}
                        title="Condense"
                        className="p-1 text-blue-600 hover:bg-blue-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const newBullets = proj.bullets.filter((_, idx) => idx !== bIdx);
                          updateProject(proj.id, { bullets: newBullets });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      updateProject(proj.id, {
                        bullets: [...proj.bullets, 'Delivered project milestone resulting in measurable positive outcome.'],
                      });
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    + Add Project Bullet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Education</h3>
                <p className="text-xs text-slate-500">Degrees, major, honors, graduation dates.</p>
              </div>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {(data.education || []).map((edu) => (
              <div key={edu.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                    placeholder="University Name"
                    className="font-bold text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none w-2/3"
                  />
                  <button onClick={() => removeEducation(edu.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Degree (e.g. Bachelor of Science)"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                    placeholder="Field of Study"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })}
                    placeholder="Graduation Year"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.gpaOrHonors || ''}
                    onChange={(e) => updateEducation(edu.id, { gpaOrHonors: e.target.value })}
                    placeholder="GPA / Honors (optional)"
                    className="text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Certifications</h3>
                <p className="text-xs text-slate-500">Industry-recognized professional credentials.</p>
              </div>
              <button
                onClick={addCert}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>

            {(data.certifications || []).map((cert) => (
              <div
                key={cert.id}
                className="p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCert(cert.id, { name: e.target.value })}
                  placeholder="Certification Name"
                  className="flex-1 px-2 py-1 text-xs font-semibold border border-slate-300 rounded focus:outline-none"
                />
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
                  placeholder="Issuer"
                  className="w-1/3 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                />
                <input
                  type="text"
                  value={cert.date}
                  onChange={(e) => updateCert(cert.id, { date: e.target.value })}
                  placeholder="Year"
                  className="w-16 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                />
                <button onClick={() => removeCert(cert.id)} className="text-slate-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACHIEVEMENTS / HONORS */}
        {activeTab === 'achievements' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Honors & Achievements</h3>
                <p className="text-xs text-slate-500">Awards, hackathons, scholarships, and special recognitions.</p>
              </div>
              <button
                onClick={addAchievement}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Honor
              </button>
            </div>

            {(data.achievements || []).map((ach, aIdx) => (
              <div key={aIdx} className="flex items-start gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 text-xs mt-1">•</span>
                <textarea
                  rows={2}
                  value={ach}
                  onChange={(e) => updateAchievement(aIdx, e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none"
                />
                <button
                  onClick={() => handleCondenseBullet('achievements', '', aIdx)}
                  title="Condense"
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeAchievement(aIdx)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* LANGUAGES */}
        {activeTab === 'languages' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Languages</h3>
              <p className="text-xs text-slate-500">Spoken and written language proficiency.</p>
            </div>
            <textarea
              rows={2}
              value={data.languages || ''}
              onChange={(e) => onChange({ ...data, languages: e.target.value })}
              placeholder="e.g. English (Native), Spanish (Professional Working Proficiency)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* SECTION ORDER PRESETS */}
        {activeTab === 'order' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Section Hierarchy & Ordering</h3>
              <p className="text-xs text-slate-500">
                Tailor section order for your career level (Students highlight education & projects first; professionals highlight experience first).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setPresetOrder('experienced')}
                className="p-3 border rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="font-bold text-xs text-slate-900 block">Experienced Professional Preset</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Summary → Skills → Experience → Projects → Education → Certifications
                </span>
              </button>

              <button
                onClick={() => setPresetOrder('student')}
                className="p-3 border rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="font-bold text-xs text-slate-900 block">Student & Fresher Preset</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Summary → Education → Skills → Projects → Experience → Honors
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Quick Action Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <button
          onClick={onCondenseAllContent}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          title="Strips filler phrases and upgrades verbs across all bullets"
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Condense All Bullets
        </button>
        <span className="text-[11px] text-slate-500 font-medium">Auto-saves instantly</span>
      </div>
    </div>
  );
};
