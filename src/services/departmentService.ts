import api from './api';

const DEPARTMENTS_URL = '/departments';

const departmentService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(DEPARTMENTS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${DEPARTMENTS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(DEPARTMENTS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${DEPARTMENTS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${DEPARTMENTS_URL}/${id}`),

  getEmployees: (id: string) =>
    api.get<any>(`${DEPARTMENTS_URL}/${id}/employees`),
};

export default departmentService;
