import { useState, useEffect } from 'react';
import { ALL_SCHOOL_CLASSES, calculateFeeForStartMonth } from '../../types/admission';
import {
  syncClassFeeStructureToSupabase,
  fetchClassFeeStructuresFromSupabase,
  syncFeeCollectionToSupabase,
  fetchFeeCollectionsFromSupabase
} from '../../lib/supabaseSync';

export interface ClassFeeStructure {
  className: string;
  registrationFee: number;
  admissionFee: number;
  tuitionFeeAnnual: number;
  tuitionFeeMonthly: number;
  tuitionFeeQuarterly: number;
  transportFee: number;
  labFee: number;
  commitmentFee: number;
}

export type PaymentModeType = 'Cash' | 'Check' | 'UPI' | 'Online / NetBanking' | 'Demand Draft';
export type PaymentFrequencyType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';

export interface ExtendedFeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  classSection: string;
  feeHead: string;
  amountPaid: number;
  paymentMode: PaymentModeType;
  paymentFrequency: PaymentFrequencyType;
  checkNumber?: string;
  bankName?: string;
  checkDate?: string;
  paymentDate: string;
  status: 'Paid' | 'Pending' | 'Bounced';
  remarks?: string;
}

const STORAGE_KEY_FEE_STRUCTURES = 'schoolerp_custom_fee_structures_v2';
const STORAGE_KEY_CUSTOM_FEES = 'schoolerp_extended_fees_transactions_v2';

export const DEFAULT_FEE_STRUCTURES: ClassFeeStructure[] = ALL_SCHOOL_CLASSES.map((cls) => {
  let annualTuition = 60000;
  let regFee = 1500;
  let admFee = 25000;
  let transFee = 4500;
  let lab = 2500;

  if (cls === 'Nursery' || cls === 'KG') {
    annualTuition = 36000;
    regFee = 1500;
    admFee = 15000;
    transFee = 3500;
    lab = 1500;
  } else if (['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(cls)) {
    annualTuition = 48000;
    regFee = 1500;
    admFee = 20000;
    transFee = 4000;
    lab = 2000;
  } else if (['Class 6', 'Class 7', 'Class 8'].includes(cls)) {
    annualTuition = 60000;
    regFee = 1500;
    admFee = 25000;
    transFee = 4500;
    lab = 2500;
  } else if (['Class 9', 'Class 10'].includes(cls)) {
    annualTuition = 72000;
    regFee = 1500;
    admFee = 28000;
    transFee = 5000;
    lab = 3500;
  } else {
    // Senior secondary
    annualTuition = 84000;
    regFee = 2000;
    admFee = 32000;
    transFee = 5500;
    lab = 5000;
  }

  return {
    className: cls,
    registrationFee: regFee,
    admissionFee: admFee,
    tuitionFeeAnnual: annualTuition,
    tuitionFeeMonthly: Math.round(annualTuition / 12),
    tuitionFeeQuarterly: Math.round(annualTuition / 4),
    transportFee: transFee,
    labFee: lab,
    commitmentFee: 5000
  };
});

const INITIAL_TRANSACTIONS: ExtendedFeeTransaction[] = [
  {
    id: 'fee-ex-1',
    receiptNo: 'REC-2026-101',
    studentId: 'std-101',
    studentName: 'Aarav Sharma',
    classSection: 'Class 10-A',
    feeHead: 'Tuition Fee (Quarter 1)',
    amountPaid: 18000,
    paymentMode: 'Check',
    paymentFrequency: 'Quarterly',
    checkNumber: 'CHK-998821',
    bankName: 'State Bank of India',
    checkDate: '2026-04-05',
    paymentDate: '2026-04-05',
    status: 'Paid',
    remarks: 'Q1 Tuition + Transport Cleared via Cheque'
  },
  {
    id: 'fee-ex-2',
    receiptNo: 'REC-2026-102',
    studentId: 'std-102',
    studentName: 'Ananya Verma',
    classSection: 'Class 10-A',
    feeHead: 'Monthly Tuition & Transport Fee',
    amountPaid: 11000,
    paymentMode: 'Cash',
    paymentFrequency: 'Monthly',
    paymentDate: '2026-04-10',
    status: 'Paid',
    remarks: 'April Cash Receipt'
  },
  {
    id: 'fee-ex-3',
    receiptNo: 'REC-2026-103',
    studentId: 'std-103',
    studentName: 'Rohan Patel',
    classSection: 'Class 1-B',
    feeHead: 'Admission & Registration Fee',
    amountPaid: 21500,
    paymentMode: 'UPI',
    paymentFrequency: 'Annual',
    paymentDate: '2026-04-12',
    status: 'Paid',
    remarks: 'Online Admission Fee Payment'
  }
];

export function getClassFeeStructure(className: string): ClassFeeStructure {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FEE_STRUCTURES);
    if (saved) {
      const list: ClassFeeStructure[] = JSON.parse(saved);
      const found = list.find((item) => item.className === className || className.startsWith(item.className));
      if (found) return found;
    }
  } catch (e) {
    console.error(e);
  }

  const defaultFound = DEFAULT_FEE_STRUCTURES.find(
    (item) => item.className === className || className.startsWith(item.className)
  );
  return (
    defaultFound || {
      className,
      registrationFee: 1500,
      admissionFee: 25000,
      tuitionFeeAnnual: 60000,
      tuitionFeeMonthly: 5000,
      tuitionFeeQuarterly: 15000,
      transportFee: 4500,
      labFee: 2500,
      commitmentFee: 5000
    }
  );
}

