import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateDepartment, useUpdateDepartment, useDepartmentList } from '@/hooks/queries/useDepartments';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useParentDepartmentList } from '@/hooks/queries/useParentDepartments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

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
  const employees: any[] = empData?.data ?? [];
  const parentDepartments: any[] = parentDeptData?.data ?? [];

  const isEdit = !!id;
  const editData = isEdit ? (deptData?.data ?? []).find((d: any) => (d._id || d.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        parentDepartment: typeof editData.parentDepartment === 'object' ? editData.parentDepartment?._id : editData.parentDepartment,
        head: typeof editData.head === 'object' ? editData.head?._id : editData.head,
        description: editData.description,
        status: editData.status,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = { ...values };
      if ('head' in payload) {
        payload.headOfDepartment = payload.head;
        delete payload.head;
      }
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Department updated');
      } else {
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Department created');
      }
      navigate('/departments');
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} department`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/departments')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' ' + t('department') : t('add_department')}</Title>
      </div>

      <Card bordered={false} className="max-w-2xl">
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
          <Space className="mt-4">
            <Button onClick={() => navigate('/departments')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default DepartmentForm;
