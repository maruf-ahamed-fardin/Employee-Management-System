export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'PAID';
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  positionTitle?: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string | null;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface PayrollSummary {
  totalPayroll: number;
  paidAmount: number;
  pendingAmount: number;
  employeeCount: number;
}
