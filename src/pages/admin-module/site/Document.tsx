import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Typography, Radio, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import stateService from '@/services/stateService';
import { CountedTreeSelect } from '@/components/master/CountedSelect';

const { Title } = Typography;

type FilterState = {
  siteStatus: string;
  lockStatus: string;
  companySites: string[];
  siteStates: string[];
};

const EMPTY_FILTERS: FilterState = {
  siteStatus: 'active',
  lockStatus: 'open',
  companySites: [],
  siteStates: [],
};

export default function SiteDocument() {
  const navigate = useNavigate();

  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS);
  const setDraftField = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const setColFilter = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));

  // Server-side filtered query (driven by `applied`).
  const branchQueryParams = useMemo(() => {
    const p: Record<string, string> = { limit: '200' };
    if (applied.companySites.length) p.ids = applied.companySites.join(',');
    if (applied.siteStates.length) p.states = applied.siteStates.join(',');
    if (applied.siteStatus !== 'all') p.siteStatus = applied.siteStatus;
    if (applied.lockStatus !== 'all') p.lockStatus = applied.lockStatus;
    return p;
  }, [applied]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['branches-documents', branchQueryParams],
    queryFn: () => api.get('/branches', branchQueryParams),
  });

  // Unfiltered for tree options (so labels remain resolvable after Search).
  const { data: allBranchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies-list-min'],
    queryFn: () => api.get('/companies', { limit: '200' }),
  });

  const { data: statesData } = useQuery({
    queryKey: ['states-master'],
    queryFn: () => stateService.getAll({ limit: '200' }),
  });

  const companyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of (companiesData?.data ?? []) as any[]) {
      if (c?._id) map[c._id] = c.name || c.code || c._id;
    }
    return map;
  }, [companiesData]);

  const resolveCompanyName = (raw: any): string => {
    if (!raw) return 'UNASSIGNED';
    if (typeof raw === 'object') return raw.name || raw.code || 'UNASSIGNED';
    return companyNameById[raw] || raw;
  };

  const allBranchesForTree: any[] = allBranchesData?.data ?? [];
  const companySiteTree = useMemo(() => {
    const byCompany: Record<string, Record<string, any[]>> = {};
    for (const s of allBranchesForTree) {
      const company = resolveCompanyName(s.company);
      const type = (s.siteType || 'OTHER').toUpperCase();
      byCompany[company] ??= {};
      byCompany[company][type] ??= [];
      byCompany[company][type].push(s);
    }
    const companyNodes = Object.entries(byCompany).map(([company, types]) => ({
      title: company,
      value: `co::${company}`,
      selectable: false,
      children: Object.entries(types).map(([type, sites]) => ({
        title: type,
        value: `co::${company}::${type}`,
        selectable: false,
        children: sites.map((s) => ({
          title: `${s.name}${s.code ? ` (${s.code})` : ''}`,
          value: s._id,
        })),
      })),
    }));
    return [{ title: 'ALL', value: '__ALL__', selectable: false, children: companyNodes }];
  }, [allBranchesForTree, companyNameById]);

  const stateOptions: { name: string }[] = (statesData?.data ?? []) as any[];
  const stateTree = useMemo(() => {
    const sorted = [...stateOptions].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return [{
      title: 'ALL',
      value: '__ALL_STATES__',
      selectable: false,
      children: sorted.map((s) => ({
        title: (s.name || '').toUpperCase(),
        value: (s.name || '').toUpperCase(),
      })),
    }];
  }, [stateOptions]);

  const allSites: any[] = data?.data ?? [];

  // Column-cell text filtering only.
  const filtered = useMemo(() => allSites.filter((s) => {
    for (const [k, v] of Object.entries(colFilters)) {
      if (!v) continue;
      const val = (() => {
        switch (k) {
          case 'company': return resolveCompanyName(s.company);
          case 'name': return s.name;
          case 'gst': return (s.gstEntries || []).map((g: any) => g.gstNumber).filter(Boolean).join(', ');
          case 'loa': return s.loiLoaNo;
          case 'tender': return s.tenderNo;
          default: return '';
        }
      })();
      if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  }), [allSites, colFilters]);

  const filterCell = (key: string) => (
    <Input size="small" value={colFilters[key] || ''} onChange={(e) => setColFilter(key, e.target.value)} />
  );

  const columns = [
    {
      title: <div><div>SrNo.</div>{filterCell('sr')}</div>,
      key: 'sr', width: 80, render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: <div><div>Company Name</div>{filterCell('company')}</div>,
      key: 'company',
      sorter: (a: any, b: any) => resolveCompanyName(a.company).localeCompare(resolveCompanyName(b.company)),
      render: (_: any, r: any) => resolveCompanyName(r.company),
    },
    {
      title: <div><div>Site Name</div>{filterCell('name')}</div>,
      dataIndex: 'name', key: 'name',
      sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: <div><div>GST DETAIL</div>{filterCell('gst')}</div>,
      key: 'gst', width: 200,
      render: (_: any, r: any) =>
        (r.gstEntries || []).map((g: any) => g.gstNumber).filter(Boolean).join(', ') || '',
    },
    {
      title: <div><div>LETTER OF ACCEPTANCE</div>{filterCell('loa')}</div>,
      key: 'loa', width: 200,
      render: (_: any, r: any) => r.loiLoaNo || '',
    },
    {
      title: <div><div>TENDER</div>{filterCell('tender')}</div>,
      key: 'tender', width: 160,
      render: (_: any, r: any) => r.tenderNo || '',
    },
  ];

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Site/Plant/Project - Document</Title>

      {/* Filters */}
      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {/* Left column */}
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Company-Site</span>
              <CountedTreeSelect
                treeData={companySiteTree}
                value={draft.companySites}
                onChange={(v) => setDraftField('companySites', v as string[])}
                placeholder="Select Company / Site"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Status</span>
              <Radio.Group size="small" value={draft.siteStatus}
                onChange={(e) => setDraftField('siteStatus', e.target.value)}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site State</span>
              <CountedTreeSelect
                treeData={stateTree}
                value={draft.siteStates}
                onChange={(v) => setDraftField('siteStates', v as string[])}
                placeholder="None Selected means filter does not apply"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Lock Status</span>
              <Radio.Group size="small" value={draft.lockStatus}
                onChange={(e) => setDraftField('lockStatus', e.target.value)}>
                <Radio value="locked">Locked</Radio>
                <Radio value="open">Open</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button type="primary" danger onClick={() => { setApplied(draft); refetch(); }}>
            Search
          </Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      {/* Table */}
      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
