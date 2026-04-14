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
  const filtered = designations.filter((d: any) => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.shortName?.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Designation deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete designation');
    }
  };

  const columns = [
    { title: 'Designation Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', render: (c: string) => <Tag>{c || '-'}</Tag> },
    { title: t('department'), dataIndex: 'departments', key: 'departments', render: (items: any[]) => items?.length ? items.map((d: any) => <Tag color="blue" key={typeof d === 'object' ? d._id : d}>{typeof d === 'object' ? d.name : d}</Tag>) : '-' },
    { title: 'Display Order', dataIndex: 'displayOrder', key: 'displayOrder', render: (d: number) => d ?? 0 },
    { title: 'Employee Band', dataIndex: 'employeeBand', key: 'employeeBand', render: (b: string) => b ? <Tag color="purple">{b}</Tag> : '-' },
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
