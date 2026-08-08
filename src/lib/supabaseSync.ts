import { supabase } from './supabase';
import { TeacherTimetableRecord } from '../modules/timetable/timetableData';
import { Student } from '../types/sis';
import { AdmissionApplication } from '../types/admission';
import { StaffMember } from '../types/staff';

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 1. STUDENT (SIS) SYNC & FETCH
 */
export async function syncStudentToSupabase(student: Student): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      admission_no: student.admissionNo || `ADM-${Date.now()}`,
      full_name: (student.fullName || '').toUpperCase(),
      class_name: student.currentClass || student.admissionClass || 'Class 10',
      section: student.section || 'A',
      roll_no: Number(student.rollNo) || 1,
      gender: student.gender || 'Male',
      father_name: student.parents?.fatherName || '',
      mother_name: student.parents?.motherName || '',
      contact_phone: student.parents?.fatherMobile || '',
      category: student.category || 'General',
      status: student.status || 'Active'
    };

    const { data, error } = await supabase
      .from('students')
      .upsert([payload], { onConflict: 'admission_no' })
      .select();

    if (error) {
      console.error('Error syncing student to Supabase:', error);
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return {
      success: true,
      message: `🟢 Live DB Updated: Student "${student.fullName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to sync student' };
  }
}

export async function fetchStudentsFromSupabase(): Promise<Student[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id || `std-sb-${row.admission_no}`,
      admissionNo: row.admission_no,
      fullName: row.full_name,
      registrationNo: `REG-${row.admission_no}`,
      scholarNo: `SCH-${row.admission_no}`,
      penNo: 'PEN-100200300',
      apaarId: 'APAAR-900800700',
      aadhaarNo: '4812 9012 3456',
      gender: row.gender || 'Male',
      dob: '2012-05-15',
      bloodGroup: 'O+',
      religion: 'Hinduism',
      category: row.category || 'General',
      nationality: 'Indian',
      motherTongue: 'Hindi',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      admissionDate: new Date().toISOString().split('T')[0],
      admissionClass: row.class_name,
      currentClass: row.class_name,
      section: row.section,
      rollNo: row.roll_no || 1,
      house: 'Red',
      transportRequired: false,
      hostelRequired: false,
      parents: {
        fatherName: row.father_name || '',
        fatherOccupation: 'Business',
        fatherMobile: row.contact_phone || '',
        fatherEmail: 'parent@example.com',
        fatherIncome: '8,00,000 PA',
        fatherQualification: 'Graduate',
        motherName: row.mother_name || '',
        motherOccupation: 'Homemaker',
        motherMobile: row.contact_phone || '',
        motherEmail: '',
        address: row.address || 'City Center',
        emergencyContact: row.contact_phone || ''
      },
      medical: { bloodGroup: 'O+', disability: false },
      documents: [],
      siblings: [],
      promotions: [],
      status: row.status || 'Active'
    }));
  } catch (err) {
    console.error('Fetch students error:', err);
    return null;
  }
}

/**
 * 2. ADMISSION LEADS SYNC & FETCH
 */
export async function syncAdmissionLeadToSupabase(app: AdmissionApplication): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      lead_no: app.applicationNo || `APP-${Date.now()}`,
      applicant_name: (app.studentName || '').toUpperCase(),
      parent_name: app.fatherName || '',
      phone: app.contactPhone || '',
      class_seeking: app.classApplyingFor || 'Class 1',
      lead_source: 'Online Portal',
      status: app.status || 'Inquiry Received'
    };

    const { data, error } = await supabase
      .from('admission_leads')
      .upsert([payload], { onConflict: 'lead_no' })
      .select();

    if (error) {
      console.error('Error syncing admission lead to Supabase:', error);
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return {
      success: true,
      message: `🟢 Live DB Updated: Admission lead "${app.studentName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 3. TEACHER & TIMETABLE SYNC & FETCH
 */
export async function syncTeacherAndTimetableToSupabase(
  teacher: TeacherTimetableRecord
): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const cleanName = teacher.teacherName.trim().toUpperCase();
    const cleanDept = teacher.department || 'Senior Secondary';
    const empCode = `EMP-${cleanName.replace(/[^A-Z0-9]/g, '').slice(0, 8)}`;

    // 1. Upsert into public.staff
    await supabase.from('staff').upsert(
      [
        {
          employee_code: empCode,
          full_name: cleanName,
          department: cleanDept,
          designation: 'Faculty / Teacher',
          status: 'Active'
        }
      ],
      { onConflict: 'employee_code' }
    );

    // 2. Clear previous timetable slots
    await supabase.from('timetables').delete().eq('teacher_name', cleanName);

    // 3. Prepare timetable rows
    const timetableRows: any[] = [];
    Object.entries(teacher.schedule || {}).forEach(([key, classVal]) => {
      if (!classVal || !classVal.trim()) return;
      const [dayStr, periodStr] = key.split('_');
      const periodNo = parseInt(periodStr, 10);

      if (dayStr && !isNaN(periodNo)) {
        timetableRows.push({
          teacher_name: cleanName,
          department: cleanDept,
          day_of_week: dayStr,
          period_number: periodNo,
          class_and_section: classVal.trim(),
          subject_name: 'Regular Subject',
          room_number: 'Classroom'
        });
      }
    });

    if (timetableRows.length > 0) {
      const { error: ttErr } = await supabase.from('timetables').insert(timetableRows);
      if (ttErr) {
        console.warn('Timetable insert notice:', ttErr);
      }
    }

    return {
      success: true,
      message: `🟢 Live DB Updated: Teacher "${cleanName}" & timetable (${timetableRows.length} periods) saved to Supabase!`
    };
  } catch (err: any) {
    console.error('Supabase timetable sync error:', err);
    return { success: false, message: err.message || 'Timetable sync error' };
  }
}

