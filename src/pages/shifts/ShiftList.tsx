import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Clock } from 'lucide-react';
import { useShiftList, useDeleteShift } from '@/hooks/queries/useShifts';
import { useNavigate } from 'react-router-dom';
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
  const [search, setSearch] = useState('');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const { data, isLoading } = useShiftList();
  const deleteMutation = useDeleteShift();

  const shifts: any[] = data?.data ?? [];
  const filtered = shifts.filter((s: any) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()),
  );

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
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => navigate(`/shifts/${r._id || r.id}/edit`) },
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
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/shifts/create')}>
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

    </div>
  );
};

export default ShiftList;
