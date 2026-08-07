import React, { useState } from 'react';
import { useOtherModulesStore } from '../otherModules/otherStore';
import { DollarSign, Plus, Printer, CheckCircle, Search } from 'lucide-react';

export const FeesModule: React.FC = () => {
  const { fees, addFeeTransaction } = useOtherModulesStore();
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [amountPaid, setAmountPaid] = useState(4500);
  const [paymentMode, setPaymentMode] = useState<any>('UPI');
  const [feeHead, setFeeHead] = useState('Tuition Fee - March 2026');

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeeTransaction({
      studentId: 'std-101',
      studentName,
      classSection: 'Class 10-A',
      amountPaid: Number(amountPaid),
      paymentMode,
      paymentDate: new Date().toISOString().split('T')[0],
      feeHead
    });
    setShowCollectModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Fees Management & Collection
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Collect school fees, generate official digital receipts, and track overdue fee ledgers.
          </p>
        </div>

        <button
          onClick={() => setShowCollectModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" /> Collect Fee & Issue Receipt
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Receipt No</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class & Sec</th>
              <th className="py-3 px-4">Fee Head</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Amount Paid</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {fees.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{f.receiptNo}</td>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{f.studentName}</td>
                <td className="py-3 px-4 text-xs font-medium">{f.classSection}</td>
                <td className="py-3 px-4 text-xs font-medium">{f.feeHead}</td>
                <td className="py-3 px-4 text-xs">{f.paymentMode}</td>
                <td className="py-3 px-4 font-extrabold text-emerald-600">₹{f.amountPaid.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 justify-end ml-auto"
                  >
                    <Printer className="w-3.5 h-3.5" /> Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Collect School Fee</h3>
            <form onSubmit={handleCollectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Fee Description / Head</label>
                <input
                  type="text"
                  required
                  value={feeHead}
                  onChange={(e) => setFeeHead(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="Online">Online Banking</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
