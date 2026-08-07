import React from 'react';
import { Package, Layers } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Inventory & Asset Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            School assets, sports equipment, lab stock, furniture, and vendor purchase orders.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Item Code</th>
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">In Stock Quantity</th>
              <th className="py-3 px-4">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {[
              { code: 'AST-101', name: 'Dell Core i5 Desktop PCs', cat: 'Computer Lab', qty: '45 Units', loc: 'Lab 2' },
              { code: 'AST-102', name: 'Microscopes (1000x)', cat: 'Biology Lab', qty: '20 Units', loc: 'Bio Lab' },
              { code: 'AST-103', name: 'Basketballs (Nivia)', cat: 'Sports Dept', qty: '15 Units', loc: 'Sports Room' }
            ].map((item, i) => (
              <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{item.code}</td>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                <td className="py-3 px-4 text-xs">{item.cat}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">{item.qty}</td>
                <td className="py-3 px-4 text-xs font-mono">{item.loc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
