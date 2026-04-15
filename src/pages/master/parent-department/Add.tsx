import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Space, Typography, App } from 'antd';
import { List as ListIcon } from 'lucide-react';
import {
  useCreateParentDepartment,
  useUpdateParentDepartment,
  useParentDepartmentList,
} from '@/hooks/queries/useParentDepartments';

const { Title } = Typography;

// Add + Edit in one component. Edit mode activates when `:id` param is present
// (route: /master/parent-department/edit/:id). Add mode has no :id.
const ParentDepartmentAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateParentDepartment();
  const updateMutation = useUpdateParentDepartment();
  // Reuse the list hook to find the row being edited (same pattern as existing
  // ParentDepartmentForm — avoids adding a new detail endpoint).
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
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Parent department updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Parent department created');
      }
      navigate('/master/parent-department/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} parent department`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar: title on the left, List shortcut on the right (matches NwayERP). */}
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Parent Department' : 'Parent Department'}</Title>
        <Button
          type="link"
          icon={<ListIcon size={14} />}
          onClick={() => navigate('/master/parent-department/list')}
        >
          List
        </Button>
      </div>

      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 10 }}
          onFinish={handleSubmit}
          initialValues={{ displayOrder: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Form.Item
            name="name"
            label="Super Department Name"
            rules={[{ required: true, message: 'Super Department Name is required' }]}
          >
            <Input maxLength={100} autoFocus />
          </Form.Item>

          <Form.Item
            name="shortName"
            label="Short Name"
            rules={[{ required: true, message: 'Short Name is required' }]}
          >
            <Input maxLength={20} style={{ width: 120 }} />
          </Form.Item>

          <Form.Item name="displayOrder" label="Display Order">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 10 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                Save
              </Button>
              <Button onClick={() => navigate('/master/parent-department/list')}>Close</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ParentDepartmentAdd;
