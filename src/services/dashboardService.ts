import api from './api';

const DASHBOARD_URL = '/dashboard';

const platformDashboardService = {
  getStats: () =>
    api.get<any>(`${DASHBOARD_URL}/platform/stats`),

  getCompanyOverviews: () =>
    api.get<any>(`${DASHBOARD_URL}/platform/company-overviews`),

  getCompanyGrowth: () =>
    api.get<any>(`${DASHBOARD_URL}/platform/company-growth`),

  getUserDistribution: () =>
    api.get<any>(`${DASHBOARD_URL}/platform/user-distribution`),
};

const dashboardService = {
  getStats: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/stats`, params),

  getAttendanceOverview: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/attendance-overview`, params),

  getLeaveOverview: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/leave-overview`, params),

  getDepartmentDistribution: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/department-distribution`, params),

  getRecentActivities: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/recent-activities`, params),

  getBirthdays: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/birthdays`, params),

  getAnniversaries: (params?: Record<string, string>) =>
    api.get<any>(`${DASHBOARD_URL}/anniversaries`, params),
};

export { platformDashboardService };
export default dashboardService;
