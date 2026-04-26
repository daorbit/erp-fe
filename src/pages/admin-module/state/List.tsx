import React, { useState } from 'react';
import { Card, Table, Button, Typography, Input, App, Dropdown, Tag } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stateHooks } from '@/hooks/queries/useMasterOther';
import { confirmDelete } from '@/lib/confirm';

const { Title, Text } = Typography;

export default function StateList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [search, setSearch] = useState('');

  const { data, isLoading } = stateHooks.useList();
  const deleteMutation = stateHooks.useDelete();

  const states: any[] = data?.data ?? [];
  const filtered = states.filter((s: any) =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.stateCode?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('State deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete state');
    }
  };

  const columns = [
    { title: 'Sr No.', key: 'sr', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'State Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', width: 120, render: (s: string) => s ? <Tag>{s}</Tag> : '-' },
    { title: 'State Code', dataIndex: 'stateCode', key: 'stateCode', width: 110 },
    {
      title: 'Is UT', dataIndex: 'isUT', key: 'isUT', width: 80,
      render: (v: boolean) => v ? <Tag color="blue">Yes</Tag> : '-',
    },
    { title: 'Country', dataIndex: 'country', key: 'country', width: 100 },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit', icon: <Edit2 size={14} />, label: 'Edit',
                onClick: () => navigate(`/admin-module/master/state/edit/${r._id || r.id}`),
              },
              {
                key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true,
                onClick: () => confirmDelete({
                  title: 'Delete state?',
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
        <Title level={4} className="!mb-0">State</Title>
        <Button
          type="primary"
          danger
          icon={<Plus size={14} />}
          onClick={() => navigate('/admin-module/master/state/add')}
        >
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder="Search by name or code..."
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
          scroll={{ x: 700 }}
          size="small"
        />
      </Card>
    </div>
  );
}
