import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, App, Button, Space } from 'antd';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/queries/useDepartments';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useParentDepartmentList } from '@/hooks/queries/useParentDepartments';
import { useTranslation } from '@/hooks/useTranslation';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, onClose, editData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const { data: empData } = useEmployeeList();
  const { data: parentDeptData } = useParentDepartmentList();
  const employees: any[] = empData?.data ?? [];
  const parentDepartments: any[] = parentDeptData?.data ?? [];

  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        parentDepartment: typeof editData.parentDepartment === 'object' ? editData.parentDepartment?._id : editData.parentDepartment,
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
      const payload: any = { ...values };
      // Map 'head' to 'headOfDepartment' for backend
      if ('head' in payload) {
        payload.headOfDepartment = payload.head;
        delete payload.head;
      }
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData._id || editData.id, data: payload });
        message.success('Department updated');
      } else {
        // Remove 'status' - not in createDepartmentSchema
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Department created');
      }
      onClose();
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} department`);
    }
  };

  return (
    <Drawer
      title={isEdit ? t('edit') + ' ' + t('department') : t('add_department')}
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
      extra={<Space><Button onClick={onClose}>{t('cancel')}</Button><Button type="primary" loading={createMutation.isPending || updateMutation.isPending} onClick={() => form.submit()}>{t('save')}</Button></Space>}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Engineering" />
        </Form.Item>
        <Form.Item name="code" label="Department Code" rules={[{ required: true }]}>
          <Input placeholder="e.g. ENG" />
        </Form.Item>
        <Form.Item name="parentDepartment" label="Parent Department" rules={[{ required: true, message: 'Parent Department is required' }]}>
          <Select placeholder="Select Parent Department" showSearch optionFilterProp="label"
            options={parentDepartments.map((p: any) => ({ value: p._id || p.id, label: p.name }))} />
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
    </Drawer>
  );
};

export default DepartmentForm;
