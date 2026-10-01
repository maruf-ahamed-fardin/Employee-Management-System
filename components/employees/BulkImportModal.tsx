'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BulkImportModal({
  departments = [],
  onSuccess,
}: {
  departments: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const sampleCsv = `employeeCode,firstName,lastName,email,phone,department,position,salary,joiningDate
SX-010,Tanvir,Hasan,tanvir.hasan@selorax.test,+880 1711-223344,Engineering,Software Engineer,65000,2026-10-01
SX-011,Sadia,Afrin,sadia.afrin@selorax.test,+880 1811-556677,Design,UI/UX Designer,60000,2026-10-01
SX-012,Kamrul,Islam,kamrul.islam@selorax.test,+880 1911-889900,HR,HR Officer,55000,2026-10-01`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selorax-employee-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((h, index) => {
        rowObj[h] = values[index] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      toast.error('No employee records parsed');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employees/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Failed to import');

      toast.success(data.message || `Imported ${data.data?.importedCount || parsedRows.length} employees!`);
      setOpen(false);
      setCsvText('');
      setParsedRows([]);
      if (onSuccess) onSuccess();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Import error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs border-slate-300 dark:border-slate-800"
      >
        <FileSpreadsheet className="size-3.5 text-emerald-500" />
        <span>Bulk CSV Import</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Bulk Employee CSV Import</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Upload a spreadsheet to bulk-create multiple staff records at once.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Template Download Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-white">Need a spreadsheet template?</p>
                <p className="text-slate-400 text-[11px]">Download our standardized CSV format with sample data.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="h-8 text-xs border-slate-700 text-slate-300 gap-1.5"
              >
                <Download className="size-3.5" />
                Download CSV Template
              </Button>
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Choose CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            {/* Or Paste CSV Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Or Paste CSV Text directly
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCsv(e.target.value);
                }}
                placeholder="Paste CSV rows here..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Parsed Preview */}
            {parsedRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    <span>Parsed {parsedRows.length} valid employee records</span>
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Full Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Department</th>
                        <th className="py-2 px-3">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="py-1.5 px-3 font-mono text-indigo-400">{r.employeeCode || `SX-${100 + idx}`}</td>
                          <td className="py-1.5 px-3 font-semibold text-white">{r.firstName} {r.lastName}</td>
                          <td className="py-1.5 px-3 text-slate-400">{r.email}</td>
                          <td className="py-1.5 px-3 text-slate-400">{r.department || 'General'}</td>
                          <td className="py-1.5 px-3 text-slate-400">{r.position || 'Staff'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting || parsedRows.length === 0}
              onClick={handleImport}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-md shadow-emerald-600/25"
            >
              <Upload className="size-3.5" />
              <span>{submitting ? 'Importing...' : `Import ${parsedRows.length} Employees`}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
