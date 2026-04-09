import api from './api';

const AUTH_URL = '/auth';

const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; refreshToken: string; user: any }>(`${AUTH_URL}/login`, data),

  register: (data: any) =>
    api.post<{ token: string; user: any }>(`${AUTH_URL}/register`, data),

  refreshToken: (data: { refreshToken: string }) =>
    api.post<{ token: string; refreshToken: string }>(`${AUTH_URL}/refresh-token`, data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<void>(`${AUTH_URL}/change-password`, data),

  getProfile: () =>
    api.get<any>(`${AUTH_URL}/profile`),

  updateProfile: (data: any) =>
    api.put<any>(`${AUTH_URL}/profile`, data),
};

export default authService;
