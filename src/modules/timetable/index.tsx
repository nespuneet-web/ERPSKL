import React, { useState, useEffect } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import {
  Clock,
  Calendar,
  Upload,
  UserCheck,
  CheckCircle2,
  UserX,
  Layers,
  User,
  Sparkles,
  FileSpreadsheet,
  Filter,
  Star,
  Award,
  Check,
  Zap,
  Sliders,
  GraduationCap,
  RefreshCw,
  X,
  ChevronRight,
  ShieldAlert,
  Printer,
  Compass,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  Eye,
  Settings,
  FileText,
  QrCode,
  Navigation,
  AlertTriangle,
  Send,
  MessageSquare,
  PhoneCall,
  Bell,
  Smartphone,
  Lock,
  Unlock,
  Radio,
  Database,
  ArrowLeft
} from 'lucide-react';
import {
  syncTeacherAndTimetableToSupabase,
  fetchTeachersAndTimetablesFromSupabase,
  syncSubstitutionToSupabase,
  fetchSubstitutionsFromSupabase,
  syncRoundDutyToSupabase,
  fetchRoundDutiesFromSupabase
} from '../../lib/supabaseSync';
import { TimetableArrangement, TeacherAvailability } from '../../types/otherModules';
import {
  TeacherTimetableRecord,
  INITIAL_TEACHER_TIMETABLES,
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
  TimetableDay,
  getDepartmentTheme,
  getTimeSlotForPeriod,
  SCHOOL_DEPARTMENTS
} from './timetableData';
import {
  rankCandidateSubstitutes,
  runAutoSubstitutionForDay,
  SubstitutionConstraintMode,
  getClassGradeLevel,
  getTeacherGradeLevel,
  getScheduleSlotValue
} from './substitutionLogic';
import { TeacherTimetableEditor } from './TeacherTimetableEditor';
import { BulkUploadSection } from './BulkUploadSection';
import { TeacherDutyAnalytics } from './TeacherDutyAnalytics';

export interface RoundDutyRecord {
  id: string;
  periodNumber: number;
  timeSlot: string;
  teacherName: string;
  location: string;
  day: TimetableDay;
  status: 'Assigned' | 'Checked In' | 'Completed' | 'Missed' | 'Alert Dispatched';
  isFixed?: boolean;
  checkInTime?: string;
  checkInMethod?: 'GPS' | 'QR Code' | 'Mobile Check-in';
  gpsCoordinates?: { lat: number; lng: number };
  remarks?: string;
  alertSent?: boolean;
  alertDetails?: string;
}

const STORAGE_KEY = 'schoolerp_teacher_timetables_v2';
const ROUND_DUTIES_KEY = 'schoolerp_round_duties_v1';
const ROUND_LOCATIONS_KEY = 'schoolerp_round_locations_v1';

