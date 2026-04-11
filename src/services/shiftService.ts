import api from './api';

const SHIFTS_URL = '/shifts';

const shiftService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(SHIFTS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${SHIFTS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(SHIFTS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${SHIFTS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${SHIFTS_URL}/${id}`),
};

export default shiftService;