export function calculateClassTuitionForMonth(
  className: string,
  startMonth: string = 'April'
): {
  structure: ClassFeeStructure;
  tuitionFeeCalculated: number;
  monthsCharged: number;
  fractionLabel: string;
  totalAdmissionEstimate: number;
} {
  const structure = getClassFeeStructure(className);
  const { tuitionFee, monthsCharged, fractionLabel } = calculateFeeForStartMonth(
    structure.tuitionFeeAnnual,
    startMonth
  );

  const totalAdmissionEstimate =
    structure.registrationFee +
    structure.admissionFee +
    tuitionFee +
    structure.transportFee +
    structure.commitmentFee +
    structure.labFee;

  return {
    structure,
    tuitionFeeCalculated: tuitionFee,
    monthsCharged,
    fractionLabel,
    totalAdmissionEstimate
  };
}

export function useFeeStructureStore() {
  const [feeStructures, setFeeStructures] = useState<ClassFeeStructure[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FEE_STRUCTURES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_FEE_STRUCTURES;
  });

  const [transactions, setTransactions] = useState<ExtendedFeeTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FEES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FEE_STRUCTURES, JSON.stringify(feeStructures));
    } catch (e) {
      console.error(e);
    }
  }, [feeStructures]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_FEES, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Remote Supabase Fetch on mount
  useEffect(() => {
    let active = true;
    async function loadRemoteFeeData() {
      const remoteStructures = await fetchClassFeeStructuresFromSupabase();
      if (remoteStructures && remoteStructures.length > 0 && active) {
        setFeeStructures((prev) => {
          const map: Record<string, ClassFeeStructure> = {};
          prev.forEach((s) => { map[s.className] = s; });
          remoteStructures.forEach((s) => { map[s.className] = s; });
          return Object.values(map);
        });
      }

      const remoteFeeCol = await fetchFeeCollectionsFromSupabase();
      if (remoteFeeCol && remoteFeeCol.length > 0 && active) {
        setTransactions((prev) => {
          const map: Record<string, ExtendedFeeTransaction> = {};
          prev.forEach((t) => { map[t.receiptNo] = t; });
          remoteFeeCol.forEach((t) => {
            map[t.receiptNo] = {
              id: t.id,
              receiptNo: t.receiptNo,
              studentId: t.studentId,
              studentName: t.studentName,
              classSection: t.classSection,
              feeHead: t.feeHead,
              amountPaid: t.amountPaid,
              paymentMode: t.paymentMode as any,
              paymentFrequency: 'Monthly',
              paymentDate: t.paymentDate,
              status: 'Paid',
              remarks: `Receipt #${t.receiptNo}`
            };
          });
          return Object.values(map);
        });
      }
    }
    loadRemoteFeeData();
    return () => { active = false; };
  }, []);

  const updateClassFeeStructure = (updated: ClassFeeStructure) => {
    setFeeStructures((prev) =>
      prev.map((item) => (item.className === updated.className ? updated : item))
    );
    // Sync to Supabase live database
    syncClassFeeStructureToSupabase(updated);
    setSyncStatus(`Updated & DB Synced class fee structure for ${updated.className}`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const addFeeTransaction = (
    trx: Omit<ExtendedFeeTransaction, 'id' | 'receiptNo' | 'status'>
  ) => {
    const newTrx: ExtendedFeeTransaction = {
      ...trx,
      id: `fee-trx-${Date.now()}`,
      receiptNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Paid'
    };
    setTransactions((prev) => [newTrx, ...prev]);

    // Sync receipt transaction to Supabase live database
    syncFeeCollectionToSupabase({
      receiptNo: newTrx.receiptNo,
      studentAdmissionNo: newTrx.studentId,
      studentName: newTrx.studentName,
      className: newTrx.classSection,
      feeHead: newTrx.feeHead,
      amountPaid: newTrx.amountPaid,
      paymentMode: newTrx.paymentMode,
      transactionRef: newTrx.checkNumber || 'Cash/Online'
    });

    setSyncStatus(`Receipt ${newTrx.receiptNo} collected & DB Synced via ${newTrx.paymentMode}`);
    setTimeout(() => setSyncStatus(null), 4000);
    return newTrx;
  };

  return {
    feeStructures,
    transactions,
    syncStatus,
    updateClassFeeStructure,
    addFeeTransaction
  };
}
