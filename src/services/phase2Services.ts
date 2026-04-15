// Consolidated services for Phase 2 modules. Each is a thin wrapper over
// `api` — the variety of endpoints (regular CRUD + the oddballs like
// day-authorizations which use POST-save-all) is kept close together for
// discoverability.
import api from './api';

const simpleCrud = (base: string) => ({
  getAll: (params?: Record<string, string>) => api.get<any>(base, params),
  getById: (id: string) => api.get<any>(`${base}/${id}`),
  create: (data: any) => api.post<any>(base, data),
  update: (id: string, data: any) => api.put<any>(`${base}/${id}`, data),
  delete: (id: string) => api.delete<void>(`${base}/${id}`),
});

export const resignationService = simpleCrud('/resignations');
export const tdsExemptionService = simpleCrud('/tds-exemptions');
export const tdsGroupService = simpleCrud('/tds-groups');
export const smsEmailAlertService = simpleCrud('/sms-email-alerts');
export const imageGalleryService = simpleCrud('/image-galleries');
export const manageMessageService = simpleCrud('/manage-messages');
export const optionalHolidayService = simpleCrud('/optional-holidays');

// Day Authorization — filtered by user, upsert all rows at once.
export const dayAuthorizationService = {
  get: (userId: string) => api.get<any>('/day-authorizations', { user: userId }),
  save: (user: string, rows: any[]) => api.post<any>('/day-authorizations', { user, rows }),
};

// User Rights
export const userRightService = {
  get: (user: string, branch: string) => api.get<any>('/user-rights', { user, branch }),
  save: (data: any) => api.post<any>('/user-rights', data),
  copy: (fromUser: string, toUser: string, branch: string) =>
    api.post<any>('/user-rights/copy', { fromUser, toUser, branch }),
};

// Emp Leave Opening — bulk upsert
export const empLeaveOpeningService = {
  get: (params?: Record<string, string>) => api.get<any>('/emp-leave-openings', params),
  save: (rows: any[]) => api.post<any>('/emp-leave-openings', { rows }),
};

// Closing Leave Transfer
export const closingLeaveTransferService = {
  get: (params?: Record<string, string>) => api.get<any>('/closing-leave-transfers', params),
  transfer: (rows: any[]) => api.post<any>('/closing-leave-transfers', { rows }),
};
