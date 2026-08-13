import { useState, useEffect } from 'react';
import {
  syncStudentAcademicPermissionsToSupabase,
  fetchStudentAcademicPermissionsFromSupabase
} from '../../lib/supabaseSync';

export interface StudentAcademicPermission {
  studentId: string;
  studentName: string;
  className: string;
  halfYearlyGranted: boolean;
  annualGranted: boolean;
  unitTestGranted: boolean;
  reportCardActive: boolean;
  updatedAt: string;
  grantedBy: string;
}

const PERMISSIONS_KEY = 'schoolerp_academic_permissions_v2';
const GLOBAL_ACTIVE_KEY = 'schoolerp_report_card_active_global';

const DEFAULT_PERMISSIONS: StudentAcademicPermission[] = [
  {
    studentId: 'std-101',
    studentName: 'Aarav Sharma',
    className: 'Class 10-A',
    halfYearlyGranted: true,
    annualGranted: true,
    unitTestGranted: true,
    reportCardActive: true,
    updatedAt: new Date().toISOString().split('T')[0],
    grantedBy: 'Admission Panel'
  },
  {
    studentId: 'std-102',
    studentName: 'Ananya Verma',
    className: 'Class 10-A',
    halfYearlyGranted: true,
    annualGranted: true,
    unitTestGranted: true,
    reportCardActive: true,
    updatedAt: new Date().toISOString().split('T')[0],
    grantedBy: 'Admission Panel'
  },
  {
    studentId: 'std-105',
    studentName: 'Abhir Sharma',
    className: 'Class 10-A',
    halfYearlyGranted: true,
    annualGranted: true,
    unitTestGranted: true,
    reportCardActive: true,
    updatedAt: new Date().toISOString().split('T')[0],
    grantedBy: 'Admission Panel'
  },
  {
    studentId: 'std-106',
    studentName: 'Amit Kumar',
    className: 'Class 10-A',
    halfYearlyGranted: true,
    annualGranted: true,
    unitTestGranted: true,
    reportCardActive: true,
    updatedAt: new Date().toISOString().split('T')[0],
    grantedBy: 'Admission Panel'
  }
];

export function useAcademicPermissions() {
  const [permissions, setPermissions] = useState<StudentAcademicPermission[]>(() => {
    try {
      const saved = localStorage.getItem(PERMISSIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading academic permissions:', e);
    }
    return DEFAULT_PERMISSIONS;
  });

  const [globalReportCardActive, setGlobalReportCardActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_ACTIVE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    } catch (e) {
      console.error('Error saving permissions:', e);
    }
  }, [permissions]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_ACTIVE_KEY, JSON.stringify(globalReportCardActive));
    } catch (e) {
      console.error('Error saving global report active:', e);
    }
  }, [globalReportCardActive]);

  // Remote Supabase Load on mount
  useEffect(() => {
    let active = true;
    async function loadRemotePermissions() {
      const remote = await fetchStudentAcademicPermissionsFromSupabase();
      if (remote && remote.length > 0 && active) {
        setPermissions((prev) => {
          const map: Record<string, StudentAcademicPermission> = {};
          prev.forEach((p) => { map[p.studentId] = p; });
          remote.forEach((p) => { map[p.studentId] = p; });
          return Object.values(map);
        });
      }
    }
    loadRemotePermissions();
    return () => { active = false; };
  }, []);

  const toggleStudentPermission = (studentId: string, field: 'halfYearlyGranted' | 'annualGranted' | 'unitTestGranted' | 'reportCardActive') => {
    let updatedPerm: StudentAcademicPermission | null = null;
    setPermissions((prev) => {
      const exists = prev.some((p) => p.studentId === studentId);
      if (!exists) {
        updatedPerm = {
          studentId,
          studentName: 'Student',
          className: 'Class 10-A',
          halfYearlyGranted: field === 'halfYearlyGranted' ? false : true,
          annualGranted: field === 'annualGranted' ? false : true,
          unitTestGranted: field === 'unitTestGranted' ? false : true,
          reportCardActive: field === 'reportCardActive' ? false : true,
          updatedAt: new Date().toISOString().split('T')[0],
          grantedBy: 'Admission Panel'
        };
        return [...prev, updatedPerm];
      }
      return prev.map((p) => {
        if (p.studentId === studentId) {
          updatedPerm = { ...p, [field]: !p[field], updatedAt: new Date().toISOString().split('T')[0] };
          return updatedPerm;
        }
        return p;
      });
    });

    if (updatedPerm) {
      syncStudentAcademicPermissionsToSupabase(updatedPerm);
    }
  };

  const grantAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((p) => ({ ...p, halfYearlyGranted: true, annualGranted: true, unitTestGranted: true, reportCardActive: true, updatedAt: new Date().toISOString().split('T')[0] }))
    );
    setGlobalReportCardActive(true);
  };

  const revokeAllPermissions = () => {
    setPermissions((prev) =>
      prev.map((p) => ({ ...p, halfYearlyGranted: false, annualGranted: false, unitTestGranted: false, reportCardActive: false, updatedAt: new Date().toISOString().split('T')[0] }))
    );
    setGlobalReportCardActive(false);
  };

  const getStudentPermission = (studentId: string): StudentAcademicPermission => {
    const found = permissions.find((p) => p.studentId === studentId);
    if (found) return found;
    return {
      studentId,
      studentName: 'Student',
      className: 'Class 10-A',
      halfYearlyGranted: true,
      annualGranted: true,
      unitTestGranted: true,
      reportCardActive: true,
      updatedAt: new Date().toISOString().split('T')[0],
      grantedBy: 'Admission Panel'
    };
  };

  return {
    permissions,
    globalReportCardActive,
    setGlobalReportCardActive,
    toggleStudentPermission,
    grantAllPermissions,
    revokeAllPermissions,
    getStudentPermission
  };
}
