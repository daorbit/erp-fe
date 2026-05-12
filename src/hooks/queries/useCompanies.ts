import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import companyService from '../../services/companyService';

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (params: any) => [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

export function useCompanyList(params?: any) {
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => companyService.getAll(params),
  });
}

export function useMyCompany() {
  return useQuery({
    queryKey: [...companyKeys.all, 'me'] as const,
    queryFn: () => companyService.getMyCompany(),
  });
}

/** Returns all companies in the user's group (main + siblings) as Select options. */
export function useGroupCompanies() {
  const { data, isLoading } = useQuery({
    queryKey: [...companyKeys.all, 'group'] as const,
    queryFn: () => companyService.getAll(),
  });
  const companies: any[] = (data as any)?.data ?? [];
  const companyOptions = companies.map((c: any) => ({
    value: c._id || c.id,
    label: c.name,
  }));
  const firstCompanyId: string | undefined = companies[0]?._id || companies[0]?.id;
  return { companyOptions, firstCompanyId, isLoading, companies };
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companyService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => companyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}
