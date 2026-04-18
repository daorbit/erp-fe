import React, { useMemo, useState } from 'react';
import {
  Card, Form, Input, Button, Typography, Checkbox, App, Alert, Table, Popconfirm, InputNumber,
} from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import {
  useEmployeeGroupList,
  useCreateEmployeeGroup,
  useUpdateEmployeeGroup,
  useDeleteEmployeeGroup,
} from '@/hooks/queries/useEmployeeGroups';
import { useBranchList } from '@/hooks/queries/useBranches';

const { Title, Text } = Typography;

// Combined form (left) + list (right) on a single page — matches the screenshot.
// Clicking Edit on a row populates the form; Save persists create/update.
const EmployeeGroupPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: listData, isLoading } = useEmployeeGroupList();
  const { data: branchListData } = useBranchList();
  const createMutation = useCreateEmployeeGroup();
  const updateMutation = useUpdateEmployeeGroup();
  const deleteMutation = useDeleteEmployeeGroup();

  const items: any[] = listData?.data ?? [];
  const branches = branchListData?.data ?? [];
  const allBranchIds = useMemo(() => branches.map((b: any) => b._id || b.id), [branches]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  const allChecked = allBranchIds.length > 0 && selectedBranches.length === allBranchIds.length;
  const indeterminate = selectedBranches.length > 0 && selectedBranches.length < allBranchIds.length;

  const resetForm = () => {
    form.resetFields();
    setSelectedBranches([]);
    setEditingId(null);
  };

  const handleAllToggle = (checked: boolean) => {
    const next = checked ? [...allBranchIds] : [];
    setSelectedBranches(next);
  };

  const handleEdit = (row: any) => {
    const editBranches = (row.branches ?? []).map((b: any) => (typeof b === 'string' ? b : b._id || b.id));
    form.setFieldsValue({ name: row.name, shortName: row.shortName });
    setSelectedBranches(editBranches);
    setEditingId(row._id || row.id);
    // Scroll up so the form is visible (helpful on short viewports).
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (values: any) => {
    if (selectedBranches.length === 0) {
      message.error('Select at least one branch');
      return;
    }
    const payload = { ...values, branches: selectedBranches };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        message.success('Employee Group updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Employee Group created');
      }
      resetForm();
    } catch (err: any) {
      message.error(err?.message || 'Failed to save Employee Group');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Employee Group deleted');
      if (editingId === id) resetForm();
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete Employee Group');
    }
  };

  // Per-column filters on the right list.
  const [filters, setFilters] = useState({ sno: '', name: '', siteCount: '' });
  const numbered = useMemo(
    () => items.map((x, i) => ({ ...x, _sno: i + 1, _siteCount: Array.isArray(x.branches) ? x.branches.length : 0 })),
    [items],
  );
  const filtered = useMemo(() => {
    return numbered.filter((x) => {
      if (filters.sno && !String(x._sno).includes(filters.sno)) return false;
      if (filters.name && !x.name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.siteCount && !String(x._siteCount).includes(filters.siteCount)) return false;
      return true;
    });
  }, [numbered, filters]);

  const columns = [
    { title: 'SrNo', dataIndex: '_sno', key: 'sno', width: 70 },
    { title: 'Employee Group', dataIndex: 'name', key: 'name' },
    { title: 'Site Count', dataIndex: '_siteCount', key: 'siteCount', width: 110, align: 'right' as const },
    {
      title: 'Edit', key: 'edit', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Edit2 size={16} />} onClick={() => handleEdit(r)} />
      ),
    },
    {
      title: 'Del', key: 'del', width: 70, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this group?" okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  const [branchSearch, setBranchSearch] = useState('');
  const filteredBranches = useMemo(
    () => branches.filter((b: any) => b.name?.toLowerCase().includes(branchSearch.toLowerCase())),
    [branches, branchSearch],
  );

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Employee Group</Title>

      {/* Top section: form + branch card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Left — form */}
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="name"
                label={<> Employee Group</>}
                rules={[{ required: true, message: 'Employee Group name is required' }]}
              >
                <Input placeholder="e.g. Group A" maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item name="shortName" label="Short Name">
                <Input placeholder="e.g. GA" maxLength={20} />
              </Form.Item>
            </div>

            <div className="flex gap-3 mt-2">
              <Button onClick={resetForm}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Card>

        {/* Right — Branch List */}
        <Card
          title={<><Text type="danger">*</Text> Branch List</>}
          bordered={false}
          bodyStyle={{ padding: '12px 16px' }}
          className="h-fit"
        >
          <Input.Search
            placeholder="Search..."
            allowClear
            value={branchSearch}
            onChange={(e) => setBranchSearch(e.target.value)}
            className="mb-3"
          />
          <div className="max-h-[280px] overflow-y-auto space-y-2">
            {branches.length === 0 ? (
              <Alert type="warning" message="No branches available." showIcon />
            ) : (
              <>
                <Checkbox checked={allChecked} indeterminate={indeterminate}
                  onChange={(e) => handleAllToggle(e.target.checked)}
                  style={{ fontWeight: 600 }}>
                  ALL
                </Checkbox>
                <Checkbox.Group value={selectedBranches}
                  onChange={(vals) => setSelectedBranches(vals as string[])}
                  className="flex flex-col gap-1">
                  {filteredBranches.map((b: any) => (
                    <Checkbox key={b._id || b.id} value={b._id || b.id}>{b.name}</Checkbox>
                  ))}
                </Checkbox.Group>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom — list table */}
      <Card bordered={false}>
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '70px 1fr 110px 70px 70px' }}>
          <Input size="small" placeholder="#" value={filters.sno}
            onChange={(e) => setFilters({ ...filters, sno: e.target.value })} />
          <Input size="small" placeholder="Filter Group" value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })} allowClear />
          <InputNumber size="small" placeholder="#"
            value={filters.siteCount ? Number(filters.siteCount) : undefined}
            onChange={(v) => setFilters({ ...filters, siteCount: v == null ? '' : String(v) })}
            className="w-full" />
          <div /><div />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading}
          rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 20 }}
          size="small" bordered />
      </Card>
    </div>
  );
};

export default EmployeeGroupPage;
