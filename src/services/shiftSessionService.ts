import api from './api';

const BASE_URL = '/shift-sessions';

export interface IGpsPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string;
  matchedSite?: any;
  matchedSiteLocation?: any;
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
  siteBufferKm?: number;
  latestSiteWithinBuffer?: boolean;
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

export interface SiteDurationReportParams {
  status?: 'active' | 'completed';
  employee?: string;
  site?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SiteDurationReportRow {
  key: string;
  date: string;
  employee: any;
  employeeName: string;
  employeeCode?: string;
  site: any;
  siteName?: string;
  siteCode?: string;
  siteLocation?: any;
  siteLocationName?: string;
  durationMinutes: number;
  sessionCount: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  minDistanceMeters?: number;
  maxDistanceMeters?: number;
}

export interface SiteDurationReport {
  rows: SiteDurationReportRow[];
  totals: {
    durationMinutes: number;
    employeeCount: number;
    siteCount: number;
    rowCount: number;
  };
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

  /** Admin/HR — employee x site duration report from GPS trail. */
  getSiteDurationReport: (params?: SiteDurationReportParams) =>
    api.get<SiteDurationReport>(`${BASE_URL}/reports/site-duration`, params as Record<string, any>),

  /** Detail (with full GPS trail). */
  getById: (id: string) => api.get<IShiftSession>(`${BASE_URL}/${id}`),

  /**
   * Start a new shift. `selfie` is a Blob/File from the webcam.
   * Sent as multipart/form-data so the backend's `upload.single('selfie')` parses it.
   */
  start: (input: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    notes?: string;
    selfie?: Blob;
  }) => {
    const fd = new FormData();
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
    siteBufferKm?: number;
    latestSiteWithinBuffer?: boolean;
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
