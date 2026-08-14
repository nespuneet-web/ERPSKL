import React, { useState } from 'react';
import { useExamStore } from './examStore';
import { ExamTypesSetup } from './ExamTypesSetup';
import { SubjectConfigView } from './SubjectConfigView';
import { MarksEntryGrid } from './MarksEntryGrid';
import { ReportCardDesigner } from './ReportCardDesigner';
import { ReportCardPreviewModal } from './ReportCardPreviewModal';
import { ExamAnalyticsView } from './ExamAnalyticsView';
import { ExamWeightageSetup } from './ExamWeightageSetup';
import { useSisStore } from '../sis/sisStore';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, Edit3, Layout, TrendingUp, Calculator } from 'lucide-react';

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
  const { activeRole, logActivity } = useAuth();

  const [activeTab, setActiveTab] = useState<'marks' | 'weightage' | 'designer' | 'analytics' | 'types' | 'subjects'>('marks');
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
      </div>

      {activeTab === 'marks' && (
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

      {activeTab === 'weightage' && (
        <ExamWeightageSetup
          examTypes={examTypes}
          students={students}
          onUpdateExamTypes={handleUpdateExamTypesList}
        />
      )}

      {activeTab === 'designer' && (
        <ReportCardDesigner
          templates={reportTemplates}
          onSaveTemplate={saveReportTemplate}
          onPreviewTemplate={(tpl) => setPreviewTemplateModal(tpl)}
        />
      )}

      {activeTab === 'analytics' && <ExamAnalyticsView students={students} />}

      {activeTab === 'types' && (
        <ExamTypesSetup
          examTypes={examTypes}
          onAddExamType={addExamType}
          onUpdateExamType={updateExamType}
          onDeleteExamType={deleteExamType}
        />
      )}

      {activeTab === 'subjects' && (
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
