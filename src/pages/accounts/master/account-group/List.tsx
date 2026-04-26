import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Popconfirm, App, Tag } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useAccountGroupList, useDeleteAccountGroup } from '@/hooks/queries/useAccountGroups';

const { Title } = Typography;

const NATURE_COLORS: Record<string, string> = {
  ASSETS: 'blue',
  EXPENSES: 'red',
  INCOME: 'green',
  LIABILITY: 'orange',
};

type Filters = { sno: string; name: string; groupNature: string; scheduleGroup: string };

const AccountGroupList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: listData, isLoading } = useAccountGroupList();
  const deleteMutation = useDeleteAccountGroup();

  const [filters, setFilters] = useState<Filters>({
    sno: '', name: '', groupNature: '', scheduleGroup: '',
  });
  const setF = (k: keyof Filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const items: any[] = listData?.data ?? [];

  const numbered = useMemo(
    () => items.map((item, i) => ({ ...item, _sno: i + 1 })),
    [items],
  );

  const filtered = useMemo(
    () =>
      numbered.filter((d) => {
        if (filters.sno && !String(d._sno).includes(filters.sno)) return false;
        if (filters.name && !d.name?.toLowerCase().includes(filters.name.toLowerCase()))
          return false;
        if (
          filters.groupNature &&
          !d.groupNature?.toLowerCase().includes(filters.groupNature.toLowerCase())
        )
          return false;
        if (
          filters.scheduleGroup &&
          !(d.scheduleGroup ?? '').toLowerCase().includes(filters.scheduleGroup.toLowerCase())
        )
          return false;
        return true;
      }),
    [numbered, filters],
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Account Group deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete Account Group');
    }
  };

  const columns = [
    { title: 'SNo.', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Account Group Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Group Nature', dataIndex: 'groupNature', key: 'groupNature', width: 150,
      render: (v: string) => <Tag color={NATURE_COLORS[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: 'Is Main Group', dataIndex: 'isMainGroup', key: 'isMainGroup', width: 120,
      render: (v: boolean) => (v ? 'YES' : 'NO'),
    },
    {
      title: 'Schedule Group', dataIndex: 'scheduleGroup', key: 'scheduleGroup',
      render: (v: string) => v || <span style={{ color: '#999' }}>—</span>,
    },
    { title: 'Order', dataIndex: 'orderNo', key: 'orderNo', width: 80 },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button
          type="text"
          icon={<Edit2 size={16} />}
          onClick={() => navigate(`/accounts/master/account-group/edit/${r._id || r.id}`)}
        />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm
          title="Delete this Account Group?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}
        >
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <div>
          <Title level={4} className="!mb-0">Account Group List</Title>
          <div style={{ fontSize: 12, color: '#999' }}>
            Total Number of Record : {filtered.length} Found
          </div>
        </div>
        <Button
          type="link"
          icon={<Plus size={14} />}
          onClick={() => navigate('/accounts/master/account-group/add')}
        >
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div
          className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: '70px 1fr 150px 1fr 80px 70px 70px' }}
        >
          <Input size="small" placeholder="#" value={filters.sno} onChange={(e) => setF('sno', e.target.value)} />
          <Input size="small" placeholder="Filter Name" value={filters.name} onChange={(e) => setF('name', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Nature" value={filters.groupNature} onChange={(e) => setF('groupNature', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Schedule" value={filters.scheduleGroup} onChange={(e) => setF('scheduleGroup', e.target.value)} allowClear />
          <div /><div /><div />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="large"
          bordered
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default AccountGroupList;
