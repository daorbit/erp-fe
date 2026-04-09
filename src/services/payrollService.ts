import api from './api';

const PAYROLL_URL = '/payroll';

const payrollService = {
  // ─── Salary Structures ──────────────────────────────────────────────────────
  getAllStructures: (params?: Record<string, string>) =>
    api.get<any>(`${PAYROLL_URL}/salary-structure`, params),

  getStructureById: (id: string) =>
    api.get<any>(`${PAYROLL_URL}/salary-structure/${id}`),

  getStructureByEmployee: (employeeId: string) =>
    api.get<any>(`${PAYROLL_URL}/salary-structure/employee/${employeeId}`),

  createStructure: (data: any) =>
    api.post<any>(`${PAYROLL_URL}/salary-structure`, data),

  updateStructure: (id: string, data: any) =>
    api.put<any>(`${PAYROLL_URL}/salary-structure/${id}`, data),

  // ─── Payslips ───────────────────────────────────────────────────────────────
  getAll: (params?: Record<string, string>) =>
    api.get<any>(PAYROLL_URL, params),

  getById: (id: string) =>
    api.get<any>(`${PAYROLL_URL}/${id}`),

  generate: (data: any) =>
    api.post<any>(`${PAYROLL_URL}/generate`, data),

  bulkGenerate: (data: any) =>
    api.post<any>(`${PAYROLL_URL}/bulk-generate`, data),

  approve: (id: string) =>
    api.put<any>(`${PAYROLL_URL}/${id}/approve`),

  markPaid: (id: string, data?: any) =>
    api.put<any>(`${PAYROLL_URL}/${id}/mark-paid`, data),

  getMyPayslips: (params?: Record<string, string>) =>
    api.get<any>(`${PAYROLL_URL}/my`, params),

  getSummary: (params?: Record<string, string>) =>
    api.get<any>(`${PAYROLL_URL}/summary`, params),
};

export default payrollService;
