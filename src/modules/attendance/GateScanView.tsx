import React, { useState } from 'react';
import { ShieldCheck, Save, Search, Scan, CheckCircle2, XCircle, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Student } from '../../types/sis';

interface GateScanViewProps {
  students: Student[];
  gateAttendanceState: Record<string, boolean>;
  onToggleGateStudent: (studentId: string) => void;
  onSetAllGateStudents: (isPresent: boolean) => void;
  onSaveGateAttendance: () => void;
}

export const GateScanView: React.FC<GateScanViewProps> = ({
  students,
  gateAttendanceState,
  onToggleGateStudent,
  onSetAllGateStudents,
  onSaveGateAttendance
}) => {
  const [scanInput, setScanInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  // Independent students (not using bus) or all students toggle
  const independentStudents = students.filter((s) => !s.transportRequired || true);

  // Alphabetically sorted students
  const alphabetSortedStudents = [...independentStudents].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  // Filtered by Search & Selected Letter
  const filteredStudents = alphabetSortedStudents.filter((s) => {
    const matchesLetter =
      selectedLetter === 'ALL' || s.fullName.trim().toUpperCase().startsWith(selectedLetter);
    const matchesQuery =
      !searchQuery ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toString().includes(searchQuery) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLetter && matchesQuery;
  });

  // Calculate Present & Absent counts
  const totalCount = independentStudents.length;
  const presentCount = independentStudents.filter((s) => gateAttendanceState[s.id] ?? true).length;
  const absentCount = totalCount - presentCount;

  // Handle ID card scan (barcode or manual code entry)
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const query = scanInput.trim().toLowerCase();
    const foundStudent = independentStudents.find(
      (s) =>
        s.id.toLowerCase() === query ||
        s.admissionNo.toLowerCase() === query ||
        s.rollNo.toString() === query ||
        s.fullName.toLowerCase().includes(query)
    );

    if (foundStudent) {
      if (!(gateAttendanceState[foundStudent.id] ?? true)) {
        onToggleGateStudent(foundStudent.id);
      }
      setScanMessage({
        type: 'success',
        text: `ID Card Scanned: ${foundStudent.fullName} (Roll #${foundStudent.rollNo}) marked PRESENT!`
      });
      setScanInput('');
    } else {
      setScanMessage({
        type: 'error',
        text: `No student found matching ID / Code "${scanInput}". Please try again.`
      });
    }

    setTimeout(() => {
      setScanMessage(null);
    }, 4000);
  };

  const alphabetList = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Header & Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Independent Arrival Module
            </span>
            <span className="text-xs text-slate-500">• Alphabetically Ordered Roster</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            School Gate Independent Arrival & ID Card Scan Attendance
          </h3>
          <p className="text-xs text-slate-500">
            Scan student ID cards or tap student profiles. Present children are highlighted in Green and Absent in Red.
          </p>
        </div>

        {/* Action Controls & Batch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSetAllGateStudents(true)}
            className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 rounded-lg border border-emerald-300 cursor-pointer"
          >
            Mark All {totalCount} Children Present (Green)
          </button>

          <button
            onClick={onSaveGateAttendance}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Gate Attendance
          </button>
        </div>
      </div>

      {/* ID CARD SCANNER INPUT BAR */}
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
        <form onSubmit={handleScanSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs shrink-0">
            <Scan className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span>ID Card Barcode / RFID Scanner:</span>
          </div>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Scan ID Card or type Roll No / Student Name (e.g. 101, ADM-2024)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow shrink-0 w-full md:w-auto"
          >
            Verify Scan ID Card
          </button>
        </form>

        {/* Scan Notification Alert Banner */}
        {scanMessage && (
          <div
            className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
              scanMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}
          >
            {scanMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{scanMessage.text}</span>
          </div>
        )}
      </div>

      {/* FILTER & ALPHABET JUMPER TOOLBAR */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          {/* Live Count Metrics */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              Total: <strong>{totalCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present (Green): <strong>{presentCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent (Red): <strong>{absentCount}</strong>
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search student name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* A-Z Alphabet Quick Bar Jumper */}
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
          <span className="text-slate-400 px-2 shrink-0">A-Z Jumper:</span>
          {alphabetList.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-2 py-1 rounded cursor-pointer transition-all shrink-0 ${
                selectedLetter === letter
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* ALPHABETICAL STUDENT GRID (GREEN = PRESENT, RED = ABSENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStudents.map((st) => {
          const isPresent = gateAttendanceState[st.id] ?? true;

          return (
            <div
              key={st.id}
              onClick={() => onToggleGateStudent(st.id)}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center justify-between shadow-xs ${
                isPresent
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                  : 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    isPresent
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {st.fullName.charAt(0)}
                </div>

                <div>
                  <h4 className="font-bold text-xs">{st.fullName}</h4>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    {st.currentClass}-{st.section} | Roll #{st.rollNo}
                  </p>
                  <p className="text-[9px] font-mono mt-0.5 font-bold">
                    ID: {st.admissionNo || `STD-${st.rollNo}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Simulate ID card scan specifically for this student
                    if (!isPresent) onToggleGateStudent(st.id);
                    setScanMessage({
                      type: 'success',
                      text: `ID Card Scanned: ${st.fullName} marked PRESENT!`
                    });
                  }}
                  title="Simulate ID Card Tap"
                  className="p-1.5 rounded-md bg-white/60 dark:bg-slate-800/60 hover:bg-white text-slate-700 dark:text-slate-200 border text-[10px] font-bold"
                >
                  <Scan className="w-3.5 h-3.5 text-emerald-600" />
                </button>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isPresent ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isPresent ? '✓' : '✗'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
          No students found matching letter "{selectedLetter}" or query "{searchQuery}".
        </div>
      )}
    </div>
  );
};
