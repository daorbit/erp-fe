import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Card, Checkbox, Input, Select, Table, Typography, App, Spin, Tag,
} from 'antd';
import { List as ListIcon } from 'lucide-react';
import { smsEmailAlertHooks } from '@/hooks/queries/usePhase2';
import employeeService from '@/services/employeeService';
import api from '@/services/api';

const { Title } = Typography;

// All alert types displayed in the grid (left column, then right column)
const ALERT_KEYS_LEFT = [
  'smsEmailOnMR',
  'smsEmailOnPO',
  'smsOnBankBalance',
  'smsEmailOnProductionChallan',
  'smsOnMachine',
  'salaryAlert',
  'smsEmailOnIndentApproval',
  'smsEmailOnInwardOutward',
  'smsEmailOnJobCard',
  'smsEmailOnWorkIndent',
  'smsEmailOnWO',
  'smsEmailOnSubcontractorBill',
  'smsEmailOnRunningBill',
  'emailOnBuiltyPartyBill',
];

const ALERT_KEYS_RIGHT = [
  'smsEmailOnIndent',
  'smsEmailOnPaymentReq',
  'smsOfDailyStockMISTicked',
  'smsOnTaskAdmin',
  'smsEmailOnMachineWorkingLog',
  'smsEmailOnPOApproval',
  'smsEmailOnNewJoiningExisting',
  'smsEmailOnJobSheet',
  'smsEmailOnGRN',
  'smsEmailOnWorkIndentApproval',
  'smsEmailOnWOApproval',
  'smsEmailOnSubcontractorBillApproval',
  'smsEmailOnRunningBillApproval',
  'emailOnBuiltyPartyBillApproval',
];

const ALERT_LABELS: Record<string, string> = {
  smsEmailOnMR: 'SMS/EMAIL On MR',
  smsEmailOnPO: 'SMS/EMAIL On PO',
  smsOnBankBalance: 'SMS On Bank Balance',
  smsEmailOnProductionChallan: 'SMS/EMAIL On Production Challan',
  smsOnMachine: 'SMS On Machine',
  salaryAlert: 'Salary SMS Alert',
  smsEmailOnIndentApproval: 'SMS/EMAIL On Indent Approval',
  smsEmailOnInwardOutward: 'SMS/EMAIL On Inward/Outward',
  smsEmailOnJobCard: 'SMS/EMAIL On JobCard',
  smsEmailOnWorkIndent: 'SMS/EMAIL On Work Indent',
  smsEmailOnWO: 'SMS/EMAIL On WO',
  smsEmailOnSubcontractorBill: 'SMS/EMAIL On Subcontractor Bill',
  smsEmailOnRunningBill: 'SMS/EMAIL On Running Bill',
  emailOnBuiltyPartyBill: 'EMAIL On Builty Party Bill',
  smsEmailOnIndent: 'SMS/EMAIL On Indent',
  smsEmailOnPaymentReq: 'SMS/EMAIL on Payment Req.',
  smsOfDailyStockMISTicked: 'SMS Of Daily Stock (MIS Ticked)',
  smsOnTaskAdmin: 'SMS On Task(Admin)',
  smsEmailOnMachineWorkingLog: 'SMS/EMAIL On Machine Working Log',
  smsEmailOnPOApproval: 'SMS/EMAIL On PO Approval',
  smsEmailOnNewJoiningExisting: 'SMS/EMAIL On New Joining Employee / Existing',
  smsEmailOnJobSheet: 'SMS/EMAIL On JobSheet',
  smsEmailOnGRN: 'SMS/EMAIL On GRN',
  smsEmailOnWorkIndentApproval: 'SMS/EMAIL On Work Indent Approval',
  smsEmailOnWOApproval: 'SMS/EMAIL On WO Approval',
  smsEmailOnSubcontractorBillApproval: 'SMS/EMAIL On Subcontractor Bill Approval',
  smsEmailOnRunningBillApproval: 'SMS/EMAIL On Running Bill Approval',
  emailOnBuiltyPartyBillApproval: 'EMAIL On Builty Party Bill Approval',
};

interface AlertRow {
  key: string;
  assign: boolean;
  defaultTicked: boolean;
  compulsory: boolean;
  sites: string[];
}

const ALL_KEYS = [...ALERT_KEYS_LEFT, ...ALERT_KEYS_RIGHT];

