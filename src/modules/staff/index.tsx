import React, { useState } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { Users, UserPlus, Search, CheckCircle, AlertCircle, Trash2, Mail, Phone, ShieldCheck, Building2, BookOpen, Clock, CheckSquare } from 'lucide-react';
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

export const StaffModule: React.FC = () => {
  const { staff, addStaffMember, deleteStaffMember, updateStaffStatus, updateStaffAllocation } = useOtherModulesStore();
  const [activeTab, setActiveTab] = useState<'directory' | 'departments' | 'class_allocation'>('directory');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Class allocation state mapping teacherId -> { classTeacherOf: string, subjects: { class: string, subject: string }[] }
  const [classAllocations, setClassAllocations] = useState<Record<string, { classTeacherOf: string; subjects: string[] }>>({
    'stf-1': { classTeacherOf: 'Class 10-A', subjects: ['Class 10 Mathematics', 'Class 9 Mathematics'] },
    'stf-2': { classTeacherOf: 'Class 12-A', subjects: ['Class 11 Physics', 'Class 12 Physics'] },
    'stf-3': { classTeacherOf: 'Class 8-B', subjects: ['Class 8 English', 'Class 7 English'] }
  });

  // Selected teacher for editing allocation
  const [selectedAllocationTeacher, setSelectedAllocationTeacher] = useState<string>(staff[0]?.id || 'stf-1');
  const [tempClassTeacher, setTempClassTeacher] = useState('Class 10-A');
  const [tempSubjects, setTempSubjects] = useState('Class 10 Mathematics, Class 9 Mathematics');

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

  const handleSaveAllocation = (teacherId: string) => {
    const subjectArray = tempSubjects.split(',').map((s) => s.trim()).filter(Boolean);
    const assignedClasses = Array.from(new Set([tempClassTeacher, ...subjectArray.map(s => {
      const match = s.match(/Class\s+\d+[-A-Z]*/i);
      return match ? match[0] : tempClassTeacher;
    })])).filter(c => c && c !== 'None');

    setClassAllocations((prev) => ({
      ...prev,
      [teacherId]: {
        classTeacherOf: tempClassTeacher,
        subjects: subjectArray
      }
    }));

    updateStaffAllocation(teacherId, tempClassTeacher, assignedClasses, subjectArray);

    setSuccessMsg(`🟢 Class & Subject Allocations saved to Central Registry & updated throughout application!`);
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
                    const alloc = classAllocations[stf.id];
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
                          {alloc ? (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 block">
                                Teacher of {alloc.classTeacherOf}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unassigned</span>
                          )}
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
                      const alloc = classAllocations[at.id];
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
                            {alloc?.classTeacherOf && (
                              <p className="text-[10px] text-indigo-600 font-bold mt-1">Class Teacher: {alloc.classTeacherOf}</p>
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
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Class Teacher & Subject Allocation Engine
            </h3>
            <p className="text-xs text-slate-500">
              Assign Class Teacher responsibility and teaching subject allocations to faculty members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SELECT TEACHER & ALLOCATE */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                  Select Faculty Member
                </label>
                <select
                  value={selectedAllocationTeacher}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedAllocationTeacher(id);
                    const existing = classAllocations[id];
                    if (existing) {
                      setTempClassTeacher(existing.classTeacherOf);
                      setTempSubjects(existing.subjects.join(', '));
                    } else {
                      setTempClassTeacher('Class 10-A');
                      setTempSubjects('Class 10 Mathematics');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {staff.map((s, idx) => (
                    <option key={`${s.id}-${idx}`} value={s.id}>
                      {s.fullName} ({s.employeeCode}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                  Assigned Class Teacher Duty
                </label>
                <select
                  value={tempClassTeacher}
                  onChange={(e) => setTempClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {ALL_SCHOOL_CLASSES.map((cls) => (
                    <React.Fragment key={cls}>
                      <option value={`${cls}-A`}>{cls} - Section A</option>
                      <option value={`${cls}-B`}>{cls} - Section B</option>
                      <option value={`${cls}-C`}>{cls} - Section C</option>
                    </React.Fragment>
                  ))}
                  <option value="None">None (Subject Specialist Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                  Allocated Teaching Subjects & Classes (Comma Separated)
                </label>
                <textarea
                  rows={3}
                  value={tempSubjects}
                  onChange={(e) => setTempSubjects(e.target.value)}
                  placeholder="e.g. Class 10 Mathematics, Class 9 Mathematics, Class 11 Advanced Physics"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => handleSaveAllocation(selectedAllocationTeacher)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
              >
                <CheckSquare className="w-4 h-4" /> Save Class Allocation
              </button>
            </div>

            {/* CURRENT ALLOCATION MATRIX */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                Active Faculty Allocation Matrix
              </h4>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {staff.map((stf, idx) => {
                  const alloc = classAllocations[stf.id];
                  return (
                    <div key={`${stf.id}-${idx}`} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white">{stf.fullName}</span>
                        <span className="font-mono text-[10px] text-indigo-600">{stf.employeeCode}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">Dept: {stf.department}</p>
                      {alloc ? (
                        <div className="pt-1 space-y-1">
                          <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                            Class Teacher: <span className="bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded">{alloc.classTeacherOf}</span>
                          </p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">
                            Subjects: {alloc.subjects.join(' • ')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No classes allocated yet.</p>
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
