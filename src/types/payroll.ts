import type { IQueryParams } from './api';
import type { PayslipStatus, PaymentMode } from './enums';

// ─── Salary Structure ───────────────────────────────────────────────────────

export interface ISalaryStructure {
  _id: string;
  employee: string;
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  medicalAllowance: number;
  travelAllowance: number;
  pf: number;
  esi: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  ctc: number;
  effectiveFrom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ICreateSalaryStructure = Omit<ISalaryStructure, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateSalaryStructure = Partial<ICreateSalaryStructure>;

// ─── Payslip ────────────────────────────────────────────────────────────────

export interface IPayslipEarnings {
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  medicalAllowance: number;
  travelAllowance: number;
  overtime: number;
  bonus: number;
}

export interface IPayslipDeductions {
  pf: number;
  esi: number;
  professionalTax: number;
  tds: number;
  lop: number;
  otherDeductions: number;
}

export interface IPayslip {
  _id: string;
  employee: string;
  month: number;
  year: number;
  salaryStructure: string;
  workingDays: number;
  presentDays: number;
  lopDays: number;
  earnings: IPayslipEarnings;
  deductions: IPayslipDeductions;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  status: PayslipStatus;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  transactionId?: string;
  generatedBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayslipListParams extends IQueryParams {
  employee?: string;
  month?: number;
  year?: number;
  status?: PayslipStatus;
}

export type ICreatePayslip = Omit<IPayslip, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdatePayslip = Partial<ICreatePayslip>;
