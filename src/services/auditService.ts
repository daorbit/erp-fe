import api from './api';

const AUDIT_URL = '/audit-logs';

const auditService = {
  getAll: (params?: Record<string, string>) =>
    api.get<any>(AUDIT_URL, params),
};

export default auditService;
