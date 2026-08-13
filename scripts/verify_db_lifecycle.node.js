const SUPABASE_URL = 'https://sxsuebbwgeqkqyxfqvnt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4c3VlYmJ3Z2Vxa3F5eGZxdm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDIyOTQsImV4cCI6MjEwMTY3ODI5NH0.chVdylAVAhZ11qv5N1U-waU81Z1Vt0WBlrYLeWV1j64';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function logStep(stage, message, success = true, meta = null) {
  const symbol = success ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${symbol} [${stage}] ${message}`);
  if (meta) {
    console.log(`   └─ Meta: ${JSON.stringify(meta)}`);
  }
}

async function runFullLifecycleAudit() {
  console.log('=============== SCHOOL ERP DATABASE FULL LIFECYCLE VERIFICATION ===============');
  console.log(`Target Supabase Host: ${SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const timestamp = Date.now();
  let overallSuccess = true;

  // ==========================================
  // 1. STUDENT FULL LIFECYCLE (C - R - U - D)
  // ==========================================
  console.log('--- 1. STUDENT RECORD LIFECYCLE TEST ---');
  const studentAdmissionNo = `VERIFY-ADM-${timestamp}`;
  let studentDbId = null;

  // A. CREATE STUDENT
  try {
    const createBody = {
      admission_no: studentAdmissionNo,
      full_name: 'Aarav Dev Sharma',
      class_name: 'Class 10',
      section: 'A',
      roll_no: 101,
      gender: 'Male',
      father_name: 'Ramesh Sharma',
      mother_name: 'Sunita Sharma',
      contact_phone: '+919876543210',
      category: 'General',
      status: 'Active'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createBody)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    studentDbId = data[0]?.id;
    await logStep('STUDENT CREATE', `Successfully created student "${createBody.full_name}" with Admission No #${studentAdmissionNo}`, true, { id: studentDbId });
  } catch (err) {
    overallSuccess = false;
    await logStep('STUDENT CREATE', `Failed to create student record: ${err.message}`, false);
  }

  // B. READ STUDENT
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?admission_no=eq.${studentAdmissionNo}`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.length === 1 && data[0].full_name === 'Aarav Dev Sharma') {
      await logStep('STUDENT READ', `Verified student record persistence in Supabase REST API`, true, { record: data[0] });
    } else {
      throw new Error(`Expected 1 record with name 'Aarav Dev Sharma', got ${data.length} records`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('STUDENT READ', `Failed to read student record: ${err.message}`, false);
  }

  // C. UPDATE STUDENT
  try {
    const updateBody = {
      full_name: 'Aarav Dev Sharma (Promoted)',
      class_name: 'Class 11',
      section: 'B'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?admission_no=eq.${studentAdmissionNo}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateBody)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data[0]?.class_name === 'Class 11' && data[0]?.full_name.includes('Promoted')) {
      await logStep('STUDENT UPDATE', `Updated student class to "Class 11" and name to "${data[0].full_name}"`, true, { updated: data[0] });
    } else {
      throw new Error(`Update verification failed. Output: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('STUDENT UPDATE', `Failed to update student record: ${err.message}`, false);
  }

  // D. DELETE STUDENT
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?admission_no=eq.${studentAdmissionNo}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    // Verify deletion
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/students?admission_no=eq.${studentAdmissionNo}`, { headers });
    const checkData = await checkRes.json();

    if (checkData.length === 0) {
      await logStep('STUDENT DELETE', `Successfully removed test student #${studentAdmissionNo} from database`, true);
    } else {
      throw new Error(`Record still exists after DELETE call`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('STUDENT DELETE', `Failed to delete student record: ${err.message}`, false);
  }

  console.log('\n--- 2. TEACHER / STAFF RECORD LIFECYCLE TEST ---');
  const staffEmpCode = `VERIFY-EMP-${timestamp}`;
  let staffDbId = null;

  // A. CREATE TEACHER
  try {
    const createBody = {
      employee_code: staffEmpCode,
      full_name: 'Dr. Vikramaditya Sen',
      department: 'Mathematics',
      designation: 'Senior HOD',
      contact_phone: '+919123456789',
      status: 'Active'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/staff`, {
      method: 'POST',
      headers,
      body: JSON.stringify(createBody)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    staffDbId = data[0]?.id;
    await logStep('TEACHER CREATE', `Successfully created teacher "${createBody.full_name}" with Emp Code #${staffEmpCode}`, true, { id: staffDbId });
  } catch (err) {
    overallSuccess = false;
    await logStep('TEACHER CREATE', `Failed to create teacher record: ${err.message}`, false);
  }

  // B. READ TEACHER
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/staff?employee_code=eq.${staffEmpCode}`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.length === 1 && data[0].full_name === 'Dr. Vikramaditya Sen') {
      await logStep('TEACHER READ', `Verified teacher record persistence in Supabase REST API`, true, { record: data[0] });
    } else {
      throw new Error(`Expected 1 record with name 'Dr. Vikramaditya Sen', got ${data.length} records`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('TEACHER READ', `Failed to read teacher record: ${err.message}`, false);
  }

  // C. UPDATE TEACHER
  try {
    const updateBody = {
      designation: 'Vice Principal & HOD Math',
      department: 'Academic Administration'
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/staff?employee_code=eq.${staffEmpCode}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateBody)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data[0]?.designation.includes('Vice Principal')) {
      await logStep('TEACHER UPDATE', `Updated designation to "${data[0].designation}" and department to "${data[0].department}"`, true, { updated: data[0] });
    } else {
      throw new Error(`Update verification failed. Output: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('TEACHER UPDATE', `Failed to update teacher record: ${err.message}`, false);
  }

  // D. DELETE TEACHER
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/staff?employee_code=eq.${staffEmpCode}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Verify deletion
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/staff?employee_code=eq.${staffEmpCode}`, { headers });
    const checkData = await checkRes.json();

    if (checkData.length === 0) {
      await logStep('TEACHER DELETE', `Successfully removed test teacher #${staffEmpCode} from database`, true);
    } else {
      throw new Error(`Record still exists after DELETE call`);
    }
  } catch (err) {
    overallSuccess = false;
    await logStep('TEACHER DELETE', `Failed to delete teacher record: ${err.message}`, false);
  }

  console.log('\n===================================================================');
  if (overallSuccess) {
    console.log('🎉 FULL DATABASE LIFECYCLE AUDIT PASSED: 100% SUCCESS ACROSS ALL CRUD STAGES!');
  } else {
    console.log('⚠️ DATABASE LIFECYCLE AUDIT ENCOUNTERED ERRORS.');
    process.exit(1);
  }
}

runFullLifecycleAudit();
