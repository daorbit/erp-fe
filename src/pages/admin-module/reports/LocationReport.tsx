import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, Table } from 'antd';
import { Printer } from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import stateService from '@/services/stateService';
import { CountedTreeSelect } from '@/components/master/CountedSelect';
import { SiteTreeFilter, useSiteTree } from './_shared';

const { Title } = Typography;

type Filters = { siteIds: string[]; states: string[] };

export default function LocationReport() {
  const initial: Filters = { siteIds: [], states: [] };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters>(initial);
  const [showResults, setShowResults] = useState(false);

  const { branches, resolveCompanyName } = useSiteTree();

  const { data: locationsData } = useQuery({
    queryKey: ['locations-all'],
    queryFn: () => api.get('/locations', { limit: '500' }),
  });
  const locations: any[] = ((locationsData as any)?.data ?? []) as any[];

  const { data: statesData } = useQuery({
    queryKey: ['states-master'],
    queryFn: () => stateService.getAll({ limit: '200' }),
  });
  const stateOpts: { name: string }[] = ((statesData as any)?.data ?? []) as any[];
  const stateTree = useMemo(() => [{
    title: 'ALL', value: '__ALL_STATES__', selectable: false,
    children: stateOpts.map((s) => ({ title: s.name, value: s.name })),
  }], [stateOpts]);

  // Group locations under their site under their company.
  const groupedRows = useMemo(() => {
    if (!showResults) return [];
    const filtered = locations.filter((loc) => {
      const siteId = typeof loc.site === 'object' ? loc.site._id : loc.site;
      if (applied.siteIds.length && !applied.siteIds.includes(siteId)) return false;
      return true;
    });
    type Row = { type: 'company' | 'site' | 'loc'; sno: string; name: string; address?: string; contact?: string };
    const out: Row[] = [];
    const byCompany: Record<string, Record<string, any[]>> = {};
    for (const loc of filtered) {
      const siteId = typeof loc.site === 'object' ? loc.site._id : loc.site;
      const site = branches.find((b) => b._id === siteId);
      if (!site) continue;
      const co = resolveCompanyName(site.company);
      byCompany[co] ??= {};
      byCompany[co][siteId] ??= [];
      byCompany[co][siteId].push({ ...loc, _site: site });
    }
    let ci = 0;
    for (const [co, sites] of Object.entries(byCompany)) {
      ci += 1;
      out.push({ type: 'company', sno: String(ci), name: co });
      let si = 0;
      for (const [, locs] of Object.entries(sites)) {
        si += 1;
        const site = locs[0]._site;
        out.push({
          type: 'site', sno: `${ci}.${si}`,
          name: `${site.name}${site.code ? ` (${site.code})` : ''}`,
        });
        let li = 0;
        for (const loc of locs) {
          li += 1;
          out.push({
            type: 'loc', sno: `${ci}.${si}.${li}`,
            name: loc.name,
            address: [loc.address1, loc.city].filter(Boolean).join(', '),
            contact: loc.contactPerson1,
          });
        }
      }
    }
    return out;
  }, [locations, branches, applied, showResults, resolveCompanyName]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Location Report</Title>
        {showResults && <Button danger icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>}
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Company-Site</span>
            <SiteTreeFilter value={draft.siteIds} onChange={(v) => setDraft({ ...draft, siteIds: v })} />
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Location State</span>
            <CountedTreeSelect treeData={stateTree as any} value={draft.states}
              onChange={(v) => setDraft({ ...draft, states: v as string[] })}
              placeholder="None Selected means filter does not apply" />
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
            <div className="font-bold text-lg">LOCATION REPORT</div>
            <div className="text-xs">{dayjs().format('DD-MM-YYYY')}</div>
          </div>
          <Table
            size="small" bordered
            dataSource={groupedRows}
            rowKey={(r) => `${r.type}-${r.sno}`}
            pagination={false}
            locale={{ emptyText: 'No Records Found' }}
            columns={[
              { title: 'S. No.', key: 'sr', width: 90, render: (_, r: any) => r.sno },
              {
                title: 'Location Name', key: 'name',
                render: (_, r: any) => (
                  <span className={r.type === 'company' ? 'font-bold text-red-600' : r.type === 'site' ? 'text-blue-600' : ''}>
                    {r.name}
                  </span>
                ),
              },
              { title: 'Address', dataIndex: 'address', key: 'address' },
              { title: 'Contact Person', dataIndex: 'contact', key: 'contact', width: 200 },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
