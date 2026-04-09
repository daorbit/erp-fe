import type { IQueryParams } from './api';
import type {
  AnnouncementCategory,
  AnnouncementPriority,
  TargetAudience,
} from './enums';

export interface IAnnouncementAttachment {
  _id?: string;
  name: string;
  fileUrl: string;
}

export interface IReadReceipt {
  employee: string;
  readAt: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  targetAudience: TargetAudience;
  departments: string[];
  attachments: IAnnouncementAttachment[];
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
  isPinned: boolean;
  createdBy: string;
  readBy: IReadReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface IAnnouncementListParams extends IQueryParams {
  category?: AnnouncementCategory;
  priority?: AnnouncementPriority;
  isActive?: boolean;
}

export type ICreateAnnouncement = Omit<IAnnouncement, '_id' | 'createdAt' | 'updatedAt' | 'readBy'>;

export type IUpdateAnnouncement = Partial<ICreateAnnouncement>;
