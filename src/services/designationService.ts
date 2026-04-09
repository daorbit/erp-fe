import api from './api';

const DESIGNATIONS_URL = '/designations';

const designationService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(DESIGNATIONS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${DESIGNATIONS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(DESIGNATIONS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${DESIGNATIONS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${DESIGNATIONS_URL}/${id}`),
};

export default designationService;
