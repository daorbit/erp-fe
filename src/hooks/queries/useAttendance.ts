import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../../services/attendanceService';

export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (params: any) => [...attendanceKeys.lists(), params] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  my: (params?: any) => [...attendanceKeys.all, 'my', params] as const,
  summary: (employeeId: string, params?: any) => [...attendanceKeys.all, 'summary', employeeId, params] as const,
  dailyReport: (params?: any) => [...attendanceKeys.all, 'daily-report', params] as const,
};

export function useAttendanceList(params?: any) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceService.getAll(params),
  });
}

export function useAttendance(id: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceService.getById(id),
    enabled: !!id,
  });
}

export function useMyAttendance(params?: any) {
  return useQuery({
    queryKey: attendanceKeys.my(params),
    queryFn: () => attendanceService.getMyAttendance(params),
  });
}

export function useAttendanceSummary(employeeId: string, params?: any) {
  return useQuery({
    queryKey: attendanceKeys.summary(employeeId, params),
    queryFn: () => attendanceService.getSummary(employeeId, params),
    enabled: !!employeeId,
  });
}

export function useDailyReport(params?: any) {
  return useQuery({
    queryKey: attendanceKeys.dailyReport(params),
    queryFn: () => attendanceService.getDailyReport(params),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => attendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => attendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => attendanceService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => attendanceService.bulkMark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
