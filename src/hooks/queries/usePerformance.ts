import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import performanceService from '../../services/performanceService';

export const performanceKeys = {
  all: ['performance'] as const,
  reviews: () => [...performanceKeys.all, 'reviews'] as const,
  reviewList: (params?: any) => [...performanceKeys.reviews(), 'list', params] as const,
  reviewDetail: (id: string) => [...performanceKeys.reviews(), 'detail', id] as const,
  myReviews: (params?: any) => [...performanceKeys.reviews(), 'my', params] as const,
  pendingReviews: (params?: any) => [...performanceKeys.reviews(), 'pending', params] as const,
  goals: () => [...performanceKeys.all, 'goals'] as const,
  goalList: (params?: any) => [...performanceKeys.goals(), 'list', params] as const,
  goalDetail: (id: string) => [...performanceKeys.goals(), 'detail', id] as const,
  myGoals: (params?: any) => [...performanceKeys.goals(), 'my', params] as const,
  goalsByEmployee: (employeeId: string, params?: any) => [...performanceKeys.goals(), 'employee', employeeId, params] as const,
};

// ─── Reviews ────────────────────────────────────────────────────────────────

export function useReviewList(params?: any) {
  return useQuery({
    queryKey: performanceKeys.reviewList(params),
    queryFn: () => performanceService.getAll(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: performanceKeys.reviewDetail(id),
    queryFn: () => performanceService.getById(id),
    enabled: !!id,
  });
}

export function useMyReviews(params?: any) {
  return useQuery({
    queryKey: performanceKeys.myReviews(params),
    queryFn: () => performanceService.getMyReviews(params),
  });
}

export function usePendingReviews(params?: any) {
  return useQuery({
    queryKey: performanceKeys.pendingReviews(params),
    queryFn: () => performanceService.getPendingReviews(params),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => performanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => performanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceService.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
    },
  });
}

// ─── Goals ──────────────────────────────────────────────────────────────────

export function useGoalList(params?: any) {
  return useQuery({
    queryKey: performanceKeys.goalList(params),
    queryFn: () => performanceService.getAllGoals(params),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: performanceKeys.goalDetail(id),
    queryFn: () => performanceService.getGoalById(id),
    enabled: !!id,
  });
}

export function useMyGoals(params?: any) {
  return useQuery({
    queryKey: performanceKeys.myGoals(params),
    queryFn: () => performanceService.getMyGoals(params),
  });
}

export function useGoalsByEmployee(employeeId: string, params?: any) {
  return useQuery({
    queryKey: performanceKeys.goalsByEmployee(employeeId, params),
    queryFn: () => performanceService.getGoalsByEmployee(employeeId, params),
    enabled: !!employeeId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => performanceService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => performanceService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => performanceService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => performanceService.updateProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
    },
  });
}
