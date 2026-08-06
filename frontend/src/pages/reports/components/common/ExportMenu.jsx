import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';

const DEFAULT_FORMATS = ['pdf', 'excel', 'csv'];

export default function ExportMenu({ onExport, isExporting, disabled, formats = DEFAULT_FORMATS }) {
  const [isOpen, setIsOpen] = useState(false);

  const canExportPdf = formats.includes('pdf');
  const canExportExcel = formats.includes('excel');
  const canExportCsv = formats.includes('csv');

  const handleExport = async (format) => {
    setIsOpen(false);
    if (onExport) {
      await onExport(format);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || disabled}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {isExporting ? 'Generating...' : 'Export'}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#d6d9df] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {canExportPdf && (
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 w-full text-left transition-colors"
              >
                <FileText size={16} className="text-red-500" />
                Download as PDF
              </button>
            )}
            {canExportExcel && (
              <button
                onClick={() => handleExport('excel')}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 w-full text-left transition-colors ${canExportPdf ? 'border-t border-slate-100' : ''}`}
              >
                <Table size={16} className="text-green-600" />
                Download as Excel
              </button>
            )}
            {canExportCsv && (
              <button
                onClick={() => handleExport('csv')}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 w-full text-left transition-colors ${(canExportPdf || canExportExcel) ? 'border-t border-slate-100' : ''}`}
              >
                <FileSpreadsheet size={16} className="text-blue-500" />
                Download as CSV
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
