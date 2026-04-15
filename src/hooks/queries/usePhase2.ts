// Consolidated hooks for Phase 2 modules (Resignation, TDS, SMS, Gallery,
// Messages, OptionalHoliday + the odd-shaped ones like user-rights and
// day-authorizations). Uses the same makeHooks factory as useMasterOther.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  resignationService, tdsExemptionService, tdsGroupService,
  smsEmailAlertService, imageGalleryService, manageMessageService,
  optionalHolidayService,
  dayAuthorizationService, userRightService,
  empLeaveOpeningService, closingLeaveTransferService,
} from '../../services/phase2Services';

interface CrudSvc {
  getAll: (params?: Record<string, string>) => Promise<any>;
  getById?: (id: string) => Promise<any>;
  create: (data: any) => Promise<any>;
  update?: (id: string, data: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

function makeHooks<T extends CrudSvc>(key: string, svc: T) {
  const keys = {
    all: [key] as const,
    list: (p?: any) => [key, 'list', p] as const,
    detail: (id: string) => [key, 'detail', id] as const,
  };
  return {
    keys,
    useList: (params?: any) => useQuery({ queryKey: keys.list(params), queryFn: () => svc.getAll(params) }),
    useDetail: (id: string) => useQuery({
      queryKey: keys.detail(id),
      queryFn: () => (svc.getById ? svc.getById(id) : Promise.resolve(null)),
      enabled: !!id && !!svc.getById,
    }),
    useCreate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (data: any) => svc.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
      });
    },
    useUpdate: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
          svc.update ? svc.update(id, data) : Promise.reject(new Error('Update not supported')),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
      });
    },
    useDelete: () => {
      const qc = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => svc.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
      });
    },
  };
}

export const resignationHooks = makeHooks('resignations', resignationService);
export const tdsExemptionHooks = makeHooks('tds-exemptions', tdsExemptionService);
export const tdsGroupHooks = makeHooks('tds-groups', tdsGroupService);
export const smsEmailAlertHooks = makeHooks('sms-email-alerts', smsEmailAlertService);
export const imageGalleryHooks = makeHooks('image-galleries', imageGalleryService);
export const manageMessageHooks = makeHooks('manage-messages', manageMessageService);
export const optionalHolidayHooks = makeHooks('optional-holidays', optionalHolidayService);

// Specialized hooks (non-CRUD shape)

export function useDayAuthorization(userId?: string) {
  return useQuery({
    queryKey: ['day-authorizations', userId],
    queryFn: () => dayAuthorizationService.get(userId!),
    enabled: !!userId,
  });
}
export function useSaveDayAuthorization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user, rows }: { user: string; rows: any[] }) => dayAuthorizationService.save(user, rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['day-authorizations'] }),
  });
}

export function useUserRight(user?: string, branch?: string) {
  return useQuery({
    queryKey: ['user-rights', user, branch],
    queryFn: () => userRightService.get(user!, branch!),
    enabled: !!user && !!branch,
  });
}
export function useSaveUserRight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userRightService.save(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-rights'] }),
  });
}
export function useCopyUserRight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fromUser, toUser, branch }: { fromUser: string; toUser: string; branch: string }) =>
      userRightService.copy(fromUser, toUser, branch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-rights'] }),
  });
}

export function useEmpLeaveOpenings(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['emp-leave-openings', params],
    queryFn: () => empLeaveOpeningService.get(params),
  });
}
export function useSaveEmpLeaveOpenings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: any[]) => empLeaveOpeningService.save(rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emp-leave-openings'] }),
  });
}

export function useClosingLeaveTransfers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['closing-leave-transfers', params],
    queryFn: () => closingLeaveTransferService.get(params),
  });
}
export function useRunClosingLeaveTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: any[]) => closingLeaveTransferService.transfer(rows),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['closing-leave-transfers'] }),
  });
}
