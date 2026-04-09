import api from './api';

const HELPDESK_URL = '/helpdesk';

const helpdeskService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(HELPDESK_URL, params),

  getById: (id: string) =>
    api.get<any>(`${HELPDESK_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(HELPDESK_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${HELPDESK_URL}/${id}`, data),

  assign: (id: string, data: any) =>
    api.put<any>(`${HELPDESK_URL}/${id}/assign`, data),

  addComment: (id: string, data: any) =>
    api.post<any>(`${HELPDESK_URL}/${id}/comment`, data),

  updateStatus: (id: string, data: any) =>
    api.put<any>(`${HELPDESK_URL}/${id}/status`, data),

  close: (id: string, data?: any) =>
    api.put<any>(`${HELPDESK_URL}/${id}/close`, data),

  getMyTickets: (params?: Record<string, string>) =>
    api.get<any>(`${HELPDESK_URL}/my`, params),

  getAssigned: (params?: Record<string, string>) =>
    api.get<any>(`${HELPDESK_URL}/assigned`, params),

  getStats: (params?: Record<string, string>) =>
    api.get<any>(`${HELPDESK_URL}/stats`, params),
};

export default helpdeskService;
