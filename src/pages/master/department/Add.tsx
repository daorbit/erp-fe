import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, Checkbox, App, Alert } from 'antd';
import { ArrowLeft } from 'lucide-react';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDepartmentList,
} from '@/hooks/queries/useDepartments';
import { useParentDepartmentList } from '@/hooks/queries/useParentDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';

const { Title, Text } = Typography;

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

  const [parentSearch, setParentSearch] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);

  const filteredParents = useMemo(
    () =>
      parents.filter((p: any) =>
        p.name.toLowerCase().includes(parentSearch.toLowerCase()),
      ),
    [parents, parentSearch],
  );

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder ?? 0,
        status: editData.status ?? 'Active',
        description: editData.description,
      });
      const parentDept =
        typeof editData.parentDepartment === 'object'
          ? editData.parentDepartment?._id || editData.parentDepartment?.id
          : editData.parentDepartment;
      if (parentDept) setSelectedParents([parentDept]);
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      parentDepartment: selectedParents[0] || undefined,
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
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
      
        <Title level={4} className="!mb-0">
          {isEdit ? 'Edit Department' : 'Add Department'}
        </Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Left Card — Form fields */}
        <Card bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ displayOrder: 0, status: 'Active' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="name"
                label={<>Department Name</>}
                rules={[{ required: true, message: 'Department Name is required' }]}
              >
                <Input placeholder="e.g. Engineering" maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item
                name="shortName"
                label={<>Short Name</>}
                rules={[{ required: true, message: 'Short Name is required' }]}
              >
                <Input placeholder="e.g. ENG" maxLength={20} />
              </Form.Item>

              <Form.Item name="displayOrder" label="Display Order">
                <InputNumber placeholder="e.g. 1" min={0} className="!w-full" />
              </Form.Item>

              <Form.Item name="status" label="Status">
                <Select
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} placeholder="Department description" />
            </Form.Item>

            <Space className="mt-2">
              <Button onClick={() => navigate('/master/department/list')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form>
        </Card>

        {/* Right Card — Parent Department List */}
        <Card
          bordered={false}
          title={<><Text type="danger">* </Text>Parent Department List</>}
        >
          <Input.Search
            placeholder="Search..."
            value={parentSearch}
            onChange={(e) => setParentSearch(e.target.value)}
            className="mb-3"
            allowClear
          />
          <div className="max-h-[280px] overflow-y-auto space-y-2">
            {filteredParents.length === 0 ? (
              <Text type="secondary">No parent departments found</Text>
            ) : (
              filteredParents.map((p: any) => {
                const pid = p._id || p.id;
                return (
                  <div key={pid}>
                    <Checkbox
                      checked={selectedParents.includes(pid)}
                      onChange={(e) => {
                        setSelectedParents(e.target.checked ? [pid] : []);
                      }}
                    >
                      {p.name}
                    </Checkbox>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentAdd;
