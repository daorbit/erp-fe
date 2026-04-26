import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { CountedTreeSelect } from '@/components/master/CountedSelect';
import { useSiteTree } from './_shared';

const { Title } = Typography;

// ─── Module / menu catalogue ─────────────────────────────────────────────
// Mirrors the legacy NwayERP module → page hierarchy. Each entry produces a
// row in the exported XLS; sub-pages are indented under their parent.
type MenuLeaf = { name: string; code: string; indent?: number };
type MenuGroup = { module: string; items: MenuLeaf[] };

const MENU_TREE: MenuGroup[] = [
  {
    module: 'ADMIN',
    items: [
      { name: 'MASTER', code: 'master', indent: 0 },
      { name: 'COMPANY', code: 'company', indent: 1 },
      { name: 'ADD', code: 'company.add', indent: 2 },
      { name: 'LIST', code: 'company.list', indent: 2 },
      { name: 'SITE / PLANT / PROJECT', code: 'site', indent: 1 },
      { name: 'ADD', code: 'site.add', indent: 2 },
      { name: 'LIST', code: 'site.list', indent: 2 },
      { name: 'SITE LOCATION', code: 'location', indent: 1 },
      { name: 'ADD', code: 'location.add', indent: 2 },
      { name: 'LIST', code: 'location.list', indent: 2 },
      { name: 'USER', code: 'user', indent: 1 },
      { name: 'ADD', code: 'user.add', indent: 2 },
      { name: 'ADD USER BY MAPPING', code: 'user.mapping', indent: 2 },
      { name: 'LIST', code: 'user.list', indent: 2 },
      { name: 'USER RIGHTS SUMMARY', code: 'user.rights_summary', indent: 2 },
      { name: 'LOGIN TIME SETTING', code: 'user.login_time', indent: 2 },
      { name: 'LOGIN TIME SETTING LIST', code: 'user.login_time_list', indent: 2 },
      { name: 'CHANGE PASSWORD', code: 'user.change_password', indent: 2 },
      { name: 'DAY AUTHORIZATION (BY USER)', code: 'day_authorization.user', indent: 2 },
      { name: 'DAY AUTHORIZATION (BY ENTITY)', code: 'day_authorization.entity', indent: 2 },
      { name: 'DATA BACKUP', code: 'data_backup', indent: 1 },
      { name: 'MESSAGE FROM MNG.', code: 'message_from_mng', indent: 1 },
      { name: 'TASK MASTER', code: 'task_master', indent: 1 },
      { name: 'ADD', code: 'task_master.add', indent: 2 },
      { name: 'LIST', code: 'task_master.list', indent: 2 },
      { name: 'STATE', code: 'state', indent: 1 },
      { name: 'ADD', code: 'state.add', indent: 2 },
      { name: 'LIST', code: 'state.list', indent: 2 },
      { name: 'CITY', code: 'city', indent: 1 },
      { name: 'ADD', code: 'city.add', indent: 2 },
      { name: 'LIST', code: 'city.list', indent: 2 },
      { name: 'SMS ALERT ON VOUCHER', code: 'sms_alert_voucher', indent: 1 },
      { name: 'ADD', code: 'sms_alert_voucher.add', indent: 2 },
      { name: 'LIST', code: 'sms_alert_voucher.list', indent: 2 },
    ],
  },
  {
    module: 'STORE',
    items: [
      { name: 'MASTER', code: 'store.master', indent: 0 },
      { name: 'UNIT', code: 'store.unit', indent: 1 },
      { name: 'ADD', code: 'store.unit.add', indent: 2 },
      { name: 'LIST', code: 'store.unit.list', indent: 2 },
      { name: 'ITEM GROUP', code: 'store.item_group', indent: 1 },
      { name: 'ITEM MASTER', code: 'store.item_master', indent: 1 },
      { name: 'VENDOR INFO', code: 'store.vendor_info', indent: 1 },
      { name: 'TRANSPORT RATE', code: 'store.transport_rate', indent: 1 },
      { name: 'STORE SECTION MASTER', code: 'store.section', indent: 1 },
      { name: 'TRANSACTION', code: 'store.transaction', indent: 0 },
      { name: 'MATERIAL REQUISITION', code: 'store.mr', indent: 1 },
      { name: 'INDENT REQUEST', code: 'store.indent', indent: 1 },
    ],
  },
  {
    module: 'PURCHASE',
    items: [
      { name: 'MASTER', code: 'purchase.master', indent: 0 },
      { name: 'TRANSACTION', code: 'purchase.transaction', indent: 0 },
      { name: 'PURCHASE ORDER', code: 'purchase.po', indent: 1 },
      { name: 'GRN', code: 'purchase.grn', indent: 1 },
    ],
  },
  {
    module: 'HUMAN-RESOURCE',
    items: [
      { name: 'EMPLOYEE', code: 'hr.employee', indent: 0 },
      { name: 'ATTENDANCE', code: 'hr.attendance', indent: 0 },
      { name: 'PAYROLL', code: 'hr.payroll', indent: 0 },
    ],
  },
  {
    module: 'MACHINERY',
    items: [
      { name: 'MACHINE MASTER', code: 'machine.master', indent: 0 },
      { name: 'LOG BOOK', code: 'machine.log_book', indent: 0 },
      { name: 'INSURANCE', code: 'machine.insurance', indent: 0 },
    ],
  },
];

