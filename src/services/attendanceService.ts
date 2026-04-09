import api from './api';

const ATTENDANCE_URL = '/attendance';

const attendanceService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(ATTENDANCE_URL, params),

  getById: (id: string) =>
    api.get<any>(`${ATTENDANCE_URL}/${id}`),

  checkIn: (data: any) =>
    api.post<any>(`${ATTENDANCE_URL}/check-in`, data),

  checkOut: (data: any) =>
    api.post<any>(`${ATTENDANCE_URL}/check-out`, data),

  getMyAttendance: (params?: Record<string, string>) =>
    api.get<any>(`${ATTENDANCE_URL}/my`, params),

  getSummary: (employeeId: string, params?: Record<string, string>) =>
    api.get<any>(`${ATTENDANCE_URL}/summary/${employeeId}`, params),

  getDailyReport: (params?: Record<string, string>) =>
    api.get<any>(`${ATTENDANCE_URL}/daily-report`, params),

  markAttendance: (data: any) =>
    api.post<any>(`${ATTENDANCE_URL}/mark`, data),

  bulkMark: (data: any) =>
    api.post<any>(`${ATTENDANCE_URL}/bulk-mark`, data),
};

export default attendanceService;
