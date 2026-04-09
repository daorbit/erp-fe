import api from './api';

const EMPLOYEES_URL = '/employees';

const employeeService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(EMPLOYEES_URL, params),

  getById: (id: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(EMPLOYEES_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${EMPLOYEES_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${EMPLOYEES_URL}/${id}`),

  getAttendance: (id: string, month?: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}/attendance`, month ? { month } : undefined),

  getLeaves: (id: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}/leaves`),

  getPayslips: (id: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}/payslips`),

  getAssets: (id: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}/assets`),

  getTimeline: (id: string) =>
    api.get<any>(`${EMPLOYEES_URL}/${id}/timeline`),

  uploadDocument: (id: string, formData: FormData) =>
    api.post<any>(`${EMPLOYEES_URL}/${id}/documents`, formData),
};

export default employeeService;
