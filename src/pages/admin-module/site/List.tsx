import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Typography, Radio, Select, TreeSelect, Input, Space, App } from 'antd';
import { Plus, Edit, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import stateService from '@/services/stateService';
import { useDeleteBranch } from '@/hooks/queries/useBranches';
import { confirmDelete } from '@/lib/confirm';
import { CountedTreeSelect } from '@/components/master/CountedSelect';

const { Title } = Typography;

type FilterState = {
  siteStatus: string;
  lockStatus: string;
  division: string;
  companySites: string[];
  siteStates: string[];
};

const EMPTY_FILTERS: FilterState = {
  siteStatus: 'all',
  lockStatus: 'all',
  division: 'all',
  companySites: [],
  siteStates: [],
};

export default function SiteList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const deleteBranch = useDeleteBranch();

  const handleDelete = (r: any) => {
    confirmDelete({
      title: 'Delete site/plant/project?',
      content: `"${r.name}" will be permanently removed.`,
      onOk: async () => {
        try {
          await deleteBranch.mutateAsync(r._id || r.id);
          message.success('Site deleted');
        } catch (err: any) {
          message.error(err?.message || 'Failed to delete site');
        }
      },
    });
  };

  // Draft = what's currently in the form inputs.
  // Applied = what the table is filtered by — only updates on Search click.
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<FilterState>(EMPTY_FILTERS);

  const setDraftField = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  // Column-level filters apply live (table cell inputs).
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const setColFilter = (k: string, v: string) =>
    setColFilters((p) => ({ ...p, [k]: v }));

  // Build query params from the *applied* filter snapshot — sent to the backend.
  const branchQueryParams = useMemo(() => {
    const p: Record<string, string> = { limit: '200' };
    if (applied.companySites.length) p.ids = applied.companySites.join(',');
    if (applied.siteStates.length) p.states = applied.siteStates.join(',');
    if (applied.division !== 'all') p.division = applied.division;
    if (applied.siteStatus !== 'all') p.siteStatus = applied.siteStatus;
    if (applied.lockStatus !== 'all') p.lockStatus = applied.lockStatus;
    return p;
  }, [applied]);

  const { data, isLoading } = useQuery({
    queryKey: ['branches-list', branchQueryParams],
    queryFn: () => api.get('/branches', branchQueryParams),
  });

  // Unfiltered branches — used to build the Company-Site tree so labels remain
  // resolvable even after Search narrows the table dataset.
  const { data: allBranchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
    staleTime: 5 * 60 * 1000,
  });
  const allBranchesForTree: any[] = allBranchesData?.data ?? [];

  const { data: companiesData } = useQuery({
    queryKey: ['companies-list-min'],
    queryFn: () => api.get('/companies', { limit: '200' }),
  });

  const { data: statesData } = useQuery({
    queryKey: ['states-master'],
    queryFn: () => stateService.getAll({ limit: '200' }),
  });
  const stateOptions: { name: string }[] = (statesData?.data ?? []) as any[];

  const stateTree = useMemo(() => {
    const sorted = [...stateOptions].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return [
      {
        title: 'ALL',
        value: '__ALL_STATES__',
        selectable: false,
        children: sorted.map((s) => ({
          title: (s.name || '').toUpperCase(),
          value: (s.name || '').toUpperCase(),
        })),
      },
    ];
  }, [stateOptions]);

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

  const allSites: any[] = data?.data ?? [];

  // Build TreeSelect options from the unfiltered branch list so selected
  // branch IDs always resolve to readable labels.
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
    return [
      {
        title: 'ALL',
        value: '__ALL__',
        selectable: false,
        children: companyNodes,
      },
    ];
  }, [allBranchesForTree, companyNameById]);

  const divisions = useMemo(
    () => [...new Set(allSites.map((s) => s.division).filter(Boolean))] as string[],
    [allSites],
  );

  // Header filters are now applied server-side. Only column cell filters run client-side.
  const filtered = useMemo(() => {
    return allSites.filter((s) => {

      // column filters
      for (const [k, v] of Object.entries(colFilters)) {
        if (!v) continue;
        const val = (() => {
          switch (k) {
            case 'company': return resolveCompanyName(s.company);
            case 'siteType': return s.siteType;
            case 'projectType': return s.projectType;
            case 'code': return s.code;
            case 'name': return s.name;
            case 'addr': return [s.address01, s.city].filter(Boolean).join(', ');
            case 'contact': return s.contactPerson;
            case 'div': return s.division;
            case 'state': return s.stateName;
            case 'tin': return s.tinNo;
            case 'change': return s.changeTo;
            default: return '';
          }
        })();
        if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
      }
      return true;
    });
  }, [allSites, colFilters]);

  const filterCell = (key: string) => (
    <Input size="small" value={colFilters[key] || ''} onChange={(e) => setColFilter(key, e.target.value)} />
  );

  const columns = [
    {
      title: <div><div>SrNo.</div>{filterCell('sr')}</div>,
      key: 'sr', width: 70, render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: <div><div>Company Name</div>{filterCell('company')}</div>,
      key: 'company', render: (_: any, r: any) => resolveCompanyName(r.company),
    },
    {
      title: <div><div>Site Type</div>{filterCell('siteType')}</div>,
      dataIndex: 'siteType', key: 'siteType', width: 100,
      render: (v: string) => v ? v.toUpperCase() : '',
    },
    {
      title: <div><div>Project Type</div>{filterCell('projectType')}</div>,
      dataIndex: 'projectType', key: 'projectType', width: 120,
      render: (v: string) => v ? v.toUpperCase() : '',
    },
    {
      title: <div><div>Short Name</div>{filterCell('code')}</div>,
      dataIndex: 'code', key: 'code', width: 100,
    },
    {
      title: <div><div>Site Name</div>{filterCell('name')}</div>,
      key: 'name',
      sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
      render: (_: any, r: any) => (
        <div>
          <div className="font-medium">{r.name}</div>
          {r.startDate && (
            <div className="text-xs text-gray-500">
              Started : {new Date(r.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      ),
    },
    {
      title: <div><div>Address / City</div>{filterCell('addr')}</div>,
      key: 'addr', render: (_: any, r: any) => [r.address01, r.city].filter(Boolean).join(', ') || '-',
    },
    {
      title: <div><div>Contact Person</div>{filterCell('contact')}</div>,
      dataIndex: 'contactPerson', key: 'contact', width: 150,
    },
    {
      title: <div><div>Division Name</div>{filterCell('div')}</div>,
      dataIndex: 'division', key: 'div', width: 140,
    },
    {
      title: <div><div>State Name</div>{filterCell('state')}</div>,
      dataIndex: 'stateName', key: 'state', width: 120,
    },
    {
      title: <div><div>Tin No.</div>{filterCell('tin')}</div>,
      dataIndex: 'tinNo', key: 'tin', width: 110,
    },
    {
      title: <div><div>Change To</div>{filterCell('change')}</div>,
      key: 'changeTo', width: 100,
      render: (_: any, r: any) => r.isActive ? 'Active' : 'Inactive',
    },
    {
      title: 'Actions', key: 'edit', width: 110, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Space size={2}>
          <Button type="text" size="small" icon={<Edit size={14} />}
            onClick={() => navigate(`/admin-module/master/site/edit/${r._id}`)} />
          <Button type="text" size="small" icon={<FileText size={14} />}
            onClick={() => navigate(`/admin-module/master/site/document?id=${r._id}`)} />
          <Button type="text" size="small" danger icon={<Trash2 size={14} />}
            onClick={() => handleDelete(r)} />
        </Space>
      ),
    },
  ];

  // Expanded row: GST / State / Tin info
  const expandedRowRender = (record: any) => {
    const entries: any[] = record.gstEntries || [];
    if (entries.length === 0) {
      return <div className="text-xs text-gray-500 px-4 py-2">No GST entries</div>;
    }
    return (
      <Table
        size="small"
        pagination={false}
        rowKey={(_, i) => String(i)}
        dataSource={entries}
        columns={[
          { title: 'SrNo.', key: 'sr', width: 60, render: (_, __, i) => i + 1 },
          { title: 'State Name', dataIndex: 'state', key: 'state' },
          { title: 'Tin No.', dataIndex: 'tinNumber', key: 'tin' },
          { title: 'GST No.', dataIndex: 'gstNumber', key: 'gst' },
        ]}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Site / Plant / Project List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/admin-module/master/site/add')}>
          Add
        </Button>
      </div>

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
              <Radio.Group size="small" value={draft.siteStatus} onChange={(e) => setDraftField('siteStatus', e.target.value)}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Division</span>
              <Select
                size="small"
                value={draft.division}
                onChange={(v) => setDraftField('division', v)}
                style={{ width: '100%' }}
                options={[{ value: 'all', label: 'ALL' }, ...divisions.map((d) => ({ value: d, label: d }))]}
              />
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
              <Radio.Group size="small" value={draft.lockStatus} onChange={(e) => setDraftField('lockStatus', e.target.value)}>
                <Radio value="locked">Locked</Radio>
                <Radio value="open">Open</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button type="primary" danger onClick={() => setApplied(draft)}>
            Search
          </Button>
          <Button danger onClick={() => navigate('/admin-module')}>
            Close
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="text-sm font-medium mb-2">Total {filtered.length} Record</div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          expandable={{ expandedRowRender }}
        />
      </Card>
    </div>
  );
}
