import api from './api';

const ANNOUNCEMENTS_URL = '/announcements';

const announcementService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(ANNOUNCEMENTS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${ANNOUNCEMENTS_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(ANNOUNCEMENTS_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${ANNOUNCEMENTS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${ANNOUNCEMENTS_URL}/${id}`),

  getActive: (params?: Record<string, string>) =>
    api.get<any>(`${ANNOUNCEMENTS_URL}/active`, params),

  markRead: (id: string) =>
    api.put<any>(`${ANNOUNCEMENTS_URL}/${id}/read`),
};

export default announcementService;