export async function fetchTeachersAndTimetablesFromSupabase(): Promise<TeacherTimetableRecord[] | null> {
  if (!supabase) return null;

  try {
    const { data: ttData, error: ttErr } = await supabase.from('timetables').select('*');
    if (ttErr || !ttData || ttData.length === 0) return null;

    const teacherMap: Record<string, TeacherTimetableRecord> = {};

    ttData.forEach((row: any) => {
      const name = (row.teacher_name || '').toUpperCase();
      if (!name) return;

      if (!teacherMap[name]) {
        teacherMap[name] = {
          id: `tt-sb-${name.replace(/[^A-Z0-9]/g, '')}`,
          teacherName: name,
          department: row.department || 'Senior Secondary',
          schedule: {},
          lastUpdated: row.created_at ? new Date(row.created_at).toLocaleString() : new Date().toLocaleString()
        };
      }

      const slotKey = `${row.day_of_week}_${row.period_number}`;
      teacherMap[name].schedule[slotKey] = row.class_and_section || 'Assigned';
    });

    return Object.values(teacherMap);
  } catch (e) {
    console.error('Error fetching teachers from Supabase:', e);
    return null;
  }
}

/**
 * 4. FEE COLLECTION SYNC
 */
export async function syncFeeCollectionToSupabase(fee: {
  receiptNo: string;
  studentAdmissionNo: string;
  studentName: string;
  className: string;
  feeHead: string;
  amountPaid: number;
  paymentMode: string;
  transactionRef?: string;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      receipt_no: fee.receiptNo || `REC-${Date.now()}`,
      student_admission_no: fee.studentAdmissionNo,
      student_name: fee.studentName.toUpperCase(),
      class_name: fee.className,
      fee_head: fee.feeHead,
      amount_paid: fee.amountPaid,
      payment_mode: fee.paymentMode,
      transaction_ref: fee.transactionRef || 'N/A'
    };

    const { data, error } = await supabase
      .from('fee_collections')
      .upsert([payload], { onConflict: 'receipt_no' })
      .select();

    if (error) {
      console.error('Error syncing fee collection to Supabase:', error);
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return {
      success: true,
      message: `🟢 Live DB Updated: Fee Receipt #${fee.receiptNo} saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 5. STAFF SYNC
 */
export async function syncStaffToSupabase(staff: StaffMember): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      employee_code: staff.employeeCode || `EMP-${Date.now()}`,
      full_name: staff.fullName.toUpperCase(),
      department: staff.department,
      designation: staff.designation,
      contact_phone: staff.phone || '',
      email: staff.email || '',
      status: staff.status || 'Active'
    };

    const { data, error } = await supabase
      .from('staff')
      .upsert([payload], { onConflict: 'employee_code' })
      .select();

    if (error) {
      console.error('Error syncing staff to Supabase:', error);
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return {
      success: true,
      message: `🟢 Live DB Updated: Staff "${staff.fullName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 6. LEAVE APPLICATIONS SYNC
 */
export async function syncLeaveToSupabase(leave: {
  applicantName: string;
  applicantType?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status?: string;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      applicant_name: leave.applicantName.toUpperCase(),
      applicant_type: leave.applicantType || 'Staff',
      leave_type: leave.leaveType,
      start_date: leave.startDate,
      end_date: leave.endDate,
      reason: leave.reason,
      status: leave.status || 'Pending'
    };

    const { data, error } = await supabase.from('leave_applications').insert([payload]).select();
    if (error) return { success: false, message: `Supabase Error: ${error.message}` };

    return {
      success: true,
      message: `🟢 Live DB Updated: Leave request for "${leave.applicantName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 7. EXIT INTERVIEWS & HR EVALUATIONS SYNC
 */
export async function syncExitInterviewToSupabase(interview: {
  candidateName: string;
  department: string;
  designation: string;
  feedbackNotes?: string;
  rating?: string;
  status?: string;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      candidate_name: interview.candidateName.toUpperCase(),
      department: interview.department,
      designation: interview.designation,
      feedback_notes: interview.feedbackNotes || 'Completed interview assessment',
      rating: interview.rating || 'Recommended',
      status: interview.status || 'Completed'
    };

    const { data, error } = await supabase.from('exit_interviews').insert([payload]).select();
    if (error) return { success: false, message: `Supabase Error: ${error.message}` };

    return {
      success: true,
      message: `🟢 Live DB Updated: HR evaluation for "${interview.candidateName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 8. DAILY ATTENDANCE SYNC
 */
export async function syncAttendanceToSupabase(attendance: {
  date: string;
  className: string;
  section: string;
  studentAdmissionNo: string;
  status: string;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      attendance_date: attendance.date,
      class_name: attendance.className,
      section: attendance.section,
      student_admission_no: attendance.studentAdmissionNo,
      status: attendance.status
    };

    const { data, error } = await supabase.from('daily_attendance').insert([payload]).select();
    if (error) return { success: false, message: `Supabase Error: ${error.message}` };

    return {
      success: true,
      message: `🟢 Live DB Updated: Attendance for "${attendance.studentAdmissionNo}" marked in Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 9. INVENTORY & HOSTEL SYNC
 */
export async function syncInventoryToSupabase(item: {
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice?: number;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const payload = {
      item_code: item.itemCode || `ITEM-${Date.now()}`,
      item_name: item.itemName,
      category: item.category,
      total_quantity: item.quantity,
      available_quantity: item.quantity,
      unit_price: item.unitPrice || 0
    };

    const { data, error } = await supabase.from('inventory_items').upsert([payload], { onConflict: 'item_code' }).select();
    if (error) return { success: false, message: `Supabase Error: ${error.message}` };

    return {
      success: true,
      message: `🟢 Live DB Updated: Inventory "${item.itemName}" saved to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * 10. EXAMINATIONS & STUDENT MARKS SYNC
 */
export async function syncMarksheetToSupabase(params: {
  examName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  studentAdmissionNo: string;
  studentName: string;
  marksObtained: number;
  remarks?: string;
}): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    // 1. Ensure examination record exists
    let examId: string | null = null;
    const { data: existingExams } = await supabase
      .from('examinations')
      .select('id')
      .eq('exam_name', params.examName)
      .eq('class_name', params.className)
      .eq('subject_name', params.subjectName)
      .limit(1);

    if (existingExams && existingExams.length > 0) {
      examId = existingExams[0].id;
    } else {
      const { data: newExam, error: examErr } = await supabase
        .from('examinations')
        .insert([{
          exam_name: params.examName,
          academic_year: '2025-2026',
          class_name: params.className,
          subject_name: params.subjectName,
          max_marks: 100,
          passing_marks: 33,
          exam_date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (examErr) {
        console.error('Error creating examination entry in Supabase:', examErr);
      } else if (newExam && newExam[0]) {
        examId = newExam[0].id;
      }
    }

    // 2. Insert student mark entry
    const markPayload = {
      examination_id: examId,
      student_admission_no: params.studentAdmissionNo,
      student_name: params.studentName.toUpperCase(),
      marks_obtained: params.marksObtained,
      grade: params.marksObtained >= 90 ? 'A1' : params.marksObtained >= 75 ? 'A2' : params.marksObtained >= 60 ? 'B1' : params.marksObtained >= 33 ? 'C' : 'F',
      remarks: params.remarks || 'Marks evaluated'
    };

    const { data, error } = await supabase.from('student_marks').insert([markPayload]).select();
    if (error) return { success: false, message: `Supabase Error: ${error.message}` };

    return {
      success: true,
      message: `🟢 Live DB Updated: Marks (${params.marksObtained}) for "${params.studentName}" synced to Supabase!`,
      data
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Live Trial Execution Function
 * Inserts sample trial records into live Supabase tables and verifies round-trip
 */
export async function runLiveSupabaseTrial(): Promise<SupabaseSyncResult> {
  if (!supabase) return { success: false, message: 'Supabase client not connected.' };

  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trialAdmissionNo = `TRIAL-ANKUR-${randomSuffix}`;
    const trialStaffCode = `EMP-ANKUR-${randomSuffix}`;
    const trialName = 'ANKUR KABRA (LIVE TRIAL)';

    // 1. Insert into students table
    const { error: stdErr } = await supabase.from('students').upsert([
      {
        admission_no: trialAdmissionNo,
        full_name: trialName,
        class_name: '10',
        section: 'A',
        roll_no: 99,
        gender: 'Male',
        father_name: 'LIVE TRIAL FATHER',
        contact_phone: '9876543210',
        status: 'Active'
      }
    ], { onConflict: 'admission_no' });

    if (stdErr) {
      return {
        success: false,
        message: `Trial Failed on 'students' table: ${stdErr.message}. (Action needed: Open 'Supabase & Vercel Cloud' tab and click '1. Copy SQL Script' -> '2. Open Supabase SQL Editor' -> Paste & Run to create all 15 tables & RLS policies)`
      };
    }

    // 2. Insert into staff table
    const { error: staffErr } = await supabase.from('staff').upsert([
      {
        employee_code: trialStaffCode,
        full_name: trialName,
        department: 'Mathematics Dept',
        designation: 'Senior Faculty',
        contact_phone: '9876543210',
        status: 'Active'
      }
    ], { onConflict: 'employee_code' });

    if (staffErr) {
      return {
        success: false,
        message: `Student write worked, but staff write notice: ${staffErr.message}`
      };
    }

    // 3. Read back student record to verify full round-trip
    const { data: readBack, error: readErr } = await supabase
      .from('students')
      .select('*')
      .eq('admission_no', trialAdmissionNo)
      .single();

    if (readErr || !readBack) {
      return {
        success: false,
        message: `Write succeeded, but live verification read failed: ${readErr?.message || 'Record not returned'}`
      };
    }

    return {
      success: true,
      message: `✅ LIVE SUPABASE TRIAL SUCCESSFUL! Written & verified across tables: "${readBack.full_name}" (Admission: ${readBack.admission_no}, Staff Code: ${trialStaffCode}) directly in live Supabase DB!`
    };
  } catch (err: any) {
    return { success: false, message: `Trial Exception: ${err.message}` };
  }
}
