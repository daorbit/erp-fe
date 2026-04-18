import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Typography, Checkbox, App, Alert } from 'antd';
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
      const detailed = Array.isArray(err?.errors) && err.errors.length > 0
        ? err.errors
            .map((e: any) => (typeof e === 'string' ? e : e?.message || e?.msg))
            .filter(Boolean)
            .join(', ')
        : '';
      message.error(detailed || err?.message || `Failed to ${isEdit ? 'update' : 'save'} department`);
    }
  };

  const [branchSearch, setBranchSearch] = useState('');

  const filteredBranches = useMemo(
    () =>
      branches.filter((b: any) =>
        b.name?.toLowerCase().includes(branchSearch.toLowerCase()),
      ),
    [branches, branchSearch],
  );

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">{isEdit ? 'Edit Department' : 'Add Department'}</Title>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Left — Form fields */}
        <Card bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ displayOrder: 0, parentDepartment: '', branches: [] }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="name"
                label={<> Department Name</>}
                rules={[{ required: true, message: 'Department Name is required' }]}
              >
                <Input placeholder="e.g. Engineering" maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item
                name="shortName"
                label={<> Short Name</>}
                rules={[{ required: true, message: 'Short Name is required' }]}
              >
                <Input placeholder="e.g. ENG" maxLength={20} />
              </Form.Item>

              <Form.Item name="displayOrder" label="Display Order">
                <InputNumber min={0} className="!w-full" />
              </Form.Item>

              <Form.Item name="parentDepartment" label="Parent Department">
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
            </div>

            <div className="flex gap-3 mt-2">
              <Button onClick={() => navigate('/master/department/list')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? 'Update' : 'Create'}
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
              <Alert type="warning" message="No branches available. Create a branch first." showIcon />
            ) : (
              <>
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  onChange={(e) => handleAllToggle(e.target.checked)}
                  style={{ fontWeight: 600 }}
                >
                  ALL
                </Checkbox>
                <Checkbox.Group
                  value={selectedBranches}
                  onChange={(vals) => handleBranchChange(vals as string[])}
                  className="flex flex-col gap-1"
                >
                  {filteredBranches.map((b: any) => (
                    <Checkbox key={b._id || b.id} value={b._id || b.id}>
                      {b.name}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentAdd;
 