import api from './api';

const INVITATION_URL = '/invitations';

const invitationService = {
  create: (data: { email: string; role: string; company?: string }) =>
    api.post<any>(INVITATION_URL, data),

  getByToken: (token: string) =>
    api.get<any>(`${INVITATION_URL}/${token}`),

  accept: (data: { token: string; firstName: string; lastName: string; password: string; phone?: string }) =>
    api.post<any>(`${INVITATION_URL}/accept`, data),

  list: () =>
    api.get<any>(INVITATION_URL),
};

export default invitationService;
