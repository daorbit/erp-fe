import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import leaveService from '../../services/leaveService';

export const leaveKeys = {
  all: ['leaves'] as const,
  lists: () => [...leaveKeys.all, 'list'] as const,
  list: (params: any) => [...leaveKeys.lists(), params] as const,
  details: () => [...leaveKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveKeys.details(), id] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  typeList: (params?: any) => [...leaveKeys.types(), 'list', params] as const,
  typeDetail: (id: string) => [...leaveKeys.types(), 'detail', id] as const,
  my: (params?: any) => [...leaveKeys.all, 'my', params] as const,
  pendingApprovals: (params?: any) => [...leaveKeys.all, 'pending-approvals', params] as const,
  balance: (employeeId: string) => [...leaveKeys.all, 'balance', employeeId] as const,
};

// ─── Leave Types ────────────────────────────────────────────────────────────

export function useLeaveTypeList(params?: any) {
  return useQuery({
    queryKey: leaveKeys.typeList(params),
    queryFn: () => leaveService.getAllTypes(params),
  });
}

export function useLeaveType(id: string) {
  return useQuery({
    queryKey: leaveKeys.typeDetail(id),
    queryFn: () => leaveService.getTypeById(id),
    enabled: !!id,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => leaveService.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => leaveService.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveService.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.types() });
    },
  });
}

// ─── Leave Requests ─────────────────────────────────────────────────────────

export function useLeaveList(params?: any) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: () => leaveService.getAll(params),
  });
}

export function useLeave(id: string) {
  return useQuery({
    queryKey: leaveKeys.detail(id),
    queryFn: () => leaveService.getById(id),
    enabled: !!id,
  });
}

export function useMyLeaves(params?: any) {
  return useQuery({
    queryKey: leaveKeys.my(params),
    queryFn: () => leaveService.getMyLeaves(params),
  });
}

export function usePendingLeaveApprovals(params?: any) {
  return useQuery({
    queryKey: leaveKeys.pendingApprovals(params),
    queryFn: () => leaveService.getPendingApprovals(params),
  });
}

export function useLeaveBalance(employeeId: string) {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId),
    queryFn: () => leaveService.getBalance(employeeId),
    enabled: !!employeeId,
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => leaveService.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => leaveService.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => leaveService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}
