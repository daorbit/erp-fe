import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (params?: any) => [...dashboardKeys.all, 'stats', params] as const,
  attendanceOverview: (params?: any) => [...dashboardKeys.all, 'attendance-overview', params] as const,
  leaveOverview: (params?: any) => [...dashboardKeys.all, 'leave-overview', params] as const,
  departmentDistribution: (params?: any) => [...dashboardKeys.all, 'department-distribution', params] as const,
  recentActivities: (params?: any) => [...dashboardKeys.all, 'recent-activities', params] as const,
  birthdays: (params?: any) => [...dashboardKeys.all, 'birthdays', params] as const,
  anniversaries: (params?: any) => [...dashboardKeys.all, 'anniversaries', params] as const,
};

export function useDashboardStats(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.stats(params),
    queryFn: () => dashboardService.getStats(params),
  });
}

export function useAttendanceOverview(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.attendanceOverview(params),
    queryFn: () => dashboardService.getAttendanceOverview(params),
  });
}

export function useLeaveOverview(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.leaveOverview(params),
    queryFn: () => dashboardService.getLeaveOverview(params),
  });
}

export function useDepartmentDistribution(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.departmentDistribution(params),
    queryFn: () => dashboardService.getDepartmentDistribution(params),
  });
}

export function useRecentActivities(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.recentActivities(params),
    queryFn: () => dashboardService.getRecentActivities(params),
  });
}

export function useBirthdays(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.birthdays(params),
    queryFn: () => dashboardService.getBirthdays(params),
  });
}

export function useAnniversaries(params?: any) {
  return useQuery({
    queryKey: dashboardKeys.anniversaries(params),
    queryFn: () => dashboardService.getAnniversaries(params),
  });
}
