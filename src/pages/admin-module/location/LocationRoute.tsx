import React, { useMemo, useState } from 'react';
import { Card, Button, Typography, InputNumber, Table, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CountedTreeSelect } from '@/components/master/CountedSelect';

const { Title, Text } = Typography;

type SiteLite = { _id: string; name: string; code?: string; company?: any; siteType?: string };

export default function LocationRoute() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [draftFrom, setDraftFrom] = useState<string[]>([]);
  const [draftTo, setDraftTo] = useState<string[]>([]);
  const [appliedFrom, setAppliedFrom] = useState<string[]>([]);
  const [appliedTo, setAppliedTo] = useState<string[]>([]);

  // Distance matrix: keyed by `${fromLocId}::${toLocId}` → km
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // ─── Data: branches + locations ──────────────────────────────────────────
  const { data: branchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: companiesData } = useQuery({
    queryKey: ['companies-list-min'],
    queryFn: () => api.get('/companies', { limit: '200' }),
  });
  const { data: locationsData } = useQuery({
    queryKey: ['site-locations-min'],
    queryFn: () => api.get('/locations', { limit: '500' }),
  });

  const branches: SiteLite[] = (branchesData?.data ?? []) as any[];
  const allLocations: any[] = (locationsData?.data ?? []) as any[];

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

  // Build tree: ALL → Company → Site Type → Sites (re-used for From + To).
  const siteTree = useMemo(() => {
    const byCompany: Record<string, Record<string, SiteLite[]>> = {};
    for (const s of branches) {
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
  }, [branches, companyNameById]);

  // Look up the locations belonging to a site (each site has 0..n location rows).
  const locationsBySite = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const loc of allLocations) {
      const siteId = typeof loc.site === 'object' ? loc.site?._id : loc.site;
      if (!siteId) continue;
      map[siteId] ??= [];
      map[siteId].push(loc);
    }
    return map;
  }, [allLocations]);

  // ─── Build the distance matrix from the *applied* selection ──────────────
  // Rows = locations of every From-site; Columns = locations of every To-site.
  const fromRows = useMemo(() => {
    const rows: { id: string; siteName: string; locName: string }[] = [];
    for (const siteId of appliedFrom) {
      const site = branches.find((b) => b._id === siteId);
      if (!site) continue;
      const locs = locationsBySite[siteId] ?? [];
      if (locs.length === 0) {
        rows.push({ id: `${siteId}::-`, siteName: site.name, locName: `${site.name} (KM)` });
      } else {
        for (const loc of locs) {
          rows.push({
            id: `${siteId}::${loc._id}`,
            siteName: site.name,
            locName: `${(loc.name || '').toUpperCase()} (KM)`,
          });
        }
      }
    }
    return rows;
  }, [appliedFrom, branches, locationsBySite]);

  const toCols = useMemo(() => {
    const cols: { id: string; siteName: string; locName: string }[] = [];
    for (const siteId of appliedTo) {
      const site = branches.find((b) => b._id === siteId);
      if (!site) continue;
      const locs = locationsBySite[siteId] ?? [];
      if (locs.length === 0) {
        cols.push({ id: `${siteId}::-`, siteName: site.name, locName: `${site.name} (KM)` });
      } else {
        for (const loc of locs) {
          cols.push({
            id: `${siteId}::${loc._id}`,
            siteName: site.name,
            locName: `${(loc.name || '').toUpperCase()} (KM)`,
          });
        }
      }
    }
    return cols;
  }, [appliedTo, branches, locationsBySite]);

  const handleSearch = () => {
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const entries = Object.entries(distances)
        .filter(([, km]) => km > 0)
        .map(([key, km]) => {
          const [fromKey, toKey] = key.split('||');
          const [fromSite, fromLoc] = (fromKey || '').split('::');
          const [toSite, toLoc] = (toKey || '').split('::');
          return { fromSite, fromLoc, toSite, toLoc, km };
        });
      if (entries.length === 0) {
        message.warning('Enter at least one distance before saving.');
        return;
      }
      await api.post('/locations/routes', { entries });
      message.success('Location routes saved');
    } catch (err: any) {
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ─── Matrix rendering ────────────────────────────────────────────────────
  // Group To-columns by site so we can render a parent header row like the
  // legacy NwayERP UI: <SITE NAME> spanning across each of its locations.
  const groupedToColumns = useMemo(() => {
    const groups: { siteId: string; siteName: string; cols: typeof toCols }[] = [];
    const indexBySite: Record<string, number> = {};
    for (const col of toCols) {
      const [siteId] = col.id.split('::');
      if (!siteId) continue;
      if (indexBySite[siteId] === undefined) {
        indexBySite[siteId] = groups.length;
        groups.push({ siteId, siteName: col.siteName, cols: [] });
      }
      groups[indexBySite[siteId]!]!.cols.push(col);
    }
    return groups;
  }, [toCols]);

  const matrixColumns = [
    {
      title: <div className="uppercase">Site Name</div>,
      key: 'siteName',
      width: 360,
      fixed: 'left' as const,
      children: [
        {
          title: <span className="font-semibold">Location</span>,
          dataIndex: 'locName', key: 'locName',
          render: (_: any, row: any) => <span className="font-semibold">{row.locName}</span>,
        },
      ],
    },
    ...groupedToColumns.map((g) => ({
      title: <div className="uppercase font-semibold text-center">{g.siteName}</div>,
      key: `group-${g.siteId}`,
      children: g.cols.map((col) => ({
        title: <div className="text-xs font-semibold">{col.locName}</div>,
        key: col.id,
        width: 200,
        render: (_: any, row: any) => {
          const cellKey = `${row.id}||${col.id}`;
          return (
            <InputNumber
              size="small"
              min={0}
              value={distances[cellKey] ?? 0}
              onChange={(v) => setDistances((p) => ({ ...p, [cellKey]: Number(v) || 0 }))}
              style={{ width: '100%' }}
            />
          );
        },
      })),
    })),
  ];

  const showMatrix = appliedFrom.length > 0 && appliedTo.length > 0;

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Location Route</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <Text type="danger" className="block text-center font-medium mb-4">New Mode</Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">From Site</span>
            <CountedTreeSelect
              treeData={siteTree}
              value={draftFrom}
              onChange={(v) => setDraftFrom(v as string[])}
              placeholder="Select From Site"
            />
          </div>
          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">To Site</span>
            <CountedTreeSelect
              treeData={siteTree}
              value={draftTo}
              onChange={(v) => setDraftTo(v as string[])}
              placeholder="Select To Site"
            />
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button type="primary" danger onClick={handleSearch}>Search</Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      {/* Distance matrix */}
      {showMatrix && (
        <Card bordered={false} className="!rounded-lg !shadow-sm">
          <Table
            dataSource={fromRows}
            columns={matrixColumns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 320 + toCols.length * 200 }}
            bordered
          />

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
