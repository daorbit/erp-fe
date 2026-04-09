import { useQuery } from '@tanstack/react-query';
import reportService from '../../services/reportService';

export const reportKeys = {
  all: ['reports'] as const,
  employees: (params?: any) => [...reportKeys.all, 'employees', params] as const,
  attendance: (params?: any) => [...reportKeys.all, 'attendance', params] as const,
  leaves: (params?: any) => [...reportKeys.all, 'leaves', params] as const,
  payroll: (params?: any) => [...reportKeys.all, 'payroll', params] as const,
  recruitment: (params?: any) => [...reportKeys.all, 'recruitment', params] as const,
  expenses: (params?: any) => [...reportKeys.all, 'expenses', params] as const,
  headcount: (params?: any) => [...reportKeys.all, 'headcount', params] as const,
  turnover: (params?: any) => [...reportKeys.all, 'turnover', params] as const,
};

export function useEmployeeReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.employees(params),
    queryFn: () => reportService.getEmployeeReport(params),
  });
}

export function useAttendanceReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.attendance(params),
    queryFn: () => reportService.getAttendanceReport(params),
  });
}

export function useLeaveReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.leaves(params),
    queryFn: () => reportService.getLeaveReport(params),
  });
}

export function usePayrollReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.payroll(params),
    queryFn: () => reportService.getPayrollReport(params),
  });
}

export function useRecruitmentReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.recruitment(params),
    queryFn: () => reportService.getRecruitmentReport(params),
  });
}

export function useExpenseReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.expenses(params),
    queryFn: () => reportService.getExpenseReport(params),
  });
}

export function useHeadcountReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.headcount(params),
    queryFn: () => reportService.getHeadcountReport(params),
  });
}

export function useTurnoverReport(params?: any) {
  return useQuery({
    queryKey: reportKeys.turnover(params),
    queryFn: () => reportService.getTurnoverReport(params),
  });
}
