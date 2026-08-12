import React, { useState } from 'react';
import { AdmissionApplication } from '../../types/admission';
import { useSisStore } from '../sis/sisStore';
import { ALL_SCHOOL_CLASSES, GROUP_A_INDOOR_ACTIVITIES, GROUP_B_OUTDOOR_ACTIVITIES } from '../../data/mockData';
import { X, CheckCircle, Shield, Award, Users, Layers, Sparkles } from 'lucide-react';

interface AllocationModalProps {
  application: AdmissionApplication;
  onClose: () => void;
  onAllocationComplete: (updatedApp: AdmissionApplication) => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  application,
  onClose,
  onAllocationComplete
}) => {
  const { houses, clubs, addStudent, students } = useSisStore();

  const [section, setSection] = useState('A');
  const [selectedHouse, setSelectedHouse] = useState(houses[0]?.name || 'Agni (Red)');
  const [selectedClub, setSelectedClub] = useState(clubs[0]?.name || 'Eco & Green Club');
  const [selectedIndoor, setSelectedIndoor] = useState(GROUP_A_INDOOR_ACTIVITIES[0] || 'Chess');
  const [selectedOutdoor, setSelectedOutdoor] = useState(GROUP_B_OUTDOOR_ACTIVITIES[0] || 'Cricket');
  const [banner, setBanner] = useState<string | null>(null);

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if student already exists in SIS
    const existing = students.find((s) => s.fullName.toLowerCase() === application.studentName.toLowerCase());

    if (!existing) {
      // Create new student in master SIS roster
      addStudent({
        admissionNo: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
        registrationNo: `REG-${Math.floor(10000 + Math.random() * 90000)}`,
        scholarNo: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
        penNo: `PEN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        apaarId: `APAAR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        aadhaarNo: '7812 9012 3456',
        fullName: application.studentName,
        gender: application.gender || 'Male',
        dob: application.dob || '2010-05-10',
        bloodGroup: 'O+',
        religion: 'Hinduism',
        category: 'General',
        nationality: 'Indian',
        motherTongue: 'Hindi',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionClass: application.applyingClass,
        currentClass: application.applyingClass,
        section: section,
        rollNo: students.length + 1,
        house: selectedHouse,
        clubName: selectedClub,
        groupAActivity: selectedIndoor,
        groupBActivity: selectedOutdoor,
        transportRequired: true,
        busRouteNo: 'Route 1 - Civil Lines Metro',
        hostelRequired: false,
        parents: {
          fatherName: application.parentName,
          fatherMobile: application.contactNumber,
          fatherEmail: application.email || 'parent@example.com',
          fatherOccupation: application.parentOccupation || 'Doctor / Engineer',
          fatherIncome: '18,00,000 PA',
          fatherQualification: 'Graduate',
          motherName: 'Mother',
          motherOccupation: application.motherOccupation || 'Educator',
          motherMobile: application.contactNumber,
          motherEmail: application.email || 'mother@example.com',
          address: 'Main Town, Delhi NCR',
          emergencyContact: application.contactNumber
        },
        medical: { bloodGroup: 'O+', disability: false },
        documents: [],
        siblings: [],
        promotions: [],
        status: 'Active'
      });
    }

    const updatedApp: AdmissionApplication = {
      ...application,
      status: 'Confirmed'
    };

    setBanner(`Successfully allocated Section ${section}, ${selectedHouse}, ${selectedClub}, ${selectedIndoor} & ${selectedOutdoor} for ${application.studentName}! Registered into Master SIS Roster.`);

    setTimeout(() => {
      onAllocationComplete(updatedApp);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-extrabold">Post-Admission Student Allocation Engine</h3>
              <p className="text-xs text-slate-500">Candidate: {application.studentName} ({application.applyingClass})</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {banner && (
          <div className="p-3 bg-emerald-50 text-emerald-900 font-extrabold text-xs rounded-xl border border-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{banner}</span>
          </div>
        )}

        <form onSubmit={handleConfirmAllocation} className="space-y-4">
          {/* SECTION ALLOCATION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" /> Allocate Class Section *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['A', 'B', 'C', 'D'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSection(sec)}
                  className={`py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
                    section === sec
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Section {sec}
                </button>
              ))}
            </div>
          </div>

          {/* HOUSE ALLOCATION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" /> Allocate House *
            </label>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              {houses.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name} ({h.motto})
                </option>
              ))}
            </select>
          </div>

          {/* CLUB ALLOCATION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Allocate Co-Curricular Club *
            </label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* GROUP A INDOOR & GROUP B OUTDOOR ACTIVITIES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" /> Group A: Indoor Activity *
              </label>
              <select
                value={selectedIndoor}
                onChange={(e) => setSelectedIndoor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
              >
                {GROUP_A_INDOOR_ACTIVITIES.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Group B: Outdoor Activity *
              </label>
              <select
                value={selectedOutdoor}
                onChange={(e) => setSelectedOutdoor(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
              >
                {GROUP_B_OUTDOOR_ACTIVITIES.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Allocations & Confirm Admission
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
