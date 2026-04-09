import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import helpdeskService from '../../services/helpdeskService';

export const helpdeskKeys = {
  all: ['helpdesk'] as const,
  lists: () => [...helpdeskKeys.all, 'list'] as const,
  list: (params: any) => [...helpdeskKeys.lists(), params] as const,
  details: () => [...helpdeskKeys.all, 'detail'] as const,
  detail: (id: string) => [...helpdeskKeys.details(), id] as const,
  my: (params?: any) => [...helpdeskKeys.all, 'my', params] as const,
  assigned: (params?: any) => [...helpdeskKeys.all, 'assigned', params] as const,
  stats: (params?: any) => [...helpdeskKeys.all, 'stats', params] as const,
};

export function useTicketList(params?: any) {
  return useQuery({
    queryKey: helpdeskKeys.list(params),
    queryFn: () => helpdeskService.getAll(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: helpdeskKeys.detail(id),
    queryFn: () => helpdeskService.getById(id),
    enabled: !!id,
  });
}

export function useMyTickets(params?: any) {
  return useQuery({
    queryKey: helpdeskKeys.my(params),
    queryFn: () => helpdeskService.getMyTickets(params),
  });
}

export function useAssignedTickets(params?: any) {
  return useQuery({
    queryKey: helpdeskKeys.assigned(params),
    queryFn: () => helpdeskService.getAssigned(params),
  });
}

export function useHelpdeskStats(params?: any) {
  return useQuery({
    queryKey: helpdeskKeys.stats(params),
    queryFn: () => helpdeskService.getStats(params),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => helpdeskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.lists() });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => helpdeskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => helpdeskService.assign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => helpdeskService.addComment(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.detail(variables.id) });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => helpdeskService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}

export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => helpdeskService.close(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helpdeskKeys.all });
    },
  });
}
