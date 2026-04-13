import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateParentDepartment, useUpdateParentDepartment, useParentDepartmentList } from '@/hooks/queries/useParentDepartments';

const { Title } = Typography;

const ParentDepartmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateParentDepartment();
  const updateMutation = useUpdateParentDepartment();
  const { data: listData } = useParentDepartmentList();

  const isEdit = !!id;
  const editData = isEdit ? (listData?.data ?? []).find((d: any) => (d._id || d.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Parent department updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Parent department created');
      }
      navigate('/parent-departments');
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} parent department`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/parent-departments')} />
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Parent Department' : 'Add Parent Department'}</Title>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
            <Form.Item
              name="name"
              label="Super Department Name"
              rules={[{ required: true, message: 'Super Department Name is required' }]}
            >
              <Input placeholder="e.g. Operations" />
            </Form.Item>
            <Form.Item name="displayOrder" label="Order to Display">
              <InputNumber placeholder="e.g. 1" className="w-full" min={0} />
            </Form.Item>
            <Form.Item
              name="shortName"
              label="Short Name"
              rules={[{ required: true, message: 'Short Name is required' }]}
            >
              <Input placeholder="e.g. OPS" />
            </Form.Item>
          </div>
          <Space className="mt-2">
            <Button onClick={() => navigate('/parent-departments')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ParentDepartmentForm;
