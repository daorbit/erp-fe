import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Form, Input, Button, Typography, Select, Checkbox, App, Modal, Table,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { smsEmailAlertHooks } from '@/hooks/queries/usePhase2';

const { Title, Text } = Typography;

// ── Master list of alert types displayed on the screen.
// Two columns of rows (left list + right list) — render order matches the
// legacy NwayERP layout. Keys are stable identifiers stored on the document.
type Alert = { key: string; label: string };

const LEFT_ALERTS: Alert[] = [
  { key: 'sms_email_on_mr', label: 'SMS/EMAIL On MR' },
  { key: 'sms_email_on_po', label: 'SMS/EMAIL On PO' },
  { key: 'sms_on_bank_balance', label: 'SMS On Bank Balance' },
  { key: 'sms_email_on_production_challan', label: 'SMS/EMAIL On Production Challan' },
  { key: 'sms_on_machine', label: 'SMS On Machine' },
  { key: 'salary_sms_alert', label: 'Salary SMS Alert' },
  { key: 'sms_email_on_indent_approval', label: 'SMS/EMAIL On Indent Approval' },
  { key: 'sms_email_on_inward_outward', label: 'SMS/EMAIL On Inward/Outward' },
  { key: 'sms_email_on_jobcard', label: 'SMS/EMAIL On JobCard' },
  { key: 'sms_email_on_work_indent', label: 'SMS/EMAIL On Work Indent' },
  { key: 'sms_email_on_wo', label: 'SMS/EMAIL On WO' },
  { key: 'sms_email_on_subcontractor_bill', label: 'SMS/EMAIL On Subcontractor Bill' },
  { key: 'sms_email_on_running_bill', label: 'SMS/EMAIL On Running Bill' },
  { key: 'email_on_builty_party_bill', label: 'EMAIL On Builty Party Bill' },
];

const RIGHT_ALERTS: Alert[] = [
  { key: 'sms_email_on_indent', label: 'SMS/EMAIL On Indent' },
  { key: 'sms_email_on_payment_req', label: 'SMS/EMAIL on Payment Req.' },
  { key: 'sms_daily_stock_mis_ticked', label: 'SMS Of Daily Stock (MIS Ticked)' },
  { key: 'sms_on_task_admin', label: 'SMS On Task(Admin)' },
  { key: 'sms_email_on_machine_working_log', label: 'SMS/EMAIL On Machine Working Log' },
  { key: 'sms_email_on_po_approval', label: 'SMS/EMAIL On PO Approval' },
  { key: 'sms_email_on_new_joining', label: 'SMS/EMAIL On New Joining Employee / Existing' },
  { key: 'sms_email_on_jobsheet', label: 'SMS/EMAIL On JobSheet' },
  { key: 'sms_email_on_grn', label: 'SMS/EMAIL On GRN' },
  { key: 'sms_email_on_work_indent_approval', label: 'SMS/EMAIL On Work Indent Approval' },
  { key: 'sms_email_on_wo_approval', label: 'SMS/EMAIL On WO Approval' },
  { key: 'sms_email_on_subcontractor_bill_approval', label: 'SMS/EMAIL On Subcontractor Bill Approval' },
  { key: 'sms_email_on_running_bill_approval', label: 'SMS/EMAIL On Running Bill Approval' },
  { key: 'email_on_builty_party_bill_approval', label: 'EMAIL On Builty Party Bill Approval' },
];

type AlertConfig = {
  assign?: boolean;
  defaultTicked?: boolean;
  compulsory?: boolean;
  sites?: string[];
};

