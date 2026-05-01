import api from './api';

const BASE_URL = '/shift-sessions';

export interface IGpsPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string;
}

export interface IShiftSession {
  _id: string;
  employee: any;
  user: string;
  company: string;
  site?: any;
  siteLocation?: any;
  shift?: any;
  shiftDate: string;
  shiftStartedAt: string;
  shiftEndedAt?: string;
  status: 'active' | 'completed';
  selfieUrl?: string;
  startLocation?: { latitude: number; longitude: number; accuracy?: number };
  endLocation?: { latitude: number; longitude: number; accuracy?: number };
  latestLocation?: { latitude: number; longitude: number; accuracy?: number; capturedAt?: string };
  gpsTrail?: IGpsPoint[];
  totalDistanceMeters: number;
  startSiteDistanceMeters?: number;
  latestSiteDistanceMeters?: number;
  endSiteDistanceMeters?: number;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed';
  employee?: string;
  site?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const shiftSessionService = {
  /** Currently active shift for the logged-in user (returns null in `data` if none). */
  getActive: () => api.get<IShiftSession | null>(`${BASE_URL}/active`),

  /** Logged-in user's shift history. */
  getMy: (params?: ListParams) =>
    api.get<IShiftSession[]>(`${BASE_URL}/my`, params as Record<string, any>),

  /** Admin/HR — all sessions in company. */
  getAll: (params?: ListParams) =>
    api.get<IShiftSession[]>(BASE_URL, params as Record<string, any>),

  /** Detail (with full GPS trail). */
  getById: (id: string) => api.get<IShiftSession>(`${BASE_URL}/${id}`),

  /**
   * Start a new shift. `selfie` is a Blob/File from the webcam.
   * Sent as multipart/form-data so the backend's `upload.single('selfie')` parses it.
   */
  start: (input: {
    siteId?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    notes?: string;
    selfie?: Blob;
  }) => {
    const fd = new FormData();
    if (input.siteId) fd.append('siteId', input.siteId);
    fd.append('latitude', String(input.latitude));
    fd.append('longitude', String(input.longitude));
    if (typeof input.accuracy === 'number') fd.append('accuracy', String(input.accuracy));
    if (input.notes) fd.append('notes', input.notes);
    if (input.selfie) fd.append('selfie', input.selfie, 'selfie.jpg');
    return api.upload<IShiftSession>(`${BASE_URL}/start`, fd);
  },

  /** Append a GPS point to an active session. */
  track: (
    id: string,
    input: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      capturedAt?: string;
    },
  ) => api.post<{
    _id: string;
    totalDistanceMeters: number;
    latestLocation?: { latitude: number; longitude: number; accuracy?: number; capturedAt?: string };
    latestSiteDistanceMeters?: number;
    gpsTrailCount: number;
  }>(
    `${BASE_URL}/${id}/track`,
    input,
  ),

  /** End an active shift. */
  end: (
    id: string,
    input: {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      notes?: string;
    },
  ) => api.post<IShiftSession>(`${BASE_URL}/${id}/end`, input),
};

export default shiftSessionService;
