export const SUPABASE_FULL_SQL_SCHEMA = `-- ====================================================================
-- SCHOOL ERP UNIFIED AUTOMATED SUPABASE DATABASE SCHEMA & INITIALIZATION
-- Defines all necessary tables for Web ERP (Classes, Students, Teachers/Staff,
-- Examinations, Marks, Attendance, Fees, Admission Leads, Lesson Plans,
-- Substitution Logs, Round Duties, Audit Logs, and configuration masters).
-- Direct Copy-Paste into Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLASSES & SECTIONS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name VARCHAR(50) UNIQUE NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    room_no VARCHAR(20),
    class_teacher VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STUDENTS TABLE (Student Information System / SIS)
-- Foreign Key relationship linking students to classes(class_name)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    roll_no INT,
    gender VARCHAR(10),
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    contact_phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    category VARCHAR(20) DEFAULT 'General',
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAFF & TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    email VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'Active',
    class_teacher_of VARCHAR(100),
    assigned_classes TEXT,
    assigned_subjects TEXT,
    assigned_allocations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TIMETABLE MASTER TABLE
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, -- Monday..Saturday
    period_number INT NOT NULL,      -- 0 to 8
    class_and_section VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100),
    room_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EXAMINATIONS & MARKS TABLES
-- Foreign Key relationship linking examinations to marks, and students to marks
CREATE TABLE IF NOT EXISTS public.examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name VARCHAR(100) NOT NULL, -- Term 1, Midterm, Annual, Unit Test
    academic_year VARCHAR(20) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    max_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 33,
    exam_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_marks (
    id VARCHAR(100) PRIMARY KEY,
    examination_id UUID REFERENCES public.examinations(id) ON DELETE CASCADE,
    student_admission_no VARCHAR(50) NOT NULL REFERENCES public.students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DAILY ATTENDANCE TABLE
-- Foreign Key relationship linking daily_attendance to students
CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_date DATE NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL REFERENCES public.students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late, Leave
    marked_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FEES & COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_name VARCHAR(50) UNIQUE NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 1500.00,
    admission_fee DECIMAL(10, 2) DEFAULT 25000.00,
    tuition_fee_annual DECIMAL(10, 2) DEFAULT 72000.00,
    tuition_fee_monthly DECIMAL(10, 2) DEFAULT 6000.00,
    tuition_fee_quarterly DECIMAL(10, 2) DEFAULT 18000.00,
    transport_fee DECIMAL(10, 2) DEFAULT 4500.00,
    lab_fee DECIMAL(10, 2) DEFAULT 3000.00,
    commitment_fee DECIMAL(10, 2) DEFAULT 5000.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL REFERENCES public.students(admission_no) ON UPDATE CASCADE ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    fee_head VARCHAR(100) NOT NULL, -- Tuition Fee, Transport, Exam Fee
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL, -- Cash, UPI, Card, NetBanking
    transaction_ref VARCHAR(100),
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ADMISSION & PROSPECTIVE LEADS TABLE
CREATE TABLE IF NOT EXISTS public.admission_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_no VARCHAR(50) UNIQUE NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    class_seeking VARCHAR(50) NOT NULL,
    lead_source VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Inquiry Received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9B. ADMISSION FEE SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.admission_fee_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_no VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 1500.00,
    admission_fee DECIMAL(10, 2) DEFAULT 25000.00,
    tuition_fee DECIMAL(10, 2) DEFAULT 18000.00,
    transport_fee DECIMAL(10, 2) DEFAULT 4500.00,
    commitment_fee DECIMAL(10, 2) DEFAULT 5000.00,
    lab_fee DECIMAL(10, 2) DEFAULT 3000.00,
    total_fee DECIMAL(10, 2) DEFAULT 57000.00,
    fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TRANSPORT & BUS ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(30) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    total_capacity INT DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. LIBRARY CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accession_no VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    rack_no VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. LEAVE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_name VARCHAR(150) NOT NULL,
    applicant_type VARCHAR(20) DEFAULT 'Staff', -- Staff, Student
    leave_type VARCHAR(50) NOT NULL, -- Casual, Sick, Earned, Duty
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
    approved_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. EXIT INTERVIEWS & HR EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.exit_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'Exit Interview',
    interview_date DATE DEFAULT CURRENT_DATE,
    interviewer_name VARCHAR(150),
    feedback_notes TEXT,
    rating VARCHAR(20) DEFAULT 'Recommended',
    status VARCHAR(30) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. INVENTORY & ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_quantity INT DEFAULT 1,
    available_quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) DEFAULT 0.00,
    storage_location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'In Stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. HOSTEL MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS public.hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(30) UNIQUE NOT NULL,
    block_name VARCHAR(50) NOT NULL, -- Boys Hostel, Girls Hostel
    room_type VARCHAR(30) NOT NULL, -- Single, Double, Triple
    total_beds INT DEFAULT 2,
    occupied_beds INT DEFAULT 0,
    monthly_rent DECIMAL(10, 2) DEFAULT 5000.00,
    status VARCHAR(20) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. VISITOR PASSES TABLE
CREATE TABLE IF NOT EXISTS public.visitor_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pass_number VARCHAR(50) UNIQUE NOT NULL,
    visitor_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    person_to_meet VARCHAR(150) NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'Checked In',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. EXAM TIMETABLE / DATESHEET SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.exam_timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    room_number VARCHAR(30),
    max_marks INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. SUBJECT CONFIGURATIONS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.subject_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) DEFAULT 'General',
    passing_marks INT DEFAULT 33,
    has_theory BOOLEAN DEFAULT true,
    theory_max_marks INT DEFAULT 80,
    has_practical BOOLEAN DEFAULT false,
    practical_max_marks INT DEFAULT 0,
    has_internal BOOLEAN DEFAULT true,
    internal_max_marks INT DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. STUDENT ACADEMIC EXAM PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.student_academic_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    half_yearly_granted BOOLEAN DEFAULT true,
    annual_granted BOOLEAN DEFAULT true,
    unit_test_granted BOOLEAN DEFAULT true,
    report_card_active BOOLEAN DEFAULT true,
    granted_by VARCHAR(100) DEFAULT 'Admission Panel',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. LESSON PLANS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id VARCHAR(100) PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(150) NOT NULL,
    teacher_role VARCHAR(100),
    teacher_group VARCHAR(20) DEFAULT 'Senior',
    topic TEXT NOT NULL,
    target_week VARCHAR(100),
    target_completion_date DATE,
    status VARCHAR(50) NOT NULL,
    periods_required INT DEFAULT 1,
    periods_completed INT DEFAULT 0,
    last_updated_by VARCHAR(150),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT
);

-- 21. LESSON ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_alerts (
    id VARCHAR(100) PRIMARY KEY,
    lesson_plan_id VARCHAR(100),
    teacher_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    sender VARCHAR(50) DEFAULT 'Principal',
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. TEACHER SUBSTITUTIONS & LOGS TABLE (Yearly Substitution Tracking)
CREATE TABLE IF NOT EXISTS public.teacher_substitutions (
    id VARCHAR(100) PRIMARY KEY,
    sub_date DATE NOT NULL,
    period_number INT NOT NULL,
    time_slot VARCHAR(50),
    class_section VARCHAR(50) NOT NULL,
    subject VARCHAR(100),
    absent_teacher_name VARCHAR(150) NOT NULL,
    substitute_teacher_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'Arranged',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. ROUND DUTIES TABLE
CREATE TABLE IF NOT EXISTS public.round_duties (
    id VARCHAR(100) PRIMARY KEY,
    period_number INT NOT NULL,
    time_slot VARCHAR(50),
    teacher_name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'Assigned',
    is_fixed BOOLEAN DEFAULT false,
    check_in_time VARCHAR(30),
    check_in_method VARCHAR(30),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. AUDIT LOGS TABLE (Activity Tracking: who edited what and when)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_name VARCHAR(150),
    user_role VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, UPSERT, READ
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    details TEXT,
    status VARCHAR(30) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- NEW ERP SYSTEM EXPANSION TABLES (14 ADVANCED SUBSYSTEM TABLES)
-- ====================================================================

-- 25. TIMETABLE PERMISSION REQUESTS TABLE (Teacher Request & Admin Lock/Unlock Workflow)
CREATE TABLE IF NOT EXISTS public.timetable_permission_requests (
    id VARCHAR(100) PRIMARY KEY,
    teacher_name VARCHAR(150) NOT NULL,
    teacher_id VARCHAR(100),
    department VARCHAR(100),
    request_reason TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'REQUEST_PENDING', -- REQUEST_PENDING, EDIT_GRANTED, REJECTED, LOCKED
    allowed_until TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(150),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- 26. BROADCAST NOTICES & COMMUNICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.broadcast_notices (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'All', -- All, Teachers, Students, Parents
    channel VARCHAR(30) DEFAULT 'App Notice', -- App Notice, SMS, Email, WhatsApp
    author_name VARCHAR(150),
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 27. GPS VEHICLE & STAFF PATROL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.gps_tracking_logs (
    id VARCHAR(100) PRIMARY KEY,
    tracking_type VARCHAR(50) NOT NULL, -- BUS_ROUTE, ROUND_DUTY_PATROL, CAMPUS_CHECKPOINT
    entity_id VARCHAR(100) NOT NULL, -- Bus Number or Teacher ID
    entity_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed_kmh DECIMAL(5, 2) DEFAULT 0.0,
    checkpoint_name VARCHAR(150),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 28. STAFF PAYROLL & SALARY DISBURSEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payroll_disbursements (
    id VARCHAR(100) PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    month_year VARCHAR(20) NOT NULL, -- e.g. 2026-03
    basic_salary DECIMAL(10, 2) NOT NULL,
    allowances DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Paid', -- Paid, Pending, On Hold
    payment_mode VARCHAR(30) DEFAULT 'Bank Transfer',
    transaction_ref VARCHAR(100),
    disbursed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 29. GENERAL LEDGER & SCHOOL ACCOUNTING TABLE
CREATE TABLE IF NOT EXISTS public.accounting_ledger (
    id VARCHAR(100) PRIMARY KEY,
    entry_date DATE DEFAULT CURRENT_DATE,
    account_type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE, ASSET, LIABILITY
    category VARCHAR(100) NOT NULL, -- Fees, Maintenance, Salaries, Utilities
    description TEXT NOT NULL,
    debit_amount DECIMAL(12, 2) DEFAULT 0.00,
    credit_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer',
    receipt_voucher_no VARCHAR(100),
    recorded_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 30. STUDENT HEALTH & MEDICAL CLINIC RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.student_health_records (
    id VARCHAR(100) PRIMARY KEY,
    admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10),
    height_cm DECIMAL(5, 2),
    weight_kg DECIMAL(5, 2),
    allergies TEXT,
    medical_conditions TEXT,
    checkup_date DATE DEFAULT CURRENT_DATE,
    doctor_notes TEXT,
    emergency_action_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 31. HOSTEL OCCUPANCY & BED ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.hostel_allocations (
    id VARCHAR(100) PRIMARY KEY,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    block_name VARCHAR(50) NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    allocation_date DATE DEFAULT CURRENT_DATE,
    monthly_fee DECIMAL(10, 2) DEFAULT 5000.00,
    warden_name VARCHAR(150),
    status VARCHAR(30) DEFAULT 'Occupied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 32. DISCIPLINARY & STUDENT CONDUCT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.disciplinary_logs (
    id VARCHAR(100) PRIMARY KEY,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    incident_date DATE DEFAULT CURRENT_DATE,
    incident_category VARCHAR(100) NOT NULL, -- Punctuality, Uniform, Conduct, Misbehavior
    severity_level VARCHAR(30) DEFAULT 'Low', -- Low, Medium, High, Critical
    description TEXT NOT NULL,
    action_taken TEXT,
    reported_by VARCHAR(150) NOT NULL,
    parent_notified BOOLEAN DEFAULT false,
    status VARCHAR(30) DEFAULT 'Resolved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 33. ALUMNI DIRECTORY & GRADUATION REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.alumni_registry (
    id VARCHAR(100) PRIMARY KEY,
    admission_no VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    graduation_year INT NOT NULL,
    final_class VARCHAR(50) DEFAULT 'Class 12',
    current_profession VARCHAR(150),
    current_organization VARCHAR(150),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 34. CERTIFICATE ISSUANCE & VERIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.certificate_issuances (
    id VARCHAR(100) PRIMARY KEY,
    certificate_no VARCHAR(100) UNIQUE NOT NULL,
    certificate_type VARCHAR(100) NOT NULL, -- Transfer Certificate, Bonafide, Character, Merit
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    reason_for_issue TEXT,
    issued_by VARCHAR(150),
    verification_code VARCHAR(100) UNIQUE,
    status VARCHAR(30) DEFAULT 'Issued',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 35. ID CARD PRINT QUEUE & RFID ENROLLMENT TABLE
CREATE TABLE IF NOT EXISTS public.idcard_print_queue (
    id VARCHAR(100) PRIMARY KEY,
    card_type VARCHAR(50) NOT NULL, -- STUDENT, STAFF, VISITOR
    holder_id VARCHAR(50) NOT NULL,
    holder_name VARCHAR(150) NOT NULL,
    class_or_dept VARCHAR(100) NOT NULL,
    rfid_tag_no VARCHAR(100),
    photo_url TEXT,
    print_status VARCHAR(30) DEFAULT 'Printed', -- Queued, Printed, Dispatched
    batch_no VARCHAR(50),
    printed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 36. LIBRARY TRANSACTIONS & BOOK ISSUE/RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.library_transactions (
    id VARCHAR(100) PRIMARY KEY,
    accession_no VARCHAR(50) NOT NULL,
    book_title VARCHAR(200) NOT NULL,
    borrower_type VARCHAR(30) DEFAULT 'Student', -- Student, Staff
    borrower_id VARCHAR(50) NOT NULL,
    borrower_name VARCHAR(150) NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(8, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Issued', -- Issued, Returned, Overdue, Lost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 37. PARENT-TEACHER MEETING & OBSERVATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ptm_meetings (
    id VARCHAR(100) PRIMARY KEY,
    meeting_date DATE DEFAULT CURRENT_DATE,
    class_name VARCHAR(50) NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    parent_name VARCHAR(150),
    teacher_name VARCHAR(150) NOT NULL,
    discussion_points TEXT,
    parent_feedback TEXT,
    action_items TEXT,
    attendance_status VARCHAR(30) DEFAULT 'Attended',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 38. ADMISSION ENTRANCE EXAM & INTERVIEW RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.admission_test_results (
    id VARCHAR(100) PRIMARY KEY,
    application_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_seeking VARCHAR(50) NOT NULL,
    test_date DATE DEFAULT CURRENT_DATE,
    written_test_score DECIMAL(5, 2) DEFAULT 0.00,
    interview_score DECIMAL(5, 2) DEFAULT 0.00,
    total_score DECIMAL(5, 2) DEFAULT 0.00,
    evaluator_name VARCHAR(150),
    recommendation VARCHAR(50) DEFAULT 'Approved for Admission', -- Approved, Waitlisted, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Grant Public Read/Write for ERP App safely
DO $$ 
BEGIN
    -- Classes
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'classes') THEN
        ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to classes" ON public.classes;
        CREATE POLICY "Allow public full access to classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Students
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students') THEN
        ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to students" ON public.students;
        CREATE POLICY "Allow public full access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Staff
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff') THEN
        ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to staff" ON public.staff;
        CREATE POLICY "Allow public full access to staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Timetables
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'timetables') THEN
        ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to timetables" ON public.timetables;
        CREATE POLICY "Allow public full access to timetables" ON public.timetables FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Examinations
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'examinations') THEN
        ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to examinations" ON public.examinations;
        CREATE POLICY "Allow public full access to examinations" ON public.examinations FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Student Marks
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_marks') THEN
        ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to student_marks" ON public.student_marks;
        CREATE POLICY "Allow public full access to student_marks" ON public.student_marks FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Daily Attendance
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_attendance') THEN
        ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to daily_attendance" ON public.daily_attendance;
        CREATE POLICY "Allow public full access to daily_attendance" ON public.daily_attendance FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Fee Structures
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fee_structures') THEN
        ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to fee_structures" ON public.fee_structures;
        CREATE POLICY "Allow public full access to fee_structures" ON public.fee_structures FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Fee Collections
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fee_collections') THEN
        ALTER TABLE public.fee_collections ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to fee_collections" ON public.fee_collections;
        CREATE POLICY "Allow public full access to fee_collections" ON public.fee_collections FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Admission Leads
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admission_leads') THEN
        ALTER TABLE public.admission_leads ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to admission_leads" ON public.admission_leads;
        CREATE POLICY "Allow public full access to admission_leads" ON public.admission_leads FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Admission Fee Schedules
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admission_fee_schedules') THEN
        ALTER TABLE public.admission_fee_schedules ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to admission_fee_schedules" ON public.admission_fee_schedules;
        CREATE POLICY "Allow public full access to admission_fee_schedules" ON public.admission_fee_schedules FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Transport Routes
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transport_routes') THEN
        ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to transport_routes" ON public.transport_routes;
        CREATE POLICY "Allow public full access to transport_routes" ON public.transport_routes FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Library Books
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'library_books') THEN
        ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to library_books" ON public.library_books;
        CREATE POLICY "Allow public full access to library_books" ON public.library_books FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Leave Applications
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leave_applications') THEN
        ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to leave_applications" ON public.leave_applications;
        CREATE POLICY "Allow public full access to leave_applications" ON public.leave_applications FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Exit Interviews
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exit_interviews') THEN
        ALTER TABLE public.exit_interviews ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to exit_interviews" ON public.exit_interviews;
        CREATE POLICY "Allow public full access to exit_interviews" ON public.exit_interviews FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Inventory Items
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_items') THEN
        ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to inventory_items" ON public.inventory_items;
        CREATE POLICY "Allow public full access to inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Hostel Rooms
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hostel_rooms') THEN
        ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to hostel_rooms" ON public.hostel_rooms;
        CREATE POLICY "Allow public full access to hostel_rooms" ON public.hostel_rooms FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Visitor Passes
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visitor_passes') THEN
        ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to visitor_passes" ON public.visitor_passes;
        CREATE POLICY "Allow public full access to visitor_passes" ON public.visitor_passes FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Exam Timetables
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exam_timetables') THEN
        ALTER TABLE public.exam_timetables ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to exam_timetables" ON public.exam_timetables;
        CREATE POLICY "Allow public full access to exam_timetables" ON public.exam_timetables FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Subject Configs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subject_configs') THEN
        ALTER TABLE public.subject_configs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to subject_configs" ON public.subject_configs;
        CREATE POLICY "Allow public full access to subject_configs" ON public.subject_configs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Student Academic Permissions
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_academic_permissions') THEN
        ALTER TABLE public.student_academic_permissions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to student_academic_permissions" ON public.student_academic_permissions;
        CREATE POLICY "Allow public full access to student_academic_permissions" ON public.student_academic_permissions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Lesson Plans
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lesson_plans') THEN
        ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to lesson_plans" ON public.lesson_plans;
        CREATE POLICY "Allow public full access to lesson_plans" ON public.lesson_plans FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Lesson Alerts
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lesson_alerts') THEN
        ALTER TABLE public.lesson_alerts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to lesson_alerts" ON public.lesson_alerts;
        CREATE POLICY "Allow public full access to lesson_alerts" ON public.lesson_alerts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Teacher Substitutions
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teacher_substitutions') THEN
        ALTER TABLE public.teacher_substitutions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to teacher_substitutions" ON public.teacher_substitutions;
        CREATE POLICY "Allow public full access to teacher_substitutions" ON public.teacher_substitutions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Round Duties
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'round_duties') THEN
        ALTER TABLE public.round_duties ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to round_duties" ON public.round_duties;
        CREATE POLICY "Allow public full access to round_duties" ON public.round_duties FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Audit Logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to audit_logs" ON public.audit_logs;
        CREATE POLICY "Allow public full access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Timetable Permission Requests
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'timetable_permission_requests') THEN
        ALTER TABLE public.timetable_permission_requests ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to timetable_permission_requests" ON public.timetable_permission_requests;
        CREATE POLICY "Allow public full access to timetable_permission_requests" ON public.timetable_permission_requests FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Broadcast Notices
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'broadcast_notices') THEN
        ALTER TABLE public.broadcast_notices ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to broadcast_notices" ON public.broadcast_notices;
        CREATE POLICY "Allow public full access to broadcast_notices" ON public.broadcast_notices FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- GPS Tracking Logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gps_tracking_logs') THEN
        ALTER TABLE public.gps_tracking_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to gps_tracking_logs" ON public.gps_tracking_logs;
        CREATE POLICY "Allow public full access to gps_tracking_logs" ON public.gps_tracking_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Payroll Disbursements
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payroll_disbursements') THEN
        ALTER TABLE public.payroll_disbursements ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to payroll_disbursements" ON public.payroll_disbursements;
        CREATE POLICY "Allow public full access to payroll_disbursements" ON public.payroll_disbursements FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Accounting Ledger
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accounting_ledger') THEN
        ALTER TABLE public.accounting_ledger ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to accounting_ledger" ON public.accounting_ledger;
        CREATE POLICY "Allow public full access to accounting_ledger" ON public.accounting_ledger FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Student Health Records
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_health_records') THEN
        ALTER TABLE public.student_health_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to student_health_records" ON public.student_health_records;
        CREATE POLICY "Allow public full access to student_health_records" ON public.student_health_records FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Hostel Allocations
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hostel_allocations') THEN
        ALTER TABLE public.hostel_allocations ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to hostel_allocations" ON public.hostel_allocations;
        CREATE POLICY "Allow public full access to hostel_allocations" ON public.hostel_allocations FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Disciplinary Logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disciplinary_logs') THEN
        ALTER TABLE public.disciplinary_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to disciplinary_logs" ON public.disciplinary_logs;
        CREATE POLICY "Allow public full access to disciplinary_logs" ON public.disciplinary_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Alumni Registry
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'alumni_registry') THEN
        ALTER TABLE public.alumni_registry ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to alumni_registry" ON public.alumni_registry;
        CREATE POLICY "Allow public full access to alumni_registry" ON public.alumni_registry FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Certificate Issuances
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificate_issuances') THEN
        ALTER TABLE public.certificate_issuances ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to certificate_issuances" ON public.certificate_issuances;
        CREATE POLICY "Allow public full access to certificate_issuances" ON public.certificate_issuances FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- ID Card Print Queue
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'idcard_print_queue') THEN
        ALTER TABLE public.idcard_print_queue ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to idcard_print_queue" ON public.idcard_print_queue;
        CREATE POLICY "Allow public full access to idcard_print_queue" ON public.idcard_print_queue FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Library Transactions
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'library_transactions') THEN
        ALTER TABLE public.library_transactions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to library_transactions" ON public.library_transactions;
        CREATE POLICY "Allow public full access to library_transactions" ON public.library_transactions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- PTM Meetings
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ptm_meetings') THEN
        ALTER TABLE public.ptm_meetings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to ptm_meetings" ON public.ptm_meetings;
        CREATE POLICY "Allow public full access to ptm_meetings" ON public.ptm_meetings FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Admission Test Results
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admission_test_results') THEN
        ALTER TABLE public.admission_test_results ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow public full access to admission_test_results" ON public.admission_test_results;
        CREATE POLICY "Allow public full access to admission_test_results" ON public.admission_test_results FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ====================================================================
-- AUTO-MIGRATIONS FOR EXISTING TABLES (Safe execution on existing DBs)
-- ====================================================================
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS commitment_fee NUMERIC(10, 2) DEFAULT 5000.00;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS lab_fee NUMERIC(10, 2) DEFAULT 3000.00;

ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10, 2) DEFAULT 1500.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS admission_fee NUMERIC(10, 2) DEFAULT 25000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS tuition_fee NUMERIC(10, 2) DEFAULT 18000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS transport_fee NUMERIC(10, 2) DEFAULT 4500.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS commitment_fee NUMERIC(10, 2) DEFAULT 5000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS lab_fee NUMERIC(10, 2) DEFAULT 3000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS total_fee NUMERIC(10, 2) DEFAULT 57000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS fee_paid BOOLEAN DEFAULT false;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'Quarterly';
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Offered';

-- ====================================================================
-- PRE-SEEDED INITIAL DATA FOR ALL WEB ERP SECTIONS
-- ====================================================================

-- Seed Classes
INSERT INTO public.classes (class_name, section, room_no, class_teacher)
VALUES
('Class 10', 'A', '101', 'POONAM SINGH'),
('Class 11', 'A', '102', 'RAJAT JAIN'),
('Class 12', 'A', '103', 'SHRUTI CHAHAR')
ON CONFLICT (class_name) DO NOTHING;

-- Seed Fee Structures
INSERT INTO public.fee_structures (class_name, registration_fee, admission_fee, tuition_fee_annual, tuition_fee_monthly, tuition_fee_quarterly, transport_fee, lab_fee, commitment_fee)
VALUES
('Class 10', 1500.00, 25000.00, 72000.00, 6000.00, 18000.00, 4500.00, 3000.00, 5000.00),
('Class 11', 1800.00, 30000.00, 84000.00, 7000.00, 21000.00, 5000.00, 4000.00, 6000.00),
('Class 12', 2000.00, 35000.00, 96000.00, 8000.00, 24000.00, 5000.00, 5000.00, 6000.00)
ON CONFLICT (class_name) DO NOTHING;

-- Seed Admission Leads
INSERT INTO public.admission_leads (lead_no, applicant_name, parent_name, phone, class_seeking, lead_source, status)
VALUES
('APP-2026-101', 'VIKRAM SHARMA', 'Rajesh Sharma', '9876543210', 'Class 10', 'Website Inquiry', 'Offered'),
('APP-2026-102', 'PRIYA PATEL', 'Suresh Patel', '9876543211', 'Class 11', 'Walk-in', 'Interview Scheduled'),
('APP-2026-103', 'KABIR MEHTA', 'Alok Mehta', '9876543212', 'Class 12', 'Referral', 'Registration Fee Paid')
ON CONFLICT (lead_no) DO NOTHING;

-- Seed Admission Fee Schedules
INSERT INTO public.admission_fee_schedules (application_no, student_name, class_name, registration_fee, admission_fee, tuition_fee, transport_fee, commitment_fee, lab_fee, total_fee, fee_paid)
VALUES
('APP-2026-101', 'VIKRAM SHARMA', 'Class 10', 1500.00, 25000.00, 18000.00, 4500.00, 5000.00, 3000.00, 57000.00, true),
('APP-2026-102', 'PRIYA PATEL', 'Class 11', 1800.00, 30000.00, 21000.00, 5000.00, 6000.00, 4000.00, 67800.00, false),
('APP-2026-103', 'KABIR MEHTA', 'Class 12', 2000.00, 35000.00, 24000.00, 5000.00, 6000.00, 5000.00, 77000.00, true)
ON CONFLICT (application_no) DO NOTHING;

-- Seed Students
INSERT INTO public.students (admission_no, full_name, class_name, section, roll_no, father_name, contact_phone)
VALUES 
('ADM-2026-001', 'AARAV SHARMA', 'Class 10', 'A', 1, 'RAJESH SHARMA', '9876543210'),
('ADM-2026-002', 'ANANYA VERMA', 'Class 10', 'A', 2, 'SURESH VERMA', '9876543211'),
('ADM-2026-003', 'ROHAN GUPTA', 'Class 12', 'A', 1, 'ALOK GUPTA', '9876543212')
ON CONFLICT (admission_no) DO NOTHING;

-- Seed Staff
INSERT INTO public.staff (employee_code, full_name, department, designation, contact_phone)
VALUES
('EMP-101', 'POONAM SINGH', 'Senior Secondary', 'PGT Physics', '9988776655'),
('EMP-102', 'RAJAT JAIN', 'Science Dept', 'TGT Science', '9988776656'),
('EMP-103', 'SHRUTI CHAHAR', 'English Dept', 'PGT English', '9988776657'),
('EMP-104', 'NAND KISHORE SHARMA', 'Sanskrit & Hindi', 'PGT Hindi', '9988776658'),
('EMP-105', 'DHARMESH TIWARI', 'Mathematics Dept', 'PGT Maths', '9988776659')
ON CONFLICT (employee_code) DO NOTHING;

-- Seed Fee Collections
INSERT INTO public.fee_collections (receipt_no, student_admission_no, student_name, class_name, fee_head, amount_paid, payment_mode, transaction_ref)
VALUES
('REC-2026-001', 'ADM-2026-001', 'AARAV SHARMA', 'Class 10', 'Tuition Fee Q1', 18000.00, 'UPI', 'TXN9081231'),
('REC-2026-002', 'ADM-2026-002', 'ANANYA VERMA', 'Class 10', 'Admission & Reg Fee', 26500.00, 'Cash', 'CASH-REF-101')
ON CONFLICT (receipt_no) DO NOTHING;

-- Seed Transport
INSERT INTO public.transport_routes (route_name, bus_number, driver_name, driver_phone, monthly_fee)
VALUES
('Route 1 - City Center to Campus', 'UP-16-AB-1234', 'Ramesh Kumar', '9123456789', 2500.00),
('Route 2 - Model Town to Campus', 'UP-16-AB-5678', 'Suresh Singh', '9123456790', 2800.00)
ON CONFLICT DO NOTHING;

-- Seed Library
INSERT INTO public.library_books (accession_no, title, author, category, total_copies, available_copies)
VALUES
('LIB-1001', 'Concepts of Physics Vol 1', 'H.C. Verma', 'Physics', 10, 8),
('LIB-1002', 'Mathematics for Class X', 'R.D. Sharma', 'Mathematics', 15, 12)
ON CONFLICT (accession_no) DO NOTHING;

-- Safe migrations for pre-existing tables
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS lab_fee DECIMAL(10, 2) DEFAULT 3000.00;
ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS commitment_fee DECIMAL(10, 2) DEFAULT 5000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS lab_fee DECIMAL(10, 2) DEFAULT 3000.00;
ALTER TABLE public.admission_fee_schedules ADD COLUMN IF NOT EXISTS commitment_fee DECIMAL(10, 2) DEFAULT 5000.00;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS class_teacher_of VARCHAR(100);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS assigned_classes TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS assigned_subjects TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS assigned_allocations TEXT;
`;
