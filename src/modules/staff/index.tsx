import React, { useState, useEffect } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Users, UserPlus, Search, CheckCircle, AlertCircle, Trash2, Mail, Phone, ShieldCheck, Building2, BookOpen, Clock, CheckSquare, Plus, X, Layers } from 'lucide-react';
import { ALL_SCHOOL_CLASSES } from '../../data/mockData';

const DEPARTMENTS = [
  'Mathematics',
  'Sciences (Physics, Chem, Bio)',
  'Languages (English, Hindi, Sanskrit)',
  'Social Sciences & Humanities',
  'Computer Science & IT',
  'Commerce & Economics',
  'Physical Education & Sports',
  'Fine Arts & Performing Arts',
  'Administration & Accounts'
];

const ALL_SUBJECTS_LIST = [
  'Physical Education & Sports',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Science & Technology',
  'English Language & Literature',
  'Hindi / Vernacular Language',
  'Sanskrit / Regional Language',
  'Social Studies & History',
  'Geography & Civics',
  'Computer Science & IT',
  'Economics & Commerce',
  'Accountancy & Business Studies',
  'Art, Craft & Fine Arts',
  'Music & Performing Arts',
  'Environmental Studies (EVS)',
  'General Knowledge & Moral Values',
  'Other (Custom Subject)'
];

const ALL_CLASS_SECTIONS = ALL_SCHOOL_CLASSES.flatMap((cls) => [
  `${cls}-A`,
  `${cls}-B`,
  `${cls}-C`
]);

