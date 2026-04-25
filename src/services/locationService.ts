import api from './api';

const LOCATIONS_URL = '/locations';

const locationService = {
  getAll: (params?: Record<string, string>) => api.get<any>(LOCATIONS_URL, params),
  getById: (id: string) => api.get<any>(`${LOCATIONS_URL}/${id}`),
  create: (data: any) => api.post<any>(LOCATIONS_URL, data),
  update: (id: string, data: any) => api.put<any>(`${LOCATIONS_URL}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${LOCATIONS_URL}/${id}`),
};

export default locationService;
