import React, { useState } from 'react';
import { CreditCard, Printer, QrCode, Search, UserCheck, Users, GraduationCap, Shield } from 'lucide-react';
import { useSisStore } from '../sis/sisStore';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { useSettingsStore } from '../settings/settingsStore';

export const IDCardsModule: React.FC = () => {
  const { students } = useSisStore();
  const { staff } = useOtherModulesStore();
  const { profile } = useSettingsStore();

  const [cardType, setCardType] = useState<'student' | 'staff'>('student');
  const [selectedClass, setSelectedClass] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const allClasses = Array.from(new Set(students.map((s) => s.currentClass))).filter(Boolean);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.currentClass}-${s.section}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || s.currentClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const filteredStaff = staff.filter((st) => {
    return (
      st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.employeeCode && st.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (st.department && st.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Smart Identity Badging Engine
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Digital PVC & RFID ID Card Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate and batch-print official PVC identity cards for students and faculty with QR codes for smart gate check-in, library borrowing, and bus transit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" /> Batch Print Cards ({cardType === 'student' ? filteredStudents.length : filteredStaff.length})
          </button>
        </div>
      </div>

      {/* Filter and Switch Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setCardType('student')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cardType === 'student'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student ID Cards ({students.length})
          </button>
          <button
            onClick={() => setCardType('staff')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              cardType === 'staff'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Faculty / Staff ID Cards ({staff.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {cardType === 'student' && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="All">All Classes</option>
              {allClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={cardType === 'student' ? 'Search student name, adm no...' : 'Search staff name, code...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ID Cards Printable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
        {cardType === 'student' ? (
          filteredStudents.map((stu) => (
            <div
              key={stu.id}
              className="w-full max-w-[320px] bg-white text-slate-900 rounded-2xl border-2 border-indigo-950 shadow-xl overflow-hidden mx-auto flex flex-col justify-between hover:shadow-2xl transition-all print:shadow-none print:border"
            >
              {/* Header Ribbon */}
              <div className="bg-indigo-950 text-white p-3 text-center border-b-2 border-amber-400">
                <h3 className="font-black text-xs tracking-wider uppercase truncate">
                  {profile.schoolName || 'ST. XAVIER HIGHER SECONDARY'}
                </h3>
                <p className="text-[9px] font-bold text-amber-300 tracking-widest uppercase">
                  STUDENT IDENTITY CARD
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 text-center flex-1 flex flex-col justify-between">
                <div>
                  {/* Photo Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-tr from-indigo-100 to-indigo-50 border-2 border-indigo-900 rounded-2xl mx-auto flex items-center justify-center font-black text-indigo-950 text-2xl shadow-inner relative overflow-hidden">
                    {stu.avatarUrl ? (
                      <img src={stu.avatarUrl} alt={stu.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{stu.fullName.charAt(0)}</span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mt-2 truncate">{stu.fullName}</h4>
                  <p className="text-xs font-bold text-indigo-600">
                    {stu.currentClass} - Section {stu.section} (Roll: {stu.rollNo || '01'})
                  </p>
                </div>

                {/* Info Pills */}
                <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl text-left space-y-1 border border-slate-200">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Adm No:</span> <strong className="font-mono">{stu.admissionNo}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">DOB:</span> <strong>{stu.dob || '15-05-2010'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Parent Phone:</span> <strong className="font-mono">{stu.parents?.fatherPhone || stu.parents?.motherPhone || '+91 98765 43210'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Blood Group:</span> <strong className="text-rose-600 font-bold">{stu.bloodGroup || 'O+'}</strong>
                  </p>
                </div>

                {/* Footer QR / Barcode & Principal */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 font-mono">SCAN FOR GATE PASS</p>
                    <QrCode className="w-7 h-7 text-indigo-950" />
                  </div>
                  <div className="text-right">
                    <div className="w-16 border-b border-slate-400 mb-0.5 ml-auto"></div>
                    <p className="text-[9px] font-bold text-indigo-950">Principal</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredStaff.map((stf) => (
            <div
              key={stf.id}
              className="w-full max-w-[320px] bg-white text-slate-900 rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden mx-auto flex flex-col justify-between hover:shadow-2xl transition-all print:shadow-none print:border"
            >
              {/* Header Ribbon */}
              <div className="bg-slate-900 text-white p-3 text-center border-b-2 border-indigo-500">
                <h3 className="font-black text-xs tracking-wider uppercase truncate">
                  {profile.schoolName || 'ST. XAVIER HIGHER SECONDARY'}
                </h3>
                <p className="text-[9px] font-bold text-indigo-300 tracking-widest uppercase">
                  STAFF & FACULTY CARD
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 text-center flex-1 flex flex-col justify-between">
                <div>
                  {/* Photo Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-tr from-slate-100 to-indigo-50 border-2 border-slate-900 rounded-2xl mx-auto flex items-center justify-center font-black text-slate-900 text-2xl shadow-inner relative overflow-hidden">
                    {stf.avatarUrl ? (
                      <img src={stf.avatarUrl} alt={stf.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{stf.fullName.charAt(0)}</span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mt-2 truncate">{stf.fullName}</h4>
                  <p className="text-xs font-bold text-indigo-600 truncate">
                    {stf.designation} ({stf.department})
                  </p>
                </div>

                {/* Info Pills */}
                <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl text-left space-y-1 border border-slate-200">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Emp Code:</span> <strong className="font-mono">{stf.employeeCode || 'EMP-101'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span> <strong className="font-mono">{stf.phone || '+91 98111 22334'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Status:</span> <strong className="text-emerald-600 font-bold">{stf.status || 'Active'}</strong>
                  </p>
                </div>

                {/* Footer QR / Barcode & Principal */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[8px] text-slate-400 font-mono">STAFF RFID TOKEN</p>
                    <QrCode className="w-7 h-7 text-slate-900" />
                  </div>
                  <div className="text-right">
                    <div className="w-16 border-b border-slate-400 mb-0.5 ml-auto"></div>
                    <p className="text-[9px] font-bold text-slate-900">Director / Admin</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cardType === 'student' && filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No students match your filter criteria.</p>
        </div>
      )}

      {cardType === 'staff' && filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No staff members match your filter criteria.</p>
        </div>
      )}
    </div>
  );
};

