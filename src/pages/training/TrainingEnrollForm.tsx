import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, App, Button, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useEnrollTraining } from '@/hooks/queries/useTraining';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const TrainingEnrollForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const enrollMutation = useEnrollTraining();

  const { data: empData } = useEmployeeList();
  const employees: any[] = empData?.data ?? [];
  const employeeOptions = employees.map((e: any) => {
    const u = e.userId || e;
    return { value: u._id || e._id, label: `${u.firstName || ''} ${u.lastName || ''} (${e.employeeId || ''})`.trim() };
  });

  const handleSubmit = async (values: any) => {
    try {
      await enrollMutation.mutateAsync({ id: id!, data: values });
      message.success('Employee enrolled successfully');
      navigate(`/training/${id}`);
    } catch (err: any) {
      message.error(err?.message || 'Failed to enroll employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(`/training/${id}`)} />
        <Title level={4} className="!mb-0">Enroll Employee</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select placeholder="Search employee..." showSearch optionFilterProp="label" options={employeeOptions} />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate(`/training/${id}`)}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={enrollMutation.isPending}>{t('submit')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TrainingEnrollForm;