const ALL_MODULES = MENU_TREE.map((m) => m.module);

export default function UserRightSummary() {
  const { message } = App.useApp();

  const { branches, siteTree } = useSiteTree();
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [moduleNames, setModuleNames] = useState<string[]>([]);

  // ─── Dropdown options ─────────────────────────────────────────────────────
  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  const userTree = useMemo(() => [{
    title: 'ALL', value: '__ALL_USERS__', selectable: false,
    children: users.map((u) => ({
      title: (u.username || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim()).toUpperCase(),
      value: u._id || u.id,
    })).sort((a, b) => a.title.localeCompare(b.title)),
  }], [users]);

  const moduleTree = useMemo(() => [{
    title: 'ALL', value: '__ALL_MODULES__', selectable: false,
    children: ALL_MODULES.map((m) => ({ title: m, value: m })),
  }], []);

  // ─── Search → fetch + build XLS ───────────────────────────────────────────
  const [building, setBuilding] = useState(false);

  const handleSearch = async () => {
    const targetSites = siteIds.length ? siteIds : branches.map((b) => b._id);
    const targetUsers = userIds.length ? userIds : users.map((u) => u._id || u.id);
    const targetModules = moduleNames.length ? moduleNames : ALL_MODULES;
    if (targetUsers.length === 0) {
      message.warning('Pick at least one user.');
      return;
    }

    setBuilding(true);
    try {
      // Fetch every relevant user-rights row in parallel.
      const responses = await Promise.all(
        targetUsers.map((uid) =>
          api.get('/user-rights', { userId: uid }).catch(() => ({ data: [] })),
        ),
      );
      const rightsByUser: Record<string, string[]> = {};
      responses.forEach((res: any, i) => {
        const list: any[] = res?.data ?? [];
        const allowed = new Set<string>();
        for (const row of list) {
          // Only include rows whose branch is in scope (or ignore branch when none chosen).
          const branchId = typeof row.branch === 'object' ? row.branch?._id : row.branch;
          if (siteIds.length && branchId && !targetSites.includes(branchId)) continue;
          for (const p of row.allowedPages || []) allowed.add(p);
        }
        rightsByUser[targetUsers[i]!] = Array.from(allowed);
      });

      const userById: Record<string, any> = {};
      for (const u of users) userById[u._id || u.id] = u;
      const xlsHtml = buildXls({
        users: targetUsers.map((uid) => userById[uid]).filter(Boolean),
        modules: MENU_TREE.filter((m) => targetModules.includes(m.module)),
        rightsByUser,
        companyName: 'SHEERAJ PROJECTS PVT. LTD.',
      });
      downloadXls(xlsHtml, 'user-right-summary.xls');
      message.success('Excel file downloaded.');
    } catch (err: any) {
      message.error(err?.message || 'Failed to build report');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">User Right Summary Detail</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Site Name</span>
            <CountedTreeSelect treeData={siteTree as any} value={siteIds}
              onChange={(v) => setSiteIds(v as string[])}
              placeholder="None Selected means filter does not apply" />
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">User Name</span>
            <CountedTreeSelect treeData={userTree as any} value={userIds}
              onChange={(v) => setUserIds(v as string[])}
              placeholder="None Selected means filter does not apply" />
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Module Name</span>
            <CountedTreeSelect treeData={moduleTree as any} value={moduleNames}
              onChange={(v) => setModuleNames(v as string[])}
              placeholder="None Selected means filter does not apply" />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger loading={building} onClick={handleSearch}>Search</Button>
          <Button danger onClick={() => { setSiteIds([]); setUserIds([]); setModuleNames([]); }}>Close</Button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-500">
          Search downloads the User Right Summary as an Excel file.
        </div>
      </Card>
    </div>
  );
}

// ─── XLS builder (Excel-friendly HTML) ───────────────────────────────────
// Excel opens HTML tables natively, so we emit a styled <table> with the
// MIME hint. No additional library needed.

const PAGE_RIGHTS = ['add', 'edit', 'delete', 'view'] as const;
type Right = typeof PAGE_RIGHTS[number];

function hasRight(allowed: Set<string>, code: string, right: Right): boolean | null {
  // For leaf pages: <code>.<right>. For section headers (ADD/LIST under a parent): infer via parent.
  // If the catalogue doesn't expose a specific right (e.g. delete on a list page), return null.
  if (allowed.has(`${code}.${right}`)) return true;
  if (allowed.has(code) && (right === 'view' || right === 'add')) return true;
  return false;
}

function buildXls(opts: {
  users: any[];
  modules: { module: string; items: { name: string; code: string; indent?: number }[] }[];
  rightsByUser: Record<string, string[]>;
  companyName: string;
}) {
  const styles = `
    <style>
      table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
      td, th { border: 1px solid #999; padding: 4px 8px; vertical-align: top; }
      .company { background: #ddd; font-weight: bold; }
      .user { background: #c00; color: #fff; font-weight: bold; }
      .module { background: #c00; color: #fff; font-weight: bold; }
      .menu-header { background: #555; color: #fff; font-weight: bold; }
      .section { color: #00a; font-weight: bold; }
      .yes { color: #060; font-weight: bold; }
      .no { color: #c00; font-weight: bold; }
      .ind-1 { padding-left: 16px; }
      .ind-2 { padding-left: 32px; }
      .ind-3 { padding-left: 48px; }
    </style>
  `;
  const rows: string[] = [];
  rows.push(`<tr><td colspan="5" class="company">${escape(opts.companyName)} [ ]</td></tr>`);

  for (const user of opts.users) {
    const userName = (user.username || user.email || '').toUpperCase();
    const role = (user.role || '').toUpperCase().replace(/_/g, '-');
    const allowed = new Set<string>(opts.rightsByUser[user._id || user.id] || []);
    rows.push(`<tr><td colspan="5" class="user">USER NAME : ${escape(userName)} ( ${escape(role)} )</td></tr>`);
    rows.push('<tr><th class="menu-header">Menu Name</th><th class="menu-header">Add</th><th class="menu-header">Edit</th><th class="menu-header">Delete</th><th class="menu-header">View</th></tr>');

    for (const mod of opts.modules) {
      rows.push(`<tr><td colspan="5" class="module">MODULE NAME : ${escape(mod.module)}</td></tr>`);
      for (const item of mod.items) {
        const isSection = (item.indent ?? 0) === 0;
        const cells: string[] = [];
        for (const right of PAGE_RIGHTS) {
          const has = hasRight(allowed, item.code, right);
          cells.push(has === null
            ? '<td></td>'
            : `<td class="${has ? 'yes' : 'no'}">${has ? 'Yes' : 'No'}</td>`);
        }
        const indClass = `ind-${item.indent ?? 0}`;
        const nameCell = isSection
          ? `<td class="section ${indClass}">${escape(item.name)}</td>`
          : `<td class="${indClass}">${escape(item.name)}</td>`;
        rows.push(`<tr>${nameCell}${cells.join('')}</tr>`);
      }
    }
  }

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8">${styles}</head>
<body><table>${rows.join('')}</table></body></html>`;
}

function escape(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function downloadXls(html: string, filename: string) {
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
