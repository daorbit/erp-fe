import api from './api';

const PERFORMANCE_URL = '/performance';

const performanceService = {
  // ─── Reviews ────────────────────────────────────────────────────────────────
  getAll: (params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/reviews`, params),

  getById: (id: string) =>
    api.get<any>(`${PERFORMANCE_URL}/reviews/${id}`),

  create: (data: any) =>
    api.post<any>(`${PERFORMANCE_URL}/reviews`, data),

  update: (id: string, data: any) =>
    api.put<any>(`${PERFORMANCE_URL}/reviews/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${PERFORMANCE_URL}/reviews/${id}`),

  submit: (id: string) =>
    api.put<any>(`${PERFORMANCE_URL}/reviews/${id}/submit`),

  getMyReviews: (params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/reviews/my`, params),

  getPendingReviews: (params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/reviews/pending`, params),

  // ─── Goals ──────────────────────────────────────────────────────────────────
  getAllGoals: (params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/goals`, params),

  getGoalById: (id: string) =>
    api.get<any>(`${PERFORMANCE_URL}/goals/${id}`),

  createGoal: (data: any) =>
    api.post<any>(`${PERFORMANCE_URL}/goals`, data),

  updateGoal: (id: string, data: any) =>
    api.put<any>(`${PERFORMANCE_URL}/goals/${id}`, data),

  deleteGoal: (id: string) =>
    api.delete<void>(`${PERFORMANCE_URL}/goals/${id}`),

  updateProgress: (id: string, data: any) =>
    api.put<any>(`${PERFORMANCE_URL}/goals/${id}/progress`, data),

  getMyGoals: (params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/goals/my`, params),

  getGoalsByEmployee: (employeeId: string, params?: Record<string, string>) =>
    api.get<any>(`${PERFORMANCE_URL}/goals/employee/${employeeId}`, params),
};

export default performanceService;
