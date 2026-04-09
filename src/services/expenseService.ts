import api from './api';

const EXPENSES_URL = '/expenses';

const expenseService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(EXPENSES_URL, params),

  getById: (id: string) =>
    api.get<any>(`${EXPENSES_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(EXPENSES_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${EXPENSES_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${EXPENSES_URL}/${id}`),

  submit: (id: string) =>
    api.post<any>(`${EXPENSES_URL}/submit/${id}`),

  approve: (id: string, data?: any) =>
    api.put<any>(`${EXPENSES_URL}/${id}/approve`, data),

  reject: (id: string, data?: any) =>
    api.put<any>(`${EXPENSES_URL}/${id}/reject`, data),

  reimburse: (id: string, data?: any) =>
    api.put<any>(`${EXPENSES_URL}/${id}/reimburse`, data),

  getMyExpenses: (params?: Record<string, string>) =>
    api.get<any>(`${EXPENSES_URL}/my`, params),

  getPendingApprovals: (params?: Record<string, string>) =>
    api.get<any>(`${EXPENSES_URL}/pending-approvals`, params),

  getSummary: (params?: Record<string, string>) =>
    api.get<any>(`${EXPENSES_URL}/summary`, params),
};

export default expenseService;
