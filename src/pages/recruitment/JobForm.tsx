import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useJobList, useCreateJob, useUpdateJob } from '@/hooks/queries/useRecruitment';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;
const { TextArea } = Input;

const JobForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const { data: deptData } = useDepartmentList();
  const { data: jobData } = useJobList();
  const departments: any[] = deptData?.data ?? [];

  const isEdit = !!id;
  const editData = isEdit ? (jobData?.data ?? []).find((j: any) => (j._id || j.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        title: editData.title,
        department: editData.department,
        vacancies: editData.vacancies,
        status: editData.status,
        location: editData.location,
        minExperience: editData.experience?.min,
        maxExperience: editData.experience?.max,
        description: editData.description,
        skills: editData.skills,
      });
    }
  }, [editData, form]);

  const handleSubmit = (values: any) => {
    const payload: any = {
      title: values.title,
      department: values.department,
      vacancies: values.vacancies,
      description: values.description || '',
      location: values.location || '',
      experience: {
        min: values.minExperience || 0,
        max: values.maxExperience || 0,
      },
      status: values.status,
      skills: values.skills || [],
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    if (isEdit) {
      updateMutation.mutate({ id, data: payload }, {
        onSuccess: () => { message.success('Job updated'); navigate('/recruitment'); },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { message.success('Job created'); navigate('/recruitment'); },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/recruitment')} />
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Job' : 'Create Job'}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
              <Input placeholder="e.g. Senior Software Engineer" />
            </Form.Item>
            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
              <Select placeholder="Select department" allowClear showSearch optionFilterProp="label" options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="vacancies" label="Vacancies" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select placeholder="Status" options={[
                  { value: 'open', label: 'Open' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'on_hold', label: 'On Hold' },
                ]} />
              </Form.Item>
            </div>
            <Form.Item name="location" label="Location" rules={[{ required: true }]}>
              <Input placeholder="e.g. Bangalore, Remote" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="minExperience" label="Min Experience (yrs)">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item name="maxExperience" label="Max Experience (yrs)">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Job description..." />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate('/recruitment')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default JobForm;
