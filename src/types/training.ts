import type { IQueryParams } from './api';
import type {
  TrainingCategory,
  TrainerType,
  TrainingMode,
  TrainingStatus,
  ParticipantStatus,
} from './enums';

export interface IParticipant {
  _id?: string;
  employee: string;
  status: ParticipantStatus;
  completedAt?: string;
  score?: number;
  certificate?: string;
}

export interface ITrainingMaterial {
  _id?: string;
  name: string;
  fileUrl: string;
}

export interface ITrainingProgram {
  _id: string;
  title: string;
  description?: string;
  category: TrainingCategory;
  trainer?: string;
  trainerType: TrainerType;
  startDate: string;
  endDate: string;
  duration?: string;
  location?: string;
  mode: TrainingMode;
  maxParticipants?: number;
  participants: IParticipant[];
  materials: ITrainingMaterial[];
  cost?: number;
  status: TrainingStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITrainingListParams extends IQueryParams {
  category?: TrainingCategory;
  status?: TrainingStatus;
  mode?: TrainingMode;
}

export type ICreateTrainingProgram = Omit<ITrainingProgram, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateTrainingProgram = Partial<ICreateTrainingProgram>;
