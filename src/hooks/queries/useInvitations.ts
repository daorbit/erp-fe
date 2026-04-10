import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invitationService from '../../services/invitationService';

export const invitationKeys = {
  all: ['invitations'] as const,
  list: () => [...invitationKeys.all, 'list'] as const,
  byToken: (token: string) => [...invitationKeys.all, 'token', token] as const,
};

export function useInvitationList() {
  return useQuery({
    queryKey: invitationKeys.list(),
    queryFn: () => invitationService.list(),
  });
}

export function useInvitationByToken(token: string) {
  return useQuery({
    queryKey: invitationKeys.byToken(token),
    queryFn: () => invitationService.getByToken(token),
    enabled: !!token,
    retry: false,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: string; company?: string }) =>
      invitationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.list() });
    },
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (data: { token: string; firstName: string; lastName: string; password: string; phone?: string }) =>
      invitationService.accept(data),
  });
}
