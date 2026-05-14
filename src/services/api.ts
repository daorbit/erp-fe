import { store } from '../store';
import { logout } from '../store/authSlice';
import type { IApiResponse } from '../types/api';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<IApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const filtered = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)]);
    if (filtered.length > 0) {
      url += `?${new URLSearchParams(filtered).toString()}`;
    }
  }

  const token = store.getState().auth.token;
  const isFormData = fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach the active company context so the backend scopes all queries correctly
  const activeCompanyId = store.getState().activeCompany?.activeCompanyId;
  if (activeCompanyId) {
    headers['X-Active-Company'] = activeCompanyId;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Don't logout/redirect for auth endpoints (login, register, refresh)
    const isAuthEndpoint = endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/register') ||
      endpoint.startsWith('/auth/refresh');
    if (!isAuthEndpoint) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    const error = await response.json().catch(() => ({ message: 'Unauthorized' }));
    throw error;
  }

  if (response.status === 403) {
    const error = await response.json().catch(() => ({ message: 'Forbidden' }));
    // If the account was deactivated, force logout
    if (error.message?.toLowerCase().includes('deactivated')) {
      store.dispatch(logout());
      localStorage.setItem('deactivated_message', error.message);
      window.location.href = '/login';
    }
    throw error;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      success: false,
      message: 'Request failed',
    }));
    throw error;
  }

  return response.json();
}

const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data ?? {}) }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data ?? {}) }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', body: formData }),
};

export default api;
