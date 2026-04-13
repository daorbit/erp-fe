import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Drawer, Form, Select, InputNumber, Typography, Space, Dropdown, App, Checkbox } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Clock } from 'lucide-react';
import { useShiftList, useCreateShift, useUpdateShift, useDeleteShift } from '@/hooks/queries/useShifts';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const ShiftList: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data, isLoading } = useShiftList();
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const deleteMutation = useDeleteShift();

  const shifts: any[] = data?.data ?? [];
  const filtered = shifts.filter((s: any) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const isEdit = !!editRecord;

  useEffect(() => {
    if (drawerOpen && editRecord) {
      form.setFieldsValue({
        name: editRecord.name,
        startTime: editRecord.startTime,
        endTime: editRecord.endTime,
        graceMinutes: editRecord.graceMinutes,
        timezone: editRecord.timezone,
        workingDays: editRecord.workingDays,
      });
    } else if (drawerOpen) {
      form.resetFields();
    }
  }, [drawerOpen, editRecord, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editRecord._id || editRecord.id, data: values });
        message.success('Shift updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Shift created');
      }
      setDrawerOpen(false);
      setEditRecord(null);
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} shift`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Shift deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete shift');
    }
  };

  const formatDays = (days: number[]) =>
    (days || []).map((d: number) => DAY_OPTIONS.find((o) => o.value === d)?.label).filter(Boolean).join(', ');

  const columns = [
    {
      title: 'Shift Name', dataIndex: 'name', key: 'name',
      render: (n: string) => (
        <Space>
          <Clock size={16} className="text-blue-500" />
          <Text strong>{n}</Text>
        </Space>
      ),
    },
    {
      title: 'Timing', key: 'timing',
      render: (_: any, r: any) => (
        <Tag color="blue">{r.startTime} - {r.endTime}</Tag>
      ),
    },
    {
      title: 'Grace Period', dataIndex: 'graceMinutes', key: 'graceMinutes',
      render: (m: number) => `${m} min`,
    },
    {
      title: 'Working Days', dataIndex: 'workingDays', key: 'workingDays',
      render: (days: number[]) => <Text type="secondary">{formatDays(days)}</Text>,
    },
    {
      title: 'Timezone', dataIndex: 'timezone', key: 'timezone',
      render: (tz: string) => <Tag>{tz}</Tag>,
    },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => { setEditRecord(r); setDrawerOpen(true); } },
          { key: 'delete', icon: <Trash2 size={14} />, label: t('delete'), danger: true, onClick: () => handleDelete(r._id || r.id) },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Shift Management</Title>
          <Text type="secondary">Define shifts and assign them to employees for attendance tracking & WhatsApp reminders</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditRecord(null); setDrawerOpen(true); }}>
          Add Shift
        </Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder="Search shifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            allowClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Drawer
        title={isEdit ? 'Edit Shift' : 'Add Shift'}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditRecord(null); }}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={() => { setDrawerOpen(false); setEditRecord(null); }}>{t('cancel')}</Button>
            <Button
              type="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={() => form.submit()}
            >
              {t('save')}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ graceMinutes: 15, timezone: 'Asia/Kolkata', workingDays: [1, 2, 3, 4, 5] }}>
          <Form.Item name="name" label="Shift Name" rules={[{ required: true, message: 'Please enter shift name' }]}>
            <Input placeholder="e.g. Morning Shift" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="startTime" label="Start Time" rules={[{ required: true, message: 'Required' }]}>
              <Input type="time" />
            </Form.Item>
            <Form.Item name="endTime" label="End Time" rules={[{ required: true, message: 'Required' }]}>
              <Input type="time" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="graceMinutes" label="Grace Period (min)" tooltip="Minutes after shift start before marked late / sending leave inquiry">
              <InputNumber min={0} max={120} className="w-full" />
            </Form.Item>
            <Form.Item name="timezone" label="Timezone">
              <Select
                showSearch
                options={[
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                  { value: 'America/New_York', label: 'America/New_York (EST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="workingDays" label="Working Days">
            <Checkbox.Group options={DAY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ShiftList;
