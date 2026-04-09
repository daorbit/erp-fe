import type { IQueryParams } from './api';
import type {
  Gender,
  MaritalStatus,
  EmploymentType,
  AccountType,
} from './enums';

// ─── Sub-Interfaces ─────────────────────────────────────────────────────────

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface IEmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export interface IBankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: AccountType;
}

export interface IIdentityDocs {
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
}

export interface ISalaryBreakdown {
  basic?: number;
  hra?: number;
  da?: number;
  specialAllowance?: number;
  grossSalary?: number;
  deductions?: number;
  netSalary?: number;
  ctc?: number;
}

export interface IEmployeeDocument {
  _id?: string;
  name: string;
  fileUrl: string;
  fileType?: string;
  uploadedAt: string;
}

// ─── Employee Profile ───────────────────────────────────────────────────────

export interface IEmployee {
  _id: string;
  userId: string;
  employeeId: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  currentAddress?: IAddress;
  permanentAddress?: IAddress;
  emergencyContact?: IEmergencyContact;
  bankDetails?: IBankDetails;
  identityDocs?: IIdentityDocs;
  joinDate?: string;
  confirmationDate?: string;
  probationEndDate?: string;
  resignationDate?: string;
  lastWorkingDate?: string;
  employmentType: EmploymentType;
  workShift?: string;
  workLocation?: string;
  reportingManager?: string;
  salary?: ISalaryBreakdown;
  documents?: IEmployeeDocument[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Query / Mutation DTOs ──────────────────────────────────────────────────

export interface IEmployeeListParams extends IQueryParams {
  department?: string;
  designation?: string;
  employmentType?: EmploymentType;
  isActive?: boolean;
}

export type ICreateEmployee = Omit<IEmployee, '_id' | 'createdAt' | 'updatedAt'>;

export type IUpdateEmployee = Partial<ICreateEmployee>;
