import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Printer,
  CheckCircle,
  Search,
  Database,
  Copy,
  Edit2,
  CreditCard,
  Sliders,
  Check,
  FileCode2
} from 'lucide-react';
import {
  useFeeStructureStore,
  ClassFeeStructure,
  PaymentModeType,
  PaymentFrequencyType
} from './feeStructureStore';
import { useSisStore } from '../sis/sisStore';

export const FeesModule: React.FC = () => {
  const {
    feeStructures,
    transactions,
    syncStatus,
    updateClassFeeStructure,
    addFeeTransaction
  } = useFeeStructureStore();

  const { students } = useSisStore();

  const [activeTab, setActiveTab] = useState<'transactions' | 'config' | 'sql'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Modal State for Fee Collection
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [classSection, setClassSection] = useState('Class 10-A');
  const [feeHead, setFeeHead] = useState('Tuition Fee');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequencyType>('Quarterly');
  const [paymentMode, setPaymentMode] = useState<PaymentModeType>('UPI');
  const [amountPaid, setAmountPaid] = useState<number>(18000);
  const [checkNumber, setCheckNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // Class Fee Edit State
  const [editingClass, setEditingClass] = useState<ClassFeeStructure | null>(null);

  // SQL Script Text
  const sqlScript = `-- =======================================================
-- SCHOOL ERP CUSTOMIZABLE FEE MANAGEMENT DATABASE SCHEMA
-- PostgreSQL / Supabase Compatible DDL & DML Commands
-- Copy & Paste into your Database Query Editor
-- =======================================================

-- 1. Create Table for Class-Wise Customizable Fee Structure
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name VARCHAR(50) UNIQUE NOT NULL,
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    admission_fee NUMERIC(10, 2) NOT NULL DEFAULT 25000.00,
    tuition_fee_annual NUMERIC(10, 2) NOT NULL DEFAULT 60000.00,
    tuition_fee_monthly NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    tuition_fee_quarterly NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
    transport_fee NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    lab_fee NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    commitment_fee NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Table for Fee Collections & Receipts
CREATE TABLE IF NOT EXISTS public.fee_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    student_admission_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    fee_head VARCHAR(100) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('Cash', 'Check', 'UPI', 'Online / NetBanking', 'Demand Draft')),
    payment_frequency VARCHAR(50) NOT NULL DEFAULT 'Monthly' CHECK (payment_frequency IN ('Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'One-time')),
    check_number VARCHAR(50),
    bank_name VARCHAR(100),
    check_date DATE,
    payment_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Bounced', 'Refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Table for Admission Fee Schedules & Linkages
CREATE TABLE IF NOT EXISTS public.admission_fee_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_no VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Quarterly',
    registration_fee NUMERIC(10, 2) DEFAULT 1500.00,
    admission_fee NUMERIC(10, 2) DEFAULT 25000.00,
    tuition_fee NUMERIC(10, 2) DEFAULT 18000.00,
    transport_fee NUMERIC(10, 2) DEFAULT 4500.00,
    commitment_fee NUMERIC(10, 2) DEFAULT 5000.00,
    lab_fee NUMERIC(10, 2) DEFAULT 3000.00,
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 57000.00,
    fee_paid BOOLEAN DEFAULT false,
    status VARCHAR(30) DEFAULT 'Offered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Safe Column Migrations for pre-existing tables
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

-- Index creation for optimized querying
CREATE INDEX IF NOT EXISTS idx_fee_collections_student ON public.fee_collections (student_admission_no);
CREATE INDEX IF NOT EXISTS idx_fee_collections_receipt ON public.fee_collections (receipt_no);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON public.fee_structures (class_name);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSelectStudent = (stdId: string) => {
    setSelectedStudentId(stdId);
    if (!stdId) return;
    const std = students.find((s) => s.id === stdId);
    if (std) {
      setStudentName(std.fullName);
      const cls = std.currentClass || 'Class 10';
      setClassSection(`${cls}-${std.section || 'A'}`);
      
      const fs = feeStructures.find((f) => f.className === cls) || feeStructures[0];
      recalculateFeeAmount(feeHead, paymentFrequency, fs);
    }
  };

  const recalculateFeeAmount = (head: string, freq: PaymentFrequencyType, fs: ClassFeeStructure) => {
    if (head.includes('Tuition')) {
      if (freq === 'Monthly') setAmountPaid(fs.tuitionFeeMonthly);
      else if (freq === 'Quarterly') setAmountPaid(fs.tuitionFeeQuarterly);
      else if (freq === 'Annual') setAmountPaid(fs.tuitionFeeAnnual);
      else setAmountPaid(fs.tuitionFeeQuarterly);
    } else if (head.includes('Transport')) {
      setAmountPaid(fs.transportFee);
    } else if (head.includes('Registration')) {
      setAmountPaid(fs.registrationFee);
    } else if (head.includes('Admission')) {
      setAmountPaid(fs.admissionFee);
    } else if (head.includes('Lab')) {
      setAmountPaid(fs.labFee);
    } else {
      setAmountPaid(fs.tuitionFeeQuarterly);
    }
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeeTransaction({
      studentId: selectedStudentId || 'std-manual',
      studentName,
      classSection,
      feeHead: `${feeHead} (${paymentFrequency})`,
      amountPaid: Number(amountPaid),
      paymentMode,
      paymentFrequency,
      checkNumber: paymentMode === 'Check' ? checkNumber : undefined,
      bankName: paymentMode === 'Check' ? bankName : undefined,
      checkDate: paymentMode === 'Check' ? checkDate : undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      remarks
    });

    setShowCollectModal(false);
    setCheckNumber('');
    setBankName('');
    setRemarks('');
  };

  const handleSaveClassEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    updateClassFeeStructure(editingClass);
    setEditingClass(null);
  };

  const filteredTransactions = transactions.filter((t) =>
    t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.classSection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.feeHead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Live Sync Banner */}
      {syncStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs rounded-xl shadow-xs animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Main Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
            Customizable Fee Engine & Ledger
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            School Fee Structure & Collection Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure class-wise tuition fees, registration/admission rates, transport fees, and record collections via Cash, Check, UPI, or Online.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCollectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Collect Fee & Issue Receipt
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fee Collections & Receipt Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Customizable Class Fee Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'sql'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database SQL Table Commands</span>
        </button>
      </div>

      {/* TAB 1: TRANSACTIONS & RECEIPTS */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Fee Collection Ledger
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search receipt, student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Fee Head & Mode</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Receipt Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.receiptNo}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{t.studentName}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{t.classSection}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{t.feeHead}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          t.paymentMode === 'Check' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          t.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {t.paymentMode}
                        </span>
                        {t.checkNumber && <span className="font-mono text-[10px]">No: {t.checkNumber} ({t.bankName})</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-bold">{t.paymentFrequency || 'Quarterly'}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">₹{t.amountPaid.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg cursor-pointer transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMIZABLE CLASS FEE RATES */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" /> Customizable Class-wise Fee Rate Structure
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modifying fee values here dynamically updates default amounts during Admission and Fee Collection.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Class Name</th>
                  <th className="py-3 px-4 text-center text-indigo-600">Registration Fee</th>
                  <th className="py-3 px-4 text-center text-purple-600">Admission Fee</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Tuition (Annual)</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Tuition (Monthly)</th>
                  <th className="py-3 px-4 text-center text-blue-600">Transport Fee</th>
                  <th className="py-3 px-4 text-center text-amber-600">Lab / Activity Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {feeStructures.map((fs) => (
                  <tr key={fs.className} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">{fs.className}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600">₹{fs.registrationFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-purple-600">₹{fs.admissionFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">₹{fs.tuitionFeeAnnual.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-emerald-700">₹{fs.tuitionFeeMonthly.toLocaleString()} / mo</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">₹{fs.transportFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">₹{fs.labFee.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingClass({ ...fs })}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Rates
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE TABLE CREATION & SQL COMMANDS */}
      {activeTab === 'sql' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" /> PostgreSQL / Supabase SQL Table Creation Commands
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy and run this SQL script in your PostgreSQL or Supabase SQL Editor to provision the exact fee tables.
              </p>
            </div>

            <button
              onClick={copySqlToClipboard}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition-all shrink-0"
            >
              {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy SQL Commands'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-96 shadow-inner border border-slate-800">
            <pre className="whitespace-pre">{sqlScript}</pre>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                <strong>Quick Tip:</strong> Paste these commands directly into your Supabase Dashboard under <code>SQL Editor</code> ➔ <code>New Query</code> to instantly initialize live fee tables.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COLLECT FEE MODAL */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Collect School Fee & Issue Receipt
              </h3>
              <button onClick={() => setShowCollectModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Select Registered Student (Optional)</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="">-- Choose From Student Roster or Type Below --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.currentClass || 'Class 10'}-{s.section || 'A'}) — Adm No: {s.admissionNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class & Section *</label>
                  <input
                    type="text"
                    required
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fee Head / Type *</label>
                  <select
                    value={feeHead}
                    onChange={(e) => {
                      setFeeHead(e.target.value);
                      const cls = classSection.split('-')[0].trim();
                      const fs = feeStructures.find((f) => f.className === cls) || feeStructures[0];
                      recalculateFeeAmount(e.target.value, paymentFrequency, fs);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Registration Fee">Registration Fee</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Transport Fee">Transport Fee</option>
                    <option value="Lab & Activity Fee">Lab & Activity Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Frequency *</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => {
                      const freq = e.target.value as PaymentFrequencyType;
                      setPaymentFrequency(freq);
                      const cls = classSection.split('-')[0].trim();
                      const fs = feeStructures.find((f) => f.className === cls) || feeStructures[0];
                      recalculateFeeAmount(feeHead, freq, fs);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mode of Payment *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentModeType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="Check">Check (Bank Cheque)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Online / NetBanking">Online / NetBanking</option>
                    <option value="Demand Draft">Demand Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-extrabold text-emerald-600"
                  />
                </div>
              </div>

              {/* Check Details Panel */}
              {paymentMode === 'Check' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                  <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200">Bank Cheque Details:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300">Cheque Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CHK-100293"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-amber-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300">Drawn Bank Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-amber-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Q1 Tuition Fee cleared"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLASS FEE STRUCTURE MODAL */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Customize Fee Rates for {editingClass.className}
              </h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClassEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Registration Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.registrationFee}
                    onChange={(e) => setEditingClass({ ...editingClass, registrationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Admission Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.admissionFee}
                    onChange={(e) => setEditingClass({ ...editingClass, admissionFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tuition (Annual)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.tuitionFeeAnnual}
                    onChange={(e) => {
                      const ann = Number(e.target.value);
                      setEditingClass({
                        ...editingClass,
                        tuitionFeeAnnual: ann,
                        tuitionFeeMonthly: Math.round(ann / 12),
                        tuitionFeeQuarterly: Math.round(ann / 4)
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tuition (Quarterly)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.tuitionFeeQuarterly}
                    onChange={(e) => setEditingClass({ ...editingClass, tuitionFeeQuarterly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tuition (Monthly)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.tuitionFeeMonthly}
                    onChange={(e) => setEditingClass({ ...editingClass, tuitionFeeMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transport Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.transportFee}
                    onChange={(e) => setEditingClass({ ...editingClass, transportFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lab & Activity Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingClass.labFee}
                    onChange={(e) => setEditingClass({ ...editingClass, labFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer"
                >
                  Save & Apply Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
