import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import salaryHeadService from '../../services/salaryHeadService';

export const salaryHeadKeys = {
  all: ['salary-heads'] as const,
  lists: () => [...salaryHeadKeys.all, 'list'] as const,
  list: (params: any) => [...salaryHeadKeys.lists(), params] as const,
  detail: (id: string) => [...salaryHeadKeys.all, 'detail', id] as const,
};

export function useSalaryHeadList(params?: any) {
  return useQuery({
    queryKey: salaryHeadKeys.list(params),
    queryFn: () => salaryHeadService.getAll(params),
  });
}

export function useSalaryHead(id: string) {
  return useQuery({
    queryKey: salaryHeadKeys.detail(id),
    queryFn: () => salaryHeadService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSalaryHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salaryHeadService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryHeadKeys.lists() }),
  });
}

export function useUpdateSalaryHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => salaryHeadService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryHeadKeys.all }),
  });
}

export function useDeleteSalaryHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryHeadService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryHeadKeys.lists() }),
  });
}
