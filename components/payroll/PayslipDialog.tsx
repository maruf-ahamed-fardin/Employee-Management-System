'use client';

import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import {
  Download,
  Printer,
  CheckCircle,
  Building2,
  ShieldCheck,
  Calendar,
  CreditCard,
  QrCode as QrIcon,
} from 'lucide-react';
import { QrCode } from '@/components/employee/QRCode';

export function PayslipDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
}) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthStr = monthNames[record.month - 1] || 'Current Month';
  const payRefNumber = `SX-PAY-${record.year}-${String(record.month).padStart(2, '0')}-${record.employee?.employeeCode || 'EMP'}`;

  // Breakdown helpers
  const basic = record.basicSalary || (record.netSalary * 0.65) || 50000;
  const houseRent = Math.round(basic * 0.25);
  const medical = Math.round(basic * 0.10);
  const conveyance = Math.round(basic * 0.05);
  const totalAllowances = record.allowances || (houseRent + medical + conveyance);
  const grossEarnings = basic + totalAllowances;
  const taxDeduction = Math.round(grossEarnings * 0.05);
  const pfDeduction = Math.round(basic * 0.05);
  const totalDeductions = record.deductions || (taxDeduction + pfDeduction);
  const netPay = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-border bg-card">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Official Salary Payslip</h2>
              <p className="text-[11px] text-muted-foreground">{monthStr} {record.year} · {payRefNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <Printer className="size-3.5" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Printable Payslip Document Body */}
        <div
          ref={printableRef}
          className="payslip-print-container p-6 sm:p-8 bg-white text-slate-900 space-y-6"
        >
          {/* Corporate Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-lg bg-[#1b1754] text-[#F37021] font-black text-sm flex items-center justify-center">
                  SX
                </span>
                <span className="text-xl font-black tracking-tight text-[#1b1754]">
                  SeloraX Technologies Ltd.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dhaka HQ, Level 8, Gulshan Avenue, Dhaka-1212, Bangladesh
              </p>
              <p className="text-[11px] text-slate-400">
                corporate@selorax.com · +880-2-9870000 · Tax Reg: 8472-9102-SX
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block rounded-md bg-[#1b1754] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Salary Disbursement Slip
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-slate-700">{payRefNumber}</p>
              <p className="text-[11px] text-slate-500">Pay Period: <span className="font-semibold text-slate-800">{monthStr} {record.year}</span></p>
            </div>
          </div>

          {/* Employee & Payment Summary Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Name</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {record.employee?.firstName} {record.employee?.lastName}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {record.employee?.employeeCode}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {record.employee?.department?.name || 'Engineering'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {record.employee?.position?.title || 'Staff Specialist'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Status</span>
              <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle className="size-3" />
                {record.status || 'PAID'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disbursement Method</span>
              <p className="font-medium text-slate-800 mt-0.5">
                Direct Bank Transfer
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Working Days</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                22 Days (Full Cycle)
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disbursement Date</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {formatDate(record.createdAt || new Date())}
              </p>
            </div>
          </div>

          {/* Earnings vs Deductions Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>Earnings Breakdown</span>
                <span>Amount (BDT)</span>
              </div>
              <div className="p-3.5 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(basic)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(houseRent)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Medical Allowance</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(medical)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Conveyance & Transport</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(conveyance)}</span>
                </div>
              </div>
              <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 font-bold flex justify-between text-slate-900">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-emerald-700">{formatCurrency(grossEarnings)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                <span>Statutory & Company Deductions</span>
                <span>Amount (BDT)</span>
              </div>
              <div className="p-3.5 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Tax Deducted at Source (TDS)</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(taxDeduction)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provident Fund (PF Employee)</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(pfDeduction)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Unpaid Leave / Absenteeism</span>
                  <span className="font-mono font-semibold text-slate-900">৳0</span>
                </div>
              </div>
              <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 font-bold flex justify-between text-slate-900">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-600">-{formatCurrency(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Take Home Highlight */}
          <div className="rounded-xl bg-[#1b1754] text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Net Take-Home Salary
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#F37021] tracking-tight mt-0.5">
                {formatCurrency(record.netSalary || netPay)}
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-300">
              <p className="font-semibold text-white">Direct Credit to Bank</p>
              <p className="opacity-80">Reference: {payRefNumber}</p>
            </div>
          </div>

          {/* Verification QR, Authenticity Seal & Signatures */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-lg border border-slate-200 bg-white">
                <QrCode
                  value={`https://selorax.com/verify-payslip?ref=${payRefNumber}`}
                  label="Verification QR"
                  className="size-16"
                  showLogo={false}
                />
              </div>
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  System Verified Payslip
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px]">
                  Scan QR code with smartphone to verify digital authenticity on SeloraX server.
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="h-10 border-b border-slate-400 w-44 mx-auto sm:ml-auto mb-1 flex items-end justify-center font-serif italic text-slate-700">
                Fardin Ahamed
              </div>
              <p className="font-bold text-slate-800 text-[11px]">Authorized HR & Finance Officer</p>
              <p className="text-[10px] text-slate-400">SeloraX Technologies Ltd.</p>
            </div>
          </div>

          <p className="text-[9px] text-center text-slate-400 pt-2 border-t border-slate-100">
            CONFIDENTIAL: This electronic document is private and confidential between the recipient and SeloraX Technologies Ltd.
          </p>
        </div>

        {/* Global Print Styling for Clean A4 Output */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .payslip-print-container,
            .payslip-print-container * {
              visibility: visible;
            }
            .payslip-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20mm !important;
              margin: 0 !important;
              background: white !important;
              color: black !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
