import type { IQueryParams } from './api';

export interface IDepartment {
  _id: string;
  name: string;
  shortName: string;
  description?: string;
  // headOfDepartment?: string;
  parentDepartment?: string;
  displayOrder?: number;
  isActive: boolean;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartmentListParams extends IQueryParams {
  isActive?: boolean;
}

export type ICreateDepartment = Omit<IDepartment, '_id' | 'createdAt' | 'updatedAt' | 'employeeCount'>;

export type IUpdateDepartment = Partial<ICreateDepartment>;
