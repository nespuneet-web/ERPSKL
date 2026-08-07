import React, { useState } from 'react';
import { TeacherTimetableRecord, TIMETABLE_DAYS, TIMETABLE_PERIODS } from './timetableData';
import { parseUploadedExcel, downloadExcelTemplate } from './excelParser';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BulkUploadSectionProps {
  existingTeachers: TeacherTimetableRecord[];
  onUploadSuccess: (newTeachers: TeacherTimetableRecord[]) => void;
}

export const BulkUploadSection: React.FC<BulkUploadSectionProps> = ({
  existingTeachers,
  onUploadSuccess
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<TeacherTimetableRecord[] | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle Download Excel Template
  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate(existingTeachers);
    } catch (err: any) {
      alert('Failed to generate template: ' + err.message);
    }
  };

  // Process selected or dropped file
  const handleFileProcess = async (file: File) => {
    setIsParsing(true);
    setErrorMessage(null);
    setParsedResults(null);

    try {
      const records = await parseUploadedExcel(file);
      setParsedResults(records);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing Excel file. Please ensure the file format matches the template.');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!parsedResults) return;
    onUploadSuccess(parsedResults);
    alert(`Successfully imported timetables for ${parsedResults.length} teachers!`);
    setParsedResults(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Excel Bulk Importer
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Bulk Teacher Timetable Upload & Parser
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload Excel sheet containing all teachers' schedules arranged with Days (Monday - Saturday) and Period numbers (0 - 8).
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
        >
          <Download className="w-4 h-4" /> Download Standard Excel Format (.xlsx)
        </button>
      </div>

      {/* DRAG AND DROP UPLOAD ZONE */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed rounded-2xl text-center space-y-4 transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <Upload className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Drag & Drop Teacher Timetable Excel File (.xlsx / .csv)
          </h3>
          <p className="text-xs text-slate-500">
            Supported formats: Microsoft Excel Spreadsheet (.xlsx, .xls) or Comma Separated Values (.csv)
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <label className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer inline-flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Select Excel File from Computer
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>

        {isParsing && (
          <div className="pt-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600">
            <RefreshCw className="w-4 h-4 animate-spin" /> Reading and parsing Excel rows...
          </div>
        )}
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Excel Parsing Warning</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* PARSED PREVIEW REPORT */}
      {parsedResults && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Excel File Successfully Parsed!
                </h3>
                <p className="text-xs text-slate-500">
                  Detected {parsedResults.length} teacher schedule rows. Review preview below before committing to database.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmImport}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Apply All Timetables
            </button>
          </div>

          {/* TEACHERS LIST PARSED PREVIEW GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              Parsed Teachers Summary ({parsedResults.length} Teachers Found)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {parsedResults.map((t) => {
                const slotsCount = Object.keys(t.schedule).length;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white font-black text-sm">
                        {t.teacherName}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {slotsCount} Slots Assigned
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">
                      Sample slots: {Object.entries(t.schedule).slice(0, 3).map(([k, v]) => `${k.replace('_', ' P#')}:${v}`).join(', ')}...
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SAMPLE FORMAT GUIDE */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-3">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Expected Excel Matrix Layout Reference
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border text-[11px] bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-200 dark:bg-slate-800 font-bold border-b text-center">
                <th className="p-2 border text-left">Teacher Name</th>
                <th colSpan={3} className="p-2 border bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">Monday</th>
                <th colSpan={3} className="p-2 border bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200">Tuesday</th>
                <th colSpan={3} className="p-2 border bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">... Saturday</th>
              </tr>
              <tr className="bg-slate-100 dark:bg-slate-800 text-center font-mono">
                <th className="p-1 border text-left font-sans">Period #</th>
                <th className="p-1 border">0</th>
                <th className="p-1 border">1</th>
                <th className="p-1 border">... 8</th>
                <th className="p-1 border">0</th>
                <th className="p-1 border">1</th>
                <th className="p-1 border">... 8</th>
                <th className="p-1 border">0</th>
                <th className="p-1 border">1</th>
                <th className="p-1 border">... 8</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-bold">ANIL KUMAR SINGH</td>
                <td className="p-2 border text-center text-slate-400">-</td>
                <td className="p-2 border text-center font-bold">XII A</td>
                <td className="p-2 border text-center">...</td>
                <td className="p-2 border text-center font-bold">X A</td>
                <td className="p-2 border text-center text-slate-400">-</td>
                <td className="p-2 border text-center">...</td>
                <td className="p-2 border text-center font-bold">XII A</td>
                <td className="p-2 border text-center text-slate-400">-</td>
                <td className="p-2 border text-center">...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
