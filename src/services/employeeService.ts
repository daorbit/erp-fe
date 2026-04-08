import api from './api';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  department: string;
  departmentId: string;
  designation: string;
  designationId: string;
  reportingManager: string;
  reportingManagerId: string;
  joinDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  workShift: string;
  bankName: string;
  bankAccountNo: string;
  ifscCode: string;
  panNumber: string;
  aadharNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  employmentType?: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}

const employeeService = {
  getAll: (params?: EmployeeListParams) =>
    api.get<EmployeeListResponse>('/employees', params as Record<string, string>),

  getById: (id: string) =>
    api.get<Employee>(`/employees/${id}`),

  create: (data: Partial<Employee>) =>
    api.post<Employee>('/employees', data),

  update: (id: string, data: Partial<Employee>) =>
    api.put<Employee>(`/employees/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/employees/${id}`),

  getAttendance: (id: string, month?: string) =>
    api.get<unknown>(`/employees/${id}/attendance`, month ? { month } : undefined),

  getLeaves: (id: string) =>
    api.get<unknown>(`/employees/${id}/leaves`),

  getPayslips: (id: string) =>
    api.get<unknown>(`/employees/${id}/payslips`),

  getAssets: (id: string) =>
    api.get<unknown>(`/employees/${id}/assets`),

  getTimeline: (id: string) =>
    api.get<unknown>(`/employees/${id}/timeline`),

  uploadDocument: (id: string, formData: FormData) =>
    api.post<unknown>(`/employees/${id}/documents`, formData),
};

export default employeeService;
