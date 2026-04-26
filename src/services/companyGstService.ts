import api from './api';

const URL = '/company-gsts';

const companyGstService = {
  getAll: (params?: Record<string, string>) => api.get<any>(URL, params),
  getById: (id: string) => api.get<any>(`${URL}/${id}`),
  create: (data: any) => api.post<any>(URL, data),
  update: (id: string, data: any) => api.put<any>(`${URL}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${URL}/${id}`),
  addAddress: (id: string, data: any) => api.post<any>(`${URL}/${id}/addresses`, data),
  updateAddress: (id: string, addressId: string, data: any) =>
    api.put<any>(`${URL}/${id}/addresses/${addressId}`, data),
  removeAddress: (id: string, addressId: string) =>
    api.delete<void>(`${URL}/${id}/addresses/${addressId}`),
  saveEInvoice: (id: string, data: { apiUser: string; apiPassword: string }) =>
    api.put<any>(`${URL}/${id}/e-invoice`, data),
};

export default companyGstService;
