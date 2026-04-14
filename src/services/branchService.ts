import api from './api';

const BRANCHES_URL = '/branches';

const branchService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(BRANCHES_URL, params),

  getById: (id: string) =>
    api.get<any>(`${BRANCHES_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(BRANCHES_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${BRANCHES_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${BRANCHES_URL}/${id}`),
};

export default branchService;
