import type { IQueryParams } from './api';

export interface IDesignation {
  _id: string;
  title: string;
  code: string;
  description?: string;
  department?: string;
  level: number;
  band?: string;
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
