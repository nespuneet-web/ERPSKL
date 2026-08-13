import { useState, useEffect } from 'react';
import { AttendanceRecord, FeeTransaction, TimetableSlot, LibraryBook, NoticeItem, VisitorPass, InventoryItem, StaffMember } from '../../types/otherModules';
import { INITIAL_STAFF, INITIAL_ROUTES, INITIAL_NOTICES } from '../../data/mockData';
import {
  syncFeeCollectionToSupabase,
  fetchFeeCollectionsFromSupabase,
  fetchStaffFromSupabase,
  syncStaffToSupabase,
  syncAttendanceToSupabase,
  fetchAttendanceFromSupabase,
  syncInventoryToSupabase,
  fetchInventoryFromSupabase,
  syncLibraryBookToSupabase,
  fetchLibraryBooksFromSupabase,
  syncVisitorPassToSupabase,
  fetchVisitorPassesFromSupabase,
  syncTransportRouteToSupabase,
  fetchTransportRoutesFromSupabase
} from '../../lib/supabaseSync';
import { deleteRecord } from '../../lib/dbUtility';

const STORAGE_ATTENDANCE_KEY = 'schoolerp_attendance_v1';
const STORAGE_FEES_KEY = 'schoolerp_fees_v1';
const STORAGE_BOOKS_KEY = 'schoolerp_books_v1';
const STORAGE_VISITORS_KEY = 'schoolerp_visitors_v1';
const STORAGE_INVENTORY_KEY = 'schoolerp_inventory_v1';

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

function ensureUniqueStaffIds(list: StaffMember[]): StaffMember[] {
  const seen = new Set<string>();
  return list.map((item, idx) => {
    let id = item.id || `stf-${idx}`;
    if (seen.has(id)) {
      id = `${id}-${idx}-${Date.now().toString(36)}`;
    }
    seen.add(id);
    return { ...item, id };
  });
}

