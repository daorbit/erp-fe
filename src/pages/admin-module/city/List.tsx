import React, { useState } from 'react';
import { Card, Table, Button, Typography, Input, App, Dropdown, Tag } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cityHooks } from '@/hooks/queries/useMasterOther';

const { Title, Text } = Typography;

export default function CityList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [search, setSearch] = useState('');

  const { data, isLoading } = cityHooks.useList();
  const deleteMutation = cityHooks.useDelete();

  const cities: any[] = data?.data ?? [];
  const filtered = cities.filter((c: any) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('City deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete city');
    }
  };

  const columns = [
    { title: 'Sr No.', key: 'sr', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'State Name', dataIndex: 'state', key: 'state' },
    { title: 'District', dataIndex: 'district', key: 'district', render: (d: string) => d || '-' },
    { title: 'Sub District', dataIndex: 'subDistrict', key: 'subDistrict', render: (d: string) => d || '-' },
    { title: 'City Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', width: 110, render: (s: string) => s ? <Tag>{s}</Tag> : '-' },
    { title: 'Pin Code', dataIndex: 'pinCode', key: 'pinCode', width: 100, render: (p: string) => p || '-' },
    { title: 'STD Code', dataIndex: 'stdCode', key: 'stdCode', width: 100, render: (s: string) => s || '-' },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit', icon: <Edit2 size={14} />, label: 'Edit',
                onClick: () => navigate(`/admin-module/master/city/edit/${r._id || r.id}`),
              },
              {
                key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true,
                onClick: () => handleDelete(r._id || r.id),
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
        <Title level={4} className="!mb-0">City</Title>
        <Button
          type="primary"
          danger
          icon={<Plus size={14} />}
          onClick={() => navigate('/admin-module/master/city/add')}
        >
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder="Search by city or state..."
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
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>
    </div>
  );
}
