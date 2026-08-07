import React from 'react';
import { CreditCard, Printer, QrCode } from 'lucide-react';

export const IDCardsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Smart Digital ID Card Generator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Batch print PVC ID cards with QR barcodes for gate attendance, library checkout, and canteen.
          </p>
        </div>

        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
          <Printer className="w-4 h-4" /> Batch Print Cards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Aarav Sharma', classSec: 'Class 10-A', adm: 'ADM-2024-001', roll: '01', bus: 'Route #4' },
          { name: 'Ananya Verma', classSec: 'Class 10-A', adm: 'ADM-2024-002', roll: '02', bus: 'Route #1' },
          { name: 'Rohan Patel', classSec: 'Class 10-B', adm: 'ADM-2024-003', roll: '03', bus: 'Self' }
        ].map((card, i) => (
          <div key={i} className="w-80 bg-white text-slate-900 rounded-xl border-2 border-indigo-900 shadow-xl overflow-hidden mx-auto">
            <div className="bg-indigo-900 text-white p-3 text-center">
              <h3 className="font-extrabold text-xs tracking-wider uppercase">ST. XAVIER SCHOOL</h3>
              <p className="text-[10px] text-indigo-200">STUDENT IDENTIFICATION CARD</p>
            </div>

            <div className="p-4 space-y-3 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto border-2 border-indigo-600 flex items-center justify-center font-bold text-indigo-900 text-xl">
                {card.name[0]}
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{card.name}</h4>
                <p className="text-xs font-semibold text-indigo-600">{card.classSec} (Roll: {card.roll})</p>
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded text-left space-y-0.5">
                <p><strong>Adm No:</strong> {card.adm}</p>
                <p><strong>Transport:</strong> {card.bus}</p>
                <p><strong>Emergency:</strong> +91 98765 43210</p>
              </div>

              <div className="flex justify-center pt-1">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
