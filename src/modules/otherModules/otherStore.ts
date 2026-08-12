import { useState, useEffect } from 'react';
import { AttendanceRecord, FeeTransaction, TimetableSlot, LibraryBook, NoticeItem, VisitorPass, InventoryItem, StaffMember } from '../../types/otherModules';
import { INITIAL_STAFF, INITIAL_ROUTES, INITIAL_NOTICES } from '../../data/mockData';
import { syncFeeCollectionToSupabase, fetchStaffFromSupabase, syncStaffToSupabase } from '../../lib/supabaseSync';

const OTHER_STORAGE_KEY = 'schoolerp_other_modules_v1';

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-101', studentName: 'Aarav Sharma', classSection: 'Class 10-A', rollNo: 1, date: new Date().toISOString().split('T')[0], status: 'Present' },
  { id: 'att-2', studentId: 'std-102', studentName: 'Ananya Verma', classSection: 'Class 10-A', rollNo: 2, date: new Date().toISOString().split('T')[0], status: 'Present' },
  { id: 'att-3', studentId: 'std-103', studentName: 'Rohan Patel', classSection: 'Class 10-B', rollNo: 1, date: new Date().toISOString().split('T')[0], status: 'Late', remarks: 'Bus delay' }
];

const INITIAL_FEES: FeeTransaction[] = [
  { id: 'fee-1', receiptNo: 'REC-2026-901', studentId: 'std-101', studentName: 'Aarav Sharma', classSection: 'Class 10-A', amountPaid: 4500, paymentMode: 'UPI', paymentDate: '2026-03-01', feeHead: 'Tuition Fee - March 2026', status: 'Paid' },
  { id: 'fee-2', receiptNo: 'REC-2026-902', studentId: 'std-102', studentName: 'Ananya Verma', classSection: 'Class 10-A', amountPaid: 4500, paymentMode: 'Online', paymentDate: '2026-03-02', feeHead: 'Tuition Fee - March 2026', status: 'Paid' },
  { id: 'fee-3', receiptNo: 'REC-2026-903', studentId: 'std-103', studentName: 'Rohan Patel', classSection: 'Class 10-B', amountPaid: 4500, paymentMode: 'Cash', paymentDate: '2026-03-05', feeHead: 'Tuition Fee - March 2026', status: 'Paid' }
];

const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', periodNumber: 1, timeSlot: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacherName: 'Mr. Rajesh Namboodiri', classSection: 'Class 10-A', roomNo: 'Room 301' },
  { id: 'tt-2', day: 'Monday', periodNumber: 2, timeSlot: '08:45 AM - 09:30 AM', subject: 'Science & Tech', teacherName: 'Dr. Priya Nambiar', classSection: 'Class 10-A', roomNo: 'Lab 2' },
  { id: 'tt-3', day: 'Monday', periodNumber: 3, timeSlot: '09:30 AM - 10:15 AM', subject: 'English Language', teacherName: 'Mrs. M. Das', classSection: 'Class 10-A', roomNo: 'Room 301' }
];

