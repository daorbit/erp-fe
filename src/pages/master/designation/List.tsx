import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Popconfirm, App, InputNumber, Tag } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useDesignationList, useDeleteDesignation } from '@/hooks/queries/useDesignations';

const { Title } = Typography;

type Filters = {
  sno: string;
  name: string;
  shortName: string;
  dept: string;
  displayOrder: string;
};

const DesignationList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: listData, isLoading } = useDesignationList();
  const deleteMutation = useDeleteDesignation();

  const [filters, setFilters] = useState<Filters>({
    sno: '', name: '', shortName: '', dept: '', displayOrder: '',
  });
  const setF = (k: keyof Filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const items: any[] = listData?.data ?? [];
  const total = items.length;

  const numbered = useMemo(
    () => items.map((item, i) => {
      const deptNames = (item.departments ?? [])
        .map((d: any) => (typeof d === 'string' ? d : d?.name))
        .filter(Boolean)
        .join(', ');
      return { ...item, _sno: i + 1, _deptNames: deptNames };
    }),
    [items],
  );

  const filtered = useMemo(() => {
    return numbered.filter((d) => {
      if (filters.sno && !String(d._sno).includes(filters.sno)) return false;
      if (filters.name && !d.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.shortName && !d.shortName?.toLowerCase().includes(filters.shortName.toLowerCase())) return false;
      if (filters.dept && !d._deptNames?.toLowerCase().includes(filters.dept.toLowerCase())) return false;
      if (filters.displayOrder && !String(d.displayOrder ?? 0).includes(filters.displayOrder)) return false;
      return true;
    });
  }, [numbered, filters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Designation deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete designation');
    }
  };

  const columns = [
    { title: 'SNo.', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Designation Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', width: 140,
      render: (v: string) => <Tag>{v || '-'}</Tag> },
    { title: 'Department Name', dataIndex: '_deptNames', key: 'dept',
      render: (v: string) => v || <span style={{ color: '#999' }}>—</span> },
    { title: 'Order', dataIndex: 'displayOrder', key: 'displayOrder', width: 90,
      render: (v: number) => v ?? 0 },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Edit2 size={16} />}
          onClick={() => navigate(`/master/designation/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this designation?" okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <div>
          <Title level={4} className="!mb-0">Designation List</Title>
          <div style={{ fontSize: 12, color: '#999' }}>Total Number of Record : {total} Found</div>
        </div>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/designation/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: '70px 200px 140px 1fr 90px 70px 70px' }}>
          <Input size="small" placeholder="#" value={filters.sno} onChange={(e) => setF('sno', e.target.value)} />
          <Input size="small" placeholder="Filter Designation" value={filters.name} onChange={(e) => setF('name', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Short" value={filters.shortName} onChange={(e) => setF('shortName', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Department" value={filters.dept} onChange={(e) => setF('dept', e.target.value)} allowClear />
          <InputNumber size="small" placeholder="#"
            value={filters.displayOrder ? Number(filters.displayOrder) : undefined}
            onChange={(v) => setF('displayOrder', v == null ? '' : String(v))}
            className="w-full" />
          <div />
          <div />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          size="small" bordered scroll={{ x: 900 }} />
      </Card>
    </div>
  );
};

export default DesignationList;
