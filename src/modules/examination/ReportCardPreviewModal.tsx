import React, { useState } from 'react';
import { ReportCardTemplate } from '../../types/examination';
import { Student } from '../../types/sis';
import { useSisStore } from '../sis/sisStore';
import {
  GD_GOENKA_SCHOOL_META,
  EDUCATIONAL_STAGES,
  EducationalStageId,
  NCF_CURRICULUM_GOALS,
  SAMPLE_HPC_DATA,
  SAMPLE_CO_SCHOLASTIC_DATA
} from './gdGoenkaData';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Search,
  ListFilter,
  Smile
} from 'lucide-react';

interface ReportCardPreviewModalProps {
  template: ReportCardTemplate;
  student?: Student;
  onClose: () => void;
}

export const ReportCardPreviewModal: React.FC<ReportCardPreviewModalProps> = ({
  template,
  student: initialStudent,
  onClose
}) => {
  const { students } = useSisStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Active Student selection
  const [activeStudentId, setActiveStudentId] = useState<string>(
    initialStudent?.id || students.find((s) => s.fullName.includes('Ankur'))?.id || students[0]?.id || ''
  );

  const activeStudent = students.find((s) => s.id === activeStudentId) || initialStudent || students[0];

  // Helper to detect default Educational Stage from student's current class
  const detectStageFromClass = (className: string): EducationalStageId => {
    if (['Playgroup', 'Nursery', 'LKG', 'UKG'].some((c) => className.includes(c))) return 'STAGE_A';
    if (['Class 1', 'Class 2'].some((c) => className.includes(c))) return 'STAGE_B';
    if (['Class 3', 'Class 4', 'Class 5'].some((c) => className.includes(c))) return 'STAGE_C';
    if (['Class 6', 'Class 7', 'Class 8'].some((c) => className.includes(c))) return 'STAGE_D';
    if (['Class 9', 'Class 10'].some((c) => className.includes(c))) return 'STAGE_E_SEC';
    return 'STAGE_E_SR';
  };

  const [activeStageId, setActiveStageId] = useState<EducationalStageId>(detectStageFromClass(activeStudent.currentClass));
  const [activePageTab, setActivePageTab] = useState<'PAGE_1' | 'PAGE_2'>('PAGE_1'); // For HPC or Academic Front/Back

  // Update stage whenever active student changes
  const handleStudentChange = (stId: string) => {
    setActiveStudentId(stId);
    const found = students.find((s) => s.id === stId);
    if (found) {
      setActiveStageId(detectStageFromClass(found.currentClass));
    }
  };

  const currentStageInfo = EDUCATIONAL_STAGES.find((s) => s.id === activeStageId) || EDUCATIONAL_STAGES[2];
  const isHpcTrack = currentStageInfo.track === 'HPC';

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      s.fullName.toLowerCase().includes(q) ||
      s.rollNo.toString().includes(q) ||
      s.admissionNo.toLowerCase().includes(q);
    const matchesClass = selectedClassFilter === 'ALL' || s.currentClass === selectedClassFilter;
    return matchesQuery && matchesClass;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative my-6 space-y-5">
        
        {/* TOP TOOLBAR */}
        <div className="flex flex-col gap-4 border-b pb-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-indigo-700" />
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  {GD_GOENKA_SCHOOL_META.schoolName} — Report Card & HPC Engine
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {GD_GOENKA_SCHOOL_META.tagline} • {GD_GOENKA_SCHOOL_META.session}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Report Card
              </button>

              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Filters Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Roll No, Student Name, or Adm No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg text-slate-900 font-medium"
              >
                <option value="ALL">All Classes & Sections</option>
                <option value="Playgroup">Playgroup / Nursery</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <select
                value={activeStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900"
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} — Roll #{st.rollNo} ({st.currentClass}-{st.section}) [Adm: {st.admissionNo}]
                    </option>
                  ))
                ) : (
                  <option value="">No students found</option>
                )}
              </select>
            </div>
          </div>

          {/* EDUCATIONAL STAGES SELECTOR BAR */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {EDUCATIONAL_STAGES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStageId(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeStageId === st.id
                      ? st.track === 'HPC'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st.title.split(':')[0]}
                </button>
              ))}
            </div>

            {/* Page View Toggle */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg shrink-0 text-xs font-bold">
              <button
                onClick={() => setActivePageTab('PAGE_1')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activePageTab === 'PAGE_1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {isHpcTrack ? 'Page 1: Profile & Feedback' : 'Front Page: Academic Marks'}
              </button>
              <button
                onClick={() => setActivePageTab('PAGE_2')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activePageTab === 'PAGE_2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {isHpcTrack ? 'Page 2: NCF Matrix' : 'Back Page: Co-Scholastic & Soft Skills'}
              </button>
            </div>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CANVAS */}
        <div className="border-4 p-8 rounded-xl space-y-6 relative bg-white text-slate-900" style={{ borderColor: template.primaryColor }}>
          
          {/* WATERMARK OVERLAY */}
          {(template.showWatermark ?? true) && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-25deg] pointer-events-none select-none text-4xl font-extrabold uppercase">
              {template.watermarkText || 'GD GOENKA AGRA OFFICIAL REPORT'}
            </div>
          )}

          {/* COMMON BRAND HEADER */}
          {(template.showSchoolHeader ?? true) && (
            <div className="text-center border-b pb-4 space-y-1" style={{ borderColor: template.primaryColor }}>
              <h1 className="text-2xl font-black uppercase tracking-wider" style={{ color: template.primaryColor }}>
                {template.headerTitle || GD_GOENKA_SCHOOL_META.schoolName}
              </h1>
              {(template.showTagline ?? true) && (
                <p className="text-xs font-bold text-slate-600 tracking-wide">{template.schoolMotto || GD_GOENKA_SCHOOL_META.tagline}</p>
              )}
              {(template.showSchoolContact ?? true) && (
                <p className="text-[11px] text-slate-500">
                  {GD_GOENKA_SCHOOL_META.address} | Ph: {GD_GOENKA_SCHOOL_META.phone} | Email: {GD_GOENKA_SCHOOL_META.email}
                </p>
              )}
              
              {(template.showDocTitle ?? true) && (
                <div className="pt-2 flex justify-center">
                  <span className="text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-800 px-5 py-1.5 rounded-md border border-slate-300">
                    {currentStageInfo.docTitle}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TRACK 1: HOLISTIC PROGRESS CARD (HPC) */}
          {isHpcTrack ? (
            activePageTab === 'PAGE_1' ? (
              /* HPC PAGE 1 */
              <div className="space-y-6">
                
                {/* 3-PHOTOS GRID & STUDENT DETAILS */}
                {(template.showStudentBasicInfo ?? true) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {(template.showParentPhotos ?? true) ? (
                      <div className="md:col-span-5 grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded border border-slate-300 text-center space-y-1">
                          <div className="h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                            {activeStudent.photoUrl && (template.showStudentPhoto ?? true) ? (
                              <img src={activeStudent.photoUrl} alt="Student" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400">STUDENT</span>
                            )}
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-700 block uppercase">Student</span>
                        </div>

                        <div className="p-2 bg-white rounded border border-slate-300 text-center space-y-1">
                          <div className="h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                            <span className="text-[9px] font-bold text-slate-400">MOTHER</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-700 block uppercase">Mother</span>
                        </div>

                        <div className="p-2 bg-white rounded border border-slate-300 text-center space-y-1">
                          <div className="h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                            <span className="text-[9px] font-bold text-slate-400">FATHER</span>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-700 block uppercase">Father</span>
                        </div>
                      </div>
                    ) : (template.showStudentPhoto ?? true) ? (
                      <div className="md:col-span-3 p-2 bg-white rounded border border-slate-300 text-center space-y-1">
                        <div className="h-24 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                          {activeStudent.photoUrl ? (
                            <img src={activeStudent.photoUrl} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">STUDENT PHOTO</span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <div className={`${(template.showParentPhotos ?? true) ? 'md:col-span-7' : 'md:col-span-12'} grid grid-cols-2 gap-x-4 gap-y-1 text-xs`}>
                      <p><strong>Student Name:</strong> <span className="font-bold text-emerald-800">{activeStudent.fullName}</span></p>
                      <p><strong>Admission No:</strong> {activeStudent.admissionNo}</p>
                      <p><strong>Class & Section:</strong> <span className="font-bold">{activeStudent.currentClass} - {activeStudent.section}</span></p>
                      <p><strong>Roll No:</strong> Roll #{activeStudent.rollNo}</p>
                      {(template.showParentDetails ?? true) && (
                        <>
                          <p><strong>Mother's Name:</strong> {activeStudent.parents.motherName}</p>
                          <p><strong>Father's Name:</strong> {activeStudent.parents.fatherName}</p>
                        </>
                      )}
                      <p><strong>Date of Birth:</strong> {activeStudent.dob}</p>
                      <p><strong>Address:</strong> <span className="truncate block">{activeStudent.parents.address}</span></p>
                    </div>
                  </div>
                )}

                {/* ALL ABOUT ME SECTION */}
                {(template.showAllAboutMe ?? true) && (
                  <div className="border rounded-xl p-4 bg-amber-50/50 border-amber-200 space-y-2 text-xs">
                    <h3 className="font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Smile className="w-4 h-4 text-amber-600" /> All About Me (Personal Favorites)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-amber-950 font-medium">
                      <div className="p-2 bg-white rounded border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">Favorite Color</span>
                        <p className="font-bold">{SAMPLE_HPC_DATA.allAboutMe.favoriteColor}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">Favorite Food</span>
                        <p className="font-bold">{SAMPLE_HPC_DATA.allAboutMe.favoriteFood}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">Favorite Animal</span>
                        <p className="font-bold">{SAMPLE_HPC_DATA.allAboutMe.favoriteAnimal}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">Favorite Game</span>
                        <p className="font-bold">{SAMPLE_HPC_DATA.allAboutMe.favoriteGame}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ATTENDANCE TABLE & HEALTH STATUS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {(template.showAttendance ?? true) && (
                    <div className="md:col-span-8 space-y-1">
                      <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Attendance Log</h4>
                      <table className="w-full border text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b font-bold">
                            <th className="p-2 border">Attendance Metric</th>
                            <th className="p-2 border text-center">Term I</th>
                            <th className="p-2 border text-center">Term II</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="p-2 border font-medium">I Was Present For</td>
                            <td className="p-2 border text-center font-bold text-emerald-700">{SAMPLE_HPC_DATA.attendance.term1Present} Days</td>
                            <td className="p-2 border text-center font-bold text-emerald-700">{SAMPLE_HPC_DATA.attendance.term2Present} Days</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-medium">School Was Opened For</td>
                            <td className="p-2 border text-center font-bold">{SAMPLE_HPC_DATA.attendance.term1TotalDays} Days</td>
                            <td className="p-2 border text-center font-bold">{SAMPLE_HPC_DATA.attendance.term2TotalDays} Days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(template.showHealthStatus ?? true) && (
                    <div className="md:col-span-4 space-y-1">
                      <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Physical Health Status</h4>
                      <div className="p-3 bg-slate-50 rounded border space-y-2 text-xs">
                        <p><strong>Height:</strong> {SAMPLE_HPC_DATA.healthStatus.heightCms} cm</p>
                        <p><strong>Weight:</strong> {SAMPLE_HPC_DATA.healthStatus.weightKgs} kg</p>
                        <p><strong>Vaccination Status:</strong> <span className="font-bold text-emerald-700">{SAMPLE_HPC_DATA.parentFeedback.vaccinationStatus}</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MULTI-STAKEHOLDER FEEDBACK */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider border-b pb-1">
                    Multi-Stakeholder Feedback & Observational Forms
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {(template.showParentFeedback ?? true) && (
                      <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                        <h4 className="font-bold text-indigo-900 border-b pb-1">Parent's Feedback</h4>
                        <p><strong>Enjoys participating in:</strong> {SAMPLE_HPC_DATA.parentFeedback.enjoysParticipatingIn}</p>
                        <p><strong>Can be supported for:</strong> {SAMPLE_HPC_DATA.parentFeedback.canBeSupportedFor}</p>
                        <p><strong>Parent's remarks:</strong> {SAMPLE_HPC_DATA.parentFeedback.additionalSharing}</p>
                      </div>
                    )}

                    {(template.showSelfAssessment ?? true) && (
                      <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                        <h4 className="font-bold text-indigo-900 border-b pb-1">Child's Self-Assessment</h4>
                        <p><strong>Activities I enjoy most:</strong> {SAMPLE_HPC_DATA.selfAssessment.enjoysMost}</p>
                        <p><strong>Find difficult to do:</strong> {SAMPLE_HPC_DATA.selfAssessment.findsDifficult}</p>
                        <p><strong>Enjoy with friends:</strong> {SAMPLE_HPC_DATA.selfAssessment.enjoysWithFriends}</p>
                      </div>
                    )}

                    {(template.showPeerAssessment ?? true) && (
                      <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                        <h4 className="font-bold text-indigo-900 border-b pb-1">Peer-Assessment</h4>
                        <p><strong>Task Completion Help:</strong> {SAMPLE_HPC_DATA.peerAssessment.helpsInTasks}</p>
                        <p><strong>Group Play:</strong> {SAMPLE_HPC_DATA.peerAssessment.likesToPlayWithOthers}</p>
                        <p><strong>Sharing Habit:</strong> {SAMPLE_HPC_DATA.peerAssessment.sharesStationery}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* HPC PAGE 2: NCF COMPETENCY MATRIX */
              <div className="space-y-5">
                {(template.showPortfolioNote ?? true) && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-950 flex items-center justify-between">
                    <span>Encl. Learner's Portfolio i.e. selected work done by the student in experiential tasks.</span>
                    <span className="px-2.5 py-1 bg-indigo-700 text-white rounded text-[10px] font-bold uppercase">NCF-SE Aligned</span>
                  </div>
                )}

                {/* 3-LEVEL GRADING LEGEND */}
                <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-around text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-800">🌱 BEGINNER (Level 1)</span>
                  <span className="flex items-center gap-1.5 text-emerald-800">🌿 PROGRESSING (Level 2)</span>
                  <span className="flex items-center gap-1.5 text-indigo-800">🌳 PROFICIENT (Level 3)</span>
                </div>

                {/* NCF 13-GOAL MATRIX TABLE */}
                {(template.showNcfCompetencyMatrix ?? true) && (
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 uppercase text-xs">Curriculum Goals Competency Tracking Table</h3>
                    <table className="w-full border text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b font-bold text-slate-800">
                          <th className="p-2 border w-12 text-center">T1</th>
                          <th className="p-2 border">Curricular Goals & Competency Descriptors</th>
                          <th className="p-2 border w-12 text-center">T2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {NCF_CURRICULUM_GOALS.map((goal) => {
                          const ratings = SAMPLE_HPC_DATA.competencyRatings[goal.goalId] || { term1: 'PROGRESSING', term2: 'PROFICIENT' };
                          return (
                            <tr key={goal.goalId} className="hover:bg-slate-50">
                              <td className="p-2 border text-center font-bold text-base">{ratings.term1 === 'PROFICIENT' ? '🌳' : ratings.term1 === 'PROGRESSING' ? '🌿' : '🌱'}</td>
                              <td className="p-2 border">
                                <span className="font-bold text-slate-900">{goal.goalNumber}: {goal.domainName}</span>
                                <p className="text-[11px] text-slate-600 mt-0.5">{goal.competencies.join(', ')}</p>
                              </td>
                              <td className="p-2 border text-center font-bold text-base">{ratings.term2 === 'PROFICIENT' ? '🌳' : ratings.term2 === 'PROGRESSING' ? '🌿' : '🌱'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          ) : (
            /* TRACK 2: ACADEMIC REPORT CARD (CLASS III TO XII) */
            activePageTab === 'PAGE_1' ? (
              /* ACADEMIC FRONT PAGE */
              <div className="space-y-6">
                
                {/* STUDENT PROFILE HEADER */}
                {(template.showStudentBasicInfo ?? true) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    {(template.showStudentPhoto ?? true) && (
                      <div className="md:col-span-3 p-2 bg-white rounded border text-center">
                        <div className="h-24 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                          {activeStudent.photoUrl ? (
                            <img src={activeStudent.photoUrl} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">STUDENT PHOTO</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`${(template.showStudentPhoto ?? true) ? 'md:col-span-9' : 'md:col-span-12'} grid grid-cols-2 gap-x-4 gap-y-1.5`}>
                      <p><strong>Student Name:</strong> <span className="font-bold text-blue-900">{activeStudent.fullName}</span></p>
                      <p><strong>Admission No:</strong> {activeStudent.admissionNo}</p>
                      <p><strong>Roll No:</strong> Roll #{activeStudent.rollNo}</p>
                      <p><strong>Class & Section:</strong> <span className="font-bold">{activeStudent.currentClass} - {activeStudent.section}</span></p>
                      {(template.showParentDetails ?? true) && (
                        <>
                          <p><strong>Mother's Name:</strong> {activeStudent.parents.motherName}</p>
                          <p><strong>Father's Name:</strong> {activeStudent.parents.fatherName}</p>
                        </>
                      )}
                      <p><strong>Date of Birth:</strong> {activeStudent.dob}</p>
                      {(template.showHouseName ?? true) && <p><strong>House:</strong> Tagore House</p>}
                    </div>
                  </div>
                )}

                {/* DYNAMIC ACADEMIC MARKS TABLE BASED ON STAGE */}
                {(template.showScholasticTable ?? true) && (
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 uppercase text-xs tracking-wider">
                      Scholastic Assessment Performance (Session 2025-26)
                    </h3>

                    {/* STAGE C (CLASS III - V): 50 MARKS PATTERN */}
                    {activeStageId === 'STAGE_C' && (
                      <table className="w-full border text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b font-bold text-slate-800 text-center">
                            <th className="p-2 border text-left">Subject</th>
                            {(template.showTerm1Breakdown ?? true) && <th className="p-2 border">Term I (50)</th>}
                            {(template.showTerm2Breakdown ?? true) && (
                              <>
                                <th className="p-2 border">Periodic Test (2.5)</th>
                                <th className="p-2 border">Multiple Ass. (2.5)</th>
                                <th className="p-2 border">Portfolio (2.5)</th>
                                <th className="p-2 border">Sub Enrichment (2.5)</th>
                                <th className="p-2 border">Annual Exam (40)</th>
                                <th className="p-2 border bg-slate-200">Term II (50)</th>
                              </>
                            )}
                            {(template.showAggregateAndGrade ?? true) && (
                              <>
                                <th className="p-2 border bg-blue-50">Agg. (T1+T2)/2</th>
                                <th className="p-2 border bg-emerald-50">Grade</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y text-center">
                          {['English', 'Hindi', 'Mathematics', 'Environmental Studies'].map((subj) => (
                            <tr key={subj}>
                              <td className="p-2 border text-left font-bold">{subj}</td>
                              {(template.showTerm1Breakdown ?? true) && <td className="p-2 border font-semibold">46</td>}
                              {(template.showTerm2Breakdown ?? true) && (
                                <>
                                  <td className="p-2 border">2.5</td>
                                  <td className="p-2 border">2.5</td>
                                  <td className="p-2 border">2.4</td>
                                  <td className="p-2 border">2.5</td>
                                  <td className="p-2 border">37.5</td>
                                  <td className="p-2 border font-bold bg-slate-100">47.4 / 50</td>
                                </>
                              )}
                              {(template.showAggregateAndGrade ?? true) && (
                                <>
                                  <td className="p-2 border font-extrabold text-blue-900 bg-blue-50">46.7 / 50</td>
                                  <td className="p-2 border font-extrabold text-emerald-800 bg-emerald-50">A1</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* STAGE D & E (CLASS VI - X): 100 MARKS PATTERN */}
                    {(activeStageId === 'STAGE_D' || activeStageId === 'STAGE_E_SEC') && (
                      <table className="w-full border text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b font-bold text-slate-800 text-center">
                            <th className="p-2 border text-left">Subject</th>
                            {(template.showTerm1Breakdown ?? true) && <th className="p-2 border">Term I (100)</th>}
                            {(template.showTerm2Breakdown ?? true) && (
                              <>
                                <th className="p-2 border">Periodic Test (5)</th>
                                <th className="p-2 border">Multiple Ass. (5)</th>
                                <th className="p-2 border">Portfolio (5)</th>
                                <th className="p-2 border">Sub Enrichment (5)</th>
                                <th className="p-2 border">Annual Exam (80)</th>
                                <th className="p-2 border bg-slate-200">Term II (100)</th>
                              </>
                            )}
                            {(template.showAggregateAndGrade ?? true) && (
                              <>
                                <th className="p-2 border bg-blue-50">Agg. (T1+T2)/2</th>
                                <th className="p-2 border bg-emerald-50">Grade</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y text-center">
                          {['English', 'Hindi / Sanskrit', 'Mathematics', 'Science', 'Social Science', 'Information Technology'].map((subj) => (
                            <tr key={subj}>
                              <td className="p-2 border text-left font-bold">{subj}</td>
                              {(template.showTerm1Breakdown ?? true) && <td className="p-2 border font-semibold">91</td>}
                              {(template.showTerm2Breakdown ?? true) && (
                                <>
                                  <td className="p-2 border">5.0</td>
                                  <td className="p-2 border">4.8</td>
                                  <td className="p-2 border">4.9</td>
                                  <td className="p-2 border">5.0</td>
                                  <td className="p-2 border">74.5</td>
                                  <td className="p-2 border font-bold bg-slate-100">94.2 / 100</td>
                                </>
                              )}
                              {(template.showAggregateAndGrade ?? true) && (
                                <>
                                  <td className="p-2 border font-extrabold text-blue-900 bg-blue-50">92.6 / 100</td>
                                  <td className="p-2 border font-extrabold text-emerald-800 bg-emerald-50">A1</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* OVERALL PERCENTAGE & GRADE FOOTER ROW */}
                    <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border text-xs font-black">
                      {(template.showOverallPercentage ?? true) && (
                        <span className="text-blue-900">OVERALL PERCENTAGE: 93.4%</span>
                      )}
                      {(template.showOverallGrade ?? true) && (
                        <span className="text-emerald-800">OVERALL GRADE: A1 (OUTSTANDING)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* VOCATIONAL AREAS TABLE */}
                {(template.showVocationalAreas ?? true) && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 uppercase text-xs">Vocational Areas & Optional Subjects</h4>
                    <table className="w-full border text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b font-bold">
                          <th className="p-2 border">Subject / Area</th>
                          <th className="p-2 border text-center">Term II Marks</th>
                          <th className="p-2 border text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {SAMPLE_CO_SCHOLASTIC_DATA.vocationalAreas.map((voc) => (
                          <tr key={voc.name}>
                            <td className="p-2 border font-medium">{voc.name}</td>
                            <td className="p-2 border text-center font-bold">{voc.term2Score} / {voc.maxScore}</td>
                            <td className="p-2 border text-center font-bold text-emerald-700">{voc.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            ) : (
              /* ACADEMIC BACK PAGE: CO-SCHOLASTIC, SOFT SKILLS & HEALTH */
              <div className="space-y-6">
                
                {/* CO-SCHOLASTIC AREAS */}
                {(template.showCoScholastic ?? true) && (
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 uppercase text-xs">Co-Scholastic Areas (3-Point Scale: A, B, C)</h3>
                    <table className="w-full border text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b font-bold">
                          <th className="p-2 border">Area</th>
                          <th className="p-2 border text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {SAMPLE_CO_SCHOLASTIC_DATA.coScholasticAreas.map((item) => (
                          <tr key={item.name}>
                            <td className="p-2 border font-bold">{item.name}</td>
                            <td className="p-2 border text-center font-black text-emerald-800">{item.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SOFT SKILLS (SOCIAL & WORK HABITS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {(template.showSoftSkillsSocial ?? true) && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 uppercase text-[11px]">Soft Skills - Social Skills</h4>
                      <table className="w-full border text-left border-collapse">
                        <tbody className="divide-y">
                          {SAMPLE_CO_SCHOLASTIC_DATA.socialSkills.map((item) => (
                            <tr key={item.name}>
                              <td className="p-1.5 border">{item.name}</td>
                              <td className="p-1.5 border text-center font-bold text-emerald-800 w-12">{item.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(template.showSoftSkillsWorkHabits ?? true) && (
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 uppercase text-[11px]">Soft Skills - Work Habits</h4>
                      <table className="w-full border text-left border-collapse">
                        <tbody className="divide-y">
                          {SAMPLE_CO_SCHOLASTIC_DATA.workHabits.map((item) => (
                            <tr key={item.name}>
                              <td className="p-1.5 border">{item.name}</td>
                              <td className="p-1.5 border text-center font-bold text-emerald-800 w-12">{item.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* OUTDOOR & INDOOR ACTIVITIES */}
                {(template.showActivities ?? true) && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 uppercase text-xs">Activity Grades</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
                      <p><strong>Group 'A' (Outdoor Activity):</strong> {SAMPLE_CO_SCHOLASTIC_DATA.activities.groupAOutdoor} — <span className="font-bold text-emerald-800">Grade {SAMPLE_CO_SCHOLASTIC_DATA.activities.groupAOutdoorGrade}</span></p>
                      <p><strong>Group 'B' (Indoor Activity):</strong> {SAMPLE_CO_SCHOLASTIC_DATA.activities.groupBIndoor} — <span className="font-bold text-emerald-800">Grade {SAMPLE_CO_SCHOLASTIC_DATA.activities.groupBIndoorGrade}</span></p>
                    </div>
                  </div>
                )}

                {/* ATTENDANCE & HEALTH STATUS */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border">
                  {(template.showAttendance ?? true) && (
                    <div>
                      <p className="font-bold text-slate-900 border-b pb-1 mb-1">Attendance Summary</p>
                      <p>Term 1: {SAMPLE_CO_SCHOLASTIC_DATA.attendance.term1Present} / {SAMPLE_CO_SCHOLASTIC_DATA.attendance.term1Total} Days</p>
                      <p>Term 2: {SAMPLE_CO_SCHOLASTIC_DATA.attendance.term2Present} / {SAMPLE_CO_SCHOLASTIC_DATA.attendance.term2Total} Days</p>
                    </div>
                  )}

                  {(template.showHealthStatus ?? true) && (
                    <div>
                      <p className="font-bold text-slate-900 border-b pb-1 mb-1">Health Status</p>
                      <p>Height: {SAMPLE_CO_SCHOLASTIC_DATA.health.heightCms} cm</p>
                      <p>Weight: {SAMPLE_CO_SCHOLASTIC_DATA.health.weightKgs} kg</p>
                    </div>
                  )}
                </div>

                {/* GRADING SCALE LEGEND */}
                {(template.showGradeScaleTable ?? true) && (
                  <div className="p-3 bg-slate-100 rounded-xl border text-[10px] space-y-1">
                    <p className="font-bold text-slate-900 uppercase">CBSE Scholastic 8-Point Grading Scale:</p>
                    <p className="text-slate-600">
                      A1 (91-100), A2 (81-90), B1 (71-80), B2 (61-70), C1 (51-60), C2 (41-50), D (33-40), E (Below 33 - Needs Improvement)
                    </p>
                  </div>
                )}

              </div>
            )
          )}

          {/* TEACHER REMARKS & PROMOTION STATUS */}
          {(template.showTeacherRemarks ?? true) && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1">
              <p className="font-bold text-blue-900 uppercase">Class Teacher Remarks & Final Status:</p>
              <p className="text-slate-800 italic font-medium">
                "An exceptionally diligent and well-behaved student. Demonstrates deep understanding in all subjects."
              </p>
              <p className="font-bold text-emerald-800 pt-1">
                RESULT STATUS: PROMOTED TO NEXT CLASS WITH HIGH DISTINCTION
              </p>
            </div>
          )}

          {/* SIGNATURES & DIGITAL VERIFICATION QR CODE */}
          <div className="pt-6 border-t flex items-end justify-between text-xs font-bold text-slate-700">
            {(template.showClassTeacherSign ?? true) && (
              <div className="text-center">
                <div className="w-28 border-b-2 border-slate-400 mb-1"></div>
                <p>Class Teacher Sign</p>
              </div>
            )}

            {(template.showSubjectTeacherSign ?? true) && (
              <div className="text-center">
                <div className="w-28 border-b-2 border-slate-400 mb-1"></div>
                <p>Subject Teacher Sign</p>
              </div>
            )}

            {(template.showPrincipalSignature ?? true) && (
              <div className="text-center">
                <div className="w-28 border-b-2 border-slate-400 mb-1"></div>
                <p>Principal Sign</p>
              </div>
            )}

            {(template.showParentSign ?? true) && (
              <div className="text-center">
                <div className="w-28 border-b-2 border-slate-400 mb-1"></div>
                <p>Parent / Guardian Sign</p>
              </div>
            )}

            {(template.showQrCode ?? true) && (
              <div className="p-1.5 bg-white border border-slate-300 rounded-lg text-center space-y-0.5">
                <QrCode className="w-10 h-10 text-slate-900 mx-auto" />
                <span className="text-[8px] text-slate-500 font-bold block">VERIFIED QR</span>
              </div>
            )}
          </div>

          {/* FOOTER TEXT */}
          {(template.showFooterText ?? true) && (
            <div className="border-t pt-2 text-center text-[10px] text-slate-500">
              {template.footerText || `${GD_GOENKA_SCHOOL_META.address} | Ph: ${GD_GOENKA_SCHOOL_META.phone}`}
            </div>
          )}

        </div>

        {/* BOTTOM ACTION BAR WITH BACK / CANCEL / CLOSE / PRINT BUTTONS */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
            >
              <Printer className="w-4 h-4" /> Print Report Card
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