const INITIAL_BOOKS: LibraryBook[] = [
  { id: 'bk-1', isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian W. Kernighan, Dennis M. Ritchie', category: 'Computer Science', copiesTotal: 10, copiesAvailable: 7, rackLocation: 'Rack CS-2' },
  { id: 'bk-2', isbn: '978-0070671560', title: 'Concepts of Physics (Vol 1)', author: 'H. C. Verma', category: 'Physics', copiesTotal: 25, copiesAvailable: 18, rackLocation: 'Rack PHY-1' },
  { id: 'bk-3', isbn: '978-0199535569', title: 'Mathematics for Class X', author: 'R. D. Sharma', category: 'Mathematics', copiesTotal: 30, copiesAvailable: 22, rackLocation: 'Rack MATH-3' }
];

const INITIAL_VISITORS: VisitorPass[] = [
  { id: 'vis-1', passNo: 'VP-2026-041', visitorName: 'Mr. Sunil Grover', phone: '+91 98111 55443', purpose: 'Admission Inquiry', whomToMeet: 'Admission Cell', entryTime: '10:15 AM', status: 'Checked Out', exitTime: '11:00 AM' },
  { id: 'vis-2', passNo: 'VP-2026-042', visitorName: 'Mrs. Rekha Sen', phone: '+91 98111 88990', purpose: 'Parent Meeting', whomToMeet: 'Class Teacher 10-A', entryTime: '11:30 AM', status: 'Inside' }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', itemCode: 'LAB-MIC-01', itemName: 'Digital Microscope 1000x', category: 'Lab Equipment', quantity: 15, unitPrice: 12000, location: 'Biology Lab', status: 'In Stock' },
  { id: 'inv-2', itemCode: 'DESK-DUAL-04', itemName: 'Dual Seater Wooden Bench', category: 'Furniture', quantity: 200, unitPrice: 3500, location: 'Classrooms Block B', status: 'In Stock' }
];

export function useOtherModulesStore() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [fees, setFees] = useState<FeeTransaction[]>(INITIAL_FEES);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [visitors, setVisitors] = useState<VisitorPass[]>(INITIAL_VISITORS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('schoolerp_staff_list_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STAFF;
  });

  useEffect(() => {
    try {
      localStorage.setItem('schoolerp_staff_list_v1', JSON.stringify(staff));
    } catch (e) {
      console.error(e);
    }
  }, [staff]);

  // Load remote staff from Supabase on mount
  useEffect(() => {
    let active = true;
    async function loadRemoteStaff() {
      const remote = await fetchStaffFromSupabase();
      if (remote && remote.length > 0 && active) {
        setStaff((prev) => {
          const map: Record<string, StaffMember> = {};
          prev.forEach((s) => { map[s.employeeCode || s.fullName.toUpperCase()] = s; });
          remote.forEach((s) => { map[s.employeeCode || s.fullName.toUpperCase()] = s; });
          const merged = Object.values(map);
          try {
            localStorage.setItem('schoolerp_staff_list_v1', JSON.stringify(merged));
          } catch (e) {
            console.error(e);
          }
          return merged;
        });
      }
    }
    loadRemoteStaff();

    const handleStaffEvent = (e: Event) => {
      const customEvent = e as CustomEvent<StaffMember[]>;
      if (customEvent.detail) {
        setStaff(customEvent.detail);
      }
    };
    window.addEventListener('schoolerp_staff_updated', handleStaffEvent);

    return () => {
      active = false;
      window.removeEventListener('schoolerp_staff_updated', handleStaffEvent);
    };
  }, []);

  const notifyStaffUpdated = (newList: StaffMember[]) => {
    try {
      localStorage.setItem('schoolerp_staff_list_v1', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent('schoolerp_staff_updated', { detail: newList }));
  };

  const addStaffMember = async (newStaff: Omit<StaffMember, 'id'>) => {
    const empCode = newStaff.employeeCode || `EMP-${String(staff.length + 1).padStart(3, '0')}`;
    const staffObj: StaffMember = {
      ...newStaff,
      id: `stf-${Date.now()}`,
      employeeCode: empCode,
      fullName: newStaff.fullName.trim().toUpperCase(),
      status: newStaff.status || 'Active'
    };
    
    const updatedList = [staffObj, ...staff];
    setStaff(updatedList);
    notifyStaffUpdated(updatedList);

    await syncStaffToSupabase(staffObj);
    return staffObj;
  };

  const deleteStaffMember = (staffId: string) => {
    const updatedList = staff.filter((s) => s.id !== staffId);
    setStaff(updatedList);
    notifyStaffUpdated(updatedList);
  };

  const updateStaffStatus = async (staffId: string, status: 'Active' | 'On Leave' | 'Absent' | 'In Interview' | 'Half Day') => {
    let updatedStaffMember: StaffMember | null = null;
    const updatedList = staff.map((s) => {
      if (s.id === staffId) {
        updatedStaffMember = { ...s, status };
        return updatedStaffMember;
      }
      return s;
    });

    setStaff(updatedList);
    notifyStaffUpdated(updatedList);

    if (updatedStaffMember) {
      await syncStaffToSupabase(updatedStaffMember);
    }
  };
  const [routes] = useState(INITIAL_ROUTES);

  const [feeSyncStatus, setFeeSyncStatus] = useState<string | null>(null);

  const addFeeTransaction = async (trx: Omit<FeeTransaction, 'id' | 'receiptNo' | 'status'>) => {
    const newTrx: FeeTransaction = {
      ...trx,
      id: `fee-${Date.now()}`,
      receiptNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Paid'
    };
    setFees((prev) => [newTrx, ...prev]);

    setFeeSyncStatus(`Syncing receipt ${newTrx.receiptNo} to Supabase...`);
    const res = await syncFeeCollectionToSupabase({
      receiptNo: newTrx.receiptNo,
      studentAdmissionNo: newTrx.studentId || 'ADM-2026-001',
      studentName: newTrx.studentName,
      className: newTrx.classSection,
      feeHead: newTrx.feeHead,
      amountPaid: newTrx.amountPaid,
      paymentMode: newTrx.paymentMode
    });
    setFeeSyncStatus(res.message);
    setTimeout(() => setFeeSyncStatus(null), 5000);

    return newTrx;
  };

  const markAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const dates = records.map((r) => r.date);
      const filtered = prev.filter((p) => !dates.includes(p.date));
      return [...records, ...filtered];
    });
  };

  const addNotice = (notice: Omit<NoticeItem, 'id' | 'date'>) => {
    const newNot: NoticeItem = {
      ...notice,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setNotices((prev) => [newNot, ...prev]);
  };

  const addVisitor = (visitor: Omit<VisitorPass, 'id' | 'passNo' | 'entryTime' | 'status'>) => {
    const newVis: VisitorPass = {
      ...visitor,
      id: `vis-${Date.now()}`,
      passNo: `VP-2026-${Math.floor(100 + Math.random() * 900)}`,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Inside'
    };
    setVisitors((prev) => [newVis, ...prev]);
  };

  const checkOutVisitor = (id: string) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'Checked Out', exitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : v
      )
    );
  };

  return {
    attendance,
    markAttendance,
    fees,
    feeSyncStatus,
    addFeeTransaction,
    timetable,
    books,
    notices,
    addNotice,
    visitors,
    addVisitor,
    checkOutVisitor,
    inventory,
    staff,
    addStaffMember,
    deleteStaffMember,
    updateStaffStatus,
    routes
  };
}
