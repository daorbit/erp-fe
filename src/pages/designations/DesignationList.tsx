import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Input, Typography, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useDesignationList, useDeleteDesignation } from '@/hooks/queries/useDesignations';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DesignationList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { message } = App.useApp();

  const { data: desigData, isLoading } = useDesignationList();
  const deleteMutation = useDeleteDesignation();

  const designations: any[] = desigData?.data ?? [];
  const filtered = designations.filter((d: any) => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.code?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Designation deleted');
    } catch {
      message.error('Failed to delete designation');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c || '-'}</Tag> },
    { title: t('department'), dataIndex: 'department', key: 'department', render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : (d || '-')}</Tag> },
    { title: 'Level', dataIndex: 'level', key: 'level', render: (l: any) => l ?? '-' },
    { title: 'Band', dataIndex: 'band', key: 'band', render: (b: string) => b ? <Tag color="purple">{b}</Tag> : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => { navigate(`/designations/${r._id || r.id}/edit`); } },
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
          <Title level={4} className="!mb-1">{t('designations')}</Title>
          <Text type="secondary">{t('manage_designations')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/designations/create')}>{t('add_designation')}</Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
      </Card>
    </div>
  );
};

export default DesignationList;
