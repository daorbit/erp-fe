import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, App, Button, Space } from 'antd';
import { useCreateParentDepartment, useUpdateParentDepartment } from '@/hooks/queries/useParentDepartments';

interface ParentDepartmentFormProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

const ParentDepartmentForm: React.FC<ParentDepartmentFormProps> = ({ open, onClose, editData }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateParentDepartment();
  const updateMutation = useUpdateParentDepartment();

  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData._id || editData.id, data: values });
        message.success('Parent department updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Parent department created');
      }
      onClose();
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} parent department`);
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Edit Parent Department' : 'Add Parent Department'}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
      </Form>
    </Drawer>
  );
};

export default ParentDepartmentForm;
