import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, DatePicker, Select, Radio } from 'antd';
import { FileSpreadsheet } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { SiteTreeFilter } from './_shared';

const { Title, Text } = Typography;

type Filters = {
  fromDate: Dayjs;
  toDate: Dayjs;
  module: string;
  userType: string;
  userName: string;
  siteIds: string[];
  showLastRecordDate: '1' | '0';
  showEditRecord: '1' | '0';
  showGraph: '1' | '0';
  reportType: 'entry' | 'transaction';
  entryFrom: 'ALL' | 'WEB' | 'EXE' | 'APP';
};

const MODULES = [
  { value: 'all', label: 'ALL' },
  { value: 'admin_accounts', label: 'ADMIN-ACCOUNTS' },
  { value: 'correspondence', label: 'CORRESPONDENCE' },
  { value: 'human_resource', label: 'HUMAN-RESOURCE' },
  { value: 'machinery', label: 'MACHINERY' },
  { value: 'production', label: 'PRODUCTION' },
  { value: 'project_management', label: 'PROJECT-MANAGEMENT' },
  { value: 'purchase', label: 'PURCHASE' },
  { value: 'tender', label: 'TENDER' },
];

const USER_TYPES = [
  { value: 'ALL', label: 'ALL' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'HO-USER', label: 'HO-USER' },
  { value: 'SUPERADMIN', label: 'SUPERADMIN' },
  { value: 'SITE-ADMIN', label: 'SITE-ADMIN' },
  { value: 'USER', label: 'USER' },
];

