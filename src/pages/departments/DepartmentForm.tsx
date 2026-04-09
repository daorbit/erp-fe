import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/queries/useDepartments';
import { useEmployeeList } from '@/hooks/queries/useEmployees';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, onClose, editData }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const { data: empData } = useEmployeeList();
  const employees: any[] = empData?.data ?? [];

  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        head: typeof editData.head === 'object' ? editData.head?._id : editData.head,
        description: editData.description,
        status: editData.status,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData._id || editData.id, data: values });
        message.success('Department updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Department created');
      }
      onClose();
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} department`);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Department' : 'Add Department'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Engineering" />
        </Form.Item>
        <Form.Item name="code" label="Department Code" rules={[{ required: true }]}>
          <Input placeholder="e.g. ENG" />
        </Form.Item>
        <Form.Item name="head" label="Head of Department">
          <Select placeholder="Select HOD" allowClear showSearch optionFilterProp="label"
            options={employees.map((e: any) => ({ value: e._id || e.id, label: e.name || `${e.firstName ?? ''} ${e.lastName ?? ''}` }))} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Department description" />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="active">
          <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm;
