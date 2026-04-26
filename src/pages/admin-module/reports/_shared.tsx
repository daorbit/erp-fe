import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CountedTreeSelect } from '@/components/master/CountedSelect';

export type SiteTreeNode = {
  title: string;
  value: string;
  selectable?: boolean;
  children?: SiteTreeNode[];
};

/** Shared hook: builds the ALL → COMPANY → SITE-TYPE → SITES tree used by every report filter. */
export function useSiteTree() {
  const { data: branchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: companiesData } = useQuery({
    queryKey: ['companies-list-min'],
    queryFn: () => api.get('/companies', { limit: '200' }),
  });

  const branches: any[] = ((branchesData as any)?.data ?? []) as any[];
  const companyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of ((companiesData as any)?.data ?? []) as any[]) {
      if (c?._id) map[c._id] = c.name || c.code || c._id;
    }
    return map;
  }, [companiesData]);

  const resolveCompanyName = (raw: any) => {
    if (!raw) return 'UNASSIGNED';
    if (typeof raw === 'object') return raw.name || raw.code || 'UNASSIGNED';
    return companyNameById[raw] || raw;
  };

  const siteTree = useMemo<SiteTreeNode[]>(() => {
    const byCompany: Record<string, Record<string, any[]>> = {};
    for (const b of branches) {
      const co = resolveCompanyName(b.company);
      const t = (b.siteType || 'OTHER').toUpperCase();
      byCompany[co] ??= {};
      byCompany[co][t] ??= [];
      byCompany[co][t].push(b);
    }
    const companyNodes = Object.entries(byCompany).map(([co, types]) => ({
      title: co,
      value: `co::${co}`,
      selectable: false,
      children: Object.entries(types).map(([t, sites]) => ({
        title: t,
        value: `co::${co}::${t}`,
        selectable: false,
        children: sites.map((s) => ({
          title: `${s.name}${s.code ? ` (${s.code})` : ''}`,
          value: s._id,
        })),
      })),
    }));
    return [{ title: 'ALL', value: '__ALL__', selectable: false, children: companyNodes }];
  }, [branches, companyNameById]);

  return { branches, siteTree, resolveCompanyName };
}

export function SiteTreeFilter({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const { siteTree } = useSiteTree();
  return (
    <CountedTreeSelect
      treeData={siteTree as any}
      value={value}
      onChange={(v) => onChange(v as string[])}
      placeholder={placeholder ?? 'Select site(s)'}
    />
  );
}
