import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, Form, Input, Button, Typography, DatePicker, Checkbox, App, Upload,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { List as ListIcon, Upload as UploadIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { manageMessageHooks } from '@/hooks/queries/usePhase2';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Recipient role groups shown above the user list — shape matches the legacy
// NwayERP labels. The role values map onto our backend `UserRole` enum.
const ROLE_GROUPS: { key: string; label: string; roles: string[] }[] = [
  { key: 'super_admin', label: 'SUPER ADMIN', roles: ['super_admin'] },
  { key: 'admin', label: 'ADMIN', roles: ['admin'] },
  { key: 'ho_user', label: 'HO-USER', roles: ['ho_user', 'hr_manager'] },
  { key: 'site_admin', label: 'SITE-ADMIN', roles: ['site_admin', 'manager'] },
  { key: 'user', label: 'USER', roles: ['user', 'viewer'] },
  { key: 'employee', label: 'EMPLOYEE', roles: ['employee'] },
];

const roleLabel = (role?: string) =>
  ROLE_GROUPS.find((g) => g.roles.includes(role || ''))?.label || (role || 'USER').toUpperCase();

export default function MessageFromMngAdd() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();
  const isEdit = !!id;

  const createMutation = manageMessageHooks.useCreate();
  const updateMutation = manageMessageHooks.useUpdate();
  const { data: existingData } = manageMessageHooks.useDetail(id || '');

  // Users list — drives the recipient checkbox grid.
  const { data: usersData } = useQuery({
    queryKey: ['users-all-min'],
    queryFn: () => api.get('/auth/users', { limit: '500' }),
  });
  const users: any[] = ((usersData as any)?.data ?? []) as any[];

  // Hydrate when editing.
  useEffect(() => {
    const existing = (existingData as any)?.data;
    if (isEdit && existing) {
      form.setFieldsValue({
        title: existing.title,
        description: existing.description,
        date: existing.date ? dayjs(existing.date) : dayjs(),
        isActive: existing.isActive ?? true,
      });
      setAttachmentUrl(existing.attachmentUrl);
      const map: Record<string, boolean> = {};
      for (const r of existing.recipients || []) {
        const rid = typeof r === 'object' ? r._id : r;
        if (rid) map[rid] = true;
      }
      setSelected(map);
    }
  }, [existingData, isEdit, form]);

  // Bucket users by role group for the 3-column display order.
  const usersByGroup = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const u of users) {
      const grp = ROLE_GROUPS.find((g) => g.roles.includes(u.role)) ?? ROLE_GROUPS[4]!;
      map[grp.key] ??= [];
      map[grp.key]!.push(u);
    }
    return map;
  }, [users]);

  // Flat ordered list (left → right, top → bottom in 3 columns).
  const orderedUsers = useMemo(() => {
    const out: any[] = [];
    for (const g of ROLE_GROUPS) {
      const list = usersByGroup[g.key] ?? [];
      list.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
      out.push(...list);
    }
    return out;
  }, [usersByGroup]);

  const checkAll = (val: boolean) => {
    const next: Record<string, boolean> = {};
    for (const u of orderedUsers) next[u._id || u.id] = val;
    setSelected(next);
  };

  const toggleGroup = (groupKey: string, val: boolean) => {
    const list = usersByGroup[groupKey] ?? [];
    setSelected((p) => {
      const next = { ...p };
      for (const u of list) next[u._id || u.id] = val;
      return next;
    });
  };

  const isGroupAllChecked = (groupKey: string) => {
    const list = usersByGroup[groupKey] ?? [];
    return list.length > 0 && list.every((u) => selected[u._id || u.id]);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const recipients = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
      if (recipients.length === 0) {
        message.error('Select at least one recipient.');
        return;
      }
      setSaving(true);
      const payload: any = {
        title: values.title,
        description: values.description,
        date: (values.date || dayjs()).toISOString(),
        isActive: !!values.isActive,
        attachmentUrl,
        recipients,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id: id!, data: payload });
        message.success('Message updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Message created');
      }
      navigate('/admin-module/master/message-from-mng/list');
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Message From Management</Title>
        <Button icon={<ListIcon size={14} />} onClick={() => navigate('/admin-module/master/message-from-mng/list')}>
          List
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Text type="danger" className="block text-center font-medium mb-4">
          {isEdit ? 'Edit Mode' : 'New Mode'}
        </Text>

        <Form form={form} layout="horizontal" size="small" initialValues={{ date: dayjs(), isActive: true }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <Form.Item label={<span>Title<span className="text-red-500">*</span></span>}
              name="title" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
              rules={[{ required: true, message: 'Title is required' }]}>
              <Input />
            </Form.Item>
            <Form.Item label={<span>Description<span className="text-red-500">*</span></span>}
              name="description" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
              rules={[{ required: true, message: 'Description is required' }]}>
              <TextArea rows={3} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <div className="flex items-center gap-3">
              <Form.Item label="Date" name="date" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} className="flex-1">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item name="isActive" valuePropName="checked" className="!mb-0">
                <Checkbox>Is Active</Checkbox>
              </Form.Item>
            </div>
            <Form.Item label="Attachment File" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Upload
                maxCount={1}
                action="/api/v1/upload"
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    setAttachmentUrl(info.file.response?.url || info.file.response?.data?.url);
                  }
                }}
              >
                <Button size="small" icon={<UploadIcon size={14} />}>Choose File</Button>
              </Upload>
              {attachmentUrl && <span className="text-xs ml-2">{attachmentUrl.split('/').pop()}</span>}
            </Form.Item>
          </div>

          {/* Bulk + group toggles */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Button type="primary" danger size="small" onClick={() => checkAll(true)}>CheckAll</Button>
            <Button danger size="small" onClick={() => checkAll(false)}>UnCheckAll</Button>
            {ROLE_GROUPS.map((g) => (
              <Checkbox
                key={g.key}
                checked={isGroupAllChecked(g.key)}
                indeterminate={
                  !!(usersByGroup[g.key]?.some((u) => selected[u._id || u.id])) &&
                  !isGroupAllChecked(g.key)
                }
                onChange={(e) => toggleGroup(g.key, e.target.checked)}
              >
                <span className="font-semibold">{g.label}</span>
              </Checkbox>
            ))}
          </div>

          {/* User checkbox grid (3 columns) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded p-2 max-h-[420px] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
              {orderedUsers.map((u) => {
                const uid = u._id || u.id;
                const groupName = roleLabel(u.role);
                const userName = u.username || (u.email || '').split('@')[0];
                const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').toUpperCase();
                return (
                  <label key={uid} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={!!selected[uid]}
                      onChange={(e) => setSelected((p) => ({ ...p, [uid]: e.target.checked }))}
                    />
                    <span>
                      <em className="text-gray-500 not-italic mr-1">{groupName}</em> -{' '}
                      <span className="font-medium">{userName}</span>{' '}
                      <span className="text-gray-500">({fullName})</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {orderedUsers.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-6">No users available</div>
            )}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Button type="primary" danger loading={saving} onClick={handleSave}>Save</Button>
            <Button danger onClick={() => navigate('/admin-module/master/message-from-mng/list')}>Close</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
