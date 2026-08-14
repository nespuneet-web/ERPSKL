import React, { useState, useEffect } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  BookOpen,
  Clock,
  CheckSquare,
  Plus,
  X,
  Layers,
  Sparkles,
  GraduationCap,
  SlidersHorizontal,
  Check,
  Award,
  UserCheck
} from 'lucide-react';
import { ALL_SCHOOL_CLASSES } from '../../data/mockData';
import { StaffAllocationItem, StaffMember } from '../../types/otherModules';
import { StaffAttendanceRegisterView } from './StaffAttendanceRegisterView';

export const DEPARTMENTS = [
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

export const DEPARTMENT_SUBJECT_MAPPING: Record<string, string[]> = {
  'Mathematics': ['Mathematics', 'Applied Mathematics', 'Vedic Mathematics', 'Statistics'],
  'Sciences (Physics, Chem, Bio)': ['Physics', 'Chemistry', 'Biology', 'Science & Technology', 'Environmental Studies (EVS)'],
  'Languages (English, Hindi, Sanskrit)': ['English Language & Literature', 'Hindi / Vernacular Language', 'Sanskrit / Regional Language', 'French / Foreign Language'],
  'Social Sciences & Humanities': ['Social Studies & History', 'Geography & Civics', 'Political Science', 'Psychology & Sociology'],
  'Computer Science & IT': ['Computer Science & IT', 'Artificial Intelligence & Coding', 'Informatics Practices'],
  'Commerce & Economics': ['Accountancy & Business Studies', 'Economics & Commerce', 'Financial Marketing & Management'],
  'Physical Education & Sports': ['Physical Education & Sports', 'Yoga & Physical Fitness', 'Athletics & Games'],
  'Fine Arts & Performing Arts': ['Art, Craft & Fine Arts', 'Music & Vocal Arts', 'Dance & Theatre'],
  'Administration & Accounts': ['Administration & Management', 'Accounts & Bookkeeping', 'Library & Resource Management']
};

export const ALL_SUBJECTS_LIST = [
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
  'Political Science',
  'Computer Science & IT',
  'Artificial Intelligence & Coding',
  'Economics & Commerce',
  'Accountancy & Business Studies',
  'Physical Education & Sports',
  'Yoga & Physical Fitness',
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
  const [activeTab, setActiveTab] = useState<'directory' | 'departments' | 'class_allocation' | 'staff_attendance'>('directory');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState<'All' | 'Active' | 'Absent' | 'On Leave' | 'Half Day'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected teacher for editing allocation in Tab 3
  const [selectedAllocationTeacher, setSelectedAllocationTeacher] = useState<string>(staff[0]?.id || 'stf-1');
  const [tempClassTeacher, setTempClassTeacher] = useState('None');
  
  // Subject dropdown selection for Tab 3
  const [selectedSubjectDropdown, setSelectedSubjectDropdown] = useState<string>('Mathematics');
  const [customSubjectInput, setCustomSubjectInput] = useState<string>('');

  // Selected multiple class sections for Tab 3
  const [selectedClassSections, setSelectedClassSections] = useState<string[]>(['Class 9-A', 'Class 9-B', 'Class 10-A']);

  // Active teacher allocations list in Tab 3: { className: string; subject: string }[]
  const [teacherAllocationsList, setTeacherAllocationsList] = useState<StaffAllocationItem[]>([
    { className: 'Class 9-A', subject: 'Mathematics' },
    { className: 'Class 9-B', subject: 'Mathematics' },
    { className: 'Class 10-A', subject: 'Mathematics' }
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
        if (currentStaff.assignedAllocations[0]?.subject) {
          setSelectedSubjectDropdown(currentStaff.assignedAllocations[0].subject);
        }
      } else if (currentStaff.assignedClasses && currentStaff.assignedClasses.length > 0) {
        const sub = currentStaff.assignedSubjects?.[0] || 'Mathematics';
        const list = currentStaff.assignedClasses.map((c) => ({ className: c, subject: sub }));
        setTeacherAllocationsList(list);
        setSelectedClassSections(currentStaff.assignedClasses);
        setSelectedSubjectDropdown(sub);
      } else {
        setTeacherAllocationsList([]);
        setSelectedClassSections([]);
      }
    }
  }, [selectedAllocationTeacher, staff]);

  // ==========================================
  // NEW STAFF REGISTRATION MODAL FORM STATE
  // ==========================================
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('PGT Mathematics');
  const [department, setDepartment] = useState('Mathematics');
  const [modalSelectedSubjects, setModalSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [modalCustomSubject, setModalCustomSubject] = useState('');
  const [modalClassTeacherOf, setModalClassTeacherOf] = useState('None');
  const [modalAllocatedClasses, setModalAllocatedClasses] = useState<string[]>(['Class 9-A', 'Class 9-B', 'Class 10-A']);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('M.Sc. / B.Ed.');
  const [monthlySalary, setMonthlySalary] = useState(65000);
  const [employeeCode, setEmployeeCode] = useState('');

  // When modal department changes, automatically update recommended subjects
  const handleModalDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const recSubjs = DEPARTMENT_SUBJECT_MAPPING[newDept] || ['General'];
    setModalSelectedSubjects([recSubjs[0]]);
    if (newDept.includes('Math')) setDesignation('PGT Mathematics');
    else if (newDept.includes('Sci')) setDesignation('PGT Physics / Science');
    else if (newDept.includes('Lang')) setDesignation('TGT Languages');
    else if (newDept.includes('Social')) setDesignation('TGT Social Studies');
    else if (newDept.includes('Computer')) setDesignation('PGT Computer Science & IT');
    else if (newDept.includes('Commerce')) setDesignation('PGT Commerce & Accounts');
    else if (newDept.includes('Physical')) setDesignation('Physical Education Director');
    else if (newDept.includes('Fine Arts')) setDesignation('Art & Fine Arts Incharge');
  };

  const toggleModalSubject = (subj: string) => {
    setModalSelectedSubjects((prev) =>
      prev.includes(subj) ? (prev.length > 1 ? prev.filter((s) => s !== subj) : prev) : [...prev, subj]
    );
  };

  const toggleModalClassSection = (cs: string) => {
    setModalAllocatedClasses((prev) =>
      prev.includes(cs) ? prev.filter((c) => c !== cs) : [...prev, cs]
    );
  };

  const selectModalClassesByGrade = (gradePrefix: string) => {
    const matching = ALL_CLASS_SECTIONS.filter((c) => c.startsWith(gradePrefix));
    setModalAllocatedClasses((prev) => Array.from(new Set([...prev, ...matching])));
  };

  const selectModalAllSectionA = () => {
    const matching = ALL_CLASS_SECTIONS.filter((c) => c.endsWith('-A'));
    setModalAllocatedClasses(matching);
  };

  const clearModalClasses = () => {
    setModalAllocatedClasses([]);
  };

  const filteredStaff = staff.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.employeeCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      (s.assignedSubjects && s.assignedSubjects.some(sub => sub.toLowerCase().includes(q))) ||
      (s.assignedClasses && s.assignedClasses.some(cls => cls.toLowerCase().includes(q)));

    const currentStatus = s.status || 'Active';
    const matchesStatus =
      directoryStatusFilter === 'All' ||
      (directoryStatusFilter === 'Active' && (currentStatus === 'Active' || (currentStatus as any) === 'Present')) ||
      currentStatus === directoryStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter the faculty member full name.');
      return;
    }

    // Finalize subjects list
    const finalSubjects = [...modalSelectedSubjects];
    if (modalCustomSubject.trim() && !finalSubjects.includes(modalCustomSubject.trim())) {
      finalSubjects.push(modalCustomSubject.trim());
    }

    // Build assigned allocations
    const finalAllocations: StaffAllocationItem[] = [];
    modalAllocatedClasses.forEach((cls) => {
      finalSubjects.forEach((sub) => {
        finalAllocations.push({ className: cls, subject: sub });
      });
    });

    const generatedCode = employeeCode.trim() || `EMP-${String(staff.length + 1).padStart(3, '0')}`;
    const cleanName = fullName.trim().toUpperCase();

    const newStaff = await addStaffMember({
      employeeCode: generatedCode,
      fullName: cleanName,
      designation: designation.trim(),
      department: department.trim(),
      email: email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@school.edu`,
      phone: phone.trim() || '+91 98100 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: qualification.trim(),
      monthlySalary: Number(monthlySalary) || 55000,
      status: 'Active',
      classTeacherOf: modalClassTeacherOf !== 'None' ? modalClassTeacherOf : undefined,
      assignedClasses: modalAllocatedClasses.length > 0 ? modalAllocatedClasses : undefined,
      assignedSubjects: finalSubjects.length > 0 ? finalSubjects : undefined,
      assignedAllocations: finalAllocations.length > 0 ? finalAllocations : undefined
    });

    setSuccessMsg(`🟢 Teacher "${newStaff.fullName}" registered with ${finalSubjects.join(', ')} in ${department} & synced to Database and Timetable!`);
    setTimeout(() => setSuccessMsg(null), 6000);

    // Reset Form
    setFullName('');
    setEmployeeCode('');
    setEmail('');
    setPhone('');
    setModalCustomSubject('');
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

  const handleSaveAllocation = async (teacherId: string) => {
    const currentStaff = staff.find((s) => s.id === teacherId || s.employeeCode === teacherId);
    const teacherName = currentStaff ? currentStaff.fullName : 'Faculty Member';

    const assignedClasses = Array.from(new Set<string>(teacherAllocationsList.map((a) => a.className)));
    if (tempClassTeacher && tempClassTeacher !== 'None' && !assignedClasses.includes(tempClassTeacher)) {
      assignedClasses.push(tempClassTeacher);
    }

    const assignedSubjects = Array.from(new Set<string>(teacherAllocationsList.map((a) => a.subject)));

    await updateStaffAllocation(
      teacherId,
      tempClassTeacher,
      assignedClasses,
      assignedSubjects,
      teacherAllocationsList
    );

    setSuccessMsg(`🟢 Class & Subject Allocations saved in Database for "${teacherName}"! (${teacherAllocationsList.length} Class-Subject assignments synced to Timetable)`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Faculty Directory & Class Allocations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {staff.length} Teachers Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register teachers with Departments, allocate multiple Subjects & Class sections, and auto-sync with the Timetable & Lesson Plan engine.
          </p>
        </div>

        <button
          onClick={() => {
            handleModalDepartmentChange('Mathematics');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all shrink-0 active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          Register New Teacher
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-600 hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'directory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          1. Teacher Directory & Profiles
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          2. Academic Departments & HODs
        </button>

        <button
          onClick={() => setActiveTab('class_allocation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'class_allocation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          3. Allocate Subjects & Classes
        </button>

        <button
          onClick={() => setActiveTab('staff_attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'staff_attendance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          4. Daily Staff Attendance Register
        </button>
      </div>

      {/* TAB 1: DIRECTORY & REGISTRATION */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* SEARCH & STATUS FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 flex-1 px-1">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search teacher by name, employee code (e.g. PAR01), department, subject, or assigned class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>

            {/* STATUS FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-3">
              <button
                onClick={() => setDirectoryStatusFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all ${
                  directoryStatusFilter === 'All'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All ({staff.length})
              </button>

              <button
                onClick={() => setDirectoryStatusFilter('Active')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all ${
                  directoryStatusFilter === 'Active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                🟢 Present ({staff.filter((s) => (s.status || 'Active') === 'Active' || (s.status as any) === 'Present').length})
              </button>

              <button
                onClick={() => setDirectoryStatusFilter('Absent')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all ${
                  directoryStatusFilter === 'Absent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                }`}
              >
                🔴 Absent ({staff.filter((s) => s.status === 'Absent').length})
              </button>

              <button
                onClick={() => setDirectoryStatusFilter('On Leave')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all ${
                  directoryStatusFilter === 'On Leave'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                🟡 Leave ({staff.filter((s) => s.status === 'On Leave').length})
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="p-3.5">Code & Teacher Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Allocated Subject(s)</th>
                    <th className="p-3.5">Assigned Classes</th>
                    <th className="p-3.5">Class Teacher Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStaff.map((stf, idx) => {
                    const subjects = stf.assignedSubjects || [];
                    const classes = stf.assignedClasses || [];
                    const allocs = stf.assignedAllocations || [];

                    return (
                      <tr key={`${stf.id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-xs shrink-0">
                              {stf.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block">
                                {stf.fullName}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                {stf.employeeCode} • {stf.designation}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 inline-block">
                            {stf.department}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subjects.map((sub, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  ⭐ {sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No subject allocated</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {allocs.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {allocs.slice(0, 4).map((a, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {a.className}
                                </span>
                              ))}
                              {allocs.length > 4 && (
                                <span className="text-[10px] font-bold text-slate-500">+{allocs.length - 4} more</span>
                              )}
                            </div>
                          ) : classes.length > 0 ? (
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{classes.join(', ')}</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No classes</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {stf.classTeacherOf && stf.classTeacherOf !== 'None' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              👑 {stf.classTeacherOf}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Subject Teacher</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <select
                            value={stf.status}
                            onChange={(e) => updateStaffStatus(stf.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                              stf.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : stf.status === 'Absent'
                                ? 'bg-rose-50 text-rose-800 border-rose-200 font-black'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="Active">🟢 Active / Present</option>
                            <option value="Absent">🔴 Absent Today</option>
                            <option value="On Leave">🟡 On Leave</option>
                            <option value="Half Day">⏱️ Half Day</option>
                          </select>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAllocationTeacher(stf.id);
                                setActiveTab('class_allocation');
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 cursor-pointer"
                              title="Edit Class Allocations"
                            >
                              Allocations
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${stf.fullName} from directory?`)) {
                                  deleteStaffMember(stf.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Delete staff member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set([...DEPARTMENTS, ...staff.map((s) => s.department).filter(Boolean)])).map((dept) => {
            const members = staff.filter((s) => s.department === dept);
            const standardSubjs = DEPARTMENT_SUBJECT_MAPPING[dept] || Array.from(new Set(members.flatMap((m) => m.assignedSubjects || [])));

            return (
              <div key={dept} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{dept}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {members.length} Faculty
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Department Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {standardSubjs.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Teachers:
                  </span>
                  {members.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No faculty assigned to this department yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {members.map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{m.fullName}</span>
                          <span className="text-[10px] text-slate-500">{m.designation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ALLOCATION OF CLASSES & SUBJECTS */}
      {activeTab === 'class_allocation' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Teacher Subject & Class Allocations
              </h3>
              <p className="text-xs text-slate-500">
                Easily select a teacher, assign multiple subjects and classes, and sync directly with the Master Timetable and Lesson Plans.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 7 COLS: ALLOCATION BUILDER */}
            <div className="lg:col-span-7 space-y-5 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* SELECT FACULTY MEMBER */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  1. Select Faculty Member *
                </label>
                <select
                  value={selectedAllocationTeacher}
                  onChange={(e) => setSelectedAllocationTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-black text-indigo-900 dark:text-indigo-200 cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {staff.map((s, idx) => (
                    <option key={`${s.id}-${idx}`} value={s.id}>
                      👨‍🏫 {s.fullName} ({s.employeeCode}) — {s.department} [{s.designation}]
                    </option>
                  ))}
                </select>
              </div>

              {/* CURRENT TEACHER PROFILE CARD */}
              {(() => {
                const currentStaff = staff.find((s) => s.id === selectedAllocationTeacher || s.employeeCode === selectedAllocationTeacher);
                const deptSubjs = currentStaff ? (DEPARTMENT_SUBJECT_MAPPING[currentStaff.department] || []) : [];

                return (
                  <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                        Active Teacher: {currentStaff?.fullName}
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-600 text-white">
                        {currentStaff?.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-bold">Recommended Department Subjects:</span>
                      {deptSubjs.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSelectedSubjectDropdown(sub)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-all ${
                            selectedSubjectDropdown === sub
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          ⭐ {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* CLASS TEACHER RESPONSIBILITY */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  2. Class Teacher Duty (Every teacher cannot be a class teacher)
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Assign only if this teacher is the primary class teacher of a specific section.
                </p>
                <select
                  value={tempClassTeacher}
                  onChange={(e) => setTempClassTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer shadow-xs"
                >
                  <option value="None">None (Subject Specialist Only / No Class Teacher Responsibility)</option>
                  {ALL_SCHOOL_CLASSES.map((cls) => (
                    <React.Fragment key={cls}>
                      <option value={`${cls}-A`}>👑 Class Teacher of {cls} - Section A</option>
                      <option value={`${cls}-B`}>👑 Class Teacher of {cls} - Section B</option>
                      <option value={`${cls}-C`}>👑 Class Teacher of {cls} - Section C</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              {/* DROPDOWN FOR SUBJECT */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  3. Select Subject to Allocate *
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
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                      9th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectClassesByGrade('Class 10')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      10th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectClassesByGrade('Class 11')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      11th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectClassesByGrade('Class 12')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      12th
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
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  + Allocate Subject "{selectedSubjectDropdown === 'Other (Custom Subject)' ? customSubjectInput || 'Custom' : selectedSubjectDropdown}" to {selectedClassSections.length} Class(es)
                </button>
              </div>

              {/* ACTIVE ALLOCATION PAIRS LIST FOR SELECTED TEACHER */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Configured Allocations for this Teacher ({teacherAllocationsList.length})
                  </span>
                  <span className="text-[11px] text-slate-500">Click ✕ to remove any pairing</span>
                </div>

                {teacherAllocationsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No class-subject pairings configured yet. Select subject and classes above to add.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
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
                  className="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CheckSquare className="w-4 h-4" />
                  💾 Save All Allocations to Cloud Database & Timetable
                </button>
              </div>
            </div>

            {/* RIGHT 5 COLS: ACTIVE FACULTY ALLOCATION MATRIX */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Registered Teachers Allocation Matrix
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {staff.length} Teachers
                </span>
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
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
                          👑 Class Teacher: {stf.classTeacherOf}
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
                          {subjects.length > 0 && <span className="block text-[10px] text-slate-500 mt-0.5">Subjects: {subjects.join(', ')}</span>}
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

      {/* TAB 4: DAILY STAFF ATTENDANCE REGISTER */}
      {activeTab === 'staff_attendance' && (
        <StaffAttendanceRegisterView />
      )}

      {/* ========================================================================= */}
      {/* ENHANCED TEACHER REGISTRATION MODAL WITH DEPARTMENT & SUBJECT ALLOCATOR   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Faculty Registration & Subject/Class Allocation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register teacher name, assign department, subjects, class sections, and class teacher responsibility.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              {/* STEP 1: TEACHER IDENTITY & DEPARTMENT */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Step 1: Faculty Identification & Department
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Teacher Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DR. SUNIL KUMAR SHARMA"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      placeholder={`EMP-${String(staff.length + 1).padStart(3, '0')}`}
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Academic Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => handleModalDepartmentChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-extrabold text-indigo-900 dark:text-indigo-200 cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: DEPARTMENT-DRIVEN SUBJECT SELECTION */}
              <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Step 2: Department Subjects & Specializations
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    {modalSelectedSubjects.length} Subject(s) Selected
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Select the subjects this teacher will teach. Click to select multiple subjects:
                </p>

                {/* 1-Click Recommended Department Subjects */}
                <div className="flex flex-wrap gap-2">
                  {(DEPARTMENT_SUBJECT_MAPPING[department] || []).map((sub) => {
                    const isSelected = modalSelectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleModalSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        <span>⭐ {sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Subjects Badge Display */}
                {modalSelectedSubjects.length > 0 && (
                  <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 block">
                      Active Subjects Assigned to this Teacher:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {modalSelectedSubjects.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-2xs"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => toggleModalSubject(sub)}
                            className="p-0.5 hover:bg-indigo-700 rounded-full cursor-pointer text-indigo-200 hover:text-white"
                            title={`Remove ${sub}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom / Additional Subject Input & Dropdown */}
                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && val !== 'Select School Subject...' && !modalSelectedSubjects.includes(val)) {
                          setModalSelectedSubjects((prev) => [...prev, val]);
                        }
                        e.target.value = 'Select School Subject...';
                      }}
                      defaultValue="Select School Subject..."
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      <option disabled>Select School Subject...</option>
                      {ALL_SUBJECTS_LIST.filter((s) => s !== 'Other (Custom Subject)').map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or type custom subject & click Add..."
                      value={modalCustomSubject}
                      onChange={(e) => setModalCustomSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (modalCustomSubject.trim() && !modalSelectedSubjects.includes(modalCustomSubject.trim())) {
                            setModalSelectedSubjects((prev) => [...prev, modalCustomSubject.trim()]);
                            setModalCustomSubject('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (modalCustomSubject.trim() && !modalSelectedSubjects.includes(modalCustomSubject.trim())) {
                          setModalSelectedSubjects((prev) => [...prev, modalCustomSubject.trim()]);
                          setModalCustomSubject('');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: CLASS TEACHER STATUS */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Step 3: Class Teacher Responsibility
                </span>
                <p className="text-xs text-slate-500">
                  Every teacher cannot be a class teacher. Leave as "None" if this teacher is a subject specialist.
                </p>

                <select
                  value={modalClassTeacherOf}
                  onChange={(e) => setModalClassTeacherOf(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="None">None (Subject Specialist Only / Not a Class Teacher)</option>
                  {ALL_SCHOOL_CLASSES.map((cls) => (
                    <React.Fragment key={cls}>
                      <option value={`${cls}-A`}>👑 Class Teacher of {cls}-A</option>
                      <option value={`${cls}-B`}>👑 Class Teacher of {cls}-B</option>
                      <option value={`${cls}-C`}>👑 Class Teacher of {cls}-C</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              {/* STEP 4: ALLOCATE MULTIPLE CLASSES & SECTIONS */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Step 4: Allocated Classes & Sections ({modalAllocatedClasses.length} Selected)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={selectModalAllSectionA}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      All Sec A
                    </button>
                    <button
                      type="button"
                      onClick={() => selectModalClassesByGrade('Class 9')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      9th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectModalClassesByGrade('Class 10')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      10th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectModalClassesByGrade('Class 11')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      11th
                    </button>
                    <button
                      type="button"
                      onClick={() => selectModalClassesByGrade('Class 12')}
                      className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 cursor-pointer"
                    >
                      12th
                    </button>
                    <button
                      type="button"
                      onClick={clearModalClasses}
                      className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                    {ALL_CLASS_SECTIONS.map((cs) => {
                      const isSelected = modalAllocatedClasses.includes(cs);
                      return (
                        <button
                          key={cs}
                          type="button"
                          onClick={() => toggleModalClassSection(cs)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-indigo-50'
                          }`}
                        >
                          <span>{cs}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP 5: CONTACT & SALARY DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* SUBMIT BUTTONS */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg cursor-pointer flex items-center gap-2 active:scale-98"
                >
                  <UserPlus className="w-4 h-4" /> Save & Register Teacher in Central Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
