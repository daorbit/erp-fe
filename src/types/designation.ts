import type { IQueryParams } from './api';

export interface IDesignation {
  _id: string;
  name: string;
  shortName: string;
  rolesAndResponsibility?: string;
  departments?: string[];
  displayOrder?: number;
  employeeBand?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDesignationListParams extends IQueryParams {
  department?: string;
  isActive?: boolean;
}

export type ICreateDesignation = Omit<IDesignation, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateDesignation = Partial<ICreateDesignation>;
