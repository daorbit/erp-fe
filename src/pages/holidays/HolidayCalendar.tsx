import React, { useState } from 'react';
import { Card, Table, Tag, Button, Drawer, Form, Input, Select, Row, Col, Typography, Space, Popconfirm } from 'antd';
import { App } from 'antd';
import { Plus, CalendarDays, Globe, Star, Clock, Trash2 } from 'lucide-react';
import { useHolidayList, useCreateHoliday, useDeleteHoliday } from '@/hooks/queries/useHolidays';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const { Title, Text } = Typography;

const typeColor: Record<string, string> = {
  public: 'green', optional: 'blue', restricted: 'orange', company: 'purple',
};

const HolidayCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HR_MANAGER;
  const isManager = isAdmin || currentUser?.role === UserRole.MANAGER;
  const isViewer = currentUser?.role === UserRole.VIEWER;

  const { data, isLoading } = useHolidayList({ year });
  const createMutation = useCreateHoliday();
  const deleteMutation = useDeleteHoliday();

  const holidays: any[] = data?.data ?? [];

  const upcoming = holidays.filter((h: any) => new Date(h.date) >= new Date()).length;
  const publicCount = holidays.filter((h: any) => h.type === 'public').length;
  const optionalCount = holidays.filter((h: any) => h.type === 'optional').length;

  const stats = [
    { title: 'Total Holidays', value: holidays.length, icon: <CalendarDays size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Public', value: publicCount, icon: <Globe size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Optional', value: optionalCount, icon: <Star size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
    { title: 'Upcoming', value: upcoming, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
  ];

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Holiday added');
      form.resetFields();
      setModalOpen(false);
    } catch {
      message.error('Failed to add holiday');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Holiday deleted');
    } catch {
      message.error('Failed to delete holiday');
    }
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: t('date'), dataIndex: 'date', key: 'date', render: (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
    { title: 'Day', dataIndex: 'date', key: 'day', render: (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long' }) : '-' },
    { title: t('type'), dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={typeColor[t] ?? 'default'}>{t}</Tag> },
    { title: t('description'), dataIndex: 'description', key: 'description', ellipsis: true },
    ...(isAdmin ? [{
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this holiday?" onConfirm={() => handleDelete(r._id ?? r.id)} okText="Yes" cancelText="No">
          <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('holidays')}</Title>
          <Text type="secondary">{t('manage_holidays')}</Text>
        </div>
        <Space>
          <Select value={year} onChange={setYear} options={[2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }))} />
          {isAdmin && <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>{t('add_holiday')}</Button>}
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="h-full hover:shadow-md transition-shadow" bordered={false}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
              </div>
              <div className="mt-4">
                <Text type="secondary" className="text-xs">{stat.title}</Text>
                <div className="text-2xl font-bold mt-0.5">{stat.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={holidays} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 15 }} size="middle" scroll={{ x: 700 }} />
      </Card>

      <Drawer title="Add Holiday" open={modalOpen} onClose={() => setModalOpen(false)} width={520} destroyOnClose extra={<Space><Button onClick={() => setModalOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>{t('add')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Holiday Name" rules={[{ required: true }]}>
            <Input placeholder="Enter holiday name" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select placeholder="Select type" options={[
                { value: 'public', label: 'Public' },
                { value: 'religious', label: 'Religious' },
                { value: 'company_specific', label: 'Company Specific' },
                { value: 'optional', label: 'Optional' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default HolidayCalendar;
