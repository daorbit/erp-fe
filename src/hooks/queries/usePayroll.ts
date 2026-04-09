import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import payrollService from '../../services/payrollService';

export const payrollKeys = {
  all: ['payroll'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  list: (params: any) => [...payrollKeys.lists(), params] as const,
  details: () => [...payrollKeys.all, 'detail'] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
  structures: () => [...payrollKeys.all, 'structures'] as const,
  structureList: (params?: any) => [...payrollKeys.structures(), 'list', params] as const,
  structureDetail: (id: string) => [...payrollKeys.structures(), 'detail', id] as const,
  structureByEmployee: (employeeId: string) => [...payrollKeys.structures(), 'employee', employeeId] as const,
  my: (params?: any) => [...payrollKeys.all, 'my', params] as const,
  summary: (params?: any) => [...payrollKeys.all, 'summary', params] as const,
};

// ─── Salary Structures ──────────────────────────────────────────────────────

export function useSalaryStructureList(params?: any) {
  return useQuery({
    queryKey: payrollKeys.structureList(params),
    queryFn: () => payrollService.getAllStructures(params),
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: payrollKeys.structureDetail(id),
    queryFn: () => payrollService.getStructureById(id),
    enabled: !!id,
  });
}

export function useSalaryStructureByEmployee(employeeId: string) {
  return useQuery({
    queryKey: payrollKeys.structureByEmployee(employeeId),
    queryFn: () => payrollService.getStructureByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

export function useUpdateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => payrollService.updateStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.structures() });
    },
  });
}

// ─── Payslips ───────────────────────────────────────────────────────────────

export function usePayslipList(params?: any) {
  return useQuery({
    queryKey: payrollKeys.list(params),
    queryFn: () => payrollService.getAll(params),
  });
}

export function usePayslip(id: string) {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: () => payrollService.getById(id),
    enabled: !!id,
  });
}

export function useMyPayslips(params?: any) {
  return useQuery({
    queryKey: payrollKeys.my(params),
    queryFn: () => payrollService.getMyPayslips(params),
  });
}

export function usePayrollSummary(params?: any) {
  return useQuery({
    queryKey: payrollKeys.summary(params),
    queryFn: () => payrollService.getSummary(params),
  });
}

export function useGeneratePayslip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
    },
  });
}

export function useBulkGeneratePayslips() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.bulkGenerate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.lists() });
    },
  });
}

export function useApprovePayslip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}

export function useMarkPayslipPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => payrollService.markPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
}
