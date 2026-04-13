import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Input, Typography, Row, Col, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Building2, CheckCircle2 } from 'lucide-react';
import { useParentDepartmentList, useDeleteParentDepartment } from '@/hooks/queries/useParentDepartments';

const { Title, Text } = Typography;

const ParentDepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { message } = App.useApp();

  const { data: listData, isLoading } = useParentDepartmentList();
  const deleteMutation = useDeleteParentDepartment();

  const items: any[] = listData?.data ?? [];
  const filtered = items.filter(
    (d: any) =>
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.shortName?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = items.length;
  const activeCount = items.filter((d: any) => d.isActive !== false).length;

  const stats = [
    { title: 'Parent Departments', value: totalCount, icon: <Building2 size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Active', value: activeCount, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Parent department deleted');
    } catch {
      message.error('Failed to delete parent department');
    }
  };

  const columns = [
    { title: 'Super Department Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', render: (c: string) => <Tag>{c || '-'}</Tag> },
    { title: 'Display Order', dataIndex: 'displayOrder', key: 'displayOrder', render: (v: number) => v ?? 0 },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <Edit2 size={14} />, label: 'Edit', onClick: () => { navigate(`/parent-departments/${r._id || r.id}/edit`); } },
              { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true, onClick: () => handleDelete(r._id || r.id) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Parent Departments</Title>
          <Text type="secondary">Manage parent departments</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/parent-departments/create')}>
          Add Parent Department
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12}>
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
          <Input prefix={<Search size={16} />} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
      </Card>
    </div>
  );
};

export default ParentDepartmentList;
