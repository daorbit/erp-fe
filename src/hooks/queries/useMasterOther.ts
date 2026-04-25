// Consolidated hooks for the "Master → Other" group of simple masters.
// Each master has the same CRUD shape, so we generate the set with a helper
// rather than writing 13 near-identical hook files.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import qualificationService from '../../services/qualificationService';
import documentMasterService from '../../services/documentMasterService';
import tagService from '../../services/tagService';
import levelService from '../../services/levelService';
import gradeService from '../../services/gradeService';
import bankService from '../../services/bankService';
import cityService from '../../services/cityService';
import importantFormService from '../../services/importantFormService';
import simService from '../../services/simService';
import otherIncomeService from '../../services/otherIncomeService';
import attUploadSiteService from '../../services/attUploadSiteService';
import attAutoNotificationService from '../../services/attAutoNotificationService';
import stateService from '../../services/stateService';

// Minimal shape every simple master service conforms to.
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

export const qualificationHooks = makeHooks('qualifications', qualificationService);
export const documentMasterHooks = makeHooks('document-masters', documentMasterService);
export const tagHooks = makeHooks('tags', tagService);
export const levelHooks = makeHooks('levels', levelService);
export const gradeHooks = makeHooks('grades', gradeService);
export const bankHooks = makeHooks('banks', bankService);
export const cityHooks = makeHooks('cities', cityService);
export const importantFormHooks = makeHooks('important-forms', importantFormService);
export const simHooks = makeHooks('sims', simService);
export const otherIncomeHooks = makeHooks('other-incomes', otherIncomeService);
export const attUploadSiteHooks = makeHooks('att-upload-sites', attUploadSiteService);
export const attAutoNotificationHooks = makeHooks('att-auto-notifications', attAutoNotificationService);
export const stateHooks = makeHooks('states', stateService);
