import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, App } from 'antd';
import { ArrowLeft } from 'lucide-react';
import {
  useCreateParentDepartment,
  useUpdateParentDepartment,
  useParentDepartmentList,
} from '@/hooks/queries/useParentDepartments';

const { Title, Text } = Typography;

const ParentDepartmentAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateParentDepartment();
  const updateMutation = useUpdateParentDepartment();
  const { data: listData } = useParentDepartmentList();

  const isEdit = !!id;
  const editData = isEdit
    ? (listData?.data ?? []).find((d: any) => (d._id || d.id) === id)
    : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder ?? 0,
        // Backend stores isActive boolean — show as Active/Inactive in the form.
        status: editData.isActive === false ? 'Inactive' : 'Active',
        description: editData.description,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    // Map the status enum to the boolean the backend validator expects.
    const { status, ...rest } = values;
    const payload = { ...rest, isActive: status !== 'Inactive' };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Parent department updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Parent department created');
      }
      navigate('/master/parent-department/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} parent department`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
       
        <Title level={4} className="!mb-0">
          {isEdit ? 'Edit Parent Department' : 'Add Parent Department'}
        </Title>
      </div>

      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{ displayOrder: 0, status: 'Active' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item
              name="name"
              label={<><Text type="danger">* </Text>Super Department Name</>}
              rules={[{ required: true, message: 'Super Department Name is required' }]}
            >
              <Input placeholder="e.g. Operations" maxLength={100} autoFocus />
            </Form.Item>

            <Form.Item
              name="shortName"
              label={<><Text type="danger">* </Text>Short Name</>}
              rules={[{ required: true, message: 'Short Name is required' }]}
            >
              <Input placeholder="e.g. OPS" maxLength={20} />
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
            <Button onClick={() => navigate('/master/parent-department/list')}>Cancel</Button>
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
    </div>
  );
};

export default ParentDepartmentAdd;
