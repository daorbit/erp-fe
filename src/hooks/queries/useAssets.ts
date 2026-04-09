import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import assetService from '../../services/assetService';

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (params: any) => [...assetKeys.lists(), params] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  byEmployee: (employeeId: string, params?: any) => [...assetKeys.all, 'employee', employeeId, params] as const,
  available: (params?: any) => [...assetKeys.all, 'available', params] as const,
  maintenanceDue: (params?: any) => [...assetKeys.all, 'maintenance-due', params] as const,
};

export function useAssetList(params?: any) {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => assetService.getAll(params),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: assetKeys.detail(id),
    queryFn: () => assetService.getById(id),
    enabled: !!id,
  });
}

export function useAssetsByEmployee(employeeId: string, params?: any) {
  return useQuery({
    queryKey: assetKeys.byEmployee(employeeId, params),
    queryFn: () => assetService.getByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
}

export function useAvailableAssets(params?: any) {
  return useQuery({
    queryKey: assetKeys.available(params),
    queryFn: () => assetService.getAvailable(params),
  });
}

export function useMaintenanceDueAssets(params?: any) {
  return useQuery({
    queryKey: assetKeys.maintenanceDue(params),
    queryFn: () => assetService.getMaintenanceDue(params),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => assetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetService.assign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}

export function useReturnAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => assetService.return(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
