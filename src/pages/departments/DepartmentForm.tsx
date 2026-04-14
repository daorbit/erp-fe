import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography, Space, Checkbox, Divider } from 'antd';
import { ArrowLeft, Search } from 'lucide-react';
import { useCreateDepartment, useUpdateDepartment, useDepartmentList } from '@/hooks/queries/useDepartments';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useParentDepartmentList } from '@/hooks/queries/useParentDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DepartmentForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const { data: empData } = useEmployeeList();
  const { data: parentDeptData } = useParentDepartmentList();
  const { data: deptData } = useDepartmentList();
  const { data: branchData } = useBranchList();
  const employees: any[] = empData?.data ?? [];
  const parentDepartments: any[] = parentDeptData?.data ?? [];
  const branches: any[] = branchData?.data ?? [];
  const [branchSearch, setBranchSearch] = useState('');

  const isEdit = !!id;
  const editData = isEdit ? (deptData?.data ?? []).find((d: any) => (d._id || d.id) === id) : null;

  useEffect(() => {
    if (editData) {
      const parentDept = editData.parentDepartment
        ? (typeof editData.parentDepartment === 'object' ? editData.parentDepartment._id : editData.parentDepartment)
        : undefined;
      const branchIds = (editData.branches ?? []).map((b: any) =>
        typeof b === 'object' ? b._id : b
      );
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        parentDepartment: parentDept,
        branches: branchIds,
        // head: typeof editData.head === 'object' ? editData.head?._id : editData.head,
        displayOrder: editData.displayOrder,
        description: editData.description,
        status: editData.status,
      });
    }
  }, [editData, form]);

  const filteredBranches = useMemo(() => {
    if (!branchSearch) return branches;
    return branches.filter((b: any) =>
      b.name?.toLowerCase().includes(branchSearch.toLowerCase())
    );
  }, [branches, branchSearch]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = { ...values };
      if (payload.displayOrder != null) payload.displayOrder = Number(payload.displayOrder);
      // if ('head' in payload) {
      //   payload.headOfDepartment = payload.head;
      //   delete payload.head;
      // }
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Department updated');
      } else {
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Department created');
      }
      navigate('/departments');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/departments')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' ' + t('department') : t('add_department')}</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Fields */}
          <div className="lg:col-span-2">
            <Card bordered={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Engineering" />
                </Form.Item>
                <Form.Item name="shortName" label="Short Name" rules={[{ required: true }]}>
                  <Input placeholder="e.g. ENG" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="displayOrder" label="Display Order">
                  <Input type="number" placeholder="e.g. 1" />
                </Form.Item>
                <Form.Item name="parentDepartment" label="Parent Department" rules={[{ required: true, message: 'Parent department is required' }]}>
                  <Select placeholder="Select parent department" allowClear showSearch optionFilterProp="label"
                    options={parentDepartments.map((p: any) => ({ value: p._id || p.id, label: p.name }))} />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                </Form.Item>
              </div>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Department description" />
              </Form.Item>
              <Space className="mt-2">
                <Button onClick={() => navigate('/departments')}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Card>
          </div>

          {/* Right: Branch Checkbox List */}
          <div>
            <Card bordered={false}>
              <Form.Item
                name="branches"
                label={<Text strong>Branch List</Text>}
              >
                <Checkbox.Group className="w-full">
                  <div className="mb-3">
                    <Input
                      prefix={<Search size={14} />}
                      placeholder="Search..."
                      value={branchSearch}
                      onChange={e => setBranchSearch(e.target.value)}
                      allowClear
                      size="small"
                    />
                  </div>
                  <Divider className="!my-2" />
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                    {filteredBranches.map((b: any) => (
                      <div key={b._id || b.id}>
                        <Checkbox value={b._id || b.id}>{b.name}</Checkbox>
                      </div>
                    ))}
                    {filteredBranches.length === 0 && (
                      <Text type="secondary" className="text-sm">No branches found</Text>
                    )}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default DepartmentForm;
