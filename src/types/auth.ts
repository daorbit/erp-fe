import type { UserRole } from './enums';

export interface ICompanyRef {
  _id: string;
  name: string;
  code: string;
  logo?: string;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  employeeId: string;
  company?: ICompanyRef | string;
  department?: string;
  designation?: string;
  avatar?: string;
  onboardingRequired: boolean;
  onboardingCompleted: boolean;
  passwordChangeRequired?: boolean;
  isActive: boolean;
  lastLogin?: string;
  allowedModules?: string[];
  allowedBranches?: Array<string | {
    _id: string;
    id?: string;
    name: string;
    code?: string;
    siteType?: string;
    division?: string;
    address01?: string;
    address02?: string;
    address03?: string;
    city?: string;
    pincode?: string;
    stateName?: string;
    latitude?: number;
    longitude?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginRequest {
  email?: string;
  identifier?: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  refreshToken?: string;
  user: IUser;
}

export interface IRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  company?: string;
  employeeId: string;
  department?: string;
  designation?: string;
}
