import type { IQueryParams } from './api';
import type { ExpenseCategory, ExpenseStatus } from './enums';

export interface IReceipt {
  _id?: string;
  name: string;
  fileUrl: string;
}

export interface IExpense {
  _id: string;
  employee: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  receipts: IReceipt[];
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
  approverRemarks?: string;
  reimbursedAt?: string;
  reimbursementRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseListParams extends IQueryParams {
  employee?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
}

export type ICreateExpense = Omit<IExpense, '_id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt' | 'approverRemarks' | 'reimbursedAt' | 'reimbursementRef'>;

export type IUpdateExpense = Partial<ICreateExpense>;