export default function UserWorkReport() {
  const navigate = useNavigate();
  const today = dayjs();
  const initial: Filters = {
    fromDate: today.subtract(7, 'day'),
    toDate: today,
    module: 'all',
    userType: 'ALL',
    userName: 'all',
    siteIds: [],
    showLastRecordDate: '1',
    showEditRecord: '1',
    showGraph: '0',
    reportType: 'entry',
    entryFrom: 'ALL',
  };
  const [draft, setDraft] = useState<Filters>(initial);
  const [applied, setApplied] = useState<Filters | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  // Server endpoint placeholder — when ready, this hits a real aggregation.
  const queryParams = useMemo(() => {
    if (!applied) return {} as Record<string, string>;
    const p: Record<string, string> = {
      from: applied.fromDate.startOf('day').toISOString(),
      to: applied.toDate.endOf('day').toISOString(),
      reportType: applied.reportType,
      entryFrom: applied.entryFrom,
      showEdit: applied.showEditRecord,
      showLastDate: applied.showLastRecordDate,
    };
    if (applied.module !== 'all') p.module = applied.module;
    if (applied.userType !== 'ALL') p.userType = applied.userType;
    if (applied.userName !== 'all') p.userId = applied.userName;
    if (applied.siteIds.length) p.siteIds = applied.siteIds.join(',');
    return p;
  }, [applied]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-work-report', queryParams],
    queryFn: () => api.get('/reports/user-work', queryParams),
    enabled: !!applied,
    retry: false,
  });

  // Modules + their voucher columns (mirrors the legacy NwayERP grid).
  const MODULE_GRID: { key: string; title: string; cols: string[] }[] = [
    {
      key: 'hr', title: 'HR Module',
      cols: ['Attendance', 'Leave Application', 'Employee OD', 'Employee OT', 'Employee Salary',
        'Advance/Loan Advance', 'Other Addition/Deduction', 'Sim Allotment', 'Mobile Bill', 'Employee',
        'Salary/Appraisal', 'Doc Upload'],
    },
    {
      key: 'purchase', title: 'Purchase And Store Module',
      cols: ['Material Request', 'Enquiry', 'Quotation', 'Indent', 'Material Return', 'Purchase Order',
        'Purchase', 'GRN', 'Gate Pass', 'Material Issue', 'Freight Rate', 'Rate Contract', 'Raw Material Sale'],
    },
    {
      key: 'machine', title: 'Machine Module',
      cols: ['Log Book', 'Service Log', 'M/V Break Down', 'M/V Working', 'Machine Insurance',
        'Machine Fitness', 'Machine Permit', 'Taxation', 'PUC', 'Loan Finance', 'Tyre', 'Battery'],
    },
    {
      key: 'account', title: 'Account Module',
      cols: ['CONTRA VOUCHER (CNT)', 'JOURNAL GST VOUCHER (GJV)', 'SALARY VOUCHER (HRS)',
        'EXPENCE VOUCHER (EJV)', 'PURCHASE VOUCHER (PUR)', 'RECEIPT VOUCHER (REC)',
        'JOURNAL VOUCHER (JUR)', 'DEBIT NOTE (DBN)', 'PAYMENT VOUCHER (PAY)',
        'CREDIT NOTE (CDN)', 'RAW MATERIAL SALES (RSL)', 'INCOME VOUCHER (IJV)',
        'Site To Site Entry', 'Site To Multi Site Entry'],
    },
    {
      key: 'pm', title: 'Project Management Module',
      cols: ['Daily Progress Report (DPR)', 'Request For Inspection (RFI)', 'Work Indent', 'Work Order',
        'Sub Contractor Bill', 'Running Account (RA) Bill'],
    },
  ];

  const reportData: any = (data as any)?.data ?? null;

  const renderModuleGrid = (mod: typeof MODULE_GRID[number]) => {
    // Each row is a user. If the BE response has data for this module use it,
    // otherwise just show the structure so the layout matches the legacy report.
    const rows: any[] = reportData?.[mod.key] ?? [];
    if (rows.length === 0) {
      return (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th colSpan={6 + mod.cols.length * 2} className="px-2 py-1 text-left">{mod.title}</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th colSpan={6}></th>
                <th colSpan={mod.cols.length * 2} className="px-2 py-1 text-center">Forms / Voucher's Name</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-2 py-1 text-left">Sno.</th>
                <th className="px-2 py-1 text-left">User Name</th>
                <th className="px-2 py-1 text-left">Employee Name</th>
                <th className="px-2 py-1 text-left">Employee Code</th>
                <th className="px-2 py-1 text-left">Employee Site</th>
                <th className="px-2 py-1 text-left">Job Role</th>
                {mod.cols.map((c) => (
                  <th key={c} className="px-2 py-1 text-center" colSpan={2}>{c}</th>
                ))}
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th colSpan={6}></th>
                {mod.cols.map((c) => (
                  <React.Fragment key={c}>
                    <th className="px-2 py-1 text-center">ADD</th>
                    <th className="px-2 py-1 text-center">EDIT</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={6 + mod.cols.length * 2} className="px-2 py-3 text-center text-gray-500">
                No data — run a search to populate.
              </td></tr>
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th colSpan={6 + mod.cols.length * 2} className="px-2 py-1 text-left">{mod.title}</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="px-2 py-1 text-left">Sno.</th>
              <th className="px-2 py-1 text-left">User Name</th>
              <th className="px-2 py-1 text-left">Employee Name</th>
              <th className="px-2 py-1 text-left">Employee Code</th>
              <th className="px-2 py-1 text-left">Employee Site</th>
              <th className="px-2 py-1 text-left">Job Role</th>
              {mod.cols.map((c) => (
                <React.Fragment key={c}>
                  <th className="px-2 py-1 text-center">{c} ADD</th>
                  <th className="px-2 py-1 text-center">{c} EDIT</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.userId || i} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-2 py-1">{i + 1}</td>
                <td className="px-2 py-1">{r.userName}</td>
                <td className="px-2 py-1">{r.employeeName}</td>
                <td className="px-2 py-1">{r.employeeCode}</td>
                <td className="px-2 py-1">{r.employeeSite}</td>
                <td className="px-2 py-1">{r.jobRole}</td>
                {mod.cols.map((c) => (
                  <React.Fragment key={c}>
                    <td className="px-2 py-1 text-center">{r[`${c}__add`] ?? 0}</td>
                    <td className="px-2 py-1 text-center">{r[`${c}__edit`] ?? 0}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">User Work Report</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Left column */}
          <div className="space-y-2">
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">From Date</span>
              <div className="flex items-center gap-2">
                <DatePicker size="small" format="DD/MM/YYYY" value={draft.fromDate}
                  onChange={(d) => setDraft({ ...draft, fromDate: d || dayjs() })} />
                <span className="text-xs">To</span>
                <DatePicker size="small" format="DD/MM/YYYY" value={draft.toDate}
                  onChange={(d) => setDraft({ ...draft, toDate: d || dayjs() })} />
              </div>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Type</span>
              <Select size="small" value={draft.userType} onChange={(v) => setDraft({ ...draft, userType: v })}
                options={USER_TYPES} />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Site Name</span>
              <SiteTreeFilter value={draft.siteIds} onChange={(v) => setDraft({ ...draft, siteIds: v })} />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Show Edit Record</span>
              <Radio.Group size="small" value={draft.showEditRecord}
                onChange={(e) => setDraft({ ...draft, showEditRecord: e.target.value })}>
                <Radio value="1">YES</Radio>
                <Radio value="0">NO</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Report Type</span>
              <Radio.Group size="small" value={draft.reportType}
                onChange={(e) => setDraft({ ...draft, reportType: e.target.value })}>
                <Radio value="entry">Entry Date</Radio>
                <Radio value="transaction">Transaction Date</Radio>
              </Radio.Group>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-2">
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Module</span>
              <Select size="small" value={draft.module} onChange={(v) => setDraft({ ...draft, module: v })}
                options={MODULES} />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Name</span>
              <Select size="small" value={draft.userName} onChange={(v) => setDraft({ ...draft, userName: v })}
                showSearch optionFilterProp="label"
                options={[{ value: 'all', label: 'ALL' }, ...users.map((u) => ({
                  value: u._id || u.id,
                  label: (u.username || u.email || '').toUpperCase(),
                }))]}
              />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Show Last Record Date</span>
              <Radio.Group size="small" value={draft.showLastRecordDate}
                onChange={(e) => setDraft({ ...draft, showLastRecordDate: e.target.value })}>
                <Radio value="1">YES</Radio>
                <Radio value="0">NO</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Show Graph</span>
              <Radio.Group size="small" value={draft.showGraph}
                onChange={(e) => setDraft({ ...draft, showGraph: e.target.value })}>
                <Radio value="1">YES</Radio>
                <Radio value="0">NO</Radio>
              </Radio.Group>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">Entry From</span>
              <Radio.Group size="small" value={draft.entryFrom}
                onChange={(e) => setDraft({ ...draft, entryFrom: e.target.value })}>
                <Radio value="ALL">ALL</Radio>
                <Radio value="WEB">BY WEB</Radio>
                <Radio value="EXE">BY EXE</Radio>
                <Radio value="APP">BY APP</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => setApplied(draft)}>Search</Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      {applied && (
        <>
          <div className="flex items-center justify-between">
            <Text type="danger" className="text-xs font-medium">
              # = Closed Without Logout
            </Text>
            <Button danger icon={<FileSpreadsheet size={14} />}>Export To Excel</Button>
          </div>

          <Card bordered={false} className="!rounded-lg !shadow-sm">
            {isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {isError && <div className="text-sm text-red-600">Report endpoint not yet available on the server.</div>}
            {!isLoading && MODULE_GRID.map(renderModuleGrid)}
          </Card>
        </>
      )}
    </div>
  );
}