export default function SmsAlertAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const isEdit = !!id;

  const [alerts, setAlerts] = useState<Record<string, AlertConfig>>({});
  const [siteModal, setSiteModal] = useState<{ open: boolean; alertKey?: string }>({ open: false });
  const [siteSelection, setSiteSelection] = useState<string[]>([]);

  const createMut = smsEmailAlertHooks.useCreate();
  const updateMut = smsEmailAlertHooks.useUpdate();
  const { data: existing } = smsEmailAlertHooks.useDetail(id || '');

  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  const { data: branchesData } = useQuery({
    queryKey: ['branches-all-tree'],
    queryFn: () => api.get('/branches', { limit: '500' }),
  });
  const branches: any[] = ((branchesData as any)?.data ?? []) as any[];

  const userOptions = useMemo(() =>
    users.map((u) => ({
      value: u._id || u.id,
      label: `${u.firstName || ''} ${u.lastName || ''} ${u.employeeId ? `(${u.employeeId})` : ''}`.trim() || u.email,
    })), [users]);

  // ─── Hydrate on edit ──────────────────────────────────────────────────────
  useEffect(() => {
    const doc = (existing as any)?.data;
    if (isEdit && doc) {
      const empId = typeof doc.employee === 'object' ? doc.employee._id : doc.employee;
      const usrId = typeof doc.userId === 'object' ? doc.userId._id : doc.userId;
      form.setFieldsValue({
        employee: empId,
        userId: usrId,
        mobileNo: doc.mobileNo,
        emailId: doc.emailId,
      });
      // doc.alerts may be an object or a Map serialised to plain object
      const a: Record<string, AlertConfig> = {};
      const src = doc.alerts || {};
      for (const [k, v] of Object.entries<any>(src)) {
        a[k] = {
          assign: !!v?.assign,
          defaultTicked: !!v?.defaultTicked,
          compulsory: !!v?.compulsory,
          sites: (v?.sites || []).map((s: any) => (typeof s === 'object' ? s._id : s)),
        };
      }
      setAlerts(a);
    }
  }, [existing, isEdit, form]);

  const setAlertField = (key: string, field: keyof AlertConfig, val: any) => {
    setAlerts((p) => ({ ...p, [key]: { ...p[key], [field]: val } }));
  };

  const openSiteModal = (alertKey: string) => {
    setSiteSelection(alerts[alertKey]?.sites ?? []);
    setSiteModal({ open: true, alertKey });
  };

  const saveSiteSelection = () => {
    const k = siteModal.alertKey;
    if (k) setAlertField(k, 'sites', siteSelection);
    setSiteModal({ open: false });
  };

  // ─── ALL row toggles: stamps the same flag across every alert row ─────────
  const allChecked = (field: 'assign' | 'defaultTicked' | 'compulsory') => {
    const all = [...LEFT_ALERTS, ...RIGHT_ALERTS];
    return all.length > 0 && all.every((a) => alerts[a.key]?.[field]);
  };
  const toggleAll = (field: 'assign' | 'defaultTicked' | 'compulsory', val: boolean) => {
    setAlerts((prev) => {
      const next = { ...prev };
      for (const a of [...LEFT_ALERTS, ...RIGHT_ALERTS]) {
        next[a.key] = { ...next[a.key], [field]: val };
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      const payload: any = {
        employee: v.employee,
        userId: v.userId,
        mobileNo: v.mobileNo,
        emailId: v.emailId,
        alerts,
      };
      if (isEdit) {
        await updateMut.mutateAsync({ id: id!, data: payload });
        message.success('SMS/Email alert updated');
      } else {
        await createMut.mutateAsync(payload);
        message.success('SMS/Email alert created');
      }
      navigate('/admin-module/master/sms-alert-voucher/list');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">SMS/Email Alert Mobile No./Email Id</Title>
        <Button icon={<ListIcon size={14} />} onClick={() => navigate('/admin-module/master/sms-alert-voucher/list')}>
          List
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">
          {isEdit ? 'Edit Mode' : 'New Mode'}
        </Text>

        <Form form={form} layout="horizontal" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <Form.Item label={<span>Employee Name<span className="text-red-500">*</span></span>}
              name="employee" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
              rules={[{ required: true, message: 'Employee is required' }]}>
              <Select showSearch optionFilterProp="label" placeholder="Type here to search data" options={userOptions} allowClear />
            </Form.Item>
            <Form.Item label="User ID" name="userId" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Select showSearch optionFilterProp="label" placeholder="Type here to search data" options={userOptions} allowClear />
            </Form.Item>

            <Form.Item label={<span>Mobile No.<span className="text-red-500">*</span></span>}
              name="mobileNo" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
              rules={[{ required: true, message: 'Mobile is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Email ID" name="emailId" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Input />
            </Form.Item>
          </div>

          {/* Alert grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1"></th>
                  <th className="px-2 py-1 text-center">Assign</th>
                  <th className="px-2 py-1 text-center">Default<br />Ticked</th>
                  <th className="px-2 py-1 text-center">Compulsory</th>
                  <th className="px-2 py-1 text-center">Site<br />Selection</th>
                  <th className="px-2 py-1"></th>
                  <th className="px-2 py-1 text-center">Assign</th>
                  <th className="px-2 py-1 text-center">Default<br />Ticked</th>
                  <th className="px-2 py-1 text-center">Compulsory</th>
                  <th className="px-2 py-1 text-center">Site<br />Selection</th>
                </tr>
                {/* ALL row */}
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <td className="text-right pr-3 py-1 font-semibold">ALL</td>
                  <td className="text-center"><Checkbox checked={allChecked('assign')} onChange={(e) => toggleAll('assign', e.target.checked)} /></td>
                  <td className="text-center"><Checkbox checked={allChecked('defaultTicked')} onChange={(e) => toggleAll('defaultTicked', e.target.checked)} /></td>
                  <td className="text-center"><Checkbox checked={allChecked('compulsory')} onChange={(e) => toggleAll('compulsory', e.target.checked)} /></td>
                  <td colSpan={6}></td>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(LEFT_ALERTS.length, RIGHT_ALERTS.length) }).map((_, i) => {
                  const left = LEFT_ALERTS[i];
                  const right = RIGHT_ALERTS[i];
                  const cellsFor = (a?: Alert) => {
                    if (!a) return <><td /><td /><td /><td /><td /></>;
                    const cfg = alerts[a.key] || {};
                    return (
                      <>
                        <td className="text-right pr-3 py-1 text-sm">{a.label}</td>
                        <td className="text-center"><Checkbox checked={!!cfg.assign} onChange={(e) => setAlertField(a.key, 'assign', e.target.checked)} /></td>
                        <td className="text-center"><Checkbox checked={!!cfg.defaultTicked} onChange={(e) => setAlertField(a.key, 'defaultTicked', e.target.checked)} /></td>
                        <td className="text-center"><Checkbox checked={!!cfg.compulsory} onChange={(e) => setAlertField(a.key, 'compulsory', e.target.checked)} /></td>
                        <td className="text-center">
                          <Button size="small" type="link" onClick={() => openSiteModal(a.key)}>
                            &lt;&lt; Select Site &gt;&gt;
                          </Button>
                          {(cfg.sites?.length ?? 0) > 0 && (
                            <span className="text-xs text-gray-500 ml-1">({cfg.sites!.length})</span>
                          )}
                        </td>
                      </>
                    );
                  };
                  return (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                      {cellsFor(left)}
                      {cellsFor(right)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <Button type="primary" danger loading={createMut.isPending || updateMut.isPending} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/sms-alert-voucher/list')}>Close</Button>
          </div>
        </Form>
      </Card>

      {/* Site selection modal — checkbox table per legacy "Select Site Wise" UI */}
      <Modal
        open={siteModal.open}
        title="Select Site Wise"
        onCancel={() => setSiteModal({ open: false })}
        onOk={saveSiteSelection}
        okText="Done"
        width={900}
        destroyOnClose
      >
        <Table
          size="small"
          rowKey={(r: any) => r._id || r.id}
          dataSource={branches}
          pagination={false}
          scroll={{ y: 420 }}
          bordered
          columns={[
            {
              title: '( Company Name) Site Name',
              key: 'name',
              render: (_: any, b: any) => {
                const company = typeof b.company === 'object'
                  ? (b.company?.code || b.company?.name)
                  : b.code;
                return (
                  <span>
                    <span className="text-gray-500">({company || ''})</span>{' '}
                    <span className="uppercase">{b.name}</span>
                  </span>
                );
              },
            },
            {
              title: (
                <div className="flex items-center justify-start gap-2">
                  <span>Assign</span>
                  <Checkbox
                    checked={branches.length > 0 && branches.every((b) => siteSelection.includes(b._id || b.id))}
                    indeterminate={
                      branches.some((b) => siteSelection.includes(b._id || b.id))
                      && !branches.every((b) => siteSelection.includes(b._id || b.id))
                    }
                    onChange={(e) =>
                      setSiteSelection(e.target.checked ? branches.map((b) => b._id || b.id) : [])
                    }
                  />
                </div>
              ),
              key: 'assign',
              width: 120,
              render: (_: any, b: any) => {
                const id = b._id || b.id;
                return (
                  <Checkbox
                    checked={siteSelection.includes(id)}
                    onChange={(e) =>
                      setSiteSelection((p) =>
                        e.target.checked ? [...p, id] : p.filter((x) => x !== id),
                      )
                    }
                  />
                );
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
}
