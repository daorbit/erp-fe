import type { IQueryParams } from './api';
import type { JobPostingStatus, JobEmploymentType, ApplicationStatus } from './enums';

// ─── Job Posting ────────────────────────────────────────────────────────────

export interface IExperienceRange {
  min: number;
  max: number;
}

export interface ISalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface IJobPosting {
  _id: string;
  title: string;
  description: string;
  department: string;
  designation?: string;
  location: string;
  employmentType: JobEmploymentType;
  experience: IExperienceRange;
  salary?: ISalaryRange;
  skills: string[];
  qualifications: string[];
  vacancies: number;
  status: JobPostingStatus;
  postedBy: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IJobPostingListParams extends IQueryParams {
  status?: JobPostingStatus;
  department?: string;
  employmentType?: JobEmploymentType;
}

export type ICreateJobPosting = Omit<IJobPosting, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateJobPosting = Partial<ICreateJobPosting>;

// ─── Job Application ────────────────────────────────────────────────────────

export interface IJobApplication {
  _id: string;
  jobPosting: string;
  candidateName: string;
  email: string;
  phone: string;
  resume?: string;
  coverLetter?: string;
  experience?: number;
  currentSalary?: number;
  expectedSalary?: number;
  skills: string[];
  status: ApplicationStatus;
  interviewDate?: string;
  interviewNotes?: string;
  interviewers: string[];
  rating?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IJobApplicationListParams extends IQueryParams {
  jobPosting?: string;
  status?: ApplicationStatus;
}

export type ICreateJobApplication = Omit<IJobApplication, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateJobApplication = Partial<ICreateJobApplication>;
