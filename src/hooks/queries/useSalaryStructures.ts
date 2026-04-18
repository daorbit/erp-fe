import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import salaryStructureService from '../../services/salaryStructureService';

export const salaryStructureKeys = {
  all: ['salary-structures'] as const,
  lists: () => [...salaryStructureKeys.all, 'list'] as const,
  list: (params: any) => [...salaryStructureKeys.lists(), params] as const,
  detail: (id: string) => [...salaryStructureKeys.all, 'detail', id] as const,
  heads: (id: string) => [...salaryStructureKeys.detail(id), 'heads'] as const,
};

export function useSalaryStructureList(params?: any) {
  return useQuery({
    queryKey: salaryStructureKeys.list(params),
    queryFn: () => salaryStructureService.getAll(params),
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: salaryStructureKeys.detail(id),
    queryFn: () => salaryStructureService.getById(id),
    enabled: !!id,
  });
}

export function useSalaryStructureHeads(structureId: string) {
  return useQuery({
    queryKey: salaryStructureKeys.heads(structureId),
    queryFn: () => salaryStructureService.getAssignedHeads(structureId),
    enabled: !!structureId,
  });
}

export function useCreateSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salaryStructureService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.lists() }),
  });
}

export function useUpdateSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salaryStructureService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.all }),
  });
}

export function useDeleteSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryStructureService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.lists() }),
  });
}

export function useAssignSalaryHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salaryStructureService.assignHead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.all }),
  });
}

export function useUpdateAssignedHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salaryStructureService.updateAssignedHead(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.all }),
  });
}

export function useRemoveAssignedHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryStructureService.removeAssignedHead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryStructureKeys.all }),
  });
}
