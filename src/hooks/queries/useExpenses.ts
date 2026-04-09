import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseService from '../../services/expenseService';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: any) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  my: (params?: any) => [...expenseKeys.all, 'my', params] as const,
  pendingApprovals: (params?: any) => [...expenseKeys.all, 'pending-approvals', params] as const,
  summary: (params?: any) => [...expenseKeys.all, 'summary', params] as const,
};

export function useExpenseList(params?: any) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseService.getAll(params),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
  });
}

export function useMyExpenses(params?: any) {
  return useQuery({
    queryKey: expenseKeys.my(params),
    queryFn: () => expenseService.getMyExpenses(params),
  });
}

export function usePendingExpenseApprovals(params?: any) {
  return useQuery({
    queryKey: expenseKeys.pendingApprovals(params),
    queryFn: () => expenseService.getPendingApprovals(params),
  });
}

export function useExpenseSummary(params?: any) {
  return useQuery({
    queryKey: expenseKeys.summary(params),
    queryFn: () => expenseService.getSummary(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useSubmitExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => expenseService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => expenseService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useReimburseExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => expenseService.reimburse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}
