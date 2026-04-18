import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import departmentService from '../../services/departmentService';

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: any) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  employees: (id: string) => [...departmentKeys.detail(id), 'employees'] as const,
};

export function useDepartmentList(params?: any) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentService.getAll(params),
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

export function useDepartmentEmployees(id: string) {
  return useQuery({
    queryKey: departmentKeys.employees(id),
    queryFn: () => departmentService.getEmployees(id),
    enabled: !!id,
  });
}

export function useMergeDepartments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fromDepartment: string; toDepartment: string }) =>
      departmentService.merge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}
