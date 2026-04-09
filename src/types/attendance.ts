import type { IQueryParams } from './api';
import type { AttendanceStatus } from './enums';

export interface ILocation {
  latitude?: number;
  longitude?: number;
}

export interface IAttendance {
  _id: string;
  employee: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  overtime?: number;
  notes?: string;
  location?: ILocation;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceListParams extends IQueryParams {
  employee?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

export type ICreateAttendance = Omit<IAttendance, '_id' | 'createdAt' | 'updatedAt' | 'workHours'>;

export type IUpdateAttendance = Partial<ICreateAttendance>;
