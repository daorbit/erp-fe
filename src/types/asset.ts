import type { IQueryParams } from './api';
import type { AssetCategory, AssetCondition, AssetStatus } from './enums';

export interface IAssignmentHistory {
  _id?: string;
  employee: string;
  assignedDate: string;
  returnedDate?: string;
  condition?: string;
  notes?: string;
}

export interface IAsset {
  _id: string;
  name: string;
  assetTag: string;
  category: AssetCategory;
  brand?: string;
  modelName?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  condition: AssetCondition;
  status: AssetStatus;
  assignedTo?: string;
  assignedDate?: string;
  location?: string;
  specifications?: Record<string, string>;
  notes?: string;
  assignmentHistory: IAssignmentHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface IAssetListParams extends IQueryParams {
  category?: AssetCategory;
  condition?: AssetCondition;
  status?: AssetStatus;
  assignedTo?: string;
}

export type ICreateAsset = Omit<IAsset, '_id' | 'createdAt' | 'updatedAt' | 'assignmentHistory'>;

export type IUpdateAsset = Partial<ICreateAsset>;
