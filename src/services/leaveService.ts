import api from './api';

const LEAVES_URL = '/leaves';

const leaveService = {
  // ─── Leave Types ────────────────────────────────────────────────────────────
  getAllTypes: (params?: Record<string, string>) =>
    api.get<any>(`${LEAVES_URL}/types`, params),

  getTypeById: (id: string) =>
    api.get<any>(`${LEAVES_URL}/types/${id}`),

  createType: (data: any) =>
    api.post<any>(`${LEAVES_URL}/types`, data),

  updateType: (id: string, data: any) =>
    api.put<any>(`${LEAVES_URL}/types/${id}`, data),

  deleteType: (id: string) =>
    api.delete<void>(`${LEAVES_URL}/types/${id}`),

  // ─── Leave Requests ─────────────────────────────────────────────────────────
  getAll: (params?: Record<string, string>) =>
    api.get<any>(LEAVES_URL, params),

  getById: (id: string) =>
    api.get<any>(`${LEAVES_URL}/${id}`),

  apply: (data: any) =>
    api.post<any>(`${LEAVES_URL}/apply`, data),

  approve: (id: string, data?: any) =>
    api.put<any>(`${LEAVES_URL}/${id}/approve`, data),

  reject: (id: string, data?: any) =>
    api.put<any>(`${LEAVES_URL}/${id}/reject`, data),

  cancel: (id: string) =>
    api.put<any>(`${LEAVES_URL}/${id}/cancel`),

  getMyLeaves: (params?: Record<string, string>) =>
    api.get<any>(`${LEAVES_URL}/my`, params),

  getPendingApprovals: (params?: Record<string, string>) =>
    api.get<any>(`${LEAVES_URL}/pending-approvals`, params),

  getBalance: (employeeId: string) =>
    api.get<any>(`${LEAVES_URL}/balance/${employeeId}`),
};

export default leaveService;
