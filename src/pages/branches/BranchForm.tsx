import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateBranch, useUpdateBranch, useBranchList } from '@/hooks/queries/useBranches';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const BranchForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const { data: branchData } = useBranchList();

  const isEdit = !!id;
  const editData = isEdit ? (branchData?.data ?? []).find((b: any) => (b._id || b.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Branch updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Branch created');
      }
      navigate('/branches');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} branch`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/branches')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' Branch' : t('add_branch')}</Title>
      </div>

      <Card bordered={false} className="max-w-2xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item name="name" label="Branch Name" rules={[{ required: true, message: 'Branch name is required' }]}>
              <Input placeholder="e.g. Head Office" />
            </Form.Item>
            <Form.Item name="code" label="Branch Code" rules={[{ required: true, message: 'Branch code is required' }]}>
              <Input placeholder="e.g. HO" />
            </Form.Item>
          </div>
          <Space className="mt-2">
            <Button onClick={() => navigate('/branches')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default BranchForm;
