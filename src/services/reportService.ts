import api from './api';

const REPORTS_URL = '/reports';

const reportService = {
  getEmployeeReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/employees`, params),

  getAttendanceReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/attendance`, params),

  getLeaveReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/leaves`, params),

  getPayrollReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/payroll`, params),

  getRecruitmentReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/recruitment`, params),

  getExpenseReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/expenses`, params),

  getHeadcountReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/headcount`, params),

  getTurnoverReport: (params?: Record<string, string>) =>
    api.get<any>(`${REPORTS_URL}/turnover`, params),
};

export default reportService;
