import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import holidayService from '../../services/holidayService';

export const holidayKeys = {
  all: ['holidays'] as const,
  lists: () => [...holidayKeys.all, 'list'] as const,
  list: (params: any) => [...holidayKeys.lists(), params] as const,
  details: () => [...holidayKeys.all, 'detail'] as const,
  detail: (id: string) => [...holidayKeys.details(), id] as const,
  byYear: (year: string | number) => [...holidayKeys.all, 'year', year] as const,
  upcoming: (params?: any) => [...holidayKeys.all, 'upcoming', params] as const,
};

export function useHolidayList(params?: any) {
  return useQuery({
    queryKey: holidayKeys.list(params),
    queryFn: () => holidayService.getAll(params),
  });
}

export function useHoliday(id: string) {
  return useQuery({
    queryKey: holidayKeys.detail(id),
    queryFn: () => holidayService.getById(id),
    enabled: !!id,
  });
}

export function useHolidaysByYear(year: string | number) {
  return useQuery({
    queryKey: holidayKeys.byYear(year),
    queryFn: () => holidayService.getByYear(year),
    enabled: !!year,
  });
}

export function useUpcomingHolidays(params?: any) {
  return useQuery({
    queryKey: holidayKeys.upcoming(params),
    queryFn: () => holidayService.getUpcoming(params),
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => holidayService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => holidayService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => holidayService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidayKeys.lists() });
    },
  });
}
