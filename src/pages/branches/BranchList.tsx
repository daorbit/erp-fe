import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Input, Typography, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useBranchList, useDeleteBranch } from '@/hooks/queries/useBranches';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const BranchList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { message } = App.useApp();

  const { data: branchData, isLoading } = useBranchList();
  const deleteMutation = useDeleteBranch();

  const branches: any[] = branchData?.data ?? [];
  const filtered = branches.filter((b: any) =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Branch deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete branch');
    }
  };

  const columns = [
    { title: 'Branch Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Branch Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c || '-'}</Tag> },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => navigate(`/branches/${r._id || r.id}/edit`) },
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
          <Title level={4} className="!mb-1">{t('branches')}</Title>
          <Text type="secondary">Manage your organization branches</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/branches/create')}>{t('add_branch')}</Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input prefix={<Search size={16} />} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} scroll={{ x: 500 }} />
      </Card>
    </div>
  );
};

export default BranchList;
