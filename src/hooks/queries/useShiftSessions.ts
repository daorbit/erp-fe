import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import shiftSessionService, {
  type ListParams,
} from '../../services/shiftSessionService';

export const shiftSessionKeys = {
  all: ['shift-sessions'] as const,
  active: () => [...shiftSessionKeys.all, 'active'] as const,
  myList: (params?: ListParams) => [...shiftSessionKeys.all, 'my', params] as const,
  list: (params?: ListParams) => [...shiftSessionKeys.all, 'list', params] as const,
  detail: (id: string) => [...shiftSessionKeys.all, 'detail', id] as const,
};

export function useActiveShiftSession(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: shiftSessionKeys.active(),
    queryFn: () => shiftSessionService.getActive(),
    refetchInterval: options?.refetchInterval,
  });
}

export function useMyShiftSessions(params?: ListParams) {
  return useQuery({
    queryKey: shiftSessionKeys.myList(params),
    queryFn: () => shiftSessionService.getMy(params),
  });
}

export function useShiftSessions(params?: ListParams) {
  return useQuery({
    queryKey: shiftSessionKeys.list(params),
    queryFn: () => shiftSessionService.getAll(params),
  });
}

export function useShiftSession(id: string | undefined) {
  return useQuery({
    queryKey: shiftSessionKeys.detail(id ?? ''),
    queryFn: () => shiftSessionService.getById(id as string),
    enabled: !!id,
  });
}

export function useStartShiftSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shiftSessionService.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftSessionKeys.all });
    },
  });
}

export function useEndShiftSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof shiftSessionService.end>[1]) =>
      shiftSessionService.end(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shiftSessionKeys.all });
    },
  });
}

export function useTrackShiftLocation() {
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof shiftSessionService.track>[1]) =>
      shiftSessionService.track(id, input),
  });
}
