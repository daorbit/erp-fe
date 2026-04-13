import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import parentDepartmentService from '../../services/parentDepartmentService';

export const parentDepartmentKeys = {
  all: ['parent-departments'] as const,
  lists: () => [...parentDepartmentKeys.all, 'list'] as const,
  list: (params: any) => [...parentDepartmentKeys.lists(), params] as const,
  details: () => [...parentDepartmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...parentDepartmentKeys.details(), id] as const,
};

export function useParentDepartmentList(params?: any) {
  return useQuery({
    queryKey: parentDepartmentKeys.list(params),
    queryFn: () => parentDepartmentService.getAll(params),
  });
}

export function useCreateParentDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => parentDepartmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentDepartmentKeys.lists() });
    },
  });
}

export function useUpdateParentDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => parentDepartmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentDepartmentKeys.all });
    },
  });
}

export function useDeleteParentDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parentDepartmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentDepartmentKeys.lists() });
    },
  });
}
