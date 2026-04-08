import api from './api';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  headOfDepartmentId: string;
  parentDepartment: string;
  parentDepartmentId: string;
  employeeCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
}

const departmentService = {
  getAll: (params?: DepartmentListParams) =>
    api.get<DepartmentListResponse>('/departments', params as Record<string, string>),

  getById: (id: string) =>
    api.get<Department>(`/departments/${id}`),

  create: (data: Partial<Department>) =>
    api.post<Department>('/departments', data),

  update: (id: string, data: Partial<Department>) =>
    api.put<Department>(`/departments/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/departments/${id}`),

  getEmployees: (id: string) =>
    api.get<unknown>(`/departments/${id}/employees`),
};

export default departmentService;
