import api from './api';

const RECRUITMENT_URL = '/recruitment';

const recruitmentService = {
  // ─── Job Postings ───────────────────────────────────────────────────────────
  getAllJobs: (params?: Record<string, string>) =>
    api.get<any>(`${RECRUITMENT_URL}/jobs`, params),

  getJobById: (id: string) =>
    api.get<any>(`${RECRUITMENT_URL}/jobs/${id}`),

  createJob: (data: any) =>
    api.post<any>(`${RECRUITMENT_URL}/jobs`, data),

  updateJob: (id: string, data: any) =>
    api.put<any>(`${RECRUITMENT_URL}/jobs/${id}`, data),

  deleteJob: (id: string) =>
    api.delete<void>(`${RECRUITMENT_URL}/jobs/${id}`),

  updateJobStatus: (id: string, data: any) =>
    api.put<any>(`${RECRUITMENT_URL}/jobs/${id}/status`, data),

  getJobStats: (jobId: string) =>
    api.get<any>(`${RECRUITMENT_URL}/jobs/${jobId}/stats`),

  // ─── Applications ───────────────────────────────────────────────────────────
  getAllApplications: (params?: Record<string, string>) =>
    api.get<any>(`${RECRUITMENT_URL}/applications`, params),

  getApplicationById: (id: string) =>
    api.get<any>(`${RECRUITMENT_URL}/applications/${id}`),

  createApplication: (data: any) =>
    api.post<any>(`${RECRUITMENT_URL}/applications`, data),

  updateApplicationStatus: (id: string, data: any) =>
    api.put<any>(`${RECRUITMENT_URL}/applications/${id}`, data),

  scheduleInterview: (id: string, data: any) =>
    api.put<any>(`${RECRUITMENT_URL}/applications/${id}/schedule-interview`, data),

  getApplicationsByJob: (jobId: string, params?: Record<string, string>) =>
    api.get<any>(`${RECRUITMENT_URL}/jobs/${jobId}/applications`, params),
};

export default recruitmentService;
