import { useState, useEffect } from 'react';
import { AdmissionApplication, SeatAvailability } from '../../types/admission';
import { INITIAL_APPLICATIONS } from '../../data/mockData';

const ADMISSION_STORAGE_KEY = 'schoolerp_admission_apps_v1';

const INITIAL_SEATS: SeatAvailability[] = [
  { className: 'Nursery', totalSeats: 60, filledSeats: 48, reservedSeats: 5, availableSeats: 7 },
  { className: 'KG', totalSeats: 60, filledSeats: 55, reservedSeats: 3, availableSeats: 2 },
  { className: 'Class 1', totalSeats: 80, filledSeats: 72, reservedSeats: 5, availableSeats: 3 },
  { className: 'Class 6', totalSeats: 80, filledSeats: 68, reservedSeats: 6, availableSeats: 6 },
  { className: 'Class 11 Science', totalSeats: 50, filledSeats: 35, reservedSeats: 5, availableSeats: 10 }
];

export function useAdmissionStore() {
  const [applications, setApplications] = useState<AdmissionApplication[]>(() => {
    const saved = localStorage.getItem(ADMISSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [seats] = useState<SeatAvailability[]>(INITIAL_SEATS);

  useEffect(() => {
    localStorage.setItem(ADMISSION_STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const addApplication = (app: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'applicationDate' | 'status'>) => {
    const newApp: AdmissionApplication = {
      ...app,
      id: `app-${Date.now()}`,
      applicationNo: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Received'
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateApplicationStatus = (id: string, status: AdmissionApplication['status'], remarks?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, interviewRemarks: remarks || a.interviewRemarks } : a
      )
    );
  };

  return {
    applications,
    seats,
    addApplication,
    updateApplicationStatus
  };
}
