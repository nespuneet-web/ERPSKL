import React, { useState } from 'react';
import { useSisStore } from './sisStore';
import { StudentDirectory } from './StudentDirectory';
import { StudentProfileView } from './StudentProfileView';
import { StudentFormModal } from './StudentFormModal';
import { StudentPortalView } from './StudentPortalView';
import { ParentPortalView } from './ParentPortalView';
import { Student } from '../../types/sis';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Eye, Plus, ShieldAlert } from 'lucide-react';

export const SisModule: React.FC = () => {
  const { students, syncStatus, addStudent, updateStudent, deleteStudent, addDocumentToStudent } = useSisStore();
  const { activeRole, logActivity, addNotification } = useAuth();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [subView, setSubView] = useState<'directory' | 'student-portal' | 'parent-portal'>('directory');

  const handleSaveStudent = (data: any) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
      logActivity('UPDATE_STUDENT', 'SIS', `Updated student record for ${data.fullName}`);
      addNotification({
        title: 'Student Profile Updated',
        message: `Changes saved for ${data.fullName} (${data.admissionNo}).`,
        type: 'info',
        module: 'SIS'
      });
      setEditingStudent(null);
    } else {
      const created = addStudent(data);
      logActivity('CREATE_STUDENT', 'SIS', `Registered new student ${data.fullName} with PEN ${data.penNo}`);
      addNotification({
        title: 'New Student Registered',
        message: `Registered ${data.fullName} under ${data.currentClass}-${data.section}.`,
        type: 'success',
        module: 'SIS'
      });
      setShowAddModal(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      deleteStudent(id);
      logActivity('DELETE_STUDENT', 'SIS', `Deleted student record ${id}`);
    }
  };

  // If role is Student or Parent, show their target portal directly with quick toggle
  if (activeRole === 'Student') {
    return <StudentPortalView student={students[0]} />;
  }

  if (activeRole === 'Parent') {
    return <ParentPortalView students={students} />;
  }

  return (
    <div className="space-y-6">
      {/* Live Sync Alert Banner */}
      {syncStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs rounded-xl shadow-xs animate-fade-in flex items-center justify-between">
          <span>{syncStatus}</span>
        </div>
      )}

      {/* SIS Mode Switcher Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => { setSubView('directory'); setSelectedStudent(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            subView === 'directory' && !selectedStudent
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Student Directory (Admin View)
        </button>

        <button
          onClick={() => { setSubView('student-portal'); setSelectedStudent(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            subView === 'student-portal'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Preview Student Portal
        </button>

        <button
          onClick={() => { setSubView('parent-portal'); setSelectedStudent(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            subView === 'parent-portal'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Preview Parent Portal
        </button>
      </div>

      {subView === 'student-portal' && <StudentPortalView student={selectedStudent || students[0]} />}
      {subView === 'parent-portal' && <ParentPortalView students={students} />}

      {subView === 'directory' && (
        <>
          {selectedStudent ? (
            <StudentProfileView
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
              onUploadDocument={(studentId, doc) => {
                addDocumentToStudent(studentId, doc);
                logActivity('UPLOAD_DOC', 'SIS', `Uploaded ${doc.title} for student ${studentId}`);
              }}
            />
          ) : (
            <StudentDirectory
              students={students}
              onSelectStudent={(s) => setSelectedStudent(s)}
              onEditStudent={(s) => setEditingStudent(s)}
              onDeleteStudent={handleDeleteStudent}
              onAddNew={() => setShowAddModal(true)}
            />
          )}
        </>
      )}

      {/* Add / Edit Student Modal */}
      {(showAddModal || editingStudent) && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => {
            setShowAddModal(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
};
