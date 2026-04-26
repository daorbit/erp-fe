import api from './api';

const BASE = '/account-groups';

const accountGroupService = {
  getAll: (params?: Record<string, string>) => api.get<any>(BASE, params),
  getById: (id: string) => api.get<any>(`${BASE}/${id}`),
  create: (data: any) => api.post<any>(BASE, data),
  update: (id: string, data: any) => api.put<any>(`${BASE}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${BASE}/${id}`),
};

export default accountGroupService;
