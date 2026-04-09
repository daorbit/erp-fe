import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import designationService from '../../services/designationService';

export const designationKeys = {
  all: ['designations'] as const,
  lists: () => [...designationKeys.all, 'list'] as const,
  list: (params: any) => [...designationKeys.lists(), params] as const,
  details: () => [...designationKeys.all, 'detail'] as const,
  detail: (id: string) => [...designationKeys.details(), id] as const,
};

export function useDesignationList(params?: any) {
  return useQuery({
    queryKey: designationKeys.list(params),
    queryFn: () => designationService.getAll(params),
  });
}

export function useDesignation(id: string) {
  return useQuery({
    queryKey: designationKeys.detail(id),
    queryFn: () => designationService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => designationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.lists() });
    },
  });
}

export function useUpdateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => designationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

export function useDeleteDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.lists() });
    },
  });
}
