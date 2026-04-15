import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Typography, Checkbox, App, Table, Popconfirm } from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import {
  useSalaryStructureList,
  useCreateSalaryStructure,
  useUpdateSalaryStructure,
  useDeleteSalaryStructure,
} from '@/hooks/queries/useSalaryStructures';

const { Title } = Typography;

// Salary Structure — "Add" form at the top, existing list below, matching the
// screenshot. Clicking Edit on a row populates the form.
const SalaryStructurePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: listData, isLoading, refetch } = useSalaryStructureList();
  const createMutation = useCreateSalaryStructure();
  const updateMutation = useUpdateSalaryStructure();
  const deleteMutation = useDeleteSalaryStructure();

  const items: any[] = listData?.data ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    form.resetFields();
    setEditingId(null);
  };

  const handleEdit = (row: any) => {
    setEditingId(row._id || row.id);
    form.setFieldsValue({ name: row.name, isInactive: !!row.isInactive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: values });
        message.success('Salary Structure updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Salary Structure created');
      }
      resetForm();
    } catch (err: any) {
      message.error(err?.message || 'Failed to save Salary Structure');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Salary Structure deleted');
      if (editingId === id) resetForm();
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete Salary Structure');
    }
  };

  const [filterName, setFilterName] = useState('');
  const numbered = useMemo(() => items.map((x, i) => ({ ...x, _sno: i + 1 })), [items]);
  const filtered = useMemo(() => numbered.filter((x) =>
    !filterName || x.name?.toLowerCase().includes(filterName.toLowerCase())
  ), [numbered, filterName]);

  const columns = [
    { title: 'SNo.', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Salary Structure Name', dataIndex: 'name', key: 'name' },
    {
      title: 'In-Active', dataIndex: 'isInactive', key: 'isInactive', width: 120, align: 'center' as const,
      render: (v: boolean) => (v ? 'YES' : 'NO'),
    },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Edit2 size={16} />} onClick={() => handleEdit(r)} />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this structure?" okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">{editingId ? 'Edit Salary Structure' : 'Salary Structure'}</Title>
        <Button type="link" onClick={() => navigate('/master/salary-structure/assign')}>
          Assign Salary Head
        </Button>
      </div>

      {/* Add/Edit form */}
      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{ isInactive: false }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <Form.Item name="name" label="Salary Structure"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Salary Structure name is required' }]}>
              <Input maxLength={100} autoFocus />
            </Form.Item>

            <Form.Item name="isInactive" label="In-Active Salary Structure"
              valuePropName="checked"
              labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
              <Checkbox />
            </Form.Item>
          </div>

          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
              <Button onClick={() => refetch()}>Refresh</Button>
              <Button onClick={resetForm}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* List */}
      <Card bordered={false}>
        <Input size="small" className="mb-3 max-w-xs"
          placeholder="Filter Structure" allowClear
          value={filterName} onChange={(e) => setFilterName(e.target.value)} />
        <Table columns={columns} dataSource={filtered} loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 20 }} size="small" bordered />
      </Card>
    </div>
  );
};

export default SalaryStructurePage;
