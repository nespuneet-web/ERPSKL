import { useState, useEffect } from 'react';
import { SchoolProfile, ClassSectionConfig, FeeHead, PermissionMatrix } from '../../types/settings';
import {
  syncClassConfigToSupabase,
  fetchClassConfigsFromSupabase,
  syncSchoolProfileToSupabase,
  fetchSchoolProfileFromSupabase
} from '../../lib/supabaseSync';

const SETTINGS_STORAGE_KEY = 'schoolerp_admin_settings_v1';

const INITIAL_PROFILE: SchoolProfile = {
  schoolName: 'ST. XAVIER HIGHER SECONDARY SCHOOL',
  affilNo: 'CBSE/AFF/330912',
  schoolCode: 'SCH-88201',
  address: '10, Institutional Area, Sector 15, New Delhi - 110001',
  phone: '+91 11 2788 9000',
  email: 'info@stxavierschool.edu',
  website: 'www.stxavierschool.edu',
  logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100',
  principalName: 'Dr. V. K. Sharma',
  academicYear: '2025-2026'
};

const INITIAL_CLASSES: ClassSectionConfig[] = [
  { id: 'cls-1', className: 'Class 9', sections: ['A', 'B', 'C'], classTeacherMapping: { A: 'Mrs. S. Roy', B: 'Mr. P. Kumar', C: 'Mrs. M. Das' } },
  { id: 'cls-2', className: 'Class 10', sections: ['A', 'B', 'C'], classTeacherMapping: { A: 'Mr. Rajesh Namboodiri', B: 'Mrs. K. Patel', C: 'Mr. A. Varma' } },
  { id: 'cls-3', className: 'Class 11 Science', sections: ['A', 'B'], classTeacherMapping: { A: 'Dr. Priya Nambiar', B: 'Mr. T. Sen' } },
  { id: 'cls-4', className: 'Class 12 Science', sections: ['A', 'B'], classTeacherMapping: { A: 'Dr. V. K. Gupta', B: 'Mrs. R. Kaur' } }
];

const INITIAL_FEE_HEADS: FeeHead[] = [
  { id: 'fh-1', headName: 'Tuition Fee', frequency: 'Monthly', defaultAmount: 4500 },
  { id: 'fh-2', headName: 'Admission Fee', frequency: 'One-Time', defaultAmount: 25000 },
  { id: 'fh-3', headName: 'Development Fund', frequency: 'Annually', defaultAmount: 12000 },
  { id: 'fh-4', headName: 'Computer & Science Lab', frequency: 'Quarterly', defaultAmount: 3000 },
  { id: 'fh-5', headName: 'Transport Service', frequency: 'Monthly', defaultAmount: 1500 }
];

export function useSettingsStore() {
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [classes, setClasses] = useState<ClassSectionConfig[]>(() => {
    const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [feeHeads, setFeeHeads] = useState<FeeHead[]>(() => {
    const saved = localStorage.getItem(`${SETTINGS_STORAGE_KEY}_feeheads`);
    return saved ? JSON.parse(saved) : INITIAL_FEE_HEADS;
  });

  useEffect(() => {
    localStorage.setItem(`${SETTINGS_STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${SETTINGS_STORAGE_KEY}_classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${SETTINGS_STORAGE_KEY}_feeheads`, JSON.stringify(feeHeads));
  }, [feeHeads]);

  // Load Remote Classes Config and School Profile from Supabase
  useEffect(() => {
    let active = true;
    async function loadRemoteData() {
      const [remoteClasses, remoteProfile] = await Promise.all([
        fetchClassConfigsFromSupabase(),
        fetchSchoolProfileFromSupabase()
      ]);

      if (remoteProfile && active) {
        setProfile((prev) => ({ ...prev, ...remoteProfile }));
      }

      if (remoteClasses && remoteClasses.length > 0 && active) {
        setClasses((prev) => {
          const map: Record<string, ClassSectionConfig> = {};
          prev.forEach((c) => { map[c.className] = c; });
          remoteClasses.forEach((rc) => {
            map[rc.className] = {
              id: rc.id,
              className: rc.className,
              sections: rc.sections || ['A'],
              classTeacherMapping: rc.classTeacherMapping || {}
            };
          });
          return Object.values(map);
        });
      }
    }
    loadRemoteData();
    return () => { active = false; };
  }, []);

  const updateProfile = async (fields: Partial<SchoolProfile>) => {
    const updated = { ...profile, ...fields };
    setProfile(updated);
    await syncSchoolProfileToSupabase(updated);
  };

  const addClassConfig = (cls: Omit<ClassSectionConfig, 'id'>) => {
    const newConfig = { ...cls, id: `cls-${Date.now()}` };
    setClasses((prev) => [...prev, newConfig]);

    syncClassConfigToSupabase({
      className: newConfig.className,
      section: newConfig.sections[0] || 'A',
      classTeacher: newConfig.classTeacherMapping[newConfig.sections[0] || 'A'] || 'Unassigned'
    });
  };

  const addFeeHead = (head: Omit<FeeHead, 'id'>) => {
    setFeeHeads((prev) => [...prev, { ...head, id: `fh-${Date.now()}` }]);
  };

  return {
    profile,
    updateProfile,
    classes,
    addClassConfig,
    feeHeads,
    addFeeHead
  };
}
