import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import trainingService from '../../services/trainingService';

export const trainingKeys = {
  all: ['training'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (params: any) => [...trainingKeys.lists(), params] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
  my: (params?: any) => [...trainingKeys.all, 'my', params] as const,
  upcoming: (params?: any) => [...trainingKeys.all, 'upcoming', params] as const,
};

export function useTrainingList(params?: any) {
  return useQuery({
    queryKey: trainingKeys.list(params),
    queryFn: () => trainingService.getAll(params),
  });
}

export function useTraining(id: string) {
  return useQuery({
    queryKey: trainingKeys.detail(id),
    queryFn: () => trainingService.getById(id),
    enabled: !!id,
  });
}

export function useMyTrainings(params?: any) {
  return useQuery({
    queryKey: trainingKeys.my(params),
    queryFn: () => trainingService.getMyTrainings(params),
  });
}

export function useUpcomingTrainings(params?: any) {
  return useQuery({
    queryKey: trainingKeys.upcoming(params),
    queryFn: () => trainingService.getUpcoming(params),
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => trainingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });
}

export function useEnrollTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainingService.enroll(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useCompleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainingService.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}

export function useDropTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainingService.drop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all });
    },
  });
}
