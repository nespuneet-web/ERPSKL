import { supabase } from './supabase';
import { TeacherTimetableRecord } from '../modules/timetable/timetableData';

export interface SupabaseStaffRow {
  id?: string;
  employee_code: string;
  full_name: string;
  department: string;
  designation: string;
  contact_phone?: string;
  email?: string;
  status?: string;
}

export interface SupabaseTimetableRow {
  id?: string;
  teacher_name: string;
  department: string;
  day_of_week: string;
  period_number: number;
  class_and_section: string;
  subject_name?: string;
  room_number?: string;
}

export interface SupabaseStudentRow {
  id?: string;
  admission_no: string;
  full_name: string;
  class_name: string;
  section: string;
  roll_no?: number;
  father_name?: string;
  contact_phone?: string;
  status?: string;
}

/**
 * Live Sync: Upsert Teacher & Timetable to Supabase
 */
export async function syncTeacherAndTimetableToSupabase(
  teacher: TeacherTimetableRecord
): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase client not initialized.' };
  }

  try {
    const cleanName = teacher.teacherName.trim().toUpperCase();
    const cleanDept = teacher.department || 'Senior Secondary';
    const empCode = `EMP-${cleanName.replace(/[^A-Z0-9]/g, '').slice(0, 8)}`;

    // 1. Upsert into public.staff table
    const { error: staffErr } = await supabase.from('staff').upsert(
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

    if (staffErr) {
      console.warn('Supabase staff upsert notice:', staffErr);
    }

    // 2. Clear previous timetable slots for this teacher in public.timetables
    await supabase.from('timetables').delete().eq('teacher_name', cleanName);

    // 3. Prepare timetable rows from teacher.schedule
    const timetableRows: SupabaseTimetableRow[] = [];
    Object.entries(teacher.schedule).forEach(([key, classVal]) => {
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
        console.warn('Supabase timetables insert notice:', ttErr);
      }
    }

    return {
      success: true,
      message: `🟢 Successfully synced "${cleanName}" and timetable (${timetableRows.length} slots) to live Supabase DB!`
    };
  } catch (err: any) {
    console.error('Supabase sync error:', err);
    return {
      success: false,
      message: `Sync warning: ${err.message || 'Error communicating with Supabase'}`
    };
  }
}

/**
 * Live Fetch: Fetch Teachers & Timetables from Supabase DB on app mount
 */
export async function fetchTeachersAndTimetablesFromSupabase(): Promise<TeacherTimetableRecord[] | null> {
  if (!supabase) return null;

  try {
    // Fetch all timetables
    const { data: ttData, error: ttErr } = await supabase.from('timetables').select('*');
    if (ttErr || !ttData) {
      console.warn('Could not fetch timetables from Supabase:', ttErr);
      return null;
    }

    if (ttData.length === 0) return null;

    // Group by teacher_name
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
 * Live Sync Student to Supabase
 */
export async function syncStudentToSupabase(student: {
  admissionNo: string;
  fullName: string;
  className: string;
  section: string;
  rollNo?: number;
  fatherName?: string;
  phone?: string;
}): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

  try {
    const { error } = await supabase.from('students').upsert(
      [
        {
          admission_no: student.admissionNo,
          full_name: student.fullName.toUpperCase(),
          class_name: student.className,
          section: student.section,
          roll_no: student.rollNo || 1,
          father_name: student.fatherName || '',
          contact_phone: student.phone || '',
          status: 'Active'
        }
      ],
      { onConflict: 'admission_no' }
    );

    if (error) throw error;
    return { success: true, message: `Synced student ${student.fullName} to Supabase!` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
