import React, { useState } from 'react';
import { Card, Table, Button, Typography, Input, App, Dropdown, Tag } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocationList, useDeleteLocation } from '@/hooks/queries/useLocations';
import { confirmDelete } from '@/lib/confirm';

const { Title, Text } = Typography;

export default function LocationList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useLocationList();
  const deleteMutation = useDeleteLocation();

  const locations: any[] = data?.data ?? [];
  const filtered = locations.filter((l: any) =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Location deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete location');
    }
  };

  const columns = [
    {
      title: 'Sr No.', key: 'sr', width: 60,
      render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: 'Location Name', dataIndex: 'name', key: 'name',
      render: (n: string) => <Text strong>{n}</Text>,
    },
    {
      title: 'Site Name', key: 'site',
      render: (_: any, r: any) => typeof r.site === 'object' ? r.site?.name : r.site || '-',
    },
    { title: 'City', dataIndex: 'city', key: 'city', render: (c: string) => c || '-' },
    { title: 'PIN Code', dataIndex: 'pinCode', key: 'pinCode', width: 100, render: (p: string) => p || '-' },
    {
      title: 'Location Type', dataIndex: 'locationType', key: 'locationType', width: 130,
      render: (t: string) => t ? <Tag>{t.replace(/_/g, ' ')}</Tag> : '-',
    },
    { title: 'Order No.', dataIndex: 'orderNo', key: 'orderNo', width: 90 },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit', icon: <Edit2 size={14} />, label: 'Edit',
                onClick: () => navigate(`/admin-module/master/site-location/edit/${r._id || r.id}`),
              },
              {
                key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true,
                onClick: () => confirmDelete({
                  title: 'Delete location?',
                  content: `"${r.name}" will be permanently removed.`,
                  onOk: () => handleDelete(r._id || r.id),
                }),
              },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Location</Title>
        <Button
          type="primary"
          danger
          icon={<Plus size={14} />}
          onClick={() => navigate('/admin-module/master/site-location/add')}
        >
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder="Search by name or city..."
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
          pagination={{ pageSize: 15 }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>
    </div>
  );
}
