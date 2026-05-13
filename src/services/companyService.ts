import api from './api';

const COMPANIES_URL = '/companies';

const companyService = {
  getMyCompany: () =>
    api.get<any>(`${COMPANIES_URL}/me`),

  /** Returns parent + all siblings for the context switcher dropdown. */
  getGroup: () =>
    api.get<any[]>(`${COMPANIES_URL}/group`),

  getAll: (params?: Record<string, string>) =>
    api.get<any>(COMPANIES_URL, params),

  getById: (id: string) =>
    api.get<any>(`${COMPANIES_URL}/${id}`),

  create: (data: any) =>
    api.post<any>(COMPANIES_URL, data),

  update: (id: string, data: any) =>
    api.put<any>(`${COMPANIES_URL}/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`${COMPANIES_URL}/${id}`),
};

export default companyService;
