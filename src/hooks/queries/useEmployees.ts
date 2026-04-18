import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import employeeService from '../../services/employeeService';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: any) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  attendance: (id: string, month?: string) => [...employeeKeys.detail(id), 'attendance', month] as const,
  payslips: (id: string) => [...employeeKeys.detail(id), 'payslips'] as const,
  timeline: (id: string) => [...employeeKeys.detail(id), 'timeline'] as const,
};

export function useEmployeeList(params?: any) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.getAll(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useEmployeeAttendance(id: string, month?: string) {
  return useQuery({
    queryKey: employeeKeys.attendance(id, month),
    queryFn: () => employeeService.getAttendance(id, month),
    enabled: !!id,
  });
}

export function useEmployeePayslips(id: string) {
  return useQuery({
    queryKey: employeeKeys.payslips(id),
    queryFn: () => employeeService.getPayslips(id),
    enabled: !!id,
  });
}

export function useEmployeeTimeline(id: string) {
  return useQuery({
    queryKey: employeeKeys.timeline(id),
    queryFn: () => employeeService.getTimeline(id),
    enabled: !!id,
  });
}

export function useUploadEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      employeeService.uploadDocument(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
