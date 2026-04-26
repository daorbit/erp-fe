import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import accountGroupService from '../../services/accountGroupService';

export const accountGroupKeys = {
  all: ['accountGroups'] as const,
  lists: () => [...accountGroupKeys.all, 'list'] as const,
  list: (params?: any) => [...accountGroupKeys.lists(), params] as const,
  detail: (id: string) => [...accountGroupKeys.all, 'detail', id] as const,
};

export function useAccountGroupList(params?: any) {
  return useQuery({
    queryKey: accountGroupKeys.list(params),
    queryFn: () => accountGroupService.getAll(params),
  });
}

export function useAccountGroup(id: string) {
  return useQuery({
    queryKey: accountGroupKeys.detail(id),
    queryFn: () => accountGroupService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAccountGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => accountGroupService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountGroupKeys.lists() }),
  });
}

export function useUpdateAccountGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      accountGroupService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountGroupKeys.all }),
  });
}

export function useDeleteAccountGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountGroupService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountGroupKeys.lists() }),
  });
}
