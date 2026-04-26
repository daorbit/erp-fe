import React, { useState } from 'react';
import { Card, Button, Typography, Modal, Form, Input, App, InputNumber, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { List as ListIcon, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

const { Title, Text } = Typography;

const APP_TYPES = ['erp', 'hrm', 'geo_tagging', 'transport', 'task_management'] as const;
const APP_LABELS: Record<string, string> = {
  erp: 'ERP App',
  hrm: 'HRM App',
  geo_tagging: 'Geo Tagging App',
  transport: 'Transport App',
  task_management: 'TaskManagement App',
};

type Limits = Record<string, { total?: number; used?: number }>;

export default function MobileAppCountAdd() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['mobile-app-count'],
    queryFn: () => api.get('/mobile-app-counts'),
  });
  const doc: any = (data as any)?.data ?? {};
  const client: Limits = doc.client || {};
  const nway: Limits = doc.nway || {};
  const history: any[] = doc.history || [];
  const activationUsers: any[] = doc.activationUsers || [];

  // ─── Modals ──────────────────────────────────────────────────────────────
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [updateLimitOpen, setUpdateLimitOpen] = useState(false);
  const [activationForm] = Form.useForm();
  const [updateLimitForm] = Form.useForm();

  // ─── Mutations ───────────────────────────────────────────────────────────
  const addUserMut = useMutation({
    mutationFn: (data: any) => api.post('/mobile-app-counts/activation-users', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-app-count'] });
      message.success('Activation user added');
      setActivationModalOpen(false);
      activationForm.resetFields();
    },
    onError: (err: any) => message.error(err?.message || 'Failed'),
  });

  const updateLimitsMut = useMutation({
    mutationFn: (data: any) => api.put('/mobile-app-counts/limits', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-app-count'] });
      message.success('Limits updated');
      setUpdateLimitOpen(false);
      updateLimitForm.resetFields();
    },
    onError: (err: any) => message.error(err?.message || 'Failed'),
  });

  // Active/inactive ERP user counts (uses activationUsers array as a proxy).
  const activeUserCount = activationUsers.filter((u) => u.isActive).length;
  const inactiveUserCount = activationUsers.filter((u) => !u.isActive).length;

  const renderLimitTable = (title: string, limits: Limits) => (
    <table className="w-full border-collapse text-sm mb-4">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-800">
          <th className="px-2 py-1 text-left">Limit Summary</th>
          <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>{title}</th>
        </tr>
        <tr className="bg-gray-50 dark:bg-gray-900">
          <th></th>
          {APP_TYPES.map((t) => (
            <th key={t} className="px-2 py-1 text-center">
              {APP_LABELS[t]}
              {t === 'erp' && (
                <Tooltip title="Note : ERP App Count Can Be A User App, Admin App Count">
                  <Info size={12} className="inline ml-1 text-gray-500 cursor-help" />
                </Tooltip>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-2 py-1">No. of available app</td>
          {APP_TYPES.map((t) => <td key={t} className="px-2 py-1 text-center">{limits[t]?.total ?? 0}</td>)}
        </tr>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-2 py-1">Used app</td>
          {APP_TYPES.map((t) => (
            <td key={t} className="px-2 py-1 text-center text-blue-600">{limits[t]?.used ?? 0}</td>
          ))}
        </tr>
        <tr>
          <td className="px-2 py-1 font-semibold">Balance App</td>
          {APP_TYPES.map((t) => (
            <td key={t} className="px-2 py-1 text-center font-semibold">
              {(limits[t]?.total ?? 0) - (limits[t]?.used ?? 0)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  // ─── Update Limit Form ───────────────────────────────────────────────────
  const openUpdateLimit = () => {
    const initial: any = { client: {}, nway: {} };
    for (const t of APP_TYPES) {
      initial.client[t] = client[t]?.total ?? 0;
      initial.nway[t] = nway[t]?.total ?? 0;
    }
    updateLimitForm.setFieldsValue(initial);
    setUpdateLimitOpen(true);
  };

  const submitUpdateLimit = async () => {
    const v = await updateLimitForm.validateFields();
    const payload = {
      client: APP_TYPES.reduce<Limits>((acc, t) => {
        acc[t] = { total: v.client?.[t] ?? 0, used: client[t]?.used ?? 0 };
        return acc;
      }, {}),
      nway: APP_TYPES.reduce<Limits>((acc, t) => {
        acc[t] = { total: v.nway?.[t] ?? 0, used: nway[t]?.used ?? 0 };
        return acc;
      }, {}),
      remark: v.remark,
    };
    await updateLimitsMut.mutateAsync(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Mobile App Count</Title>
        <Button icon={<ListIcon size={14} />} onClick={() => navigate('/admin-module/master/mobile-app-count/list')}>
          List
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="flex justify-end gap-2 mb-2">
          <Button type="primary" danger size="small" onClick={() => setActivationModalOpen(true)}>Activation user rights</Button>
          <Button type="primary" danger size="small" onClick={() => setHistoryModalOpen(true)}>App Limit History</Button>
          <Button type="primary" danger size="small" onClick={openUpdateLimit}>Update Limit</Button>
        </div>

        <Text type="danger" className="block font-medium mb-2">
          Note: Tagging Count included in ERP Count and HRM Count &amp; Total Otp Verified Count Show
        </Text>

        {renderLimitTable('Client Team', client)}
        {renderLimitTable('Nway Team', nway)}

        {/* Users summary */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 text-left">Users Summary</th>
              <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>Active/Inactive App Users</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th></th>
              {APP_TYPES.map((t) => <th key={t} className="px-2 py-1 text-center">{APP_LABELS[t]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="px-2 py-1">Active App Users</td>
              {APP_TYPES.map((t) => (
                <td key={t} className="px-2 py-1 text-center text-blue-600">{t === 'erp' ? activeUserCount : 0}</td>
              ))}
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="px-2 py-1">Inactive App Users</td>
              {APP_TYPES.map((t) => (
                <td key={t} className="px-2 py-1 text-center text-blue-600">{t === 'erp' ? inactiveUserCount : 0}</td>
              ))}
            </tr>
            <tr>
              <td className="px-2 py-1 font-semibold">Total Users</td>
              {APP_TYPES.map((t) => (
                <td key={t} className="px-2 py-1 text-center font-semibold">{t === 'erp' ? activationUsers.length : 0}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Authorized via OTP */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 text-center" colSpan={2}>Authorized To Active / Inactive User Via OTP</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="px-2 py-1 text-left w-1/2">Mobile No.</th>
              <th className="px-2 py-1 text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            {activationUsers.length === 0
              ? <tr><td colSpan={2} className="px-2 py-2 text-xs text-gray-500">No users</td></tr>
              : activationUsers.map((u: any) => (
                <tr key={u._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-2 py-1">{u.mobile}</td>
                  <td className="px-2 py-1">{u.userName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {/* ─── Activation User Rights modal ──────────────────────────────────── */}
      <Modal
        open={activationModalOpen}
        title="Activation User Rights"
        onCancel={() => setActivationModalOpen(false)}
        footer={null}
        width={1100}
      >
        <Text type="danger" className="block font-medium mb-3">
          Note: This for add user for APP activation rights
        </Text>
        <Form form={activationForm} layout="vertical" size="small"
          onFinish={(v) => addUserMut.mutate(v)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Form.Item label="User Name" name="userName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Mobile No." name="mobile" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Password" name="password">
              <Input.Password />
            </Form.Item>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            <Button type="primary" danger htmlType="submit" loading={addUserMut.isPending}>Save</Button>
            <Button danger onClick={() => setActivationModalOpen(false)}>Close</Button>
          </div>
        </Form>
      </Modal>

      {/* ─── App Limit History modal ───────────────────────────────────────── */}
      <Modal
        open={historyModalOpen}
        title="App Limit History"
        onCancel={() => setHistoryModalOpen(false)}
        footer={[<Button key="c" onClick={() => setHistoryModalOpen(false)}>Close</Button>]}
        width={1300}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 text-left">Entry By Name/Mobile</th>
              <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>Client Team</th>
              <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>Nway Team</th>
              <th className="px-2 py-1 text-left">Remark</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th></th>
              {APP_TYPES.map((t) => <th key={`c-${t}`} className="px-2 py-1 text-center">{APP_LABELS[t].replace(' App', '')}</th>)}
              {APP_TYPES.map((t) => <th key={`n-${t}`} className="px-2 py-1 text-center">{APP_LABELS[t].replace(' App', '')}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0
              ? <tr><td colSpan={2 + APP_TYPES.length * 2} className="px-2 py-3 text-xs text-gray-500 text-center">No history</td></tr>
              : history.map((h: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-2 py-1">{h.entryByName}{h.mobile ? `/${h.mobile}` : ''}</td>
                  {APP_TYPES.map((t) => <td key={`c-${i}-${t}`} className="px-2 py-1 text-center">{h.client?.[t] ?? 0}</td>)}
                  {APP_TYPES.map((t) => <td key={`n-${i}-${t}`} className="px-2 py-1 text-center">{h.nway?.[t] ?? 0}</td>)}
                  <td className="px-2 py-1">{h.remark}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Modal>

      {/* ─── Update Limit Form modal ───────────────────────────────────────── */}
      <Modal
        open={updateLimitOpen}
        title="Update Limit Form"
        onCancel={() => setUpdateLimitOpen(false)}
        footer={null}
        width={1300}
      >
        <Text type="danger" className="block font-medium mb-3">
          Note: Tagging Count included in ERP Count and HRM Count &amp; Total Otp Verified Count Show
        </Text>
        <Form form={updateLimitForm} layout="vertical" size="small">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-2 py-1 text-left">Limit Update</th>
                <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>Client Team</th>
                <th className="px-2 py-1 text-center" colSpan={APP_TYPES.length}>Nway Team</th>
                <th className="px-2 py-1 text-left">Remark</th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th></th>
                {APP_TYPES.map((t) => <th key={`hc-${t}`} className="px-2 py-1 text-center">{APP_LABELS[t].replace(' App', '')}</th>)}
                {APP_TYPES.map((t) => <th key={`hn-${t}`} className="px-2 py-1 text-center">{APP_LABELS[t].replace(' App', '')}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-2 py-1">Last/Old</td>
                {APP_TYPES.map((t) => <td key={`l-${t}`} className="px-2 py-1 text-center">{client[t]?.total ?? 0}</td>)}
                {APP_TYPES.map((t) => <td key={`ln-${t}`} className="px-2 py-1 text-center">{nway[t]?.total ?? 0}</td>)}
                <td></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-2 py-1">New/Update</td>
                {APP_TYPES.map((t) => (
                  <td key={`nc-${t}`} className="px-2 py-1">
                    <Form.Item name={['client', t]} noStyle><InputNumber size="small" min={0} style={{ width: '100%' }} /></Form.Item>
                  </td>
                ))}
                {APP_TYPES.map((t) => (
                  <td key={`nn-${t}`} className="px-2 py-1">
                    <Form.Item name={['nway', t]} noStyle><InputNumber size="small" min={0} style={{ width: '100%' }} /></Form.Item>
                  </td>
                ))}
                <td className="px-2 py-1">
                  <Form.Item name="remark" noStyle><Input size="small" /></Form.Item>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-center gap-3 mt-3">
            <Button type="primary" danger loading={updateLimitsMut.isPending} onClick={submitUpdateLimit}>Save</Button>
            <Button danger onClick={() => setUpdateLimitOpen(false)}>Close</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
