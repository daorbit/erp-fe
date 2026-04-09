import type { IQueryParams } from './api';
import type { LeaveRequestStatus, HalfDayType, ApplicableFor } from './enums';

// ─── Leave Type ─────────────────────────────────────────────────────────────

export interface ILeaveType {
  _id: string;
  name: string;
  code: string;
  description?: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward: number;
  isActive: boolean;
  isPaid: boolean;
  applicableFor: ApplicableFor;
  createdAt: string;
  updatedAt: string;
}

export type ICreateLeaveType = Omit<ILeaveType, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateLeaveType = Partial<ICreateLeaveType>;

// ─── Leave Request ──────────────────────────────────────────────────────────

export interface ILeaveRequest {
  _id: string;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approverRemarks?: string;
  attachments?: string[];
  isHalfDay: boolean;
  halfDayType?: HalfDayType;
  createdAt: string;
  updatedAt: string;
}

export interface ILeaveRequestListParams extends IQueryParams {
  employee?: string;
  leaveType?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
}

export type ICreateLeaveRequest = Omit<ILeaveRequest, '_id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approverRemarks' | 'status'>;

export type IUpdateLeaveRequest = Partial<ICreateLeaveRequest>;

// ─── Leave Balance ──────────────────────────────────────────────────────────

export interface ILeaveBalance {
  _id: string;
  employee: string;
  leaveType: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
  carryForward: number;
  createdAt: string;
  updatedAt: string;
}
