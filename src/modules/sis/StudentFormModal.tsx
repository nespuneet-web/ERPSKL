import React, { useState } from 'react';
import { Student } from '../../types/sis';
import { X, Save, User, FileText, Bus, Home, Heart } from 'lucide-react';

interface StudentFormModalProps {
  student?: Student | null;
  onClose: () => void;
  onSave: (studentData: any) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ student, onClose, onSave }) => {
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [admissionNo, setAdmissionNo] = useState(student?.admissionNo || `ADM-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [registrationNo, setRegistrationNo] = useState(student?.registrationNo || `REG-${Math.floor(10000 + Math.random() * 90000)}`);
  const [scholarNo, setScholarNo] = useState(student?.scholarNo || `SCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [penNo, setPenNo] = useState(student?.penNo || `PEN-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [apaarId, setApaarId] = useState(student?.apaarId || `APAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`);
  const [aadhaarNo, setAadhaarNo] = useState(student?.aadhaarNo || '4812 9012 3456');

  const [gender, setGender] = useState<Student['gender']>(student?.gender || 'Male');
  const [dob, setDob] = useState(student?.dob || '2010-05-15');
  const [bloodGroup, setBloodGroup] = useState(student?.bloodGroup || 'O+');
  const [religion, setReligion] = useState(student?.religion || 'Hinduism');
  const [category, setCategory] = useState<Student['category']>(student?.category || 'General');
  const [motherTongue, setMotherTongue] = useState(student?.motherTongue || 'Hindi');

  const [currentClass, setCurrentClass] = useState(student?.currentClass || 'Class 10');
  const [section, setSection] = useState(student?.section || 'A');
  const [rollNo, setRollNo] = useState(student?.rollNo || 1);
  const [house, setHouse] = useState<Student['house']>(student?.house || 'Red');

  const [fatherName, setFatherName] = useState(student?.parents.fatherName || '');
  const [fatherMobile, setFatherMobile] = useState(student?.parents.fatherMobile || '');
  const [motherName, setMotherName] = useState(student?.parents.motherName || '');
  const [address, setAddress] = useState(student?.parents.address || '');

  const [transportRequired, setTransportRequired] = useState(student?.transportRequired || false);
  const [hostelRequired, setHostelRequired] = useState(student?.hostelRequired || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      fullName,
      admissionNo,
      registrationNo,
      scholarNo,
      penNo,
      apaarId,
      aadhaarNo,
      gender,
      dob,
      bloodGroup,
      religion,
      category,
      nationality: 'Indian',
      motherTongue,
      photoUrl: student?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      admissionDate: student?.admissionDate || new Date().toISOString().split('T')[0],
      admissionClass: student?.admissionClass || currentClass,
      currentClass,
      section,
      rollNo: Number(rollNo),
      house,
      transportRequired,
      busRouteNo: transportRequired ? 'Route 1 - Model Town' : undefined,
      hostelRequired,
      hostelRoomNo: hostelRequired ? 'Block A - 102' : undefined,
      parents: {
        fatherName,
        fatherOccupation: student?.parents?.fatherOccupation || 'Business/Service',
        fatherMobile,
        fatherEmail: student?.parents?.fatherEmail || `${fatherName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        fatherIncome: student?.parents?.fatherIncome || '12,00,000 PA',
        fatherQualification: student?.parents?.fatherQualification || 'Graduate',
        motherName,
        motherOccupation: student?.parents?.motherOccupation || 'Homemaker/Service',
        motherMobile: student?.parents?.motherMobile || fatherMobile,
        motherEmail: student?.parents?.motherEmail || '',
        address,
        emergencyContact: fatherMobile
      },
      medical: student?.medical || { bloodGroup, disability: false },
      documents: student?.documents || [],
      siblings: student?.siblings || [],
      promotions: student?.promotions || [],
      status: student?.status || 'Active'
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            {student ? 'Edit Student Record' : 'New Student Registration (SIS)'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Identity Numbers */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">
              1. Official Government & School IDs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Permanent Education Number (PEN)</label>
                <input
                  type="text"
                  required
                  value={penNo}
                  onChange={(e) => setPenNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">APAAR ID</label>
                <input
                  type="text"
                  required
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  required
                  value={aadhaarNo}
                  onChange={(e) => setAadhaarNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">
              2. Student Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Admission Number</label>
                <input
                  type="text"
                  required
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Placement */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">
              3. Class & House Allocation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
                <select
                  value={currentClass}
                  onChange={(e) => setCurrentClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11 Science">Class 11 Science</option>
                  <option value="Class 12 Science">Class 12 Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                <input
                  type="number"
                  min={1}
                  value={rollNo}
                  onChange={(e) => setRollNo(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">House</label>
                <select
                  value={house}
                  onChange={(e) => setHouse(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Red">Red House</option>
                  <option value="Blue">Blue House</option>
                  <option value="Green">Green House</option>
                  <option value="Yellow">Yellow House</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">
              4. Parent & Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Father's Name *</label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Father's Mobile *</label>
                <input
                  type="text"
                  required
                  value={fatherMobile}
                  onChange={(e) => setFatherMobile(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-3">
              5. Opted School Services
            </h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transportRequired}
                  onChange={(e) => setTransportRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                Opt Bus Transport
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hostelRequired}
                  onChange={(e) => setHostelRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                Opt Hostel Accommodation
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Student Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
