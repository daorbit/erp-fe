import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Popconfirm, App, InputNumber, Tag } from 'antd';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useDepartmentList, useDeleteDepartment } from '@/hooks/queries/useDepartments';

const { Title } = Typography;

type Filters = {
  sno: string;
  name: string;
  shortName: string;
  branch: string;
  displayOrder: string;
};

const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: listData, isLoading } = useDepartmentList();
  const deleteMutation = useDeleteDepartment();

  const [filters, setFilters] = useState<Filters>({
    sno: '', name: '', shortName: '', branch: '', displayOrder: '',
  });
  const setF = (k: keyof Filters, v: string) => setFilters((p) => ({ ...p, [k]: v }));

  const items: any[] = listData?.data ?? [];
  const total = items.length;

  const numbered = useMemo(
    () => items.map((item, i) => {
      const branchNames = (item.branches ?? [])
        .map((b: any) => (typeof b === 'string' ? b : b?.name))
        .filter(Boolean)
        .join(', ');
      return { ...item, _sno: i + 1, _branchNames: branchNames };
    }),
    [items],
  );

  const filtered = useMemo(() => {
    return numbered.filter((d) => {
      if (filters.sno && !String(d._sno).includes(filters.sno)) return false;
      if (filters.name && !d.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.shortName && !d.shortName?.toLowerCase().includes(filters.shortName.toLowerCase())) return false;
      if (filters.branch && !d._branchNames?.toLowerCase().includes(filters.branch.toLowerCase())) return false;
      if (filters.displayOrder && !String(d.displayOrder ?? 0).includes(filters.displayOrder)) return false;
      return true;
    });
  }, [numbered, filters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Department deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete department');
    }
  };

  const columns = [
    { title: 'SNo.', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Department Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Short Name', dataIndex: 'shortName', key: 'shortName', width: 140,
      render: (v: string) => <Tag>{v || '-'}</Tag> },
    { title: 'Branch Name', dataIndex: '_branchNames', key: 'branch',
      render: (v: string) => v || <span style={{ color: '#999' }}>—</span> },
    { title: 'Display Order', dataIndex: 'displayOrder', key: 'displayOrder', width: 130,
      render: (v: number) => v ?? 0 },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button
          type="text"
          icon={<Edit2 size={16} />}
          onClick={() => navigate(`/master/department/edit/${r._id || r.id}`)}
        />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm
          title="Delete this department?"
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
          <Title level={4} className="!mb-0">Department List</Title>
          <div style={{ fontSize: 12, color: '#999' }}>Total Number of Record : {total} Found</div>
        </div>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/department/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false}>
        <div
          className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: '70px 200px 140px 1fr 130px 70px 70px' }}
        >
          <Input size="small" placeholder="#" value={filters.sno} onChange={(e) => setF('sno', e.target.value)} />
          <Input size="small" placeholder="Filter Department" value={filters.name} onChange={(e) => setF('name', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Short Name" value={filters.shortName} onChange={(e) => setF('shortName', e.target.value)} allowClear />
          <Input size="small" placeholder="Filter Branch" value={filters.branch} onChange={(e) => setF('branch', e.target.value)} allowClear />
          <InputNumber
            size="small"
            placeholder="#"
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
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default DepartmentList;