const defaultAlerts = (): Record<string, AlertRow> =>
  Object.fromEntries(
    ALL_KEYS.map((k) => [k, { key: k, assign: false, defaultTicked: false, compulsory: false, sites: [] }]),
  );

const SmsEmailAlertAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { message } = App.useApp();

  const create = smsEmailAlertHooks.useCreate();
  const update = smsEmailAlertHooks.useUpdate();

  // Employee search
  const [empOptions, setEmpOptions] = useState<{ value: string; label: string }[]>([]);
  const [empSearching, setEmpSearching] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // User search
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const [mobileNo, setMobileNo] = useState('');
  const [emailId, setEmailId] = useState('');
  const [alerts, setAlerts] = useState<Record<string, AlertRow>>(defaultAlerts());
  const [submitting, setSubmitting] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  // Load existing record when editing
  useEffect(() => {
    if (!id) return;
    setLoadingRecord(true);
    api.get<any>(`/sms-email-alerts/${id}`)
      .then((res: any) => {
        const r = res?.data ?? res;
        const empVal = typeof r.employee === 'object' ? r.employee?._id || r.employee?.id : r.employee;
        const uVal = typeof r.userId === 'object' ? r.userId?._id || r.userId?.id : r.userId;
        setEmployeeId(empVal);
        setUserId(uVal);
        setMobileNo(r.mobileNo ?? '');
        setEmailId(r.emailId ?? '');

        // Restore alerts from Map
        const loaded = defaultAlerts();
        if (r.alerts) {
          const entries = r.alerts instanceof Map ? Array.from(r.alerts.entries()) : Object.entries(r.alerts);
          (entries as [string, any][]).forEach(([k, v]) => {
            if (loaded[k]) {
              loaded[k] = {
                key: k,
                assign: !!v.assign,
                defaultTicked: !!v.defaultTicked,
                compulsory: !!v.compulsory,
                sites: Array.isArray(v.sites) ? v.sites : [],
              };
            }
          });
        }
        // legacy flags
        if (r.salaryAlert !== undefined) loaded.salaryAlert.assign = !!r.smsOnSalaryAlert;
        if (r.smsEmailOnNewJoiningExitAlert !== undefined) loaded.smsEmailOnNewJoiningExisting.assign = !!r.smsEmailOnNewJoiningExitAlert;
        setAlerts(loaded);

        // Set employee label for dropdown
        if (r.employee && typeof r.employee === 'object') {
          const u = r.employee.userId ?? r.employee;
          setEmpOptions([{ value: empVal, label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() }]);
        }
        if (r.userId && typeof r.userId === 'object') {
          setUserOptions([{ value: uVal, label: `${r.userId.firstName ?? ''} ${r.userId.lastName ?? ''}`.trim() }]);
        }
      })
      .catch((e: any) => message.error(e?.message || 'Failed to load'))
      .finally(() => setLoadingRecord(false));
  }, [id]);

  const handleEmpSearch = useCallback((text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text) { setEmpOptions([]); return; }
    setEmpSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await employeeService.getAll({ search: text, limit: '20' });
        const list = res?.data ?? [];
        setEmpOptions(list.map((e: any) => {
          const u = e.userId ?? e;
          return { value: e._id || e.id, label: `${u.firstName ?? ''} ${u.lastName ?? ''} (${e.employeeId ?? ''})`.trim() };
        }));
      } catch { setEmpOptions([]); }
      finally { setEmpSearching(false); }
    }, 300);
  }, []);

  const handleUserSearch = useCallback((text: string) => {
    if (!text) { setUserOptions([]); return; }
    setUserSearching(true);
    api.get<any>('/auth/users', { userName: text, limit: '20' })
      .then((res: any) => {
        const list = res?.data ?? [];
        setUserOptions(list.map((u: any) => ({
          value: u._id || u.id,
          label: `${u.firstName ?? ''} ${u.lastName ?? ''} (${u.username ?? u.email ?? ''})`.trim(),
        })));
      })
      .catch(() => setUserOptions([]))
      .finally(() => setUserSearching(false));
  }, []);

  const toggleAlert = (key: string, field: keyof Omit<AlertRow, 'key' | 'sites'>) => {
    setAlerts((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] },
    }));
  };

  const toggleAllAssign = (checked: boolean) => {
    setAlerts((prev) => Object.fromEntries(
      Object.entries(prev).map(([k, v]) => [k, { ...v, assign: checked }]),
    ));
  };
  const toggleAllDefaultTicked = (checked: boolean) => {
    setAlerts((prev) => Object.fromEntries(
      Object.entries(prev).map(([k, v]) => [k, { ...v, defaultTicked: checked }]),
    ));
  };
  const toggleAllCompulsory = (checked: boolean) => {
    setAlerts((prev) => Object.fromEntries(
      Object.entries(prev).map(([k, v]) => [k, { ...v, compulsory: checked }]),
    ));
  };

  const allAssign = ALL_KEYS.every((k) => alerts[k]?.assign);
  const allDefaultTicked = ALL_KEYS.every((k) => alerts[k]?.defaultTicked);
  const allCompulsory = ALL_KEYS.every((k) => alerts[k]?.compulsory);

  const handleSave = async () => {
    if (!employeeId) { message.error('Employee Name is required'); return; }
    if (!mobileNo.trim()) { message.error('Mobile No. is required'); return; }
    setSubmitting(true);
    try {
      const alertsMap: Record<string, any> = {};
      ALL_KEYS.forEach((k) => {
        alertsMap[k] = {
          assign: alerts[k].assign,
          defaultTicked: alerts[k].defaultTicked,
          compulsory: alerts[k].compulsory,
          sites: alerts[k].sites,
        };
      });
      const payload = {
        employee: employeeId,
        userId,
        mobileNo: mobileNo.trim(),
        emailId: emailId.trim(),
        alerts: alertsMap,
      };
      if (isEdit) await update.mutateAsync({ id, data: payload });
      else await create.mutateAsync(payload);
      message.success(isEdit ? 'Updated successfully' : 'Created successfully');
      navigate('/master/other/sms-email-alert');
    } catch (e: any) {
      message.error(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRecord) {
    return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  }

  // Build alert grid columns
  const alertCols = (side: 'left' | 'right') => {
    const keys = side === 'left' ? ALERT_KEYS_LEFT : ALERT_KEYS_RIGHT;
    return [
      {
        title: '',
        dataIndex: 'key',
        width: 220,
        render: (k: string) => (
          <span className="text-sm text-right block pr-2">{ALERT_LABELS[k]}</span>
        ),
      },
      {
        title: 'Assign',
        dataIndex: 'assign',
        width: 70,
        align: 'center' as const,
        render: (_: any, row: AlertRow) => (
          <Checkbox checked={row.assign} onChange={() => toggleAlert(row.key, 'assign')} />
        ),
      },
      {
        title: 'Default Ticked',
        dataIndex: 'defaultTicked',
        width: 100,
        align: 'center' as const,
        render: (_: any, row: AlertRow) => (
          <Checkbox checked={row.defaultTicked} onChange={() => toggleAlert(row.key, 'defaultTicked')} />
        ),
      },
      {
        title: 'Compulsory',
        dataIndex: 'compulsory',
        width: 90,
        align: 'center' as const,
        render: (_: any, row: AlertRow) => (
          <Checkbox checked={row.compulsory} onChange={() => toggleAlert(row.key, 'compulsory')} />
        ),
      },
      {
        title: 'Site Selection',
        dataIndex: 'sites',
        width: 130,
        align: 'center' as const,
        render: (_: any, row: AlertRow) => (
          <Button
            type="link"
            size="small"
            disabled={!row.assign}
            className="text-xs"
          >
            {'<< Select Site >>'}
          </Button>
        ),
      },
    ];
  };

  const leftData = ALERT_KEYS_LEFT.map((k) => alerts[k]);
  const rightData = ALERT_KEYS_RIGHT.map((k) => alerts[k]);

  const allRow = (
    <tr className="border-b border-gray-700">
      <td className="text-right pr-2 py-1 font-semibold text-sm w-[220px]">ALL</td>
      <td className="text-center w-[70px]">
        <Checkbox checked={allAssign} onChange={(e) => toggleAllAssign(e.target.checked)} />
      </td>
      <td className="text-center w-[100px]">
        <Checkbox checked={allDefaultTicked} onChange={(e) => toggleAllDefaultTicked(e.target.checked)} />
      </td>
      <td className="text-center w-[90px]">
        <Checkbox checked={allCompulsory} onChange={(e) => toggleAllCompulsory(e.target.checked)} />
      </td>
      <td className="text-center w-[130px]" />
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-2">
        <Title level={4} className="!mb-0">SMS/Email Alert Mobile No./Email Id</Title>
        <Button
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/master/other/sms-email-alert')}
        >
          List
        </Button>
      </div>

      <Card bordered={false}>
        {/* Mode tag */}
        <div className="text-center mb-4">
          <Tag color={isEdit ? 'blue' : 'red'} className="text-sm px-4 py-0.5">
            {isEdit ? 'Edit Mode' : 'New Mode'}
          </Tag>
        </div>

        {/* ─── Employee / User / Contact fields ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-36 shrink-0 text-right">
              <span className="text-red-500">*</span> Employee Name<span className="text-red-500">*</span>:
            </label>
            <Select
              className="flex-1"
              showSearch
              filterOption={false}
              placeholder="Type here to search data"
              value={employeeId}
              onSearch={handleEmpSearch}
              onChange={setEmployeeId}
              loading={empSearching}
              options={empOptions}
              allowClear
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24 shrink-0 text-right">User ID:</label>
            <Select
              className="flex-1"
              showSearch
              filterOption={false}
              placeholder="Type here to search data"
              value={userId}
              onSearch={handleUserSearch}
              onChange={setUserId}
              loading={userSearching}
              options={userOptions}
              allowClear
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-36 shrink-0 text-right">
              <span className="text-red-500">*</span> Mobile No.<span className="text-red-500">*</span>:
            </label>
            <Input
              className="flex-1"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24 shrink-0 text-right">Email ID:</label>
            <Input
              className="flex-1"
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        {/* ─── Alert Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Left column */}
          <Table
            dataSource={leftData}
            columns={alertCols('left')}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
            title={() => (
              <table className="w-full">
                <tbody>
                  {allRow}
                </tbody>
              </table>
            )}
          />
          {/* Right column */}
          <Table
            dataSource={rightData}
            columns={alertCols('right')}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
            title={() => (
              <table className="w-full">
                <tbody>
                  {allRow}
                </tbody>
              </table>
            )}
          />
        </div>

        {/* ─── Actions ─────────────────────────────────────────────── */}
        <div className="flex justify-center gap-3 mt-6">
          <Button type="primary" onClick={handleSave} loading={submitting}>Save</Button>
          <Button onClick={() => navigate('/master/other/sms-email-alert')}>Close</Button>
        </div>
      </Card>
    </div>
  );
};

// ─── List page ───────────────────────────────────────────────────────────────

const SmsEmailAlertList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = smsEmailAlertHooks.useList();
  const del = smsEmailAlertHooks.useDelete();
  const { message } = App.useApp();

  const rows = (data?.data ?? []).map((r: any, i: number) => ({
    ...r,
    _sno: i + 1,
    _empName:
      r.employee && typeof r.employee === 'object'
        ? `${r.employee.userId?.firstName ?? r.employee.firstName ?? ''} ${r.employee.userId?.lastName ?? r.employee.lastName ?? ''}`.trim()
        : '',
  }));

  const columns = [
    { title: 'S.No.', dataIndex: '_sno', width: 60 },
    { title: 'Employee Name', dataIndex: '_empName' },
    { title: 'Mobile No.', dataIndex: 'mobileNo', width: 140 },
    { title: 'Email ID', dataIndex: 'emailId' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      width: 100,
      render: (_: any, r: any) => (
        <div className="flex gap-2">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/master/other/sms-email-alert/edit/${r._id || r.id}`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={async () => {
              try {
                await del.mutateAsync(r._id || r.id);
                message.success('Deleted');
              } catch (e: any) {
                message.error(e?.message || 'Delete failed');
              }
            }}
          >
            Del
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <Title level={4} className="!mb-0">SMS/Email Alert — List</Title>
        <Button type="primary" onClick={() => navigate('/master/other/sms-email-alert/add')}>
          + Add New
        </Button>
      </div>
      <Card bordered={false}>
        <Table
          dataSource={rows}
          columns={columns as any}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small"
          bordered
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

// ─── Router wrapper ───────────────────────────────────────────────────────────

const SmsEmailAlertPage: React.FC = () => {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  // Route: /master/other/sms-email-alert          → list
  // Route: /master/other/sms-email-alert/add      → add
  // Route: /master/other/sms-email-alert/edit/:id → edit
  const loc = window.location.pathname;
  if (loc.includes('/add') || loc.includes('/edit')) return <SmsEmailAlertAdd />;
  return <SmsEmailAlertList />;
};

export default SmsEmailAlertPage;
