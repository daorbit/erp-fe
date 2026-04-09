import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recruitmentService from '../../services/recruitmentService';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  jobs: () => [...recruitmentKeys.all, 'jobs'] as const,
  jobList: (params?: any) => [...recruitmentKeys.jobs(), 'list', params] as const,
  jobDetail: (id: string) => [...recruitmentKeys.jobs(), 'detail', id] as const,
  jobStats: (jobId: string) => [...recruitmentKeys.jobs(), 'stats', jobId] as const,
  applications: () => [...recruitmentKeys.all, 'applications'] as const,
  applicationList: (params?: any) => [...recruitmentKeys.applications(), 'list', params] as const,
  applicationDetail: (id: string) => [...recruitmentKeys.applications(), 'detail', id] as const,
  applicationsByJob: (jobId: string, params?: any) => [...recruitmentKeys.applications(), 'by-job', jobId, params] as const,
};

// ─── Job Postings ───────────────────────────────────────────────────────────

export function useJobList(params?: any) {
  return useQuery({
    queryKey: recruitmentKeys.jobList(params),
    queryFn: () => recruitmentService.getAllJobs(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: recruitmentKeys.jobDetail(id),
    queryFn: () => recruitmentService.getJobById(id),
    enabled: !!id,
  });
}

export function useJobStats(jobId: string) {
  return useQuery({
    queryKey: recruitmentKeys.jobStats(jobId),
    queryFn: () => recruitmentService.getJobStats(jobId),
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => recruitmentService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => recruitmentService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => recruitmentService.updateJobStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.jobs() });
    },
  });
}

// ─── Applications ───────────────────────────────────────────────────────────

export function useApplicationList(params?: any) {
  return useQuery({
    queryKey: recruitmentKeys.applicationList(params),
    queryFn: () => recruitmentService.getAllApplications(params),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: recruitmentKeys.applicationDetail(id),
    queryFn: () => recruitmentService.getApplicationById(id),
    enabled: !!id,
  });
}

export function useApplicationsByJob(jobId: string, params?: any) {
  return useQuery({
    queryKey: recruitmentKeys.applicationsByJob(jobId, params),
    queryFn: () => recruitmentService.getApplicationsByJob(jobId, params),
    enabled: !!jobId,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => recruitmentService.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      recruitmentService.updateApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      recruitmentService.scheduleInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.applications() });
    },
  });
}
