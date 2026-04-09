import api from './api';

const ASSETS_URL = '/assets';

const assetService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(ASSETS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${ASSETS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(ASSETS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${ASSETS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${ASSETS_URL}/${id}`),

  assign: (id: string, data: any) =>
    api.put<any>(`${ASSETS_URL}/${id}/assign`, data),

  return: (id: string, data?: any) =>
    api.put<any>(`${ASSETS_URL}/${id}/return`, data),

  getByEmployee: (employeeId: string, params?: Record<string, string>) =>
    api.get<any>(`${ASSETS_URL}/employee/${employeeId}`, params),

  getAvailable: (params?: Record<string, string>) =>
    api.get<any>(`${ASSETS_URL}/available`, params),

  getMaintenanceDue: (params?: Record<string, string>) =>
    api.get<any>(`${ASSETS_URL}/maintenance-due`, params),
};

export default assetService;
