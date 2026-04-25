import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationService from '../../services/locationService';

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (params?: any) => [...locationKeys.lists(), params] as const,
  detail: (id: string) => [...locationKeys.all, 'detail', id] as const,
};

export function useLocationList(params?: any) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => locationService.getAll(params),
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => locationService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => locationService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: locationKeys.all }); },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => locationService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: locationKeys.all }); },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: locationKeys.lists() }); },
  });
}