export function useOtherModulesStore() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return INITIAL_ATTENDANCE;
  });

  const [fees, setFees] = useState<FeeTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FEES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return INITIAL_FEES;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);

  const [books, setBooks] = useState<LibraryBook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return INITIAL_BOOKS;
  });

  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);

  const [visitors, setVisitors] = useState<VisitorPass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VISITORS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return INITIAL_VISITORS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVENTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return INITIAL_INVENTORY;
  });

  const [routes, setRoutes] = useState(INITIAL_ROUTES);

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('schoolerp_staff_list_v1');
      if (saved) return ensureUniqueStaffIds(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    return ensureUniqueStaffIds(INITIAL_STAFF);
  });

  // LocalStorage Sync Effects
  useEffect(() => {
    try { localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(attendance)); } catch (e) { console.error(e); }
  }, [attendance]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_FEES_KEY, JSON.stringify(fees)); } catch (e) { console.error(e); }
  }, [fees]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books)); } catch (e) { console.error(e); }
  }, [books]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_VISITORS_KEY, JSON.stringify(visitors)); } catch (e) { console.error(e); }
  }, [visitors]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(inventory)); } catch (e) { console.error(e); }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('schoolerp_staff_list_v1', JSON.stringify(staff));
    } catch (e) {
      console.error(e);
    }
  }, [staff]);

  // Load Remote Data from Supabase on mount
  useEffect(() => {
    let active = true;

    async function loadAllRemote() {
      // Remote Staff
      const remoteStaff = await fetchStaffFromSupabase();
      if (remoteStaff && remoteStaff.length > 0 && active) {
        setStaff((prev) => {
          const map: Record<string, StaffMember> = {};
          prev.forEach((s) => { map[s.employeeCode || s.fullName.toUpperCase()] = s; });
          remoteStaff.forEach((s) => { map[s.employeeCode || s.fullName.toUpperCase()] = s; });
          const merged = ensureUniqueStaffIds(Object.values(map));
          try { localStorage.setItem('schoolerp_staff_list_v1', JSON.stringify(merged)); } catch (e) {}
          return merged;
        });
      }

      // Remote Fees
      const remoteFees = await fetchFeeCollectionsFromSupabase();
      if (remoteFees && remoteFees.length > 0 && active) {
        setFees((prev) => {
          const map: Record<string, FeeTransaction> = {};
          prev.forEach((f) => { map[f.receiptNo] = f; });
          remoteFees.forEach((f) => { map[f.receiptNo] = f; });
          return Object.values(map);
        });
      }

      // Remote Attendance
      const remoteAtt = await fetchAttendanceFromSupabase();
      if (remoteAtt && remoteAtt.length > 0 && active) {
        setAttendance((prev) => {
          const map: Record<string, AttendanceRecord> = {};
          prev.forEach((a) => { map[`${a.studentId}-${a.date}`] = a; });
          remoteAtt.forEach((a) => { map[`${a.studentId}-${a.date}`] = a; });
          return Object.values(map);
        });
      }

      // Remote Inventory
      const remoteInv = await fetchInventoryFromSupabase();
      if (remoteInv && remoteInv.length > 0 && active) {
        setInventory((prev) => {
          const map: Record<string, InventoryItem> = {};
          prev.forEach((i) => { map[i.itemCode] = i; });
          remoteInv.forEach((i) => { map[i.itemCode] = i; });
          return Object.values(map);
        });
      }

      // Remote Library Books
      const remoteBks = await fetchLibraryBooksFromSupabase();
      if (remoteBks && remoteBks.length > 0 && active) {
        setBooks((prev) => {
          const map: Record<string, LibraryBook> = {};
          prev.forEach((b) => { map[b.isbn] = b; });
          remoteBks.forEach((b) => { map[b.isbn] = b; });
          return Object.values(map);
        });
      }

      // Remote Visitors
      const remoteVis = await fetchVisitorPassesFromSupabase();
      if (remoteVis && remoteVis.length > 0 && active) {
        setVisitors((prev) => {
          const map: Record<string, VisitorPass> = {};
          prev.forEach((v) => { map[v.passNo] = v; });
          remoteVis.forEach((v) => { map[v.passNo] = v; });
          return Object.values(map);
        });
      }

      // Remote Transport Routes
      const remoteRt = await fetchTransportRoutesFromSupabase();
      if (remoteRt && remoteRt.length > 0 && active) {
        setRoutes(remoteRt);
      }
    }

    loadAllRemote();

    const handleStaffEvent = (e: Event) => {
      const customEvent = e as CustomEvent<StaffMember[]>;
      if (customEvent.detail) {
        setStaff(ensureUniqueStaffIds(customEvent.detail));
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

  const deleteStaffMember = async (staffId: string) => {
    const target = staff.find((s) => s.id === staffId || s.employeeCode === staffId);
    const updatedList = staff.filter((s) => s.id !== staffId && s.employeeCode !== staffId);
    setStaff(updatedList);
    notifyStaffUpdated(updatedList);

    if (target && target.employeeCode) {
      await deleteRecord('staff', target.employeeCode, undefined, 'employee_code');
    }
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

  const updateStaffAllocation = async (staffId: string, classTeacherOf: string, assignedClasses: string[], assignedSubjects: string[]) => {
    let updatedStaffMember: StaffMember | null = null;
    const updatedList = staff.map((s) => {
      if (s.id === staffId || s.employeeCode === staffId) {
        updatedStaffMember = {
          ...s,
          classTeacherOf,
          assignedClasses,
          assignedSubjects
        };
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

  const markAttendance = async (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const dates = records.map((r) => r.date);
      const filtered = prev.filter((p) => !dates.includes(p.date));
      return [...records, ...filtered];
    });

    for (const rec of records) {
      const [cls, sec] = (rec.classSection || 'Class 10-A').split('-');
      await syncAttendanceToSupabase({
        date: rec.date,
        className: cls || 'Class 10',
        section: sec || 'A',
        studentAdmissionNo: rec.studentId || 'ADM-001',
        status: rec.status
      });
    }
  };

  const addNotice = (notice: Omit<NoticeItem, 'id' | 'date'>) => {
    const newNot: NoticeItem = {
      ...notice,
      id: `not-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setNotices((prev) => [newNot, ...prev]);
  };

  const addVisitor = async (visitor: Omit<VisitorPass, 'id' | 'passNo' | 'entryTime' | 'status'>) => {
    const newVis: VisitorPass = {
      ...visitor,
      id: `vis-${Date.now()}`,
      passNo: `VP-2026-${Math.floor(100 + Math.random() * 900)}`,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Inside'
    };
    setVisitors((prev) => [newVis, ...prev]);
    await syncVisitorPassToSupabase({
      passNo: newVis.passNo,
      visitorName: newVis.visitorName,
      phone: newVis.phone,
      purpose: newVis.purpose,
      whomToMeet: newVis.whomToMeet,
      entryTime: newVis.entryTime,
      status: 'Inside'
    });
  };

  const checkOutVisitor = async (id: string) => {
    let targetPass: VisitorPass | null = null;
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id || v.passNo === id) {
          targetPass = { ...v, status: 'Checked Out', exitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          return targetPass;
        }
        return v;
      })
    );
    if (targetPass) {
      await syncVisitorPassToSupabase({
        passNo: (targetPass as VisitorPass).passNo,
        visitorName: (targetPass as VisitorPass).visitorName,
        phone: (targetPass as VisitorPass).phone,
        purpose: (targetPass as VisitorPass).purpose,
        whomToMeet: (targetPass as VisitorPass).whomToMeet,
        entryTime: (targetPass as VisitorPass).entryTime,
        status: 'Checked Out'
      });
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    setInventory((prev) => [newItem, ...prev]);
    await syncInventoryToSupabase({
      itemCode: newItem.itemCode,
      itemName: newItem.itemName,
      category: newItem.category,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice
    });
  };

  const addBook = async (book: Omit<LibraryBook, 'id' | 'copiesAvailable'>) => {
    const newBook: LibraryBook = {
      ...book,
      id: `bk-${Date.now()}`,
      copiesAvailable: book.copiesTotal
    };
    setBooks((prev) => [newBook, ...prev]);
    await syncLibraryBookToSupabase({
      isbn: newBook.isbn,
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      copiesTotal: newBook.copiesTotal,
      rackLocation: newBook.rackLocation
    });
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
    addInventoryItem,
    addBook,
    staff,
    addStaffMember,
    deleteStaffMember,
    updateStaffStatus,
    updateStaffAllocation,
    routes
  };
}
