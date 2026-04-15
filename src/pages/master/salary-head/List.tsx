import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Popconfirm, App, InputNumber, Tag } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useSalaryHeadList, useDeleteSalaryHead } from '@/hooks/queries/useSalaryHeads';
import { HeadType, labelFromOptions, HEAD_TYPE_OPTIONS } from '@/types/enums';

const { Title } = Typography;

type Filters = { sno: string; name: string; printName: string; headType: string; order: string };

const SalaryHeadList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: listData, isLoading } = useSalaryHeadList();
  const deleteMutation = useDeleteSalaryHead();

  const [filters, setFilters] = useState<Filters>({ sno: '', name: '', printName: '', headType: '', order: '' });
  const setF = (k: keyof Filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const items: any[] = listData?.data ?? [];
  const numbered = useMemo(() => items.map((x, i) => ({ ...x, _sno: i + 1 })), [items]);

  const filtered = useMemo(() => numbered.filter((d) => {
    if (filters.sno && !String(d._sno).includes(filters.sno)) return false;
    if (filters.name && !d.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.printName && !d.printName?.toLowerCase().includes(filters.printName.toLowerCase())) return false;
    if (filters.headType && !d.headType?.includes(filters.headType.toLowerCase())) return false;
    if (filters.order && !String(d.displayOrder ?? 0).includes(filters.order)) return false;
    return true;
  }), [numbered, filters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Salary Head deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete Salary Head');
    }
  };

  const columns = [
    { title: 'SNo.', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Salary Head Name', dataIndex: 'name', key: 'name' },
    { title: 'Print Name', dataIndex: 'printName', key: 'printName', width: 160 },
    {
      title: 'Head Type', dataIndex: 'headType', key: 'headType', width: 130,
      render: (v: HeadType) => (
        <Tag color={v === HeadType.ADDITION ? 'green' : 'red'}>
          {labelFromOptions(HEAD_TYPE_OPTIONS, v)}
        </Tag>
      ),
    },
    { title: 'Order', dataIndex: 'displayOrder', key: 'order', width: 90, render: (v: number) => v ?? 0 },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Edit2 size={16} />}
          onClick={() => navigate(`/master/salary-head/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this salary head?" okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Salary Head List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/salary-head/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '70px 1fr 160px 130px 90px 70px 70px' }}>
          <Input size="small" placeholder="#" value={filters.sno} onChange={(e) => setF('sno', e.target.value)} />
          <Input size="small" placeholder="Filter Name" value={filters.name} onChange={(e) => setF('name', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Print" value={filters.printName} onChange={(e) => setF('printName', e.target.value)} allowClear />
          <Input size="small" placeholder="add/ded" value={filters.headType} onChange={(e) => setF('headType', e.target.value)} allowClear />
          <InputNumber size="small" placeholder="#"
            value={filters.order ? Number(filters.order) : undefined}
            onChange={(v) => setF('order', v == null ? '' : String(v))} className="w-full" />
          <div /><div />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 25, showSizeChanger: true }}
          size="small" bordered scroll={{ x: 800 }} />
      </Card>
    </div>
  );
};

export default SalaryHeadList;
