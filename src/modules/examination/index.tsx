import React, { useState } from 'react';
import { useExamStore } from './examStore';
import { ExamTypesSetup } from './ExamTypesSetup';
import { SubjectConfigView } from './SubjectConfigView';
import { MarksEntryGrid } from './MarksEntryGrid';
import { ReportCardDesigner } from './ReportCardDesigner';
import { ReportCardPreviewModal } from './ReportCardPreviewModal';
import { ExamAnalyticsView } from './ExamAnalyticsView';
import { ExamWeightageSetup } from './ExamWeightageSetup';
import { ExamTimetableDatesheet } from './ExamTimetableDatesheet';
import { useSisStore } from '../sis/sisStore';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, Edit3, Layout, TrendingUp, Calculator, Calendar } from 'lucide-react';

export const ExaminationModule: React.FC = () => {
  const {
    examTypes,
    addExamType,
    updateExamType,
    deleteExamType,
    subjects,
    addSubject,
    updateSubject,
    marksheets,
    syncStatus,
    autoSaveStatus,
    saveStudentMark,
    syncMarksheetBatch,
    toggleMarksheetLock,
    reportTemplates,
    saveReportTemplate
  } = useExamStore();

  const { students } = useSisStore();
  const { activeRole, logActivity, isSubSectionAllowed } = useAuth();

  // Determine allowed sub-sections for current role / user
  const canMarksEntry = isSubSectionAllowed('exam_marks_entry');
  const canExamSetup = isSubSectionAllowed('exam_setup');
  const canExamTimetable = isSubSectionAllowed('exam_timetable');
  const canDesigner = isSubSectionAllowed('exam_designer');
  const canAnalytics = isSubSectionAllowed('exam_analytics');
  const canSubjects = isSubSectionAllowed('exam_subjects');

  // Compute default active tab
  const getInitialTab = (): 'marks' | 'timetable' | 'weightage' | 'designer' | 'analytics' | 'types' | 'subjects' => {
    if (canMarksEntry) return 'marks';
    if (canExamTimetable) return 'timetable';
    if (canAnalytics) return 'analytics';
    if (canExamSetup) return 'weightage';
    if (canDesigner) return 'designer';
    return 'marks';
  };

  const [activeTab, setActiveTab] = useState<'marks' | 'timetable' | 'weightage' | 'designer' | 'analytics' | 'types' | 'subjects'>(getInitialTab);
  const [previewTemplateModal, setPreviewTemplateModal] = useState<any | null>(null);

  const handleUpdateExamTypesList = (updated: any[]) => {
    updated.forEach((e) => updateExamType(e.id, e));
    logActivity('UPDATE_EXAM_WEIGHTAGES', 'Examination', 'Updated exam report card weightage calculation settings');
  };

  return (
    <div className="space-y-6">
      {/* Live Sync Status Notification Banner */}
      {syncStatus && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg text-sm font-semibold shadow-md flex items-center justify-between animate-fadeIn">
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {canMarksEntry && (
          <button
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'marks'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" /> Marks Entry Grid
          </button>
        )}

        {canExamTimetable && (
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'timetable'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" /> Exam Timetable & Datesheets
          </button>
        )}

        {canExamSetup && (
          <button
            onClick={() => setActiveTab('weightage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'weightage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-300" /> Exam Weightage & Calculation Setup
          </button>
        )}

        {canDesigner && (
          <button
            onClick={() => setActiveTab('designer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'designer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layout className="w-4 h-4" /> Report Card Designer
          </button>
        )}

        {canAnalytics && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Rankings & Analytics
          </button>
        )}

        {canExamSetup && (
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'types'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> Exam Types Setup
          </button>
        )}

        {canSubjects && (
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Subjects Catalog
          </button>
        )}
      </div>

      {activeTab === 'marks' && canMarksEntry && (
        <MarksEntryGrid
          examTypes={examTypes}
          subjects={subjects}
          students={students}
          marksheets={marksheets}
          autoSaveStatus={autoSaveStatus}
          onSaveMark={saveStudentMark}
          onSyncMarksBatch={syncMarksheetBatch}
          onToggleLock={(msId, user) => {
            toggleMarksheetLock(msId, user);
            logActivity('TOGGLE_MARKS_LOCK', 'Examination', `Toggled lock for marksheet ${msId}`);
          }}
          currentUserRole={activeRole}
        />
      )}

      {activeTab === 'timetable' && canExamTimetable && (
        <ExamTimetableDatesheet />
      )}

      {activeTab === 'weightage' && canExamSetup && (
        <ExamWeightageSetup
          examTypes={examTypes}
          students={students}
          onUpdateExamTypes={handleUpdateExamTypesList}
        />
      )}

      {activeTab === 'designer' && canDesigner && (
        <ReportCardDesigner
          templates={reportTemplates}
          onSaveTemplate={saveReportTemplate}
          onPreviewTemplate={(tpl) => setPreviewTemplateModal(tpl)}
        />
      )}

      {activeTab === 'analytics' && canAnalytics && <ExamAnalyticsView students={students} />}

      {activeTab === 'types' && canExamSetup && (
        <ExamTypesSetup
          examTypes={examTypes}
          onAddExamType={addExamType}
          onUpdateExamType={updateExamType}
          onDeleteExamType={deleteExamType}
        />
      )}

      {activeTab === 'subjects' && canSubjects && (
        <SubjectConfigView
          subjects={subjects}
          onAddSubject={addSubject}
          onUpdateSubject={updateSubject}
        />
      )}

      {previewTemplateModal && (
        <ReportCardPreviewModal
          template={previewTemplateModal}
          student={students[0]}
          onClose={() => setPreviewTemplateModal(null)}
        />
      )}
    </div>
  );
};
