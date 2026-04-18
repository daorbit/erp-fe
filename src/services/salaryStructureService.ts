import api from './api';

const URL = '/salary-structures';

const salaryStructureService = {
  // Templates
  getAll: (params?: Record<string, string>) => api.get<any>(URL, params),
  getById: (id: string) => api.get<any>(`${URL}/${id}`),
  create: (data: any) => api.post<any>(URL, data),
  update: (id: string, data: any) => api.put<any>(`${URL}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${URL}/${id}`),

  // Assigned heads
  getAssignedHeads: (structureId: string) => api.get<any>(`${URL}/${structureId}/heads`),
  assignHead: (data: any) => api.post<any>(`${URL}/heads`, data),
  updateAssignedHead: (assignmentId: string, data: any) =>
    api.put<any>(`${URL}/heads/${assignmentId}`, data),
  removeAssignedHead: (assignmentId: string) => api.delete<void>(`${URL}/heads/${assignmentId}`),

  /** Bulk: pin a salary structure to many employees at once. */
  bulkAssignToEmployees: (data: { employeeIds: string[]; structure: string; pfApplicable?: boolean; esicApplicable?: boolean }) =>
    api.post<any>(`${URL}/bulk-assign-employees`, data),

  /** Bulk: apply an appraisal % to many employees. */
  bulkAppraisal: (data: { employeeIds: string[]; percent: number }) =>
    api.post<any>(`${URL}/bulk-appraisal`, data),
};

export default salaryStructureService;