export const StaffModule: React.FC = () => {
  const { staff, addStaffMember, deleteStaffMember, updateStaffStatus, updateStaffAllocation } = useOtherModulesStore();
  const [activeTab, setActiveTab] = useState<'directory' | 'departments' | 'class_allocation'>('directory');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected teacher for editing allocation
  const [selectedAllocationTeacher, setSelectedAllocationTeacher] = useState<string>(staff[0]?.id || 'stf-1');
  const [tempClassTeacher, setTempClassTeacher] = useState('Class 9-A');
  
  // Subject dropdown selection
  const [selectedSubjectDropdown, setSelectedSubjectDropdown] = useState<string>('Physical Education & Sports');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');

  // Selected multiple class sections
  const [selectedClassSections, setSelectedClassSections] = useState<string[]>(['Class 9-A', 'Class 9-B', 'Class 9-C']);

  // Active teacher allocations list: { className: string; subject: string }[]
  const [teacherAllocationsList, setTeacherAllocationsList] = useState<{ className: string; subject: string }[]>([
    { className: 'Class 9-A', subject: 'Physical Education & Sports' },
    { className: 'Class 9-B', subject: 'Physical Education & Sports' },
    { className: 'Class 9-C', subject: 'Physical Education & Sports' }
  ]);

  // Sync state when selected teacher changes or staff list updates
  useEffect(() => {
    if (!selectedAllocationTeacher && staff.length > 0) {
      setSelectedAllocationTeacher(staff[0].id);
    }
    const currentStaff = staff.find((s) => s.id === selectedAllocationTeacher || s.employeeCode === selectedAllocationTeacher);
    if (currentStaff) {
      setTempClassTeacher(currentStaff.classTeacherOf || 'None');
      if (currentStaff.assignedAllocations && currentStaff.assignedAllocations.length > 0) {
        setTeacherAllocationsList(currentStaff.assignedAllocations);
        setSelectedClassSections(Array.from(new Set(currentStaff.assignedAllocations.map(a => a.className))));
      } else if (currentStaff.assignedClasses && currentStaff.assignedClasses.length > 0) {
        const sub = currentStaff.assignedSubjects?.[0] || 'Physical Education & Sports';
        const list = currentStaff.assignedClasses.map((c) => ({ className: c, subject: sub }));
        setTeacherAllocationsList(list);
        setSelectedClassSections(currentStaff.assignedClasses);
      }
    }
  }, [selectedAllocationTeacher, staff]);

  // New staff form state
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('PGT Teacher');
  const [department, setDepartment] = useState('Mathematics');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('M.Sc. / B.Ed.');
  const [monthlySalary, setMonthlySalary] = useState(65000);
  const [employeeCode, setEmployeeCode] = useState('');

  const filteredStaff = staff.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newStaff = await addStaffMember({
      employeeCode: employeeCode.trim() || `EMP-${String(staff.length + 1).padStart(3, '0')}`,
      fullName: fullName.trim().toUpperCase(),
      designation: designation.trim(),
      department: department.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      phone: phone.trim() || '+91 98100 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: qualification.trim(),
      monthlySalary: Number(monthlySalary) || 50000,
      status: 'Active'
    });

    setSuccessMsg(`🟢 Teacher "${newStaff.fullName}" added & registered in Central Directory!`);
    setTimeout(() => setSuccessMsg(null), 5000);

    setFullName('');
    setEmployeeCode('');
    setEmail('');
    setPhone('');
    setIsAddModalOpen(false);
  };

  const toggleClassSection = (cs: string) => {
    setSelectedClassSections((prev) =>
      prev.includes(cs) ? prev.filter((c) => c !== cs) : [...prev, cs]
    );
  };

  const selectClassesByGrade = (gradeName: string) => {
    const matching = ALL_CLASS_SECTIONS.filter((c) => c.startsWith(gradeName));
    setSelectedClassSections((prev) => Array.from(new Set([...prev, ...matching])));
  };

  const selectAllSectionA = () => {
    const matching = ALL_CLASS_SECTIONS.filter((c) => c.endsWith('-A'));
    setSelectedClassSections(matching);
  };

  const clearSelectedClasses = () => {
    setSelectedClassSections([]);
  };

  const handleAddAllocationsToTeacher = () => {
    const subjectToAssign = selectedSubjectDropdown === 'Other (Custom Subject)' ? customSubjectInput.trim() : selectedSubjectDropdown;
    if (!subjectToAssign) {
      alert('Please select or enter a subject name.');
      return;
    }
    if (selectedClassSections.length === 0) {
      alert('Please select at least one class and section.');
      return;
    }

    setTeacherAllocationsList((prev) => {
      const existingMap = new Map(prev.map((item) => [`${item.className}__${item.subject}`, item]));
      selectedClassSections.forEach((cs) => {
        existingMap.set(`${cs}__${subjectToAssign}`, { className: cs, subject: subjectToAssign });
      });
      return Array.from(existingMap.values());
    });
  };

  const handleRemoveAllocationItem = (index: number) => {
    setTeacherAllocationsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAllocation = (teacherId: string) => {
    const currentStaff = staff.find((s) => s.id === teacherId || s.employeeCode === teacherId);
    const teacherName = currentStaff ? currentStaff.fullName : 'Faculty Member';

    const assignedClasses = Array.from(new Set<string>(teacherAllocationsList.map((a) => a.className)));
    if (tempClassTeacher && tempClassTeacher !== 'None' && !assignedClasses.includes(tempClassTeacher)) {
      assignedClasses.push(tempClassTeacher);
    }

    const assignedSubjects = Array.from(new Set<string>(teacherAllocationsList.map((a) => a.subject)));

    updateStaffAllocation(
      teacherId,
      tempClassTeacher,
      assignedClasses,
      assignedSubjects,
      teacherAllocationsList
    );

    setSuccessMsg(`🟢 Class & Subject Allocations saved in Database for "${teacherName}"! (${teacherAllocationsList.length} Class-Subject assignments)`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Staff Management & Class Allocations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {staff.length} Faculty Members
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register staff members, organize academic departments, and assign Class Teachers & Subject allocations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Staff Registration
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          1. Staff Registration & Central Directory
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          2. Staff Departments
        </button>

        <button
          onClick={() => setActiveTab('class_allocation')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'class_allocation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          3. Allocation of Classes & Subjects
        </button>
      </div>

      {/* TAB 1: DIRECTORY & REGISTRATION */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff member by name, code, designation, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Staff Member & Contacts</th>
                  <th className="py-3 px-4">Designation & Department</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Class Allocation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                      No staff members found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((stf, idx) => {
                    return (
                      <tr key={`${stf.id}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{stf.employeeCode}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{stf.fullName}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span><Mail className="w-3 h-3 inline mr-1 text-slate-400" />{stf.email}</span>
                            <span>•</span>
                            <span><Phone className="w-3 h-3 inline mr-1 text-slate-400" />{stf.phone}</span>
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{stf.designation}</p>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {stf.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">{stf.qualification}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {stf.classTeacherOf && stf.classTeacherOf !== 'None' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 inline-block">
                                CT: {stf.classTeacherOf}
                              </span>
                            )}
                            {stf.assignedAllocations && stf.assignedAllocations.length > 0 ? (
                              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                                {stf.assignedAllocations.map(a => `${a.className} (${a.subject})`).slice(0, 3).join(', ')}
                                {stf.assignedAllocations.length > 3 && ` +${stf.assignedAllocations.length - 3} more`}
                              </p>
                            ) : stf.assignedClasses && stf.assignedClasses.length > 0 ? (
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                Classes: {stf.assignedClasses.join(', ')}
                              </p>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateStaffStatus(stf.id, 'Active')}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 border ${
                                stf.status === 'Active' || stf.status === 'Present' as any
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Present
                            </button>

                            <button
                              type="button"
                              onClick={() => updateStaffStatus(stf.id, 'Absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 border ${
                                stf.status === 'Absent'
                                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-rose-50'
                              }`}
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Remove staff member "${stf.fullName}"?`)) {
                                deleteStaffMember(stf.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ABSENT TEACHERS LIST AT BOTTOM */}
          {(() => {
            const absentTeachers = staff.filter((s) => s.status === 'Absent' || s.status === 'On Leave');
            return (
              <div className="bg-rose-50/70 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                      Absent Teachers List ({absentTeachers.length} Absent Today)
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    Automatically interlinked across Substitution & Timetable
                  </span>
                </div>

                {absentTeachers.length === 0 ? (
                  <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900">
                    🎉 All teachers are Present today! No staff absences reported.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {absentTeachers.map((at, idx) => {
                      return (
                        <div key={`${at.id}-${idx}`} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-800 shadow-xs flex flex-col justify-between gap-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                                {at.employeeCode}
                              </span>
                              <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                                {at.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">{at.fullName}</h4>
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{at.designation} • {at.department}</p>
                            {at.classTeacherOf && at.classTeacherOf !== 'None' && (
                              <p className="text-[10px] text-indigo-600 font-bold mt-1">Class Teacher: {at.classTeacherOf}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => updateStaffStatus(at.id, 'Active')}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Present
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: STAFF DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => {
            const members = staff.filter((s) => s.department.toLowerCase().includes(dept.toLowerCase().split(' ')[0]));
            return (
              <div key={dept} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{dept}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {members.length} Staff
                  </span>
                </div>

                <div className="space-y-2">
                  {members.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No faculty assigned to this department yet.</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{m.fullName}</p>
                          <p className="text-[10px] text-slate-500">{m.designation}</p>
                        </div>
                        <span className="font-mono text-[10px] text-indigo-600 font-bold">{m.employeeCode}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ALLOCATION OF CLASSES */}
      {activeTab === 'class_allocation' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Class Teacher & Multi-Class Subject Allocation
              </h3>
              <p className="text-xs text-slate-500">
                Select subjects from dropdowns and allocate multiple classes & sections to faculty members.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 7 COLS: ALLOCATION BUILDER */}
            <div className="lg:col-span-7 space-y-5 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* SELECT FACULTY MEMBER */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  1. Select Faculty Member
                </label>
                <select
                  value={selectedAllocationTeacher}
                  onChange={(e) => setSelectedAllocationTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {staff.map((s, idx) => (
                    <option key={`${s.id}-${idx}`} value={s.id}>
                      {s.fullName} ({s.employeeCode}) — {s.department} [{s.designation}]
                    </option>
                  ))}
                </select>
              </div>

              {/* CLASS TEACHER RESPONSIBILITY */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  2. Assigned Class Teacher Duty (Optional)
                </label>
                <select
                  value={tempClassTeacher}
                  onChange={(e) => setTempClassTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer shadow-xs"
                >
                  <option value="None">None (Subject Specialist / Multi-Class Teacher)</option>
                  {ALL_SCHOOL_CLASSES.map((cls) => (
                    <React.Fragment key={cls}>
                      <option value={`${cls}-A`}>{cls} - Section A</option>
                      <option value={`${cls}-B`}>{cls} - Section B</option>
                      <option value={`${cls}-C`}>{cls} - Section C</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              {/* DROPDOWN FOR SUBJECT */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  3. Select Allocation Subject (Dropdown Menu)
                </label>
                <select
                  value={selectedSubjectDropdown}
                  onChange={(e) => setSelectedSubjectDropdown(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold text-indigo-700 dark:text-indigo-300 cursor-pointer shadow-xs"
                >
                  {ALL_SUBJECTS_LIST.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>

                {selectedSubjectDropdown === 'Other (Custom Subject)' && (
                  <input
                    type="text"
                    placeholder="Type custom subject name..."
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
                  />
                )}
              </div>

              {/* SELECT MULTIPLE CLASSES AND SECTIONS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    4. Select Multiple Classes & Sections ({selectedClassSections.length} Selected)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={selectAllSectionA}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      All Sec A
                    </button>
                    <button
                      type="button"
                      onClick={() => selectClassesByGrade('Class 9')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      Class 9
                    </button>
                    <button
                      type="button"
                      onClick={() => selectClassesByGrade('Class 10')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      Class 10
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedClasses}
                      className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                    {ALL_CLASS_SECTIONS.map((cs) => {
                      const isSelected = selectedClassSections.includes(cs);
                      return (
                        <button
                          key={cs}
                          type="button"
                          onClick={() => toggleClassSection(cs)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                          }`}
                        >
                          <span>{cs}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ACTION: ADD SUBJECT PAIRING */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAddAllocationsToTeacher}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Pair Subject "{selectedSubjectDropdown === 'Other (Custom Subject)' ? customSubjectInput || 'Custom' : selectedSubjectDropdown}" with {selectedClassSections.length} Class(es)
                </button>
              </div>

              {/* ACTIVE ALLOCATION PAIRS LIST FOR SELECTED TEACHER */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Configured Class-Subject Allocations ({teacherAllocationsList.length})
                  </span>
                  <span className="text-[11px] text-slate-500">Click ✕ to remove any pairing</span>
                </div>

                {teacherAllocationsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No class-subject pairings configured yet. Select subject and classes above to add.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {teacherAllocationsList.map((item, idx) => (
                      <span
                        key={`${item.className}-${item.subject}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs text-xs font-bold text-slate-900 dark:text-slate-100"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{item.className}</span>
                        <span className="text-slate-400">•</span>
                        <span>{item.subject}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllocationItem(idx)}
                          className="ml-1 p-0.5 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer transition-colors"
                          title="Remove pairing"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveAllocation(selectedAllocationTeacher)}
                  className="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  Save Class Allocations to Live Database
                </button>
              </div>
            </div>

            {/* RIGHT 5 COLS: ACTIVE FACULTY ALLOCATION MATRIX */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Active Faculty Allocation Matrix
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {staff.length} Teachers
                </span>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {staff.map((stf, idx) => {
                  const isSelectedTeacher = stf.id === selectedAllocationTeacher;
                  const allocs = stf.assignedAllocations || [];
                  const classes = stf.assignedClasses || [];
                  const subjects = stf.assignedSubjects || [];

                  return (
                    <div
                      key={`${stf.id}-${idx}`}
                      onClick={() => setSelectedAllocationTeacher(stf.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelectedTeacher
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-xs">{stf.fullName}</p>
                          <p className="text-[10px] text-slate-500">{stf.department} • {stf.designation}</p>
                        </div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600">
                          {stf.employeeCode}
                        </span>
                      </div>

                      {stf.classTeacherOf && stf.classTeacherOf !== 'None' && (
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
                          Class Teacher: {stf.classTeacherOf}
                        </div>
                      )}

                      {allocs.length > 0 ? (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {allocs.map((a, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {a.className} • {a.subject}
                            </span>
                          ))}
                        </div>
                      ) : classes.length > 0 ? (
                        <div className="pt-1 text-[10px] text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">Classes: </span>
                          {classes.join(' • ')}
                          {subjects.length > 0 && <span className="block text-[10px] text-slate-500 mt-0.5">Subject: {subjects.join(', ')}</span>}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No classes or subjects allocated yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Faculty & Staff Registration
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Employee Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder={`EMP-${String(staff.length + 1).padStart(3, '0')}`}
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUNIL KUMAR SHARMA"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98100 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Save & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
