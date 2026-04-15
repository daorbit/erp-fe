import api from './api';
const URL = '/cities';
const cityService = {
  getAll: (params?: Record<string, string>) => api.get<any>(URL, params),
  getById: (id: string) => api.get<any>(`${URL}/${id}`),
  create: (data: any) => api.post<any>(URL, data),
  update: (id: string, data: any) => api.put<any>(`${URL}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${URL}/${id}`),
};
export default cityService;
