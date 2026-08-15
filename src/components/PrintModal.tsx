import React, { useState } from 'react';
import { X, Printer, Layout, FileText, Check, SlidersHorizontal } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Customizable Print & PDF Export Utility',
  children
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter'>('A4');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [colorTheme, setColorTheme] = useState<'color' | 'monochrome'>('color');

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    // Inject dynamic print style for orientation
    const styleId = 'dynamic-print-orientation';
    let existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
      existingStyle = document.createElement('style');
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }
    existingStyle.innerHTML = `
      @media print {
        @page {
          size: ${paperSize.toLowerCase()} ${orientation};
          margin: 10mm;
        }
        body {
          background: white !important;
          color: black !important;
        }
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
      }
    `;

    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* MODAL HEADER WITH CLOSE BUTTON */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">{title}</h3>
              <p className="text-xs text-slate-300">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close Print Preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PRINT CUSTOMIZATION TOOLBAR */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* ORIENTATION SELECTOR */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="px-2 text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                <Layout className="w-3.5 h-3.5 text-indigo-500" /> Orientation:
              </span>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Landscape
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Portrait
              </button>
            </div>

            {/* PAPER SIZE */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-black">Paper:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="bg-transparent font-black text-slate-900 dark:text-white cursor-pointer focus:outline-none"
              >
                <option value="A4">A4 Sheet</option>
                <option value="Letter">US Letter</option>
              </select>
            </div>

            {/* COLOR MODE */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-black">Style:</span>
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value as any)}
                className="bg-transparent font-black text-slate-900 dark:text-white cursor-pointer focus:outline-none"
              >
                <option value="color">Full Color ERP</option>
                <option value="monochrome">Grayscale / Print Friendly</option>
              </select>
            </div>

            {/* OPTIONS TOGGLES */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>School Letterhead</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Signature Block</span>
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleTriggerPrint}
              className="px-5 py-2 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        </div>

        {/* PRINTABLE CANVAS PREVIEW CONTAINER */}
        <div className="p-6 overflow-y-auto bg-slate-200/70 dark:bg-slate-950 flex justify-center flex-1">
          <div
            id="printable-document-content"
            className={`bg-white text-slate-900 p-8 shadow-2xl rounded-sm transition-all border border-slate-300 ${
              orientation === 'landscape' ? 'w-full max-w-[1000px]' : 'w-full max-w-[750px]'
            } ${colorTheme === 'monochrome' ? 'grayscale contrast-125' : ''}`}
          >
            {/* SCHOOL HEADER (if enabled) */}
            {includeHeader && (
              <div className="border-b-2 border-indigo-900 pb-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-900 text-amber-300 font-black text-xl rounded-2xl flex items-center justify-center shadow">
                    DPS
                  </div>
                  <div>
                    <h1 className="text-xl font-black uppercase text-indigo-950 tracking-tight">
                      Delhi Public Senior Secondary School
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Affiliated to CBSE, New Delhi • Campus Code: 20491
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Website: www.schoolerp.edu • Phone: +91 98100 00000
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-xs rounded-lg uppercase">
                    Official Document
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    Printed: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            {/* DYNAMIC DOCUMENT CONTENT */}
            <div className="my-4">{children}</div>

            {/* SIGNATURE BLOCK (if enabled) */}
            {includeSignatures && (
              <div className="mt-12 pt-6 border-t border-slate-300 flex items-end justify-between text-xs text-slate-700">
                <div className="text-center w-40">
                  <div className="border-b border-slate-400 mb-1 pb-8 font-serif italic text-slate-400 text-xs">
                    Class Teacher Sign
                  </div>
                  <strong className="font-bold block">Class Incharge</strong>
                </div>

                <div className="text-center w-40">
                  <div className="border-b border-slate-400 mb-1 pb-8 font-serif italic text-slate-400 text-xs">
                    Verified By
                  </div>
                  <strong className="font-bold block">Academic Coordinator</strong>
                </div>

                <div className="text-center w-40">
                  <div className="border-b border-slate-400 mb-1 pb-8 font-serif italic text-slate-400 text-xs">
                    Principal Seal
                  </div>
                  <strong className="font-bold block uppercase text-indigo-950">Principal</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM STICKY ACTION BAR WITH CLOSE / BACK / CANCEL / PRINT BUTTONS */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
            >
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
