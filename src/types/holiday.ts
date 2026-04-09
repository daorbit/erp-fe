import type { IQueryParams } from './api';
import type { HolidayType, HolidayApplicableFor } from './enums';

export interface IHoliday {
  _id: string;
  name: string;
  date: string;
  type: HolidayType;
  description?: string;
  isOptional: boolean;
  year: number;
  applicableFor: HolidayApplicableFor;
  departments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IHolidayListParams extends IQueryParams {
  year?: number;
  type?: HolidayType;
}

export type ICreateHoliday = Omit<IHoliday, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateHoliday = Partial<ICreateHoliday>;
