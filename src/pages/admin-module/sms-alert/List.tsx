import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Typography, Input, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { smsEmailAlertHooks } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

// Trimmed list of alert types shown as columns on the list page (matches the
// legacy NwayERP "SMS Alert Mobile No. List" header order). Edit page covers
// the full set; here we show the most relevant subset to keep the table
// manageable on screen.
const LIST_COLS: { key: string; label: string }[] = [
  { key: 'sms_email_on_mr', label: 'On MR' },
  { key: 'sms_email_on_indent', label: 'On Indent' },
  { key: 'sms_email_on_indent_approval', label: 'On Indent\nApproval' },
  { key: 'sms_email_on_po', label: 'On PO' },
  { key: 'sms_email_on_po_approval', label: 'On PO\nApproval' },
  { key: 'sms_email_on_payment_req', label: 'Pay\nReq' },
  { key: 'sms_on_bank_balance', label: 'Bank\nBal.' },
  { key: 'sms_daily_stock_mis_ticked', label: 'Daily\nStock\nSMS' },
  { key: 'sms_email_on_production_challan', label: 'On\nProduction\nChallan' },
  { key: 'sms_email_on_machine_working_log', label: 'Machine\nInsurance' },
  { key: 'sms_email_on_jobsheet', label: 'JobSheet' },
  { key: 'sms_email_on_jobcard', label: 'JobCard' },
  { key: 'salary_sms_alert', label: 'Salary\nSMS' },
];

export default function SmsAlertList() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data, isLoading } = smsEmailAlertHooks.useList();
  const rows: any[] = ((data as any)?.data ?? []) as any[];
  const deleteMut = smsEmailAlertHooks.useDelete();

  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  const employeeName = (r: any): string => {
    const e = r.employee;
    if (!e) return '';
    if (typeof e === 'object') {
      return [e.firstName, e.lastName].filter(Boolean).join(' ').toUpperCase()
        || e.username || e.email || '';
    }
    return '';
  };

  const filtered = useMemo(() => rows.filter((r) => {
    for (const [k, v] of Object.entries(colFilters)) {
      if (!v) continue;
      const val = (() => {
        switch (k) {
          case 'mobile': return r.mobileNo;
          case 'email': return r.emailId;
          case 'userId':
            return typeof r.userId === 'object' ? (r.userId?.username || r.userId?.email) : r.userId;
          case 'employee': return employeeName(r);
          default:
            // alert column filter — match YES when checkbox truthy
            return r.alerts?.[k]?.assign ? 'YES' : '';
        }
      })();
      if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
    }
    return true;
  }), [rows, colFilters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      message.success('Alert removed');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete');
    }
  };

  const yesCell = (r: any, key: string) =>
    r.alerts?.[key]?.assign ? <span className="font-semibold">YES</span> : '';

  const columns = [
    {
      title: <div><div>SrNo.</div>{filterCell('sr')}</div>,
      key: 'sr', width: 60, render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: <div><div>Mobile No.</div>{filterCell('mobile')}</div>,
      dataIndex: 'mobileNo', key: 'mobile', width: 120,
      sorter: (a: any, b: any) => (a.mobileNo || '').localeCompare(b.mobileNo || ''),
    },
    {
      title: <div><div>Email ID</div>{filterCell('email')}</div>,
      dataIndex: 'emailId', key: 'email', width: 200,
    },
    {
      title: <div><div>User ID</div>{filterCell('userId')}</div>,
      key: 'userId', width: 120,
      render: (_: any, r: any) => typeof r.userId === 'object'
        ? (r.userId?.username || r.userId?.email || '')
        : r.userId,
    },
    {
      title: <div><div>Employee</div>{filterCell('employee')}</div>,
      key: 'employee', width: 180,
      render: (_: any, r: any) => employeeName(r),
    },
    ...LIST_COLS.map((c) => ({
      title: <div className="whitespace-pre-line text-center">{c.label}</div>,
      key: c.key,
      width: 90,
      render: (_: any, r: any) => yesCell(r, c.key),
    })),
    {
      title: 'View', key: 'view', width: 60, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Button type="text" size="small" icon={<Eye size={14} />}
          onClick={() => navigate(`/admin-module/master/sms-alert-voucher/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Edit', key: 'edit', width: 60, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Button type="text" size="small" icon={<Edit size={14} />}
          onClick={() => navigate(`/admin-module/master/sms-alert-voucher/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Delete', key: 'del', width: 70, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this entry?" onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">SMS Alert Mobile No. List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/admin-module/master/sms-alert-voucher/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="text-sm font-medium mb-2">Total {filtered.length} Records</div>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey={(r) => r._id || r.id}
          loading={isLoading}
          size="small"
          scroll={{ x: 1800 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
