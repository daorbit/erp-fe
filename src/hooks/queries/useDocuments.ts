import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentService from '../../services/documentService';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: any) => [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  byEmployee: (employeeId: string, params?: any) => [...documentKeys.all, 'employee', employeeId, params] as const,
  public: (params?: any) => [...documentKeys.all, 'public', params] as const,
  byCategory: (category: string, params?: any) => [...documentKeys.all, 'category', category, params] as const,
};

export function useDocumentList(params?: any) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentService.getAll(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  });
}

export function useDocumentsByEmployee(employeeId: string, params?: any) {
  return useQuery({
    queryKey: documentKeys.byEmployee(employeeId, params),
    queryFn: () => documentService.getByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
}

export function usePublicDocuments(params?: any) {
  return useQuery({
    queryKey: documentKeys.public(params),
    queryFn: () => documentService.getPublic(params),
  });
}

export function useDocumentsByCategory(category: string, params?: any) {
  return useQuery({
    queryKey: documentKeys.byCategory(category, params),
    queryFn: () => documentService.getByCategory(category, params),
    enabled: !!category,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => documentService.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => documentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
