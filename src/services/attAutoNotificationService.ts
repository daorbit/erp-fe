import api from './api';
const URL = '/att-auto-notifications';
const attAutoNotificationService = {
  getAll: (params?: Record<string, string>) => api.get<any>(URL, params),
  create: (data: any) => api.post<any>(URL, data),
  delete: (id: string) => api.delete<void>(`${URL}/${id}`),
};
export default attAutoNotificationService;
