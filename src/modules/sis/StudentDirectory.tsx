import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { ALL_SCHOOL_CLASSES } from '../../data/mockData';
import { Search, Filter, Plus, Eye, Edit2, Trash2, ShieldCheck, Bus, Home, FileText, UserCheck, Download, Award, Shield } from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddNew: () => void;
}


export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onAddNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.penNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apaarId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.aadhaarNo.includes(searchTerm);

    const matchesClass = selectedClass === 'All' || student.currentClass === selectedClass;
    const matchesSection = selectedSection === 'All' || student.section === selectedSection;
    const matchesHouse = selectedHouse === 'All' || student.house === selectedHouse;
    const matchesCategory = selectedCategory === 'All' || student.category === selectedCategory;

    return matchesSearch && matchesClass && matchesSection && matchesHouse && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['Admission No', 'PEN Number', 'APAAR ID', 'Full Name', 'Class', 'Section', 'Roll No', 'Gender', 'Father Name', 'Mobile'];
    const rows = filteredStudents.map((s) => [
      s.admissionNo,
      s.penNo,
      s.apaarId,
      s.fullName,
      s.currentClass,
      s.section,
      s.rollNo,
      s.gender,
      s.parents.fatherName,
      s.parents.fatherMobile
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Student_Directory_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Student Directory (SIS)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Total Enrolled: <span className="font-semibold text-slate-900 dark:text-white">{students.length}</span> | Displaying: <span className="font-semibold text-indigo-600">{filteredStudents.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Registration
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Field */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Admission No, PEN No, APAAR ID, Aadhaar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
            >
              <option value="All">All Classes (PG to 12th)</option>
              {ALL_SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* House Filter */}
          <div>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="All">All Houses</option>
              <option value="Red">Red House</option>
              <option value="Blue">Blue House</option>
              <option value="Green">Green House</option>
              <option value="Yellow">Yellow House</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">PEN & APAAR ID</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">House & Club</th>
                <th className="py-3 px-4">Activities (Indoor / Outdoor)</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No students match your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.admissionNo} | Aadhaar: {student.aadhaarNo}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <p className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{student.penNo}</p>
                      <p className="font-mono text-slate-500">{student.apaarId}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {student.currentClass} - {student.section} (Roll: {student.rollNo})
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        <span>House: {student.house || 'Agni (Red)'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Club: {student.clubName || 'Eco & Green Club'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs space-y-1">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Indoor:</span> {student.groupAActivity || 'Chess'}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Outdoor:</span> {student.groupBActivity || 'Cricket'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{student.parents.fatherName}</p>
                      <p className="text-slate-500">{student.parents.fatherMobile}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {student.transportRequired && (
                          <span title="Transport Subscribed" className="p-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                            <Bus className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {student.hostelRequired && (
                          <span title="Hostel Allocated" className="p-1 rounded bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                            <Home className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span title="Documents Verified" className="p-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {student.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectStudent(student)}
                          title="View Full Profile"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
