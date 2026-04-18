import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import employeeGroupService from '../../services/employeeGroupService';

export const employeeGroupKeys = {
  all: ['employee-groups'] as const,
  lists: () => [...employeeGroupKeys.all, 'list'] as const,
  list: (params: any) => [...employeeGroupKeys.lists(), params] as const,
  detail: (id: string) => [...employeeGroupKeys.all, 'detail', id] as const,
};

export function useEmployeeGroupList(params?: any) {
  return useQuery({
    queryKey: employeeGroupKeys.list(params),
    queryFn: () => employeeGroupService.getAll(params),
  });
}

export function useEmployeeGroup(id: string) {
  return useQuery({
    queryKey: employeeGroupKeys.detail(id),
    queryFn: () => employeeGroupService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployeeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => employeeGroupService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeGroupKeys.lists() }),
  });
}

export function useUpdateEmployeeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => employeeGroupService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeGroupKeys.all }),
  });
}

export function useDeleteEmployeeGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeGroupService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeGroupKeys.lists() }),
  });
}
