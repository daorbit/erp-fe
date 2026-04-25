import api from './api';

const STATES_URL = '/states';

const stateService = {
  getAll: (params?: Record<string, string>) => api.get<any>(STATES_URL, params),
  getById: (id: string) => api.get<any>(`${STATES_URL}/${id}`),
  create: (data: any) => api.post<any>(STATES_URL, data),
  update: (id: string, data: any) => api.put<any>(`${STATES_URL}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${STATES_URL}/${id}`),
};

export default stateService;