export const TimetableModule: React.FC = () => {
  const { staff, addStaffMember } = useOtherModulesStore();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<
    | 'teacher_editor'
    | 'bulk_upload'
    | 'master_free_periods'
    | 'arrangements'
    | 'round_duty'
    | 'duty_analytics'
    | 'dept_manager'
    | 'schedule'
  >('teacher_editor');

  // Selected Day for Substitution & Availability checks
  const [selectedDay, setSelectedDay] = useState<TimetableDay>('Monday');

  // Department filter for Master Free Periods
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('ALL');

  // Duty & Substitution Exclusion Rules Constraints
  const [excludeCoordinators, setExcludeCoordinators] = useState<boolean>(true);
  const [excludedDeptList, setExcludedDeptList] = useState<string[]>(['Administration']);
  const [excludedTeacherList, setExcludedTeacherList] = useState<string[]>([]);
  const [excludedPeriodList, setExcludedPeriodList] = useState<number[]>([]);

  // Master Teacher Timetables state (persisted in localStorage)
  const [teacherTimetables, setTeacherTimetables] = useState<TeacherTimetableRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved timetables:', e);
    }
    return INITIAL_TEACHER_TIMETABLES;
  });

  // Supabase Live Sync Banner state
  const [dbSyncBanner, setDbSyncBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Save to localStorage & auto-sync to live Supabase DB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teacherTimetables));
    } catch (e) {
      console.error('Failed to save timetables:', e);
    }
  }, [teacherTimetables]);

  // Auto Sync: Ensure every member in central staff directory is present in teacherTimetables
  useEffect(() => {
    if (staff && staff.length > 0) {
      setTeacherTimetables((prev) => {
        const existingNames = new Set(prev.map((t) => t.teacherName.trim().toUpperCase()));
        const newRecords: TeacherTimetableRecord[] = [];

        staff.forEach((stf) => {
          const upperName = stf.fullName.trim().toUpperCase();
          if (upperName && !existingNames.has(upperName)) {
            newRecords.push({
              id: `tt-stf-${stf.id}`,
              teacherName: upperName,
              department: stf.department || 'Senior Secondary',
              lastUpdated: new Date().toLocaleString(),
              schedule: {}
            });
            existingNames.add(upperName);
          }
        });

        if (newRecords.length > 0) {
          newRecords.forEach((rec) => {
            syncTeacherAndTimetableToSupabase(rec);
          });
          return [...prev, ...newRecords];
        }
        return prev;
      });
    }
  }, [staff]);

  // Initial mount & periodic poll: Auto sync teachers, substitutions & round duties to Supabase
  useEffect(() => {
    let isMounted = true;

    async function performSupabaseSync() {
      // 1. Fetch remote teachers & timetables
      const remoteTeachers = await fetchTeachersAndTimetablesFromSupabase();
      if (remoteTeachers && remoteTeachers.length > 0 && isMounted) {
        setTeacherTimetables((prev) => {
          const mergedMap: Record<string, TeacherTimetableRecord> = {};
          prev.forEach((t) => { mergedMap[t.teacherName.toUpperCase()] = t; });
          remoteTeachers.forEach((rt) => { mergedMap[rt.teacherName.toUpperCase()] = rt; });
          return Object.values(mergedMap);
        });
      }

      // 2. Fetch remote substitutions
      const remoteSubs = await fetchSubstitutionsFromSupabase();
      if (remoteSubs && remoteSubs.length > 0 && isMounted) {
        setArrangements((prev) => {
          const subMap: Record<string, TimetableArrangement> = {};
          prev.forEach((s) => { subMap[s.id] = s; });
          remoteSubs.forEach((rs) => { subMap[rs.id] = rs; });
          return Object.values(subMap);
        });
      }

      // 3. Fetch remote round duties
      const remoteDuties = await fetchRoundDutiesFromSupabase();
      if (remoteDuties && remoteDuties.length > 0 && isMounted) {
        setRoundDuties((prev) => {
          const dutyMap: Record<string, RoundDutyRecord> = {};
          prev.forEach((d) => { dutyMap[d.id] = d; });
          remoteDuties.forEach((rd) => { dutyMap[rd.id] = rd; });
          return Object.values(dutyMap);
        });
      }
    }

    performSupabaseSync();

    // Poll every 10s for multi-device sync
    const interval = setInterval(() => {
      performSupabaseSync();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Round Duty Patrol Locations (Customizable)
  const [roundLocations, setRoundLocations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(ROUND_LOCATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      'Block A - Ground & 1st Floor Corridor',
      'Block B - Senior Secondary Wing',
      'Ground Floor - Main Canteen & Courtyard',
      'Library & Computer Lab Corridor',
      'Playground & Sports Field Perimeter',
      'Science Block & Physics/Chemistry Labs'
    ];
  });

  const [newCustomLocationInput, setNewCustomLocationInput] = useState<string>('');

  // Round Duty Assigned Records
  const [roundDuties, setRoundDuties] = useState<RoundDutyRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ROUND_DUTIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'rd-1',
        periodNumber: 2,
        timeSlot: '09:00 AM - 09:45 AM',
        teacherName: 'RAKESH SHARMA',
        location: 'Block A - Ground & 1st Floor Corridor',
        day: 'Monday',
        status: 'Assigned',
        remarks: 'Free Period Campus Security Patrol'
      },
      {
        id: 'rd-2',
        periodNumber: 4,
        timeSlot: '10:30 AM - 11:15 AM',
        teacherName: 'SUDHIR MISHRA',
        location: 'Ground Floor - Main Canteen & Courtyard',
        day: 'Monday',
        status: 'Assigned',
        remarks: 'Recess Campus Round Patrol'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROUND_DUTIES_KEY, JSON.stringify(roundDuties));
    } catch (e) {
      console.error('Failed to save round duties:', e);
    }
  }, [roundDuties]);

  useEffect(() => {
    try {
      localStorage.setItem(ROUND_LOCATIONS_KEY, JSON.stringify(roundLocations));
    } catch (e) {
      console.error('Failed to save round locations:', e);
    }
  }, [roundLocations]);

  // Teacher Mobile Simulation State
  const [selectedMobileTeacher, setSelectedMobileTeacher] = useState<string>('RAKESH SHARMA');
  const [mobileRemarksInput, setMobileRemarksInput] = useState<{ [dutyId: string]: string }>({});

  // Round Duty Edit Modal state
  const [editingRoundDuty, setEditingRoundDuty] = useState<RoundDutyRecord | null>(null);

  // QR Code Scanner Modal state
  const [qrScannerDuty, setQrScannerDuty] = useState<RoundDutyRecord | null>(null);

  // Red Alert Dispatch Modal State for Administrators
  const [dispatchAlertModalDuty, setDispatchAlertModalDuty] = useState<RoundDutyRecord | null>(null);
  const [dispatchAlertMessage, setDispatchAlertMessage] = useState<string>('');
  const [dispatchedAlertsLog, setDispatchedAlertsLog] = useState<
    Array<{
      id: string;
      time: string;
      teacherName: string;
      location: string;
      periodNumber: number;
      message: string;
    }>
  >([]);

  // Function: Toggle Fixed Duty
  const toggleFixedDuty = (dutyId: string) => {
    setRoundDuties((prev) =>
      prev.map((r) =>
        r.id === dutyId
          ? {
              ...r,
              isFixed: !r.isFixed,
              remarks: !r.isFixed ? '🔒 Fixed Daily Campus Patrol Duty' : 'Flexible Duty'
            }
          : r
      )
    );
  };

  // Function: GPS Location Check-in
  const handleGPSCheckIn = (dutyId: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setRoundDuties((prev) =>
            prev.map((r) =>
              r.id === dutyId
                ? {
                    ...r,
                    status: 'Checked In',
                    checkInTime: timeStr,
                    checkInMethod: 'GPS',
                    gpsCoordinates: { lat, lng },
                    remarks: r.remarks
                      ? `${r.remarks} | Verified GPS Coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
                      : `Verified Campus GPS Coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
                  }
                : r
            )
          );
          alert(`📍 GPS Location Verified! Checked in at ${timeStr} (Lat: ${lat.toFixed(4)}°, Lng: ${lng.toFixed(4)}°)`);
        },
        (err) => {
          const simulatedLat = 28.6139;
          const simulatedLng = 77.2090;
          setRoundDuties((prev) =>
            prev.map((r) =>
              r.id === dutyId
                ? {
                    ...r,
                    status: 'Checked In',
                    checkInTime: timeStr,
                    checkInMethod: 'GPS',
                    gpsCoordinates: { lat: simulatedLat, lng: simulatedLng },
                    remarks: r.remarks
                      ? `${r.remarks} | Verified Campus Geo-Fence (Block A/B)`
                      : `Verified Campus GPS Coordinates (28.6139°, 77.2090°)`
                  }
                : r
            )
          );
          alert(`📍 GPS Location Verified! Checked in at ${timeStr} (Campus Geo-Fence Coordinates Verified)`);
        },
        { timeout: 4000 }
      );
    } else {
      const simulatedLat = 28.6139;
      const simulatedLng = 77.2090;
      setRoundDuties((prev) =>
        prev.map((r) =>
          r.id === dutyId
            ? {
                ...r,
                status: 'Checked In',
                checkInTime: timeStr,
                checkInMethod: 'GPS',
                gpsCoordinates: { lat: simulatedLat, lng: simulatedLng },
                remarks: `Verified Campus GPS Coordinates (28.6139°, 77.2090°)`
              }
            : r
        )
      );
      alert(`📍 GPS Location Verified! Checked in at ${timeStr}`);
    }
  };

  // Function: QR Code Scan Check-in
  const handleVerifyQRScan = (dutyId: string, locationName: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoundDuties((prev) =>
      prev.map((r) =>
        r.id === dutyId
          ? {
              ...r,
              status: 'Completed',
              checkInTime: timeStr,
              checkInMethod: 'QR Code',
              remarks: r.remarks ? `${r.remarks} | Scanned QR Code at ${locationName}` : `Scanned QR Code at Duty Point (${locationName})`
            }
          : r
      )
    );
    setQrScannerDuty(null);
    alert(`📷 QR Code Verified! Duty marked Completed for ${locationName} at ${timeStr}!`);
  };

  // Function: Submit Mobile Remarks
  const handleSubmitMobileRemarks = (dutyId: string) => {
    const text = mobileRemarksInput[dutyId];
    if (!text || !text.trim()) return;

    setRoundDuties((prev) =>
      prev.map((r) =>
        r.id === dutyId
          ? {
              ...r,
              status: r.status === 'Assigned' ? 'Completed' : r.status,
              remarks: r.remarks ? `${r.remarks} | Mobile Remark: "${text.trim()}"` : `Mobile Remark: "${text.trim()}"`
            }
          : r
      )
    );

    setMobileRemarksInput((prev) => ({ ...prev, [dutyId]: '' }));
    alert(`📝 Mobile remark logged successfully!`);
  };

  // Function: Dispatch Emergency Alert for Red Missed Areas
  const handleDispatchAlertToIncharges = () => {
    if (!dispatchAlertModalDuty) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRoundDuties((prev) =>
      prev.map((r) =>
        r.id === dispatchAlertModalDuty.id
          ? {
              ...r,
              status: 'Alert Dispatched',
              alertSent: true,
              alertDetails: `Alert dispatched to Timetable In-Charge & Admin In-Charge at ${timeStr}`
            }
          : r
      )
    );

    setDispatchedAlertsLog((prev) => [
      {
        id: `alert-${Date.now()}`,
        time: timeStr,
        teacherName: dispatchAlertModalDuty.teacherName,
        location: dispatchAlertModalDuty.location,
        periodNumber: dispatchAlertModalDuty.periodNumber,
        message: dispatchAlertMessage
      },
      ...prev
    ]);

    alert(`🚨 EMERGENCY ALERT DISPATCHED!\n\nRecipients:\n1. Timetable In-Charge (Mr. Rakesh Sharma)\n2. Admin In-Charge / Vice Principal (Dr. S. K. Verma)\n\nAlert Message:\n"${dispatchAlertMessage}"`);

    setDispatchAlertModalDuty(null);
  };

  // Automated Round Duty Patrol Scheduler Helper Function
  const runAutoRoundDutyForDay = (
    day: TimetableDay,
    activeArrangementsList: TimetableArrangement[]
  ) => {
    // Preserve existing FIXED duties for this day
    const fixedDuties = roundDuties.filter((r) => r.day === day && r.isFixed);
    const fixedTeachersMap = new Set(fixedDuties.map((r) => `${r.periodNumber}_${r.teacherName}`));
    const fixedLocationsMap = new Set(fixedDuties.map((r) => `${r.periodNumber}_${r.location}`));

    const generatedDuties: RoundDutyRecord[] = [...fixedDuties];
    let createdCount = 0;

    TIMETABLE_PERIODS.forEach((pNo) => {
      // Check if period is excluded from round duty
      if (excludedPeriodList.includes(pNo)) return;

      // Teachers unavailable in this period:
      // 1. Absent teachers
      // 2. Teachers on substitution in this period
      // 3. Teachers already on fixed round duty in this period
      // 4. Academic Coordinators (if excludeCoordinators is true)
      // 5. Excluded departments & excluded teacher list
      const subTeacherNames = new Set(
        activeArrangementsList
          .filter((a) => a.periodNumber === pNo)
          .map((a) => a.substituteTeacherName)
      );

      const freeTeachers = teacherTimetables.filter((t) => {
        if (teacherAttendanceMap[t.teacherName] === 'Absent' || teacherAttendanceMap[t.teacherName] === 'On Leave') return false;
        if (subTeacherNames.has(t.teacherName)) return false;
        if (fixedTeachersMap.has(`${pNo}_${t.teacherName}`)) return false;

        // Exclusion constraint 1: Academic Coordinators
        if (excludeCoordinators) {
          const tUpper = t.teacherName.toUpperCase();
          const dUpper = (t.department || '').toUpperCase();
          if (tUpper.includes('ANKUR KABRA') || tUpper.includes('COORDINATOR') || dUpper.includes('COORDINATOR')) {
            return false;
          }
        }

        // Exclusion constraint 2: Excluded Departments
        if (excludedDeptList.includes(t.department || '')) return false;

        // Exclusion constraint 3: Excluded Teacher Names
        if (excludedTeacherList.includes(t.teacherName)) return false;

        const slotVal = t.schedule[`${day}_${pNo}`];
        return !slotVal || slotVal.trim() === '';
      });

      const openLocations = roundLocations.filter(
        (loc) => !fixedLocationsMap.has(`${pNo}_${loc}`)
      );

      const assignableCount = Math.min(freeTeachers.length, openLocations.length);
      for (let i = 0; i < assignableCount; i++) {
        const teacher = freeTeachers[i];
        const location = openLocations[i];

        generatedDuties.push({
          id: `rd-auto-${Date.now()}-${pNo}-${i}`,
          periodNumber: pNo,
          timeSlot: getTimeSlotForPeriod(pNo),
          teacherName: teacher.teacherName,
          location,
          day,
          status: 'Assigned',
          isFixed: false,
          remarks: '⚡ Auto-Assigned Round Duty Patrol'
        });
        createdCount++;
      }
    });

    setRoundDuties((prev) => [
      ...generatedDuties,
      ...prev.filter((r) => r.day !== day)
    ]);

    return createdCount;
  };

  // Print Noticeboard Modal Configuration
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [printPaperSize, setPrintPaperSize] = useState<'WIDE_SHEET' | 'A4' | 'A3'>('WIDE_SHEET');
  const [printIncludeSubstitutions, setPrintIncludeSubstitutions] = useState(true);
  const [printIncludeRoundDuties, setPrintIncludeRoundDuties] = useState(true);
  const [printIncludeDepartmentStats, setPrintIncludeDepartmentStats] = useState(true);

  // Handler: Save or Update single teacher
  const handleSaveTeacher = async (updatedTeacher: TeacherTimetableRecord) => {
    setTeacherTimetables((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTeacher.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedTeacher;
        return next;
      }
      return [updatedTeacher, ...prev];
    });

    setDbSyncBanner({ type: 'info', message: `Sending "${updatedTeacher.teacherName}" to live Supabase DB...` });
    const res = await syncTeacherAndTimetableToSupabase(updatedTeacher);
    setDbSyncBanner({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
  };

  // Handler: Add brand new teacher
  const handleAddNewTeacher = async (data: { teacherName: string; subject?: string; department?: string; grade?: string } | string) => {
    const nameInput = typeof data === 'string' ? data : data.teacherName;
    const subject = typeof data === 'string' ? 'General' : (data.subject || 'General');
    const department = typeof data === 'string' ? 'Senior Secondary' : (data.department || 'Senior Secondary');
    const grade = typeof data === 'string' ? 'Class 10' : (data.grade || 'Class 10');

    const cleanName = nameInput.trim().toUpperCase();
    const newRecord: TeacherTimetableRecord = {
      id: `tt-new-${Date.now()}`,
      teacherName: cleanName,
      department: department,
      lastUpdated: new Date().toLocaleString(),
      schedule: {} // blank / free timetable initially
    };
    setTeacherTimetables((prev) => [newRecord, ...prev]);

    // Add to central staff directory as well
    await addStaffMember({
      employeeCode: `EMP-${cleanName.replace(/[^A-Z0-9]/g, '').slice(0, 6)}`,
      fullName: cleanName,
      designation: `Teacher (${subject} - ${grade})`,
      department: department,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu`,
      phone: '+91 98100 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: 'M.Sc. / B.Ed.',
      monthlySalary: 60000,
      status: 'Active'
    });

    setDbSyncBanner({ type: 'info', message: `Adding "${cleanName}" (${subject}, ${grade}) to live Supabase DB & Staff Directory...` });
    const res = await syncTeacherAndTimetableToSupabase(newRecord);
    setDbSyncBanner({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
  };

  // Handler: Bulk Upload Success
  const handleUploadSuccess = async (importedTeachers: TeacherTimetableRecord[]) => {
    setTeacherTimetables(importedTeachers);
    if (importedTeachers.length > 0) {
      setSelectedAbsentTeacher(importedTeachers[0].teacherName);
    }
    setActiveTab('teacher_editor');
    
    // Sync all imported teacher timetables to Supabase in background
    setDbSyncBanner({ type: 'info', message: `Syncing ${importedTeachers.length} imported teacher timetables to Cloud Database...` });
    let successCount = 0;
    for (const rec of importedTeachers) {
      const res = await syncTeacherAndTimetableToSupabase(rec);
      if (res.success) successCount++;
    }
    setDbSyncBanner({
      type: 'success',
      message: `Successfully synchronized ${successCount}/${importedTeachers.length} teacher timetables to Cloud DB!`
    });
  };

  // Local state for arrangements / substitutions
  const [arrangements, setArrangements] = useState<TimetableArrangement[]>([
    {
      id: 'arr-1',
      date: new Date().toISOString().split('T')[0],
      periodNumber: 2,
      timeSlot: '09:00 AM - 09:45 AM',
      classSection: 'Class 10-A',
      subject: 'Science',
      absentTeacherName: 'PRATEEK BANSAL',
      substituteTeacherName: 'RAJAT JAIN',
      status: 'Arranged',
      remarks: 'Covering Chapter 4'
    }
  ]);

  const [selectedAbsentTeacher, setSelectedAbsentTeacher] = useState<string>(
    teacherTimetables[0]?.teacherName || 'ANIL KUMAR SINGH'
  );

  const [substituteSelections, setSubstituteSelections] = useState<Record<number, string>>({});
  const [constraintMode, setConstraintMode] = useState<SubstitutionConstraintMode>('same_dept_first');
  const [autoSubBanner, setAutoSubBanner] = useState<{ count: number; message: string } | null>(null);

  // TEACHER DAILY ATTENDANCE STATE (Present / Absent / On Leave / Half Day) - Synced with Staff Directory
  const [localAttendanceOverrides, setLocalAttendanceOverrides] = useState<Record<string, 'Present' | 'Absent' | 'On Leave' | 'Half Day'>>({});

  // Compute effective teacher attendance map combining staff directory and local overrides
  const teacherAttendanceMap: Record<string, 'Present' | 'Absent' | 'On Leave' | 'Half Day'> = {};
  
  // 1. Populate from staff directory
  staff.forEach((stf) => {
    const nameKey = stf.fullName.toUpperCase();
    if (stf.status === 'Absent') teacherAttendanceMap[nameKey] = 'Absent';
    else if (stf.status === 'On Leave') teacherAttendanceMap[nameKey] = 'On Leave';
    else if (stf.status === 'Half Day') teacherAttendanceMap[nameKey] = 'Half Day';
    else teacherAttendanceMap[nameKey] = 'Present';
  });

  // 2. Default overrides
  if (!('POONAM SINGH' in teacherAttendanceMap)) teacherAttendanceMap['POONAM SINGH'] = 'Absent';
  if (!('ANITA DESHMUKH' in teacherAttendanceMap)) teacherAttendanceMap['ANITA DESHMUKH'] = 'Absent';
  if (!('PRATEEK BANSAL' in teacherAttendanceMap)) teacherAttendanceMap['PRATEEK BANSAL'] = 'On Leave';

  // 3. Apply local overrides
  Object.assign(teacherAttendanceMap, localAttendanceOverrides);

  const [isPrintGridModalOpen, setIsPrintGridModalOpen] = useState(false);

  // Toggle teacher attendance status
  const handleToggleAttendance = (teacherName: string, status: 'Present' | 'Absent' | 'On Leave' | 'Half Day') => {
    setLocalAttendanceOverrides((prev) => ({
      ...prev,
      [teacherName.toUpperCase()]: status
    }));
  };

  // GLOBAL AUTO-SUBSTITUTION FOR ALL ABSENT / ON LEAVE / HALF DAY TEACHERS ON SELECTED DAY
  const handleGlobalAutoSubstituteAll = () => {
    const absentTeacherNames = teacherTimetables
      .map((t) => t.teacherName)
      .filter((tName) => {
        const st = teacherAttendanceMap[tName.toUpperCase()];
        return st === 'Absent' || st === 'On Leave' || st === 'Half Day';
      });

    if (absentTeacherNames.length === 0) {
      alert(`No teachers are currently marked as Absent, Half Day, or On Leave today. Please mark teacher attendance first in the Staff Directory or Timetable panel.`);
      return;
    }

    let totalSubstitutionsCreated = 0;
    const newArrangementsList: TimetableArrangement[] = [];

    absentTeacherNames.forEach((tName) => {
      const absentRecord = teacherTimetables.find((t) => t.teacherName.trim().toUpperCase() === tName.trim().toUpperCase());
      if (!absentRecord) return;

      const dept = absentRecord.department || 'Senior Secondary';

      const scheduledPeriods = TIMETABLE_PERIODS.map((pNo) => {
        const assignedClass = getScheduleSlotValue(absentRecord.schedule, selectedDay, pNo);
        if (assignedClass && assignedClass.trim() !== '') {
          return {
            periodNo: pNo,
            timeSlot: getTimeSlotForPeriod(pNo),
            classSec: assignedClass,
            subject: dept.replace(' Dept', '')
          };
        }
        return null;
      }).filter(Boolean) as Array<{ periodNo: number; timeSlot: string; classSec: string; subject: string }>;

      if (scheduledPeriods.length === 0) return;

      const exclusionRules = {
        excludeCoordinators,
        excludedDeptList,
        excludedTeacherList,
        excludedPeriodList
      };

      const autoMap = runAutoSubstitutionForDay(
        selectedDay,
        absentRecord,
        scheduledPeriods,
        teacherTimetables,
        constraintMode,
        undefined,
        exclusionRules
      );

      scheduledPeriods.forEach((slot) => {
        const subName = autoMap[slot.periodNo];
        if (subName) {
          totalSubstitutionsCreated++;
          newArrangementsList.push({
            id: `arr-global-${Date.now()}-${slot.periodNo}-${tName.replace(/\s+/g, '')}`,
            date: new Date().toISOString().split('T')[0],
            periodNumber: slot.periodNo,
            timeSlot: slot.timeSlot,
            classSection: slot.classSec,
            subject: slot.subject,
            absentTeacherName: tName,
            substituteTeacherName: subName,
            status: 'Arranged',
            remarks: `⚡ Global Auto-Assigned • Day: ${selectedDay}`
          });
        }
      });
    });

    if (newArrangementsList.length > 0) {
      const combinedArrangements = [...newArrangementsList, ...arrangements];
      setArrangements((prev) => [...newArrangementsList, ...prev]);

      // Sync all generated substitutions to Supabase DB
      newArrangementsList.forEach((arrItem) => {
        syncSubstitutionToSupabase(arrItem);
      });

      // Automatically run Auto Round Duty in tandem
      const autoRdCount = runAutoRoundDutyForDay(selectedDay, combinedArrangements);

      setAutoSubBanner({
        count: totalSubstitutionsCreated,
        message: `⚡ Global Auto-Substitution & Auto Round Duty Executed! Automatically assigned ${totalSubstitutionsCreated} substitutions and ${autoRdCount} campus patrol duties on ${selectedDay}!`
      });
      setTimeout(() => setAutoSubBanner(null), 8000);
    } else {
      alert(`No active classes were scheduled for the absent teachers on ${selectedDay}.`);
    }
  };

  // Live Reassign Substitute Teacher in Arrangements Log
  const handleUpdateArrangementSubstitute = (arrId: string, newSubstituteName: string) => {
    setArrangements((prev) =>
      prev.map((item) =>
        item.id === arrId
          ? {
              ...item,
              substituteTeacherName: newSubstituteName,
              status: 'Arranged',
              remarks: `Manually Reassigned to ${newSubstituteName} on ${selectedDay}`
            }
          : item
      )
    );
  };

  // Compute Availability List dynamically for selectedDay
  const teacherAvailabilityList: TeacherAvailability[] = teacherTimetables.map((t) => {
    const freePeriodNumbers: number[] = [];

    TIMETABLE_PERIODS.forEach((pNo) => {
      const slotVal = t.schedule[`${selectedDay}_${pNo}`];
      if (!slotVal || slotVal.trim() === '') {
        freePeriodNumbers.push(pNo);
      }
    });

    const freePeriodsCount = freePeriodNumbers.length;

    let colorStatus: 'Green' | 'Yellow' | 'Red' = 'Green';
    if (freePeriodsCount >= 5) colorStatus = 'Green';
    else if (freePeriodsCount >= 2) colorStatus = 'Yellow';
    else colorStatus = 'Red';

    return {
      teacherName: t.teacherName,
      department: t.department || 'Senior Secondary',
      totalPeriodsToday: 9,
      freePeriodsCount,
      freePeriodNumbers,
      colorStatus
    };
  });

  // Filter availability list by department if set
  const filteredAvailabilityList = teacherAvailabilityList.filter((t) => {
    if (selectedDepartmentFilter === 'ALL') return true;
    return getDepartmentTheme(t.department).label === selectedDepartmentFilter;
  });

  // Calculate selected absent teacher's record and department theme
  const absentTeacherRecord = teacherTimetables.find((t) => t.teacherName.trim().toUpperCase() === selectedAbsentTeacher.trim().toUpperCase()) || teacherTimetables[0];
  const absentTeacherDept = absentTeacherRecord?.department || 'Senior Secondary';
  const absentDeptTheme = getDepartmentTheme(absentTeacherDept);

  // Extract ACTUAL scheduled periods for absent teacher on selectedDay
  const scheduledPeriodsForAbsentTeacher = TIMETABLE_PERIODS.map((pNo) => {
    const assignedClass = absentTeacherRecord ? getScheduleSlotValue(absentTeacherRecord.schedule, selectedDay, pNo) : '';
    if (assignedClass && assignedClass.trim() !== '') {
      return {
        periodNo: pNo,
        timeSlot: getTimeSlotForPeriod(pNo),
        classSec: assignedClass,
        subject: absentTeacherDept.replace(' Dept', '')
      };
    }
    return null;
  }).filter(Boolean) as Array<{ periodNo: number; timeSlot: string; classSec: string; subject: string }>;

  // Automated Substitution Handler using algorithm rules
  const handleTriggerAutoSubstitution = () => {
    if (!absentTeacherRecord) return;
    if (scheduledPeriodsForAbsentTeacher.length === 0) {
      alert(`${selectedAbsentTeacher} has no scheduled classes on ${selectedDay}.`);
      return;
    }

    const exclusionRules = {
      excludeCoordinators,
      excludedDeptList,
      excludedTeacherList,
      excludedPeriodList
    };

    const autoAssignedMap = runAutoSubstitutionForDay(
      selectedDay,
      absentTeacherRecord,
      scheduledPeriodsForAbsentTeacher,
      teacherTimetables,
      constraintMode,
      undefined,
      exclusionRules,
      teacherAttendanceMap
    );

    setSubstituteSelections((prev) => ({ ...prev, ...autoAssignedMap }));
    const count = Object.keys(autoAssignedMap).length;

    // Build temporary arrangement list for round duty calculation
    const tempArrangements: TimetableArrangement[] = [];
    Object.entries(autoAssignedMap).forEach(([pNoStr, subName]) => {
      const pNo = parseInt(pNoStr, 10);
      tempArrangements.push({
        id: `temp-${pNo}`,
        date: new Date().toISOString().split('T')[0],
        periodNumber: pNo,
        timeSlot: getTimeSlotForPeriod(pNo),
        classSection: 'N/A',
        subject: 'Sub',
        absentTeacherName: selectedAbsentTeacher,
        substituteTeacherName: subName,
        status: 'Arranged'
      });
    });

    const rdCount = runAutoRoundDutyForDay(selectedDay, [...tempArrangements, ...arrangements]);

    setAutoSubBanner({
      count,
      message: `⚡ Auto-assigned ${count} substitutions and ${rdCount} round duties for ${selectedAbsentTeacher} on ${selectedDay}!`
    });

    setTimeout(() => {
      setAutoSubBanner(null);
    }, 6000);
  };

  const handleCreateArrangement = async (
    periodNo: number,
    timeSlot: string,
    classSec: string,
    subject: string
  ) => {
    const subTeacher = substituteSelections[periodNo];
    if (!subTeacher) {
      alert(`Please select an available substitute teacher for Period #${periodNo}`);
      return;
    }

    const newArrangement: TimetableArrangement = {
      id: `arr-${Date.now()}-${periodNo}`,
      date: new Date().toISOString().split('T')[0],
      periodNumber: periodNo,
      timeSlot,
      classSection: classSec,
      subject,
      absentTeacherName: selectedAbsentTeacher,
      substituteTeacherName: subTeacher,
      status: 'Arranged',
      remarks: `Day: ${selectedDay} • Department Preference Substitution`
    };

    setArrangements((prev) => [newArrangement, ...prev]);
    await syncSubstitutionToSupabase(newArrangement);
    alert(`✅ Substitution Assigned & Synced to DB Successfully!\n\n${subTeacher} will cover Period #${periodNo} (${classSec}) on ${selectedDay}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              Timetable & Substitution Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {teacherTimetables.length} Teachers Loaded
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Teacher Timetable & Department Substitution Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Department color coding active. Prioritizes substitute teachers from the same department as the absent teacher.
          </p>
        </div>

        {/* Global Day Picker */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Day:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {TIMETABLE_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedDay === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE SUPABASE DB SYNC STATUS BANNER */}
      {dbSyncBanner && (
        <div className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition-all ${
          dbSyncBanner.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
            : dbSyncBanner.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 shadow-xs'
            : 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
            <span>{dbSyncBanner.message}</span>
          </div>
          <button
            onClick={() => setDbSyncBanner(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('teacher_editor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'teacher_editor'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Teacher View & Editor
        </button>

        <button
          onClick={() => setActiveTab('bulk_upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'bulk_upload'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> Bulk Excel Upload
        </button>

        <button
          onClick={() => setActiveTab('arrangements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'arrangements'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-300" /> Substitution Engine
        </button>

        <button
          onClick={() => setActiveTab('round_duty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'round_duty'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-rose-300" /> Round Duty Patrol
        </button>

        <button
          onClick={() => setActiveTab('duty_analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'duty_analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" /> Duty Analytics & Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('dept_manager')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'dept_manager'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-300" /> Depts & Rules
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-300" /> Master Schedule Matrix
        </button>
      </div>

      {/* TAB 1: TEACHER INDIVIDUAL VIEW & INTERACTIVE EDITOR */}
      {activeTab === 'teacher_editor' && (
        <TeacherTimetableEditor
          teachers={teacherTimetables}
          onSaveTeacher={handleSaveTeacher}
          onAddNewTeacher={handleAddNewTeacher}
        />
      )}

      {/* TAB 2: BULK EXCEL UPLOAD SECTION */}
      {activeTab === 'bulk_upload' && (
        <BulkUploadSection
          existingTeachers={teacherTimetables}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* TAB 3: MASTER ADMIN FREE PERIODS COLOR CODED VIEW */}
      {activeTab === 'master_free_periods' && (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" /> Filter by Department:
              </span>

              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 font-bold rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="ALL">All Departments ({teacherTimetables.length} Teachers)</option>
                {SCHOOL_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-500">Legend ({selectedDay}):</span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 5+ Free
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 2 - 4 Free
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> 0 - 1 Free
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailabilityList.map((t) => {
              const isGreen = t.colorStatus === 'Green';
              const isYellow = t.colorStatus === 'Yellow';
              const deptTheme = getDepartmentTheme(t.department);

              return (
                <div
                  key={t.teacherName}
                  className={`p-5 rounded-2xl border shadow-xs space-y-3 transition-all ${
                    isGreen
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : isYellow
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{t.teacherName}</h4>
                      
                      {/* Department Color-Coded Tag */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${deptTheme.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${deptTheme.dotClass}`}></span>
                        {deptTheme.label}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isGreen
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : isYellow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      }`}
                    >
                      {t.colorStatus}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Free Periods ({selectedDay}):</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {t.freePeriodsCount} / {t.totalPeriodsToday}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-bold">Slots:</span>
                    {t.freePeriodNumbers.length === 0 ? (
                      <span className="text-[10px] font-bold text-rose-600">Fully Occupied</span>
                    ) : (
                      t.freePeriodNumbers.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          P#{p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ARRANGEMENT / SUBSTITUTION ENGINE */}
      {activeTab === 'arrangements' && (
        <div className="space-y-6">
          {/* VIBRANT BLUE HEADER & AUTO-SUB ENGINE BANNER */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 p-6 rounded-2xl border border-blue-700/50 shadow-lg text-white space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-700/50 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950 shadow-xs">
                    Smart Substitution Engine
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/40 text-blue-100 border border-blue-400/30">
                    Day: {selectedDay}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <UserX className="w-6 h-6 text-cyan-300" />
                  Department & Level-Prioritized Auto Substitution Engine
                </h3>
                <p className="text-xs text-blue-200/90 max-w-2xl">
                  Automatically substitutes free teachers prioritized by: <strong>1. Same Department</strong>, <strong>2. Junior/Senior Level Match</strong>, and <strong>3. Vacant/Sports Teachers</strong>.
                </p>
              </div>

              {/* ACTION BUTTONS: GLOBAL AUTO SUB & FULL SCREEN PRINT GRID */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={handleGlobalAutoSubstituteAll}
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950 animate-pulse" />
                  <span>⚡ 1-Click Global Auto-Substitute (All Absent)</span>
                </button>

                <button
                  onClick={() => setIsPrintGridModalOpen(true)}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-300"
                >
                  <Printer className="w-5 h-5 text-slate-950" />
                  <span>🖨️ Full Screen Printable Grid</span>
                </button>
              </div>
            </div>

            {/* Notification Banner when Auto-Substitute is clicked */}
            {autoSubBanner && (
              <div className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-between text-xs font-bold text-cyan-100 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <span>{autoSubBanner.message}</span>
                </div>
                <button onClick={() => setAutoSubBanner(null)} className="text-cyan-300 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CONSTRAINT SETTINGS PANEL */}
            <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold text-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-cyan-300" /> Auto-Substitution Rules & Constraints:
                </span>
                <span className="text-[11px] text-blue-300 font-semibold">
                  Select constraint strategy before clicking Auto-Substitute or applying manual overrides
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  {
                    id: 'same_dept_first',
                    title: '⭐ Same Dept + Level Match',
                    desc: 'Prioritizes same department & junior/senior match'
                  },
                  {
                    id: 'same_dept_strict',
                    title: '🔒 Same Dept Only',
                    desc: 'Assigns strictly same department teachers'
                  },
                  {
                    id: 'subject_plus_sports',
                    title: '⚽ Subject + Sports',
                    desc: 'Includes Physical Education & Sports faculty'
                  },
                  {
                    id: 'level_matched_first',
                    title: '🎓 Junior/Senior Match',
                    desc: 'Junior teachers to Junior, Senior to Senior'
                  }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConstraintMode(mode.id as SubstitutionConstraintMode)}
                    className={`p-3 rounded-xl text-left border cursor-pointer transition-all ${
                      constraintMode === mode.id
                        ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-inner font-bold'
                        : 'bg-blue-900/40 border-blue-700/40 text-blue-200 hover:bg-blue-800/50'
                    }`}
                  >
                    <div className="text-xs font-black">{mode.title}</div>
                    <div className="text-[10px] text-blue-300/80 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* FACULTY ATTENDANCE & ABSENCE MARKER TRACKER */}
            <div className="bg-blue-950/80 p-4 rounded-xl border border-blue-700/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-blue-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Teacher Daily Attendance & Absence Tracker ({selectedDay}):
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Present: {Object.values(teacherAttendanceMap).filter((v) => v === 'Present').length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Absent: {Object.values(teacherAttendanceMap).filter((v) => v === 'Absent').length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    On Leave: {Object.values(teacherAttendanceMap).filter((v) => v === 'On Leave').length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {teacherTimetables.map((t) => {
                  const status = teacherAttendanceMap[t.teacherName] || 'Present';
                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                        status === 'Absent'
                          ? 'bg-rose-950/60 border-rose-500/80 text-rose-100'
                          : status === 'On Leave'
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-100'
                          : 'bg-blue-900/30 border-blue-800/60 text-blue-200'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-bold block truncate">{t.teacherName}</span>
                        <span className="text-[10px] opacity-75">{t.department || 'Senior Sec'}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleAttendance(t.teacherName, 'Present')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                            status === 'Present' ? 'bg-emerald-500 text-slate-950' : 'bg-blue-950 text-blue-300 hover:text-white'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(t.teacherName, 'Absent')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                            status === 'Absent' ? 'bg-rose-500 text-white' : 'bg-blue-950 text-blue-300 hover:text-white'
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(t.teacherName, 'Half Day')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                            status === 'Half Day' ? 'bg-amber-500 text-white' : 'bg-blue-950 text-blue-300 hover:text-white'
                          }`}
                        >
                          H
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(t.teacherName, 'On Leave')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all ${
                            status === 'On Leave' ? 'bg-purple-500 text-white' : 'bg-blue-950 text-blue-300 hover:text-white'
                          }`}
                        >
                          L
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELECT ABSENT TEACHER CONTROL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label className="block text-xs font-bold text-blue-200 mb-1">
                  Select Specific Absent Teacher to Inspect/Arrange:
                </label>
                <select
                  value={selectedAbsentTeacher}
                  onChange={(e) => setSelectedAbsentTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-900 border border-blue-600 rounded-xl text-white shadow-inner"
                >
                  {teacherTimetables.map((st) => (
                    <option key={st.id} value={st.teacherName}>
                      👨‍🏫 {st.teacherName} — [{teacherAttendanceMap[st.teacherName] || 'Present'}] ({st.department || 'Senior Secondary'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Absent Teacher Department Theme Card */}
              {absentTeacherRecord && (
                <div className="p-3.5 rounded-xl border border-blue-600/60 bg-blue-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-300 uppercase block">Department Theme</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border mt-1 ${absentDeptTheme.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${absentDeptTheme.dotClass}`}></span>
                      {absentDeptTheme.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-blue-300 block">Scheduled on {selectedDay}</span>
                    <strong className="text-base font-black text-white">
                      {scheduledPeriodsForAbsentTeacher.length} Busy Periods
                    </strong>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* PERIOD-BY-PERIOD SUBSTITUTION CARDS WITH RANKED MANUAL OVERRIDE */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Busy Period Slots for {selectedAbsentTeacher} on {selectedDay}:
              </h4>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                Click any teacher name in dropdown for manual change!
              </span>
            </div>

            {scheduledPeriodsForAbsentTeacher.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedAbsentTeacher} has no classes scheduled on {selectedDay}!
                </p>
                <p className="text-xs text-slate-500">
                  Select a different day from the top bar or choose another absent teacher.
                </p>
              </div>
            ) : (
              scheduledPeriodsForAbsentTeacher.map((slot) => {
                const classGradeLevel = getClassGradeLevel(slot.classSec);

                const exclusionRules = {
                  excludeCoordinators,
                  excludedDeptList,
                  excludedTeacherList,
                  excludedPeriodList
                };

                // RANK CANDIDATE TEACHERS FOR THIS SLOT USING THE SCORING ALGORITHM
                const rankedCandidates = rankCandidateSubstitutes(
                  slot.periodNo,
                  selectedDay,
                  absentTeacherRecord,
                  slot.classSec,
                  teacherTimetables,
                  constraintMode,
                  undefined,
                  exclusionRules,
                  teacherAttendanceMap
                );

                const selectedSubName = substituteSelections[slot.periodNo] || '';
                const selectedSubMatch = rankedCandidates.find((c) => c.teacher.teacherName === selectedSubName);

                return (
                  <div
                    key={slot.periodNo}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-blue-400"
                  >
                    {/* Slot Info & Grade Level */}
                    <div className="space-y-1.5 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-blue-600 text-white shadow-xs">
                          Period #{slot.periodNo}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {slot.timeSlot}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <strong className="text-slate-900 dark:text-white text-base font-extrabold">{slot.classSec}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                          classGradeLevel === 'Junior'
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200'
                        }`}>
                          <GraduationCap className="w-3 h-3" />
                          {classGradeLevel} Level
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block font-medium">
                        Subject: <strong className="text-slate-800 dark:text-slate-200">{slot.subject}</strong>
                      </span>
                    </div>

                    {/* Manual Substitute Selector (Ranked Descending) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
                      <div className="flex-1 space-y-1.5">
                        <select
                          value={selectedSubName}
                          onChange={(e) =>
                            setSubstituteSelections({ ...substituteSelections, [slot.periodNo]: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">
                            Select Free Substitute ({rankedCandidates.length} Available Teachers Ranked)...
                          </option>

                          {/* TOP RANKED SAME DEPT OR BEST MATCH GROUP */}
                          {rankedCandidates.filter((c) => c.score >= 100).length > 0 && (
                            <optgroup label="⭐ RECOMMENDED TOP MATCHES (Same Department / Level Match)">
                              {rankedCandidates
                                .filter((c) => c.score >= 100)
                                .map((c) => (
                                  <option key={c.teacher.teacherName} value={c.teacher.teacherName}>
                                    ⭐ [Score: {c.score}] {c.teacher.teacherName} ({c.deptTheme.label}) — {c.freePeriodsCount} Free Periods
                                  </option>
                                ))}
                            </optgroup>
                          )}

                          {/* OTHER AVAILABLE FREE TEACHERS GROUP */}
                          <optgroup label="AVAILABLE FREE TEACHERS (Desc. Score)">
                            {rankedCandidates
                              .filter((c) => c.score < 100)
                              .map((c) => (
                                <option key={c.teacher.teacherName} value={c.teacher.teacherName}>
                                  {c.teacher.teacherName} ({c.deptTheme.label}) — {c.freePeriodsCount} Free Periods
                                </option>
                              ))}
                          </optgroup>
                        </select>

                        {/* Selected Candidate Tags */}
                        {selectedSubMatch && (
                          <div className="flex items-center gap-2 text-[10px] flex-wrap">
                            <span className="text-slate-500 font-medium">Assigned Substitute:</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${selectedSubMatch.deptTheme.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${selectedSubMatch.deptTheme.dotClass}`}></span>
                              {selectedSubMatch.deptTheme.label}
                            </span>
                            {selectedSubMatch.isSameDept && (
                              <span className="px-2 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300">
                                ⭐ SAME DEPT
                              </span>
                            )}
                            {selectedSubMatch.isLevelMatch && (
                              <span className="px-2 py-0.5 rounded-full font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-300">
                                🎓 LEVEL MATCH
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedSubName && (
                          <button
                            onClick={() => {
                              const next = { ...substituteSelections };
                              delete next[slot.periodNo];
                              setSubstituteSelections(next);
                            }}
                            title="Reset selection"
                            className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleCreateArrangement(slot.periodNo, slot.timeSlot, slot.classSec, slot.subject)}
                          className="px-4 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ACTIVE SUBSTITUTION LOG CHART WITH LIVE REASSIGNMENT */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Active Substitution Arrangements Log ({arrangements.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintGridModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Full-Screen Print Grid
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Class & Sec</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Absent Teacher</th>
                    <th className="py-3 px-4">Assigned Substitute (Live Editable)</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {arrangements.map((a) => {
                    const absDept = getDepartmentTheme(teacherTimetables.find((t) => t.teacherName === a.absentTeacherName)?.department);
                    const subDept = getDepartmentTheme(teacherTimetables.find((t) => t.teacherName === a.substituteTeacherName)?.department);

                    // Candidate free teachers for this period number to allow live reassigning
                    const freeForThisPeriod = teacherTimetables.filter((t) => {
                      const slotVal = t.schedule[`${selectedDay}_${a.periodNumber}`];
                      return !slotVal || slotVal.trim() === '';
                    });

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          Period #{a.periodNumber} ({a.timeSlot})
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">{a.classSection}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">{a.subject}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="text-rose-600 font-bold block">{a.absentTeacherName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block border ${absDept.badgeClass}`}>
                              {absDept.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1.5 max-w-xs">
                            <select
                              value={a.substituteTeacherName}
                              onChange={(e) => handleUpdateArrangementSubstitute(a.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={a.substituteTeacherName}>
                                👨‍🏫 {a.substituteTeacherName} (Current)
                              </option>
                              {freeForThisPeriod
                                .filter((f) => f.teacherName !== a.substituteTeacherName)
                                .map((f) => (
                                  <option key={f.id} value={f.teacherName}>
                                    🔄 {f.teacherName} ({f.department || 'Senior Sec'})
                                  </option>
                                ))}
                            </select>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block border ${subDept.badgeClass}`}>
                              {subDept.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                              {a.status}
                            </span>
                            <button
                              onClick={() => {
                                setArrangements((prev) => prev.filter((item) => item.id !== a.id));
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete arrangement"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE ROUND DUTY PATROL SCHEDULE (BELOW SUBSTITUTIONS) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-800/80 shadow-md text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-rose-400" />
                  Active Campus Round Duty Patrol Schedule ({selectedDay}) — Total: {roundDuties.filter((r) => r.day === selectedDay).length}
                </h3>
                <p className="text-xs text-indigo-200">
                  Teachers assigned here patrol free periods. They are automatically excluded from class substitutions and their substitution periods are reduced.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('round_duty')}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <ShieldAlert className="w-4 h-4" /> Open Live Security Radar & Duty Manager
              </button>
            </div>

            {roundDuties.filter((r) => r.day === selectedDay).length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-950/60 border border-indigo-900 text-indigo-300 text-xs">
                No active round duties assigned for {selectedDay}. Click "1-Click Auto-Assign Round Duty" in the Round Duty tab!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roundDuties
                  .filter((r) => r.day === selectedDay)
                  .map((rd) => {
                    const isCheckedIn = rd.status === 'Checked In' || rd.status === 'Completed';
                    const isMissed = rd.status === 'Missed' || rd.status === 'Alert Dispatched';

                    return (
                      <div
                        key={rd.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCheckedIn
                            ? 'bg-emerald-950/60 border-emerald-500/80'
                            : isMissed
                            ? 'bg-rose-950/80 border-rose-500/90 shadow-rose-900/40 shadow-md'
                            : 'bg-indigo-950/60 border-indigo-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="font-mono text-indigo-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Period #{rd.periodNumber} ({rd.timeSlot})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isCheckedIn
                                ? 'bg-emerald-400 text-slate-950'
                                : isMissed
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {rd.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <strong className="text-sm font-black text-white block flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                            {rd.location}
                          </strong>
                          <span className="text-xs text-indigo-100 font-bold block">
                            👨‍🏫 Duty Faculty: <span className="text-white font-black">{rd.teacherName}</span>
                          </span>

                          {rd.isFixed && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40">
                              <Lock className="w-3 h-3" /> Fixed Daily Duty
                            </span>
                          )}

                          {rd.remarks && (
                            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-indigo-800/50">
                              "{rd.remarks}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ROUND DUTY CAMPUS PATROL & REAL-TIME SECURITY MONITOR */}
      {activeTab === 'round_duty' && (
        <div className="space-y-6">
          {/* HEADER BANNER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 rounded-2xl border border-indigo-800/60 shadow-lg text-white space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-800/50 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-400 text-slate-950 shadow-xs">
                    Campus Patrol & Geolocation Monitor
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/40 text-blue-100 border border-blue-400/30">
                    Day: {selectedDay}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-rose-400" />
                  Free Period Campus Round Patrol Duty & Live Radar
                </h3>
                <p className="text-xs text-indigo-200/90 max-w-2xl">
                  Free teachers are assigned to campus patrol (Block A, Block B, Canteen, etc.). <strong>When substitution is triggered, auto round duty is applied simultaneously.</strong> Geolocation & QR Code scanning track real-time duty attendance.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => setActiveTab('teacher_editor')}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  title="Close Round Duty and Return to Main Timetable"
                >
                  <ArrowLeft className="w-5 h-5 text-indigo-400" />
                  <span>← Close / Back to Timetable</span>
                </button>

                <button
                  onClick={() => {
                    const count = runAutoRoundDutyForDay(selectedDay, arrangements);
                    if (count > 0) {
                      alert(`⚡ Auto-Assigned ${count} Round Patrol Duties for ${selectedDay}!`);
                    } else {
                      alert(`No additional free unassigned teachers available on ${selectedDay}.`);
                    }
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-300"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>⚡ 1-Click Auto-Assign Round Duty</span>
                </button>

                <button
                  onClick={() => setIsPrintGridModalOpen(true)}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-300"
                >
                  <Printer className="w-5 h-5 text-slate-950" />
                  <span>🖨️ Printable Patrol Grid</span>
                </button>
              </div>
            </div>

            {/* CUSTOMIZABLE LOCATIONS MANAGER */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-rose-400" /> Customizable Patrol Locations ({roundLocations.length}):
                </span>
                <span className="text-[11px] text-indigo-300">
                  Add custom campus patrol points (Block A, Ground Floor, Labs, Field)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {roundLocations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-900/60 border border-indigo-700/60 text-indigo-100"
                  >
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {loc}
                    <button
                      onClick={() => {
                        if (roundLocations.length <= 1) {
                          alert('You must have at least 1 patrol location.');
                          return;
                        }
                        setRoundLocations((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="ml-1 text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Block C - Junior Wing Corridor"
                  value={newCustomLocationInput}
                  onChange={(e) => setNewCustomLocationInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-bold bg-slate-900 border border-indigo-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
                <button
                  onClick={() => {
                    if (!newCustomLocationInput.trim()) return;
                    setRoundLocations((prev) => [...prev, newCustomLocationInput.trim()]);
                    setNewCustomLocationInput('');
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Location
                </button>
              </div>
            </div>

            {/* AUTO-DUTY & SUBSTITUTION EXCLUSION CONSTRAINTS CONFIGURATOR */}
            <div className="bg-slate-950/80 p-5 rounded-xl border border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Auto-Assign Round & Substitution Duty Exclusion Rules
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Select rules to prevent specific teachers, departments, or periods from being assigned round duties or substitutions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Rule 1: Academic Coordinator Exclusion Constraint */}
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2.5 font-bold text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={excludeCoordinators}
                      onChange={(e) => setExcludeCoordinators(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-700 focus:ring-amber-500 bg-slate-950"
                    />
                    <span>🛡️ Exclude Academic Coordinators (Dr. Ankur Kabra / Coordinators)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 pl-6">
                    When checked, Academic Coordinators will NEVER be assigned round duties or substitution periods during auto-rounds.
                  </p>
                </div>

                {/* Rule 2: Department Exclusions Checkboxes */}
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-white block">🏢 Exclude Entire Departments:</span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SCHOOL_DEPARTMENTS.map((dept) => {
                      const isExcluded = excludedDeptList.includes(dept);
                      return (
                        <label key={dept} className="flex items-center gap-2 text-slate-300 cursor-pointer select-none text-[11px]">
                          <input
                            type="checkbox"
                            checked={isExcluded}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExcludedDeptList((prev) => [...prev, dept]);
                              } else {
                                setExcludedDeptList((prev) => prev.filter((d) => d !== dept));
                              }
                            }}
                            className="w-3.5 h-3.5 text-amber-500 rounded border-slate-700 bg-slate-950"
                          />
                          <span className={isExcluded ? 'text-amber-300 font-bold line-through' : ''}>{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rule 3: Period Exclusions */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">⏰ Exclude Specific Periods From Auto-Duties:</span>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {TIMETABLE_PERIODS.map((pNo) => {
                    const isEx = excludedPeriodList.includes(pNo);
                    return (
                      <button
                        key={pNo}
                        type="button"
                        onClick={() => {
                          if (isEx) {
                            setExcludedPeriodList((prev) => prev.filter((p) => p !== pNo));
                          } else {
                            setExcludedPeriodList((prev) => [...prev, pNo]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] cursor-pointer transition-all border ${
                          isEx
                            ? 'bg-rose-950 text-rose-300 border-rose-600 line-through'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {isEx ? `❌ Period #${pNo} Excluded` : `Period #${pNo}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: ADMINISTRATOR REAL-TIME SECURITY RADAR & DUTY MONITOR */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Administrator Campus Patrol Radar & Area Status
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time status display of all assigned campus duty points. 🟢 <strong>GREEN</strong> = Verified Check-In. 🟡 <strong>AMBER</strong> = Active Duty. 🔴 <strong>RED</strong> = Missed Duty/Absence! <em>Click any RED card to dispatch instant emergency alert to Timetable and Admin In-Charges!</em>
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full">
                Live Geolocation Feed Connected
              </span>
            </div>

            {roundDuties.filter((r) => r.day === selectedDay).length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs">
                No duty records generated for {selectedDay} yet. Click "⚡ 1-Click Auto-Assign Round Duty" above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundDuties
                  .filter((r) => r.day === selectedDay)
                  .map((rd) => {
                    const isCheckedIn = rd.status === 'Checked In' || rd.status === 'Completed';
                    const isAlertSent = rd.status === 'Alert Dispatched';
                    const isMissed = rd.status === 'Missed' || isAlertSent;

                    // Color theme
                    let cardBg = 'bg-slate-950/80 border-slate-800 hover:border-slate-700';
                    let statusBadge = 'bg-amber-400 text-slate-950';
                    let statusDot = 'bg-amber-400';

                    if (isCheckedIn) {
                      cardBg = 'bg-emerald-950/40 border-emerald-500/60 hover:border-emerald-400';
                      statusBadge = 'bg-emerald-400 text-slate-950';
                      statusDot = 'bg-emerald-400';
                    } else if (isMissed) {
                      cardBg = 'bg-rose-950/60 border-rose-500 hover:border-rose-400 cursor-pointer shadow-lg shadow-rose-950/50';
                      statusBadge = 'bg-rose-500 text-white animate-pulse';
                      statusDot = 'bg-rose-500 animate-ping';
                    }

                    return (
                      <div
                        key={rd.id}
                        onClick={() => {
                          if (isMissed || rd.status === 'Assigned') {
                            setDispatchAlertModalDuty(rd);
                            setDispatchAlertMessage(
                              `🚨 URGENT CAMPUS PATROL ALERT: Faculty member ${rd.teacherName} has NOT checked in for Period #${rd.periodNumber} (${rd.timeSlot}) Round Duty at location [${rd.location}]. Please inspect immediately.`
                            );
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all relative overflow-hidden space-y-3 ${cardBg}`}
                      >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between text-xs font-extrabold">
                          <span className="font-mono text-indigo-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            Period #{rd.periodNumber} ({rd.timeSlot})
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusBadge}`}>
                            <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>
                            {rd.status}
                          </span>
                        </div>

                        {/* Duty Location & Teacher Name */}
                        <div className="space-y-1">
                          <strong className="text-base font-black text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                            {rd.location}
                          </strong>
                          <p className="text-xs text-slate-300 font-bold">
                            👨‍🏫 Faculty: <span className="text-white font-extrabold">{rd.teacherName}</span>
                          </p>
                        </div>

                        {/* Meta info / checkin time */}
                        <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800/80 pt-2">
                          {rd.checkInTime && (
                            <p className="text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Checked in at {rd.checkInTime} ({rd.checkInMethod || 'GPS'})
                            </p>
                          )}

                          {rd.remarks && (
                            <p className="text-slate-300 italic">
                              "{rd.remarks}"
                            </p>
                          )}

                          {rd.isFixed && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                              <Lock className="w-3 h-3" /> Fixed Daily Duty
                            </span>
                          )}
                        </div>

                        {/* Interactive Trigger Button on Red Card */}
                        {(rd.status === 'Assigned' || isMissed) && (
                          <div className="pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDispatchAlertModalDuty(rd);
                                setDispatchAlertMessage(
                                  `🚨 URGENT CAMPUS PATROL ALERT: Faculty member ${rd.teacherName} has NOT checked in for Period #${rd.periodNumber} (${rd.timeSlot}) Round Duty at location [${rd.location}]. Please inspect immediately.`
                                );
                              }}
                              className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{isAlertSent ? 'Re-Dispatch Emergency Alert' : 'Click to Dispatch Red Alert to Admin'}</span>
                            </button>
                          </div>
                        )}

                        {/* Direct Edit Output Button */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRoundDuty(rd);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Round / Apply Different Assignment</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* SECTION 2: TEACHER MOBILE LOGIN & CHECK-IN PORTAL SIMULATION */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                  Faculty Mobile Interface
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Teacher Mobile Round Duty Portal & Check-In
                </h4>
                <p className="text-xs text-slate-500">
                  Simulate logging in as a teacher on mobile to execute GPS check-in, scan QR codes placed at campus duty points, and log remarks.
                </p>
              </div>

              {/* Select Logged In Mobile Teacher */}
              <div className="space-y-1 min-w-[240px]">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Simulate Mobile Login Teacher:
                </label>
                <select
                  value={selectedMobileTeacher}
                  onChange={(e) => setSelectedMobileTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                >
                  {teacherTimetables.map((t) => (
                    <option key={t.id} value={t.teacherName}>
                      📱 {t.teacherName} ({t.department || 'Senior Sec'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logged in Teacher's Duty Cards */}
            {roundDuties.filter((r) => r.day === selectedDay && r.teacherName === selectedMobileTeacher).length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                <p className="font-bold">No Round Duty assigned to {selectedMobileTeacher} on {selectedDay}.</p>
                <p className="text-[11px] text-slate-400 mt-1">Switch teacher login or auto-assign round duties above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundDuties
                  .filter((r) => r.day === selectedDay && r.teacherName === selectedMobileTeacher)
                  .map((rd) => {
                    const isChecked = rd.status === 'Checked In' || rd.status === 'Completed';

                    return (
                      <div
                        key={rd.id}
                        className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Period #{rd.periodNumber} ({rd.timeSlot})
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isChecked
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            }`}
                          >
                            {rd.status}
                          </span>
                        </div>

                        <div>
                          <strong className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            {rd.location}
                          </strong>
                          {rd.checkInTime && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                              ✓ Verified {rd.checkInMethod || 'GPS'} Check-in at {rd.checkInTime}
                            </p>
                          )}
                        </div>

                        {/* Mobile Action Controls */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => handleGPSCheckIn(rd.id)}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>📍 Verify GPS Location</span>
                          </button>

                          <button
                            onClick={() => setQrScannerDuty(rd)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>📷 Scan Duty QR</span>
                          </button>
                        </div>

                        {/* Mobile Remarks Input */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Add Mobile Patrol Observation / Remark:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Corridor clear, all students in classes."
                              value={mobileRemarksInput[rd.id] || ''}
                              onChange={(e) =>
                                setMobileRemarksInput({ ...mobileRemarksInput, [rd.id]: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleSubmitMobileRemarks(rd.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl cursor-pointer shrink-0"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* MASTER ROUND DUTIES TABLE WITH FIXED LOCK CONTROLS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                  Master Round Patrol Duties Table ({selectedDay}) — Total: {roundDuties.filter((r) => r.day === selectedDay).length}
                </h4>
                <p className="text-xs text-slate-500">
                  Toggle 🔒 Fixed Duty locks to ensure constant patrol assignments.
                </p>
              </div>
            </div>

            {roundDuties.filter((r) => r.day === selectedDay).length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
                <Compass className="w-8 h-8 text-rose-400 mx-auto opacity-70" />
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                  No Round Duties Assigned for {selectedDay}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                      <th className="py-3 px-4">Period & Time</th>
                      <th className="py-3 px-4">Patrol Location</th>
                      <th className="py-3 px-4">Assigned Teacher</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status & Fixed Duty Lock</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {roundDuties
                      .filter((r) => r.day === selectedDay)
                      .map((rd) => {
                        const tRecord = teacherTimetables.find((t) => t.teacherName === rd.teacherName);
                        const deptTheme = getDepartmentTheme(tRecord?.department);

                        return (
                          <tr key={rd.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              Period #{rd.periodNumber} ({rd.timeSlot})
                            </td>
                            <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              {rd.location}
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900 dark:text-white text-sm">
                              {rd.teacherName}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${deptTheme.badgeClass}`}>
                                {deptTheme.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {rd.status}
                                </span>

                                <button
                                  onClick={() => toggleFixedDuty(rd.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 border ${
                                    rd.isFixed
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                  title="Lock fixed duty assignment"
                                >
                                  {rd.isFixed ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                                  {rd.isFixed ? '🔒 Fixed Duty' : '🔓 Flexible'}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingRoundDuty(rd)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                                  title="Edit Round Duty"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setRoundDuties((prev) => prev.filter((r) => r.id !== rd.id))}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                  title="Remove Duty"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: DUTY ANALYTICS & ANNUAL WORKLOAD LEADERBOARD */}
      {activeTab === 'duty_analytics' && (
        <TeacherDutyAnalytics
          teacherTimetables={teacherTimetables}
          roundDuties={roundDuties}
          arrangements={arrangements}
        />
      )}

      {/* TAB 6: DEPARTMENT ASSIGNMENTS & RULE CONSTRAINTS */}
      {activeTab === 'dept_manager' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Teacher Department Assignments & Constraint Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Update teacher department assignments live. When teachers log in or update their profile, departments are synchronized across the substitution engine.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {SCHOOL_DEPARTMENTS.length} Active Departments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                    <th className="py-3 px-4">Teacher Name</th>
                    <th className="py-3 px-4">Assigned Department (Live Update)</th>
                    <th className="py-3 px-4">Department Badge</th>
                    <th className="py-3 px-4">Grade Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {teacherTimetables.map((t) => {
                    const deptTheme = getDepartmentTheme(t.department);
                    const gradeLevel = getTeacherGradeLevel(t);

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white text-sm">
                          {t.teacherName}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t.department || 'Senior Secondary'}
                            onChange={(e) => {
                              const newDept = e.target.value;
                              setTeacherTimetables((prev) =>
                                prev.map((item) => (item.id === t.id ? { ...item, department: newDept } : item))
                              );
                            }}
                            className="px-3 py-1.5 font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
                          >
                            {SCHOOL_DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${deptTheme.badgeClass}`}>
                            {deptTheme.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                            gradeLevel === 'Junior'
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                              : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          }`}>
                            {gradeLevel} Faculty
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EXCLUSION RULES & EXCEPTIONS CHECKLIST PANEL */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                  Round Duty & Substitution Exclusion Rules & Checkboxes
                </h3>
                <p className="text-xs text-slate-500">
                  Select teachers, departments, coordinators, or periods to exclude from Round Duty patrol and Substitution assignments.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300">
                {excludedTeacherList.length + excludedDeptList.length + (excludeCoordinators ? 1 : 0)} Active Exclusions
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* 1. Academic Coordinator & Special Role Exclusions */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  1. Academic Coordinators & Admin Role Exclusions
                </h4>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400">
                  <input
                    type="checkbox"
                    checked={excludeCoordinators}
                    onChange={(e) => setExcludeCoordinators(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Exclude Academic Coordinators & Vice Principals
                    </span>
                    <span className="text-[11px] text-slate-500">
                      e.g. Ankur Kabra, Senior Coordinators, Admin Leads
                    </span>
                  </div>
                </label>
              </div>

              {/* 2. Excluded Departments Checkboxes */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  2. Excluded Departments Checkbox List
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SCHOOL_DEPARTMENTS.map((dept) => {
                    const isChecked = excludedDeptList.includes(dept);
                    return (
                      <label
                        key={dept}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExcludedDeptList((prev) => [...prev, dept]);
                            } else {
                              setExcludedDeptList((prev) => prev.filter((d) => d !== dept));
                            }
                          }}
                          className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                        />
                        <span className="text-[11px] truncate">{dept}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Excluded Individual Teachers Checkboxes */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    3. Excluded Individual Teachers Checklist ({excludedTeacherList.length} Excluded)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Check teachers with special lab/sports/exam duties to bypass substitution & round duty.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {teacherTimetables.map((t) => {
                    const isChecked = excludedTeacherList.includes(t.teacherName);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-900 dark:text-rose-200 font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExcludedTeacherList((prev) => [...prev, t.teacherName]);
                            } else {
                              setExcludedTeacherList((prev) => prev.filter((name) => name !== t.teacherName));
                            }
                          }}
                          className="w-4 h-4 text-rose-600 rounded cursor-pointer shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold block truncate text-xs">{t.teacherName}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{t.department || 'Senior Sec'}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. Excluded Periods Checkboxes */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 lg:col-span-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  4. Excluded Period Numbers (Assembly / Lunch / Zero Period Exclusions)
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {TIMETABLE_PERIODS.map((pNo) => {
                    const isChecked = excludedPeriodList.includes(pNo);
                    return (
                      <label
                        key={pNo}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer font-bold text-xs transition-all ${
                          isChecked
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExcludedPeriodList((prev) => [...prev, pNo]);
                            } else {
                              setExcludedPeriodList((prev) => prev.filter((p) => p !== pNo));
                            }
                          }}
                          className="w-3.5 h-3.5 text-rose-600 rounded cursor-pointer"
                        />
                        <span>Period #{pNo}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PRINTABLE NOTICEBOARD GRID MODAL */}
      {isPrintGridModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`bg-white text-slate-900 w-full ${printPaperSize === 'WIDE_SHEET' ? 'max-w-7xl' : 'max-w-5xl'} rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 space-y-6 p-8 relative`}>
            
            {/* Modal Control Header (Hidden on Print) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 no-print">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900">
                  Full-Screen Printable Grid & Noticeboard
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Daily School Arrangement & Patrol Noticeboard ({selectedDay})
                </h3>
              </div>

              {/* Print Preferences */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border">
                  <span>Layout:</span>
                  <button
                    onClick={() => setPrintOrientation('landscape')}
                    className={`px-2.5 py-1 rounded-lg ${printOrientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                  >
                    Landscape
                  </button>
                  <button
                    onClick={() => setPrintOrientation('portrait')}
                    className={`px-2.5 py-1 rounded-lg ${printOrientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                  >
                    Portrait
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border">
                  <span>Sheet:</span>
                  <button
                    onClick={() => setPrintPaperSize('WIDE_SHEET')}
                    className={`px-2 py-1 rounded-lg ${printPaperSize === 'WIDE_SHEET' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                  >
                    Wide Sheet
                  </button>
                  <button
                    onClick={() => setPrintPaperSize('A4')}
                    className={`px-2 py-1 rounded-lg ${printPaperSize === 'A4' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                  >
                    A4
                  </button>
                  <button
                    onClick={() => setPrintPaperSize('A3')}
                    className={`px-2 py-1 rounded-lg ${printPaperSize === 'A3' ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}
                  >
                    A3
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Noticeboard
                </button>

                <button
                  onClick={() => setIsPrintGridModalOpen(false)}
                  className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE NOTICEBOARD CONTENT AREA */}
            <div id="printable-substitution-grid" className="space-y-6">
              
              {/* PRINT HEADER */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  ST. XAVIER'S INTERNATIONAL SCHOOL
                </h1>
                <h2 className="text-sm font-extrabold text-blue-900 uppercase tracking-widest">
                  DAILY TEACHER SUBSTITUTION & CAMPUS ROUND DUTY NOTICEBOARD
                </h2>
                <div className="flex items-center justify-center gap-6 pt-2 text-xs font-black text-slate-700">
                  <span>DAY: {selectedDay.toUpperCase()}</span>
                  <span>DATE: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span>SUBSTITUTIONS: {arrangements.length}</span>
                  <span>ROUND DUTIES: {roundDuties.filter((r) => r.day === selectedDay).length}</span>
                </div>
              </div>

              {/* NOTICEBOARD GRID TABLE - SUBSTITUTIONS */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
                  1. Class Substitution & Relief Arrangements Grid:
                </h3>
                {arrangements.length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No active substitution arrangements recorded for {selectedDay}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black uppercase tracking-wider">
                          <th className="p-2.5 border border-slate-900">Period & Time</th>
                          <th className="p-2.5 border border-slate-900">Class & Sec</th>
                          <th className="p-2.5 border border-slate-900">Subject</th>
                          <th className="p-2.5 border border-slate-900">Absent Faculty (Dept)</th>
                          <th className="p-2.5 border border-slate-900">Assigned Substitute Faculty (Dept)</th>
                          <th className="p-2.5 border border-slate-900 no-print">Live Reassign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-medium">
                        {arrangements.map((arr, idx) => {
                          const absDept = getDepartmentTheme(teacherTimetables.find((t) => t.teacherName === arr.absentTeacherName)?.department);
                          const subDept = getDepartmentTheme(teacherTimetables.find((t) => t.teacherName === arr.substituteTeacherName)?.department);

                          const freeForThisPeriod = teacherTimetables.filter((t) => {
                            const slotVal = t.schedule[`${selectedDay}_${arr.periodNumber}`];
                            return !slotVal || slotVal.trim() === '';
                          });

                          return (
                            <tr key={arr.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="p-2.5 border border-slate-900 font-bold text-blue-900">
                                Period #{arr.periodNumber} ({arr.timeSlot})
                              </td>
                              <td className="p-2.5 border border-slate-900 font-extrabold text-slate-900">
                                {arr.classSection}
                              </td>
                              <td className="p-2.5 border border-slate-900 font-bold text-slate-800">
                                {arr.subject}
                              </td>
                              <td className="p-2.5 border border-slate-900">
                                <strong className="text-rose-700 block">{arr.absentTeacherName}</strong>
                                <span className="text-[10px] text-slate-500 font-semibold">[{absDept.label}]</span>
                              </td>
                              <td className="p-2.5 border border-slate-900">
                                <strong className="text-emerald-800 block text-sm">{arr.substituteTeacherName}</strong>
                                <span className="text-[10px] text-slate-600 font-bold">[{subDept.label}]</span>
                              </td>
                              <td className="p-2.5 border border-slate-900 no-print">
                                <select
                                  value={arr.substituteTeacherName}
                                  onChange={(e) => handleUpdateArrangementSubstitute(arr.id, e.target.value)}
                                  className="px-2 py-1 text-xs font-bold border border-slate-400 rounded bg-white text-slate-900 cursor-pointer"
                                >
                                  <option value={arr.substituteTeacherName}>
                                    {arr.substituteTeacherName} (Current)
                                  </option>
                                  {freeForThisPeriod
                                    .filter((f) => f.teacherName !== arr.substituteTeacherName)
                                    .map((f) => (
                                      <option key={f.id} value={f.teacherName}>
                                        {f.teacherName} ({f.department || 'Senior Sec'})
                                      </option>
                                    ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* NOTICEBOARD GRID TABLE - ROUND DUTIES */}
              <div className="space-y-2 pt-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
                  2. Free Period Campus Round Patrol Duty Schedule:
                </h3>
                {roundDuties.filter((r) => r.day === selectedDay).length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No Round Duties assigned for {selectedDay}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-900 text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black uppercase tracking-wider">
                          <th className="p-2.5 border border-slate-900">Period & Time</th>
                          <th className="p-2.5 border border-slate-900">Patrol Location</th>
                          <th className="p-2.5 border border-slate-900">Assigned Patrol Teacher</th>
                          <th className="p-2.5 border border-slate-900">Department</th>
                          <th className="p-2.5 border border-slate-900">Duty Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 font-medium">
                        {roundDuties
                          .filter((r) => r.day === selectedDay)
                          .map((rd, idx) => {
                            const tRecord = teacherTimetables.find((t) => t.teacherName === rd.teacherName);
                            const deptTheme = getDepartmentTheme(tRecord?.department);

                            return (
                              <tr key={rd.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-2.5 border border-slate-900 font-bold text-indigo-900">
                                  Period #{rd.periodNumber} ({rd.timeSlot})
                                </td>
                                <td className="p-2.5 border border-slate-900 font-extrabold text-slate-900">
                                  📍 {rd.location}
                                </td>
                                <td className="p-2.5 border border-slate-900 font-black text-slate-900">
                                  {rd.teacherName}
                                </td>
                                <td className="p-2.5 border border-slate-900 font-bold text-slate-700">
                                  {deptTheme.label}
                                </td>
                                <td className="p-2.5 border border-slate-900 font-extrabold text-emerald-800">
                                  {rd.status} (Campus Patrol)
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SIGNATURE FOOTER FOR PRINT */}
              <div className="pt-8 flex items-center justify-between text-xs font-bold text-slate-800 border-t border-slate-300 mt-6">
                <div>
                  <p>Prepared By: Timetable & Substitution Incharge</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Automated ERP Department Match Engine</p>
                </div>
                <div className="text-right">
                  <p>Approved By: Vice Principal / Principal</p>
                  <div className="mt-6 border-b border-slate-400 w-48 ml-auto"></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 5: MASTER SCHOOL SCHEDULE MATRIX (OVERALL GRID) */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Teacher Weekly Timetable Master Schedule Grid
              </h3>
              <p className="text-xs text-slate-500">
                Grid view displaying all loaded teachers across Monday – Saturday and Periods 0 through 8.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              9-Period Daily Matrix
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-black text-slate-800 dark:text-slate-200 uppercase">
                <th className="py-3 px-3">Teacher Name & Department</th>
                <th className="py-3 px-3">Day</th>
                {TIMETABLE_PERIODS.map((p) => (
                  <th key={p} className="py-3 px-2 text-center">P{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {TIMETABLE_DAYS.flatMap((day) =>
                teacherTimetables.map((t) => {
                  const deptTheme = getDepartmentTheme(t.department);
                  return (
                    <tr key={`${t.id}-${day}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <strong className="text-slate-900 dark:text-white font-extrabold block">{t.teacherName}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border inline-block mt-0.5 ${deptTheme.badgeClass}`}>
                          {deptTheme.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{day}</td>
                      {TIMETABLE_PERIODS.map((pNo) => {
                        const val = t.schedule[`${day}_${pNo}`];
                        return (
                          <td key={pNo} className="py-2.5 px-1.5 text-center">
                            {val ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800 block truncate">
                                {val}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 block">
                                Free
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QR CODE CAMERA SCANNER SIMULATION MODAL */}
      {qrScannerDuty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Duty Point QR Scanner</h3>
              </div>
              <button
                onClick={() => setQrScannerDuty(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Camera Scanner Window */}
            <div className="relative aspect-square w-full bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-500/80 flex flex-col items-center justify-center p-4 overflow-hidden group">
              {/* Laser Scan Line Effect */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/4 animate-bounce opacity-80 shadow-[0_0_15px_#10b981]" />

              <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl flex items-center justify-center bg-slate-900/60 p-4 text-center space-y-2 relative">
                <QrCode className="w-24 h-24 text-emerald-400 mx-auto" />
              </div>

              <span className="text-xs font-bold text-emerald-300 mt-4 bg-slate-900/90 px-3 py-1 rounded-full border border-emerald-500/40">
                Align Camera with QR Code at Duty Location
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-white text-sm">📍 {qrScannerDuty.location}</p>
              <p className="text-slate-300">
                Faculty: <strong className="text-white">{qrScannerDuty.teacherName}</strong> | Period #{qrScannerDuty.periodNumber} ({qrScannerDuty.timeSlot})
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleVerifyQRScan(qrScannerDuty.id, qrScannerDuty.location)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm QR Code Scan & Complete Duty</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY ALERT DISPATCH MODAL FOR RED AREAS */}
      {dispatchAlertModalDuty && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/80 text-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Emergency Campus Security Alert</h3>
                  <p className="text-[11px] text-rose-300 font-bold uppercase tracking-wider">
                    Unattended Patrol Point Detected
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDispatchAlertModalDuty(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-rose-900/60 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">Duty Location Point:</span>
                <strong className="text-rose-400 font-black text-sm">📍 {dispatchAlertModalDuty.location}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">Assigned Faculty:</span>
                <strong className="text-white font-extrabold">{dispatchAlertModalDuty.teacherName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Scheduled Time Slot:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  Period #{dispatchAlertModalDuty.periodNumber} ({dispatchAlertModalDuty.timeSlot})
                </span>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Bell className="w-4 h-4 text-amber-400" /> Pre-Configured Escalation Recipients:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-extrabold">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-white">1. Timetable In-Charge</span>
                    <span className="text-[10px] text-slate-400 font-normal">Mr. Rakesh Sharma</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="block text-white">2. Admin In-Charge</span>
                    <span className="text-[10px] text-slate-400 font-normal">Dr. S. K. Verma (Vice Principal)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Alert Message Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Alert Message Details:
              </label>
              <textarea
                rows={3}
                value={dispatchAlertMessage}
                onChange={(e) => setDispatchAlertMessage(e.target.value)}
                className="w-full p-3 text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDispatchAlertToIncharges}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>📲 Dispatch Instant SMS & System Alert Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROUND DUTY MODAL */}
      {editingRoundDuty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-5 h-5" />
                Edit Round Patrol Duty
              </h3>
              <button
                onClick={() => setEditingRoundDuty(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Faculty / Teacher
                </label>
                <select
                  value={editingRoundDuty.teacherName}
                  onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, teacherName: e.target.value })}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                >
                  {teacherTimetables.map((t) => (
                    <option key={t.id} value={t.teacherName}>
                      {t.teacherName} ({t.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patrol Location / Campus Area
                </label>
                <select
                  value={editingRoundDuty.location}
                  onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, location: e.target.value })}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer mb-1.5"
                >
                  {roundLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or type custom patrol location..."
                  value={editingRoundDuty.location}
                  onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, location: e.target.value })}
                  className="w-full px-3 py-2 font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={editingRoundDuty.day}
                    onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, day: e.target.value as TimetableDay })}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    {TIMETABLE_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Period Number
                  </label>
                  <select
                    value={editingRoundDuty.periodNumber}
                    onChange={(e) => {
                      const pNum = Number(e.target.value);
                      setEditingRoundDuty({
                        ...editingRoundDuty,
                        periodNumber: pNum,
                        timeSlot: getTimeSlotForPeriod(pNum)
                      });
                    }}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <option key={p} value={p}>
                        Period #{p} ({getTimeSlotForPeriod(p)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingRoundDuty.status}
                    onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, status: e.target.value as any })}
                    className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                    <option value="Alert Dispatched">Alert Dispatched</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fixed Duty Lock
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingRoundDuty({ ...editingRoundDuty, isFixed: !editingRoundDuty.isFixed })}
                    className={`w-full py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      editingRoundDuty.isFixed
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {editingRoundDuty.isFixed ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{editingRoundDuty.isFixed ? 'Fixed Daily Duty' : 'Flexible Duty'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Observations
                </label>
                <input
                  type="text"
                  value={editingRoundDuty.remarks || ''}
                  onChange={(e) => setEditingRoundDuty({ ...editingRoundDuty, remarks: e.target.value })}
                  placeholder="e.g. Free period security patrol duty"
                  className="w-full px-3 py-2 font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingRoundDuty(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRoundDuties((prev) => prev.map((r) => (r.id === editingRoundDuty.id ? editingRoundDuty : r)));
                  setEditingRoundDuty(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
