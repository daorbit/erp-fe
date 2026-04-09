import api from './api';

const HOLIDAYS_URL = '/holidays';

const holidayService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(HOLIDAYS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${HOLIDAYS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(HOLIDAYS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${HOLIDAYS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${HOLIDAYS_URL}/${id}`),

  getByYear: (year: string | number, params?: Record<string, string>) =>
    api.get<any>(`${HOLIDAYS_URL}/year/${year}`, params),

  getUpcoming: (params?: Record<string, string>) =>
    api.get<any>(`${HOLIDAYS_URL}/upcoming`, params),
};

export default holidayService;
