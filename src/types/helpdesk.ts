import type { IQueryParams } from './api';
import type { TicketCategory, TicketPriority, TicketStatus } from './enums';

export interface ICommentAttachment {
  name: string;
  fileUrl: string;
}

export interface ITicketComment {
  _id?: string;
  user: string;
  message: string;
  createdAt: string;
  attachments: ICommentAttachment[];
}

export interface ITicket {
  _id: string;
  ticketNumber: string;
  employee: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  resolution?: string;
  comments: ITicketComment[];
  closedAt?: string;
  closedBy?: string;
  satisfaction?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITicketListParams extends IQueryParams {
  employee?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: string;
}

export type ICreateTicket = Omit<ITicket, '_id' | 'createdAt' | 'updatedAt' | 'ticketNumber' | 'comments' | 'closedAt' | 'closedBy' | 'satisfaction'>;

export type IUpdateTicket = Partial<Omit<ICreateTicket, 'employee'>>;
