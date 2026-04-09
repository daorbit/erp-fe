import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Row, Col, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Building2, Users, CheckCircle2 } from 'lucide-react';
import { useDepartmentList, useDeleteDepartment } from '@/hooks/queries/useDepartments';
import DepartmentForm from './DepartmentForm';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DepartmentList: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [search, setSearch] = useState('');
  const { message } = App.useApp();

  const { data: deptData, isLoading } = useDepartmentList();
  const deleteMutation = useDeleteDepartment();

  const departments: any[] = deptData?.data ?? [];
  const filtered = departments.filter((d: any) => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.code?.toLowerCase().includes(search.toLowerCase()));

  const totalDepts = departments.length;
  const activeDepts = departments.filter((d: any) => d.status === 'active').length;
  const totalEmpCount = departments.reduce((sum: number, d: any) => sum + (d.employeeCount || 0), 0);

  const stats = [
    { title: t('departments'), value: totalDepts, icon: <Building2 size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: t('active'), value: activeDepts, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('total_employees'), value: totalEmpCount, icon: <Users size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Department deleted');
    } catch {
      message.error('Failed to delete department');
    }
  };

  const columns = [
    { title: t('name'), dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c || '-'}</Tag> },
    { title: 'Head of Department', dataIndex: 'head', key: 'head', render: (h: any) => typeof h === 'object' ? h?.name : (h || '-') },
    { title: 'Employees', dataIndex: 'employeeCount', key: 'employeeCount', render: (c: number) => c ?? 0 },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => { setEditRecord(r); setModalOpen(true); } },
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
          <Title level={4} className="!mb-1">{t('departments')}</Title>
          <Text type="secondary">{t('manage_departments')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditRecord(null); setModalOpen(true); }}>{t('add_department')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">{s.title}</Text>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="mb-4">
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
      </Card>

      <DepartmentForm open={modalOpen} onClose={() => { setModalOpen(false); setEditRecord(null); }} editData={editRecord} />
    </div>
  );
};

export default DepartmentList;
