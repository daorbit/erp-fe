import api from './api';

const URL = '/onboarding';

const onboardingService = {
  getMe: () => api.get<any>(`${URL}/me`),
  getAll: () => api.get<any>(URL),
  getByUser: (userId: string) => api.get<any>(`${URL}/${userId}`),
  saveStep: (step: number, data: any) => api.patch<any>(`${URL}/me/step/${step}`, data),
  submit: () => api.post<any>(`${URL}/me/submit`),
  adminUpdate: (userId: string, data: any) => api.put<any>(`${URL}/${userId}`, data),
  adminSaveStep: (userId: string, step: number, data: any) => api.patch<any>(`${URL}/${userId}/step/${step}`, data),
  adminSubmit: (userId: string) => api.post<any>(`${URL}/${userId}/submit`),
  review: (userId: string, action: string, remarks?: string) =>
    api.patch<any>(`${URL}/${userId}/review`, { action, remarks }),
  delete: (userId: string) =>
    api.delete<void>(`${URL}/${userId}`),
};

export default onboardingService;
