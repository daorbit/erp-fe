import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useDesignationList, useCreateDesignation, useUpdateDesignation } from '@/hooks/queries/useDesignations';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const DesignationForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const { data: deptData } = useDepartmentList();
  const { data: desigData } = useDesignationList();
  const departments: any[] = deptData?.data ?? [];

  const isEdit = !!id;
  const editData = isEdit ? (desigData?.data ?? []).find((d: any) => (d._id || d.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        title: editData.title,
        code: editData.code,
        department: typeof editData.department === 'object' ? editData.department?._id : editData.department,
        level: editData.level,
        band: editData.band,
        status: editData.status,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        level: values.level != null ? Number(values.level) : undefined,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Designation updated');
      } else {
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Designation created');
      }
      navigate('/designations');
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} designation`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/designations')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' ' + t('designation') : t('add_designation')}</Title>
      </div>

      <Card bordered={false} className="max-w-2xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Senior Engineer" />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. SE" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="department" label="Department">
              <Select placeholder="Select department" allowClear options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
            </Form.Item>
            <Form.Item name="level" label="Level" rules={[{ required: true }]}>
              <InputNumber min={1} max={10} className="w-full" placeholder="e.g. 5" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="band" label="Band">
              <Input placeholder="e.g. L5" />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="active">
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
          </div>
          <Space className="mt-4">
            <Button onClick={() => navigate('/designations')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default DesignationForm;
