import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Popconfirm, App, InputNumber } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import {
  useParentDepartmentList,
  useDeleteParentDepartment,
} from '@/hooks/queries/useParentDepartments';

const { Title } = Typography;

type Filters = {
  sno: string;
  name: string;
  shortName: string;
  displayOrder: string;
};

const ParentDepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: listData, isLoading } = useParentDepartmentList();
  const deleteMutation = useDeleteParentDepartment();

  const [filters, setFilters] = useState<Filters>({ sno: '', name: '', shortName: '', displayOrder: '' });
  const setF = (k: keyof Filters, v: string) => setFilters((prev) => ({ ...prev, [k]: v }));

  const items: any[] = listData?.data ?? [];

  // Add stable SNo to each row based on order returned from API.
  const numbered = useMemo(
    () => items.map((item, i) => ({ ...item, _sno: i + 1 })),
    [items],
  );

  const filtered = useMemo(() => {
    return numbered.filter((d) => {
      if (filters.sno && !String(d._sno).includes(filters.sno)) return false;
      if (filters.name && !d.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.shortName && !d.shortName?.toLowerCase().includes(filters.shortName.toLowerCase())) return false;
      if (filters.displayOrder && !String(d.displayOrder ?? 0).includes(filters.displayOrder)) return false;
      return true;
    });
  }, [numbered, filters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Parent department deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete parent department');
    }
  };

  // Per-column inline filter row matching NwayERP layout (filter input shown
  // under each header). Rendered in Table.summary so it stays aligned with
  // the header columns, even when the table scrolls.
  const columns = [
    {
      title: 'SNo.',
      dataIndex: '_sno',
      key: 'sno',
      width: 80,
    },
    {
      title: 'Super Department Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Short Name',
      dataIndex: 'shortName',
      key: 'shortName',
      width: 160,
    },
    {
      title: 'Display Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 140,
      render: (v: number) => v ?? 0,
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 80,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Button
          type="text"
          icon={<Edit2 size={16} />}
          onClick={() => navigate(`/master/parent-department/edit/${r._id || r.id}`)}
        />
      ),
    },
    {
      title: 'Del',
      key: 'del',
      width: 80,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm
          title="Delete this parent department?"
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
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Parent Department List</Title>
        <Button
          type="link"
          icon={<Plus size={14} />}
          onClick={() => navigate('/master/parent-department/add')}
        >
          Add
        </Button>
      </div>

      <Card bordered={false}>
        {/* Per-column filter row — one input per column, aligned above Table. */}
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '80px 1fr 160px 140px 80px 80px' }}>
          <Input
            size="small"
            placeholder="Filter"
            value={filters.sno}
            onChange={(e) => setF('sno', e.target.value)}
          />
          <Input
            size="small"
            placeholder="Filter Super Department Name"
            value={filters.name}
            onChange={(e) => setF('name', e.target.value)}
            allowClear
          />
          <Input
            size="small"
            placeholder="Filter Short Name"
            value={filters.shortName}
            onChange={(e) => setF('shortName', e.target.value)}
            allowClear
          />
          <InputNumber
            size="small"
            placeholder="Filter"
            value={filters.displayOrder ? Number(filters.displayOrder) : undefined}
            onChange={(v) => setF('displayOrder', v == null ? '' : String(v))}
            className="w-full"
          />
          <div />
          <div />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="large"
          bordered
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
};

export default ParentDepartmentList;
