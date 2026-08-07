import React, { useState } from 'react';
import { ReportCardTemplate } from '../../types/examination';
import { EDUCATIONAL_STAGES, EducationalStageId, GD_GOENKA_SCHOOL_META } from './gdGoenkaData';
import {
  Layout,
  Save,
  Eye,
  CheckSquare,
  Square,
  Layers,
  User,
  BookOpen,
  Award,
  FileCheck,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  HelpCircle,
  Printer
} from 'lucide-react';

interface ReportCardDesignerProps {
  templates: ReportCardTemplate[];
  onSaveTemplate: (template: ReportCardTemplate) => void;
  onPreviewTemplate: (template: ReportCardTemplate) => void;
}

export const ReportCardDesigner: React.FC<ReportCardDesignerProps> = ({
  templates,
  onSaveTemplate,
  onPreviewTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportCardTemplate>(templates[0]);
  const [activeStageId, setActiveStageId] = useState<EducationalStageId>('STAGE_C'); // Default Class III-V
  const [activeTabCategory, setActiveTabCategory] = useState<'HEADER' | 'PROFILE' | 'HPC' | 'MARKS' | 'CO_SCHOLASTIC' | 'FOOTER'>('HEADER');

  const currentStageInfo = EDUCATIONAL_STAGES.find((s) => s.id === activeStageId) || EDUCATIONAL_STAGES[2];
  const isHpcTrack = currentStageInfo.track === 'HPC';

  const handleToggle = (field: keyof ReportCardTemplate) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleValueChange = (field: keyof ReportCardTemplate, value: any) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSaveTemplate(selectedTemplate);
    alert(`Report Card Template "${selectedTemplate.name}" configuration saved successfully!`);
  };

  // Helper for batch toggles
  const setCategoryAll = (fields: (keyof ReportCardTemplate)[], value: boolean) => {
    setSelectedTemplate((prev) => {
      const updated = { ...prev };
      fields.forEach((f) => {
        (updated as any)[f] = value;
      });
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
              G D GOENKA PUBLIC SCHOOL, AGRA
            </span>
            <span className="text-xs text-slate-500">• Session 2025-26 Customizer</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Visual Report Card & HPC Section Customizer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Check or uncheck individual sections below to dynamically show or hide them on the report card.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const found = templates.find((t) => t.id === e.target.value);
              if (found) setSelectedTemplate(found);
            }}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onPreviewTemplate(selectedTemplate)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" /> Full Modal & Print
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Layout
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CONTROLS (LEFT) vs LIVE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CUSTOMIZATION CHECKBOXES & TOGGLES PANEL */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" /> Section Visibility Checkboxes
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Toggle items to show/hide</span>
          </div>

          {/* BASIC BRANDING INPUTS */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Header School Name:</label>
              <input
                type="text"
                value={selectedTemplate.headerTitle}
                onChange={(e) => handleValueChange('headerTitle', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline / Motto:</label>
                <input
                  type="text"
                  value={selectedTemplate.schoolMotto}
                  onChange={(e) => handleValueChange('schoolMotto', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Theme Color:</label>
                <input
                  type="color"
                  value={selectedTemplate.primaryColor}
                  onChange={(e) => handleValueChange('primaryColor', e.target.value)}
                  className="w-full h-8 p-1 bg-white dark:bg-slate-900 border rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* CATEGORY TABS FOR CHECKBOXES */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTabCategory('HEADER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'HEADER' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Header
            </button>
            <button
              onClick={() => setActiveTabCategory('PROFILE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'PROFILE' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTabCategory('HPC')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'HPC' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              HPC Forms
            </button>
            <button
              onClick={() => setActiveTabCategory('MARKS')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'MARKS' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Academic Marks
            </button>
            <button
              onClick={() => setActiveTabCategory('CO_SCHOLASTIC')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'CO_SCHOLASTIC' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Soft Skills
            </button>
            <button
              onClick={() => setActiveTabCategory('FOOTER')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabCategory === 'FOOTER' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Signatures & QR
            </button>
          </div>

          {/* CHECKBOX CONTROLS CONTENT BASED ON ACTIVE CATEGORY */}
          <div className="space-y-3 min-h-[300px]">
            
            {/* 1. HEADER & BRANDING CHECKBOXES */}
            {activeTabCategory === 'HEADER' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>Header Elements</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showLogo', 'showSchoolHeader', 'showTagline', 'showSchoolContact', 'showDocTitle', 'showWatermark'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showLogo', 'showSchoolHeader', 'showTagline', 'showSchoolContact', 'showDocTitle', 'showWatermark'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showLogo ?? true} onChange={() => handleToggle('showLogo')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show School Logo</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSchoolHeader ?? true} onChange={() => handleToggle('showSchoolHeader')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show School Name Header ("G D GOENKA PUBLIC SCHOOL, AGRA")</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showTagline ?? true} onChange={() => handleToggle('showTagline')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Tagline / School Motto ("Thrive. For Life.")</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSchoolContact ?? true} onChange={() => handleToggle('showSchoolContact')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show School Address & Phone Numbers Footer Header</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showDocTitle ?? true} onChange={() => handleToggle('showDocTitle')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Report Card Document Badge ("Annual Report / Holistic Progress Card")</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showWatermark ?? true} onChange={() => handleToggle('showWatermark')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Watermark Background Text</span>
                </label>
              </div>
            )}

            {/* 2. STUDENT PROFILE CHECKBOXES */}
            {activeTabCategory === 'PROFILE' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>Student Profile Info</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showStudentPhoto', 'showParentPhotos', 'showStudentBasicInfo', 'showParentDetails', 'showHouseName', 'showRank', 'showHealthStatus', 'showAttendance'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showStudentPhoto', 'showParentPhotos', 'showStudentBasicInfo', 'showParentDetails', 'showHouseName', 'showRank', 'showHealthStatus', 'showAttendance'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showStudentPhoto ?? true} onChange={() => handleToggle('showStudentPhoto')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Student Passport Photo Box</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showParentPhotos ?? true} onChange={() => handleToggle('showParentPhotos')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Mother & Father Photo Grid (HPC Pre-Primary)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showStudentBasicInfo ?? true} onChange={() => handleToggle('showStudentBasicInfo')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Student Name, Adm No, Roll No, Class & Sec</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showParentDetails ?? true} onChange={() => handleToggle('showParentDetails')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Mother's Name, Father's Name, Mobile & Address</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showHouseName ?? true} onChange={() => handleToggle('showHouseName')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Student House Tag (e.g. Tagore House)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showHealthStatus ?? true} onChange={() => handleToggle('showHealthStatus')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Physical Health Status (Height & Weight)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showAttendance ?? true} onChange={() => handleToggle('showAttendance')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Attendance Summary (Term I & Term II Working Days)</span>
                </label>
              </div>
            )}

            {/* 3. HPC & FOUNDATIONAL CHECKBOXES */}
            {activeTabCategory === 'HPC' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>HPC NCF / NIPUN Controls</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showAllAboutMe', 'showParentFeedback', 'showSelfAssessment', 'showPeerAssessment', 'showNcfCompetencyMatrix', 'showPortfolioNote'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showAllAboutMe', 'showParentFeedback', 'showSelfAssessment', 'showPeerAssessment', 'showNcfCompetencyMatrix', 'showPortfolioNote'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showAllAboutMe ?? true} onChange={() => handleToggle('showAllAboutMe')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show "All About Me" Personal Favorites Box (Colors, Foods, Games)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showParentFeedback ?? true} onChange={() => handleToggle('showParentFeedback')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Parent's Observational Feedback Section</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSelfAssessment ?? true} onChange={() => handleToggle('showSelfAssessment')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Child's Self-Assessment Section</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showPeerAssessment ?? true} onChange={() => handleToggle('showPeerAssessment')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Peer-Assessment Section</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showNcfCompetencyMatrix ?? true} onChange={() => handleToggle('showNcfCompetencyMatrix')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show NCF-SE 13-Goal Competency Matrix Table (🌱 Beginner, 🌿 Progressing, 🌳 Proficient)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showPortfolioNote ?? true} onChange={() => handleToggle('showPortfolioNote')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Enclosed Learner's Portfolio Banner Note</span>
                </label>
              </div>
            )}

            {/* 4. ACADEMIC MARKS & COMPONENTS CHECKBOXES */}
            {activeTabCategory === 'MARKS' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>Scholastic Marks Table</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showScholasticTable', 'showTerm1Breakdown', 'showTerm2Breakdown', 'showAggregateAndGrade', 'showOverallPercentage', 'showOverallGrade', 'showVocationalAreas', 'showTheoryPracticalSplit'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showScholasticTable', 'showTerm1Breakdown', 'showTerm2Breakdown', 'showAggregateAndGrade', 'showOverallPercentage', 'showOverallGrade', 'showVocationalAreas', 'showTheoryPracticalSplit'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showScholasticTable ?? true} onChange={() => handleToggle('showScholasticTable')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Main Scholastic Subjects Marks Table</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showTerm1Breakdown ?? true} onChange={() => handleToggle('showTerm1Breakdown')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Term I Marks Column (out of 50 or 100)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showTerm2Breakdown ?? true} onChange={() => handleToggle('showTerm2Breakdown')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Term II Component Columns (Periodic/CSA, MA, Portfolio, SE, Annual Exam)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showAggregateAndGrade ?? true} onChange={() => handleToggle('showAggregateAndGrade')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Aggregate Marks & Subject Grade Columns</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showOverallPercentage ?? true} onChange={() => handleToggle('showOverallPercentage')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Overall Percentage (%) Row</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showOverallGrade ?? true} onChange={() => handleToggle('showOverallGrade')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Overall Scholastic Grade Row</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showVocationalAreas ?? true} onChange={() => handleToggle('showVocationalAreas')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Vocational Areas Table (Computer, GK, German/Sanskrit)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showTheoryPracticalSplit ?? true} onChange={() => handleToggle('showTheoryPracticalSplit')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Theory / Practical / Internal Assessment Split (Class XI - XII)</span>
                </label>
              </div>
            )}

            {/* 5. CO-SCHOLASTIC & SOFT SKILLS CHECKBOXES */}
            {activeTabCategory === 'CO_SCHOLASTIC' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>Soft Skills & Activities</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showCoScholastic', 'showSoftSkillsSocial', 'showSoftSkillsWorkHabits', 'showActivities', 'showGradeScaleTable'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showCoScholastic', 'showSoftSkillsSocial', 'showSoftSkillsWorkHabits', 'showActivities', 'showGradeScaleTable'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showCoScholastic ?? true} onChange={() => handleToggle('showCoScholastic')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Co-Scholastic Areas (Art Ed, Work Ed, Health/PE, Discipline)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSoftSkillsSocial ?? true} onChange={() => handleToggle('showSoftSkillsSocial')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Soft Skills - Social Skills (Courtesy, Punctuality, Responsibility)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSoftSkillsWorkHabits ?? true} onChange={() => handleToggle('showSoftSkillsWorkHabits')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Soft Skills - Work Habits (Completes Work, Confident, Reading)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showActivities ?? true} onChange={() => handleToggle('showActivities')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Group 'A' (Outdoor) & Group 'B' (Indoor) Activities Grades</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showGradeScaleTable ?? true} onChange={() => handleToggle('showGradeScaleTable')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show CBSE 8-Point Grading Scale Reference Box (A1 to E)</span>
                </label>
              </div>
            )}

            {/* 6. FOOTER, SIGNATURES & QR CHECKBOXES */}
            {activeTabCategory === 'FOOTER' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b text-[11px] font-bold text-slate-500">
                  <span>Signatures & Validation</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryAll(['showTeacherRemarks', 'showClassTeacherSign', 'showSubjectTeacherSign', 'showPrincipalSignature', 'showParentSign', 'showQrCode', 'showFooterText'], true)} className="text-indigo-600 hover:underline">Select All</button>
                    <button onClick={() => setCategoryAll(['showTeacherRemarks', 'showClassTeacherSign', 'showSubjectTeacherSign', 'showPrincipalSignature', 'showParentSign', 'showQrCode', 'showFooterText'], false)} className="text-slate-400 hover:underline">Deselect All</button>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showTeacherRemarks ?? true} onChange={() => handleToggle('showTeacherRemarks')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Class Teacher Remarks & Result Status Box</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showClassTeacherSign ?? true} onChange={() => handleToggle('showClassTeacherSign')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Class Teacher Signature Line</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showSubjectTeacherSign ?? true} onChange={() => handleToggle('showSubjectTeacherSign')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Subject Teacher Signature Line</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showPrincipalSignature ?? true} onChange={() => handleToggle('showPrincipalSignature')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Principal Signature Line</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showParentSign ?? true} onChange={() => handleToggle('showParentSign')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Parent / Guardian Signature Line</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showQrCode ?? true} onChange={() => handleToggle('showQrCode')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Digitally Verified QR Code Box</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200">
                  <input type="checkbox" checked={selectedTemplate.showFooterText ?? true} onChange={() => handleToggle('showFooterText')} className="w-4 h-4 rounded text-indigo-600 accent-indigo-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Show Bottom Disclaimer Footer Text</span>
                </label>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: LIVE REAL-TIME REPORT CARD CANVAS */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Live Interactive Report Card Preview
              </span>
              <p className="text-[11px] text-slate-400">Updates instantly as you check or uncheck sections</p>
            </div>

            {/* Stage Selector to test across different classes */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {EDUCATIONAL_STAGES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStageId(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeStageId === st.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* CANVAS CONTAINER */}
          <div
            className="p-6 rounded-xl border-4 bg-white text-slate-900 shadow-xl space-y-5 relative overflow-hidden transition-all text-xs"
            style={{ borderColor: selectedTemplate.primaryColor }}
          >
            
            {/* Watermark Overlay */}
            {(selectedTemplate.showWatermark ?? true) && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-25deg] pointer-events-none select-none text-3xl font-extrabold uppercase">
                {selectedTemplate.watermarkText || 'GD GOENKA PUBLIC SCHOOL'}
              </div>
            )}

            {/* 1. HEADER SECTION */}
            {(selectedTemplate.showSchoolHeader ?? true) && (
              <div className="text-center border-b pb-3 space-y-1" style={{ borderColor: selectedTemplate.primaryColor }}>
                <h2 className="text-lg font-black tracking-wide uppercase" style={{ color: selectedTemplate.primaryColor }}>
                  {selectedTemplate.headerTitle}
                </h2>
                {(selectedTemplate.showTagline ?? true) && (
                  <p className="text-[11px] font-bold text-slate-600 italic">{selectedTemplate.schoolMotto}</p>
                )}
                {(selectedTemplate.showSchoolContact ?? true) && (
                  <p className="text-[10px] text-slate-500">
                    {GD_GOENKA_SCHOOL_META.address} | Ph: {GD_GOENKA_SCHOOL_META.phone}
                  </p>
                )}
                {(selectedTemplate.showDocTitle ?? true) && (
                  <div className="pt-1 flex justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-300">
                      {currentStageInfo.docTitle}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. STUDENT PROFILE & PHOTO SECTION */}
            {(selectedTemplate.showStudentBasicInfo ?? true) && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="md:col-span-9 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <p><strong>Student Name:</strong> <span className="font-bold text-indigo-900">Ankur Sharma</span></p>
                  <p><strong>Admission No:</strong> ADM-2025-882</p>
                  <p><strong>Roll No:</strong> Roll #12</p>
                  <p><strong>Class & Section:</strong> {currentStageInfo.classes[0]} - A</p>
                  {(selectedTemplate.showParentDetails ?? true) && (
                    <>
                      <p><strong>Mother's Name:</strong> Mrs. Sunita Sharma</p>
                      <p><strong>Father's Name:</strong> Mr. Rajesh Sharma</p>
                    </>
                  )}
                  {(selectedTemplate.showHouseName ?? true) && (
                    <p><strong>House:</strong> Tagore House</p>
                  )}
                </div>

                {(selectedTemplate.showStudentPhoto ?? true) && (
                  <div className="md:col-span-3 p-1 bg-white rounded border text-center flex items-center justify-center">
                    <div className="h-16 w-full bg-slate-100 rounded flex items-center justify-center font-bold text-[9px] text-slate-400">
                      STUDENT PHOTO
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PARENT PHOTOS GRID (PRE-PRIMARY HPC) */}
            {isHpcTrack && (selectedTemplate.showParentPhotos ?? true) && (
              <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-2.5 rounded border border-emerald-200 text-center">
                <div className="p-1 bg-white rounded border"><div className="h-12 bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400">STUDENT</div></div>
                <div className="p-1 bg-white rounded border"><div className="h-12 bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400">MOTHER</div></div>
                <div className="p-1 bg-white rounded border"><div className="h-12 bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400">FATHER</div></div>
              </div>
            )}

            {/* 4. ALL ABOUT ME (HPC) */}
            {isHpcTrack && (selectedTemplate.showAllAboutMe ?? true) && (
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[10px] space-y-1">
                <p className="font-bold text-amber-900 uppercase">Personal Favorites (All About Me):</p>
                <div className="grid grid-cols-4 gap-2 text-center font-semibold text-amber-950">
                  <div className="bg-white p-1 rounded border">Fav Color: Blue</div>
                  <div className="bg-white p-1 rounded border">Fav Food: Pasta</div>
                  <div className="bg-white p-1 rounded border">Fav Animal: Dog</div>
                  <div className="bg-white p-1 rounded border">Fav Game: Football</div>
                </div>
              </div>
            )}

            {/* 5. HEALTH & ATTENDANCE */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {(selectedTemplate.showAttendance ?? true) && (
                <div className="p-2 bg-slate-50 rounded border">
                  <p className="font-bold text-slate-800">Attendance Log:</p>
                  <p>Term 1: 88 / 95 Days | Term 2: 92 / 100 Days</p>
                </div>
              )}
              {(selectedTemplate.showHealthStatus ?? true) && (
                <div className="p-2 bg-slate-50 rounded border">
                  <p className="font-bold text-slate-800">Physical Health Status:</p>
                  <p>Height: 128 cm | Weight: 26 kg</p>
                </div>
              )}
            </div>

            {/* 6. ACADEMIC SCHOLASTIC MARKS TABLE (ACADEMIC TRACK) */}
            {!isHpcTrack && (selectedTemplate.showScholasticTable ?? true) && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase text-[10px]">Scholastic Assessment Table:</p>
                <table className="w-full border text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b font-bold text-slate-800 text-center">
                      <th className="p-1.5 border text-left">Subject</th>
                      {(selectedTemplate.showTerm1Breakdown ?? true) && <th className="p-1.5 border">Term I (50)</th>}
                      {(selectedTemplate.showTerm2Breakdown ?? true) && <th className="p-1.5 border">Term II (50)</th>}
                      {(selectedTemplate.showAggregateAndGrade ?? true) && (
                        <>
                          <th className="p-1.5 border bg-blue-50">Agg. Total</th>
                          <th className="p-1.5 border bg-emerald-50">Grade</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y text-center">
                    <tr>
                      <td className="p-1.5 border text-left font-bold">English</td>
                      {(selectedTemplate.showTerm1Breakdown ?? true) && <td className="p-1.5 border">46</td>}
                      {(selectedTemplate.showTerm2Breakdown ?? true) && <td className="p-1.5 border">47</td>}
                      {(selectedTemplate.showAggregateAndGrade ?? true) && (
                        <>
                          <td className="p-1.5 border font-bold text-blue-900 bg-blue-50">46.5 / 50</td>
                          <td className="p-1.5 border font-bold text-emerald-700 bg-emerald-50">A1</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <td className="p-1.5 border text-left font-bold">Mathematics</td>
                      {(selectedTemplate.showTerm1Breakdown ?? true) && <td className="p-1.5 border">48</td>}
                      {(selectedTemplate.showTerm2Breakdown ?? true) && <td className="p-1.5 border">49</td>}
                      {(selectedTemplate.showAggregateAndGrade ?? true) && (
                        <>
                          <td className="p-1.5 border font-bold text-blue-900 bg-blue-50">48.5 / 50</td>
                          <td className="p-1.5 border font-bold text-emerald-700 bg-emerald-50">A1</td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. NCF COMPETENCY MATRIX (HPC TRACK) */}
            {isHpcTrack && (selectedTemplate.showNcfCompetencyMatrix ?? true) && (
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase text-[10px]">NCF Competency Assessment Matrix:</p>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[10px] space-y-1">
                  <p className="font-bold text-emerald-950">Goal 1 (Health & Physical Well-being): 🌳 PROFICIENT</p>
                  <p className="font-bold text-emerald-950">Goal 8 (Cognitive & Mathematical Development): 🌿 PROGRESSING</p>
                </div>
              </div>
            )}

            {/* 8. CO-SCHOLASTIC & SOFT SKILLS */}
            {(selectedTemplate.showCoScholastic ?? true) && (
              <div className="p-2 bg-slate-50 rounded border text-[10px] space-y-1">
                <p className="font-bold text-slate-800 uppercase">Co-Scholastic & Soft Skills (3-Point Scale):</p>
                <p>Art Education: Grade A | Work Education: Grade A | Health & Physical Ed: Grade A</p>
                {(selectedTemplate.showSoftSkillsSocial ?? true) && (
                  <p className="text-slate-600">Social Skills: Courtesy (A), Discipline (A), Punctuality (A)</p>
                )}
              </div>
            )}

            {/* 9. TEACHER REMARKS & RESULT STATUS */}
            {(selectedTemplate.showTeacherRemarks ?? true) && (
              <div className="p-2 bg-blue-50/60 rounded border border-blue-200 text-[10px]">
                <p className="font-bold text-blue-900">Class Teacher's Remarks:</p>
                <p className="italic text-slate-700">"An outstanding and disciplined student who excels in both academics and co-curricular tasks. Promoted to next class!"</p>
              </div>
            )}

            {/* 10. SIGNATURES & VALIDATION QR CODE */}
            <div className="pt-4 border-t flex items-end justify-between text-[10px] font-bold text-slate-700">
              {(selectedTemplate.showClassTeacherSign ?? true) && (
                <div className="text-center">
                  <div className="w-20 border-b border-slate-400 mb-0.5"></div>
                  <p>Class Teacher</p>
                </div>
              )}

              {(selectedTemplate.showPrincipalSignature ?? true) && (
                <div className="text-center">
                  <div className="w-20 border-b border-slate-400 mb-0.5"></div>
                  <p>Principal</p>
                </div>
              )}

              {(selectedTemplate.showParentSign ?? true) && (
                <div className="text-center">
                  <div className="w-20 border-b border-slate-400 mb-0.5"></div>
                  <p>Parent Sign</p>
                </div>
              )}

              {(selectedTemplate.showQrCode ?? true) && (
                <div className="p-1 bg-white border rounded text-center">
                  <QrCode className="w-8 h-8 text-slate-800 mx-auto" />
                  <span className="text-[7px] text-slate-500 block">SCAN TO VERIFY</span>
                </div>
              )}
            </div>

            {/* 11. FOOTER DISCLAIMER */}
            {(selectedTemplate.showFooterText ?? true) && (
              <p className="text-[8px] text-slate-400 text-center border-t pt-1">
                {selectedTemplate.footerText}
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
