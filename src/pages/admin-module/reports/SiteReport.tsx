import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, Radio, Select, Table } from 'antd';
import { Printer } from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import stateService from '@/services/stateService';
import { CountedTreeSelect } from '@/components/master/CountedSelect';
import { SiteTreeFilter, useSiteTree } from './_shared';

const { Title } = Typography;

type Filters = {
  siteIds: string[];
  siteStatus: 'active' | 'inactive' | 'all';
  division: string;
  states: string[];
  lockStatus: 'locked' | 'open' | 'all';
};

export default function SiteReport() {
  const initial: Filters = { siteIds: [], siteStatus: 'all', division: 'all', states: [], lockStatus: 'all' };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [showResults, setShowResults] = useState(false);

  const { branches, resolveCompanyName } = useSiteTree();

  const { data: statesData } = useQuery({
    queryKey: ['states-master'],
    queryFn: () => stateService.getAll({ limit: '200' }),
  });
  const stateOpts: { name: string }[] = ((statesData as any)?.data ?? []) as any[];
  const stateTree = useMemo(() => [{
    title: 'ALL', value: '__ALL_STATES__', selectable: false,
    children: stateOpts.map((s) => ({ title: s.name, value: s.name })),
  }], [stateOpts]);

  const divisions = useMemo(() => [...new Set(branches.map((b) => b.division).filter(Boolean))] as string[], [branches]);

  const filtered = useMemo(() => {
    if (!showResults) return [];
    return branches.filter((b) => {
      if (applied.siteStatus === 'active' && !b.isActive) return false;
      if (applied.siteStatus === 'inactive' && b.isActive) return false;
      if (applied.lockStatus === 'locked' && !b.isLocked) return false;
      if (applied.lockStatus === 'open' && b.isLocked) return false;
      if (applied.division !== 'all' && b.division !== applied.division) return false;
      if (applied.siteIds.length && !applied.siteIds.includes(b._id)) return false;
      if (applied.states.length && !applied.states.includes((b.stateName || '').toUpperCase())) return false;
      return true;
    });
  }, [branches, applied, showResults]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Site Report</Title>
        {showResults && <Button danger icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>}
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Company-Site</span>
              <SiteTreeFilter value={draft.siteIds} onChange={(v) => setDraft({ ...draft, siteIds: v })} />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Status</span>
              <Radio.Group size="small" value={draft.siteStatus}
                onChange={(e) => setDraft({ ...draft, siteStatus: e.target.value })}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Division</span>
              <Select size="small" value={draft.division} onChange={(v) => setDraft({ ...draft, division: v })}
                options={[{ value: 'all', label: 'ALL' }, ...divisions.map((d) => ({ value: d, label: d }))]} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site State</span>
              <CountedTreeSelect treeData={stateTree as any} value={draft.states}
                onChange={(v) => setDraft({ ...draft, states: v as string[] })}
                placeholder="None Selected means filter does not apply" />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Lock Status</span>
              <Radio.Group size="small" value={draft.lockStatus}
                onChange={(e) => setDraft({ ...draft, lockStatus: e.target.value })}>
                <Radio value="locked">Locked</Radio>
                <Radio value="open">Open</Radio>
                <Radio value="all">ALL</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => { setApplied(draft); setShowResults(true); }}>Search</Button>
          <Button danger onClick={() => setShowResults(false)}>Close</Button>
        </div>
      </Card>

      {showResults && (
        <Card bordered={false} className="!rounded-lg !shadow-sm">
          <div className="text-center mb-3">
            <div className="font-bold text-lg">SITE LIST</div>
            <div className="text-xs">Date: {dayjs().format('DD-MM-YYYY')}</div>
          </div>
          <Table
            size="small" bordered
            dataSource={filtered}
            rowKey={(r) => r._id}
            pagination={false}
            locale={{ emptyText: 'No Records Found' }}
            columns={[
              { title: 'S.No.', key: 'sr', width: 60, render: (_, __, i) => i + 1 },
              { title: 'Site Type', dataIndex: 'siteType', key: 'siteType', width: 100,
                render: (v: string) => v ? v.toUpperCase() : '' },
              { title: 'Site Name', dataIndex: 'name', key: 'name' },
              { title: 'Short Name', dataIndex: 'code', key: 'code', width: 110 },
              { title: 'Address', key: 'addr',
                render: (_, r: any) => [r.address01, r.city].filter(Boolean).join(', ') },
              { title: 'City', dataIndex: 'city', key: 'city', width: 130 },
              { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contact', width: 160 },
              { title: 'Company', key: 'company', width: 200,
                render: (_, r: any) => resolveCompanyName(r.company) },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
