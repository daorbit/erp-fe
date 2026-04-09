import api from './api';

const TRAINING_URL = '/training';

const trainingService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(TRAINING_URL, params),

  getById: (id: string) =>
    api.get<any>(`${TRAINING_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(TRAINING_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${TRAINING_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${TRAINING_URL}/${id}`),

  enroll: (id: string, data: any) =>
    api.post<any>(`${TRAINING_URL}/${id}/enroll`, data),

  complete: (id: string, data: any) =>
    api.put<any>(`${TRAINING_URL}/${id}/complete`, data),

  drop: (id: string, data: any) =>
    api.put<any>(`${TRAINING_URL}/${id}/drop`, data),

  getMyTrainings: (params?: Record<string, string>) =>
    api.get<any>(`${TRAINING_URL}/my`, params),

  getUpcoming: (params?: Record<string, string>) =>
    api.get<any>(`${TRAINING_URL}/upcoming`, params),
};

export default trainingService;
