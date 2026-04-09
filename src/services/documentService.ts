import api from './api';

const DOCUMENTS_URL = '/documents';

const documentService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(DOCUMENTS_URL, params),

  getById: (id: string) =>
    api.get<any>(`${DOCUMENTS_URL}/${id}`),

  upload: (data: any) =>
    api.post<any>(`${DOCUMENTS_URL}/upload`, data),

  update: (id: string, data: any) =>
    api.put<any>(`${DOCUMENTS_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${DOCUMENTS_URL}/${id}`),

  getByEmployee: (employeeId: string, params?: Record<string, string>) =>
    api.get<any>(`${DOCUMENTS_URL}/employee/${employeeId}`, params),

  getPublic: (params?: Record<string, string>) =>
    api.get<any>(`${DOCUMENTS_URL}/public`, params),

  getByCategory: (category: string, params?: Record<string, string>) =>
    api.get<any>(`${DOCUMENTS_URL}/category/${category}`, params),
};

export default documentService;
