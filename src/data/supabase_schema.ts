export const SUPABASE_FULL_SQL_SCHEMA = `-- ====================================================================
-- SCHOOL ERP AUTOMATED SUPABASE DATABASE SCHEMA & DATA INITIALIZATION
-- Generates all Web ERP tables dynamically (SIS, Exam, Timetable, Staff, Fees, etc.)
-- Direct Copy-Paste into Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STUDENTS TABLE (Student Information System / SIS)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
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

-- 3. STAFF & TEACHERS TABLE
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TIMETABLE MASTER TABLE
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

-- 5. EXAMINATIONS & MARKS TABLES
CREATE TABLE IF NOT EXISTS public.examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_name VARCHAR(100) NOT NULL, -- Term 1, Midterm, Annual
    academic_year VARCHAR(20) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    max_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 33,
    exam_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID REFERENCES public.examinations(id) ON DELETE CASCADE,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DAILY ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_date DATE NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- Present, Absent, Late, Leave
    marked_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FEES & COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.fee_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    fee_head VARCHAR(100) NOT NULL, -- Tuition Fee, Transport, Exam Fee
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL, -- Cash, UPI, Card, NetBanking
    transaction_ref VARCHAR(100),
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ADMISSION & PROSPECTIVE LEADS TABLE
CREATE TABLE IF NOT EXISTS public.admission_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_no VARCHAR(50) UNIQUE NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    class_seeking VARCHAR(20) NOT NULL,
    lead_source VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Inquiry Received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TRANSPORT & BUS ROUTES TABLE
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

-- 10. LIBRARY CATALOG TABLE
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

-- 11. LEAVE APPLICATIONS TABLE
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

-- 12. EXIT INTERVIEWS & HR EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS public.exit_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'Exit Interview', -- Exit Interview, Hiring Interview
    interview_date DATE DEFAULT CURRENT_DATE,
    interviewer_name VARCHAR(150),
    feedback_notes TEXT,
    rating VARCHAR(20) DEFAULT 'Recommended',
    status VARCHAR(30) DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. INVENTORY & ASSETS TABLE
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

-- 14. HOSTEL MANAGEMENT TABLE
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

-- 15. VISITOR PASSES TABLE
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

-- Enable Row Level Security (RLS) & Grant Public Read/Write for ERP App
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to students" ON public.students;
DROP POLICY IF EXISTS "Allow public full access to staff" ON public.staff;
DROP POLICY IF EXISTS "Allow public full access to timetables" ON public.timetables;
DROP POLICY IF EXISTS "Allow public full access to examinations" ON public.examinations;
DROP POLICY IF EXISTS "Allow public full access to student_marks" ON public.student_marks;
DROP POLICY IF EXISTS "Allow public full access to daily_attendance" ON public.daily_attendance;
DROP POLICY IF EXISTS "Allow public full access to fee_collections" ON public.fee_collections;
DROP POLICY IF EXISTS "Allow public full access to admission_leads" ON public.admission_leads;
DROP POLICY IF EXISTS "Allow public full access to transport_routes" ON public.transport_routes;
DROP POLICY IF EXISTS "Allow public full access to library_books" ON public.library_books;
DROP POLICY IF EXISTS "Allow public full access to leave_applications" ON public.leave_applications;
DROP POLICY IF EXISTS "Allow public full access to exit_interviews" ON public.exit_interviews;
DROP POLICY IF EXISTS "Allow public full access to inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow public full access to hostel_rooms" ON public.hostel_rooms;
DROP POLICY IF EXISTS "Allow public full access to visitor_passes" ON public.visitor_passes;

CREATE POLICY "Allow public full access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to timetables" ON public.timetables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to examinations" ON public.examinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to student_marks" ON public.student_marks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to daily_attendance" ON public.daily_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to fee_collections" ON public.fee_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to admission_leads" ON public.admission_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to transport_routes" ON public.transport_routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to library_books" ON public.library_books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to leave_applications" ON public.leave_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to exit_interviews" ON public.exit_interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to hostel_rooms" ON public.hostel_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to visitor_passes" ON public.visitor_passes FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- PRE-SEEDED INITIAL DATA FOR ALL WEB ERP SECTIONS
-- ====================================================================

-- Seed Students
INSERT INTO public.students (admission_no, full_name, class_name, section, roll_no, father_name, contact_phone)
VALUES 
('ADM-2026-001', 'AARAV SHARMA', '10', 'A', 1, 'RAJESH SHARMA', '9876543210'),
('ADM-2026-002', 'ANANYA VERMA', '10', 'A', 2, 'SURESH VERMA', '9876543211'),
('ADM-2026-003', 'ROHAN GUPTA', '12', 'A', 1, 'ALOK GUPTA', '9876543212')
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
`;
