import type { IQueryParams } from './api';
import type { DocumentCategory } from './enums';

export interface IDocument {
  _id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  employee?: string;
  uploadedBy: string;
  isPublic: boolean;
  expiryDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentListParams extends IQueryParams {
  category?: DocumentCategory;
  employee?: string;
  isPublic?: boolean;
}

export type ICreateDocument = Omit<IDocument, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateDocument = Partial<ICreateDocument>;
