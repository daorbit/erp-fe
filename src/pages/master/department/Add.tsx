import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, Checkbox, App, Alert } from 'antd';
import { List as ListIcon } from 'lucide-react';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDepartmentList,
} from '@/hooks/queries/useDepartments';
import { useParentDepartmentList } from '@/hooks/queries/useParentDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';

const { Title, Text } = Typography;

// Add + Edit in one component. Edit mode triggers when :id is present.
const DepartmentAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const { data: deptListData } = useDepartmentList();
  const { data: parentListData } = useParentDepartmentList();
  const { data: branchListData } = useBranchList();

  const isEdit = !!id;
  const editData = isEdit
    ? (deptListData?.data ?? []).find((d: any) => (d._id || d.id) === id)
    : null;

  const parents = parentListData?.data ?? [];
  const branches = branchListData?.data ?? [];
  const allBranchIds = useMemo(() => branches.map((b: any) => b._id || b.id), [branches]);

  // Controlled branch selection so the ALL checkbox can toggle every row.
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      const editBranches: string[] = (editData.branches ?? []).map(
        (b: any) => (typeof b === 'string' ? b : b._id || b.id),
      );
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder ?? 0,
        parentDepartment:
          typeof editData.parentDepartment === 'object'
            ? editData.parentDepartment?._id || editData.parentDepartment?.id
            : editData.parentDepartment,
        branches: editBranches,
      });
      setSelectedBranches(editBranches);
    }
  }, [editData, form]);

  const allChecked = allBranchIds.length > 0 && selectedBranches.length === allBranchIds.length;
  const indeterminate = selectedBranches.length > 0 && selectedBranches.length < allBranchIds.length;

  const handleAllToggle = (checked: boolean) => {
    const next = checked ? [...allBranchIds] : [];
    setSelectedBranches(next);
    form.setFieldValue('branches', next);
  };

  const handleBranchChange = (values: string[]) => {
    setSelectedBranches(values);
    form.setFieldValue('branches', values);
  };

  const handleSubmit = async (values: any) => {
    // parentDepartment comes as '' when the user picks "Please Select"; normalise to undefined
    // so the backend treats it as not provided (creating a top-level department).
    const payload = {
      ...values,
      parentDepartment: values.parentDepartment || undefined,
      branches: selectedBranches,
    };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Department updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Department created');
      }
      navigate('/master/department/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} department`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Department' : 'Department'}</Title>
        <Button
          type="link"
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/master/department/list')}
        >
          List
        </Button>
      </div>

      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          initialValues={{ displayOrder: 0, parentDepartment: '', branches: [] }}
        >
          {/* Two-column layout: form on the left, branch selector on the right. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column — scalar fields */}
            <div>
              <Form.Item
                name="name"
                label="Department Name"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: 'Department Name is required' }]}
              >
                <Input maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item
                name="shortName"
                label="Short Name"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: 'Short Name is required' }]}
              >
                <Input maxLength={20} style={{ width: 140 }} />
              </Form.Item>

              <Form.Item
                name="displayOrder"
                label="Display Order"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <InputNumber min={0} style={{ width: 140 }} />
              </Form.Item>

              <Form.Item
                name="parentDepartment"
                label="Parent Department"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Please Select"
                  allowClear
                  options={[
                    { value: '', label: 'Please Select' },
                    ...parents.map((p: any) => ({
                      value: p._id || p.id,
                      label: p.name,
                    })),
                  ]}
                />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Text type="danger" style={{ fontSize: 12 }}>
                  Note: If you select Parent Department, the created Department will be a Sub Department.
                </Text>
              </Form.Item>
            </div>

            {/* Right column — Branch List multi-select with ALL toggle. */}
            <div>
              <Form.Item
                name="branches"
                label={<span>Branch List <Text type="danger">*</Text></span>}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[
                  {
                    validator: () =>
                      selectedBranches.length > 0
                        ? Promise.resolve()
                        : Promise.reject(new Error('Select at least one branch')),
                  },
                ]}
              >
                <div className="border rounded p-3 max-h-[360px] overflow-y-auto">
                  {branches.length === 0 ? (
                    <Alert type="warning" message="No branches available. Create a branch first." showIcon />
                  ) : (
                    <>
                      <Checkbox
                        checked={allChecked}
                        indeterminate={indeterminate}
                        onChange={(e) => handleAllToggle(e.target.checked)}
                        style={{ fontWeight: 600, marginBottom: 8 }}
                      >
                        ALL
                      </Checkbox>
                      <Checkbox.Group
                        value={selectedBranches}
                        onChange={(vals) => handleBranchChange(vals as string[])}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      >
                        {branches.map((b: any) => (
                          <Checkbox key={b._id || b.id} value={b._id || b.id}>
                            {b.name}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    </>
                  )}
                </div>
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                Save
              </Button>
              <Button onClick={() => navigate('/master/department/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DepartmentAdd;
