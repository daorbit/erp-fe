import api from './api';

export interface Designation {
  id: string;
  title: string;
  code: string;
  department: string;
  departmentId: string;
  level: number;
  band: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DesignationListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export interface DesignationListResponse {
  data: Designation[];
  total: number;
  page: number;
  limit: number;
}

const designationService = {
  getAll: (params?: DesignationListParams) =>
    api.get<DesignationListResponse>('/designations', params as Record<string, string>),

  getById: (id: string) =>
    api.get<Designation>(`/designations/${id}`),

  create: (data: Partial<Designation>) =>
    api.post<Designation>('/designations', data),

  update: (id: string, data: Partial<Designation>) =>
    api.put<Designation>(`/designations/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/designations/${id}`),
};

export default designationService;
