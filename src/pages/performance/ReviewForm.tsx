import React from 'react';
import { Card, Form, Input, Button, Select, Typography, Spin, Tag, Descriptions, Space } from 'antd';
import { App } from 'antd';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReview, useSubmitReview, useUpdateReview } from '@/hooks/queries/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ratingOptions = [
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'exceeds_expectations', label: 'Exceeds Expectations' },
  { value: 'meets_expectations', label: 'Meets Expectations' },
  { value: 'needs_improvement', label: 'Needs Improvement' },
  { value: 'unsatisfactory', label: 'Unsatisfactory' },
];

const ratingColor: Record<string, string> = {
  outstanding: 'green', exceeds_expectations: 'blue', meets_expectations: 'default',
  needs_improvement: 'orange', unsatisfactory: 'red',
};

const ReviewForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: reviewData, isLoading } = useReview(id || '');
  const submitMutation = useSubmitReview();
  const updateMutation = useUpdateReview();

  const review: any = reviewData?.data ?? {};
  const goals: any[] = review.goals ?? [];

  // Extract employee/reviewer from populated objects
  const empName = review.employee
    ? `${review.employee.firstName || ''} ${review.employee.lastName || ''}`.trim()
    : review.employeeName || '-';
  const reviewerName = review.reviewer
    ? `${review.reviewer.firstName || ''} ${review.reviewer.lastName || ''}`.trim()
    : review.reviewerName || '-';

  const handleSave = (values: any) => {
    if (!id) return;
    updateMutation.mutate({ id, data: values }, {
      onSuccess: () => message.success('Review saved'),
      onError: (err: any) => message.error(err?.message || 'Failed to save'),
    });
  };

  const handleSubmit = () => {
    if (!id) return;
    form.validateFields().then(values => {
      updateMutation.mutate({ id, data: values }, {
        onSuccess: () => {
          submitMutation.mutate(id, {
            onSuccess: () => { message.success('Review submitted'); navigate(-1); },
            onError: (err: any) => message.error(err?.message || 'Failed to submit'),
          });
        },
      });
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  if (!id) {
    return <div className="text-center py-20"><Text type="secondary">No review selected. Go back and select a review.</Text></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} />
          <div>
            <Title level={4} className="!mb-1">{t('review_form')}</Title>
            <Text type="secondary">{empName} — {review.reviewPeriod?.start ? `${review.reviewPeriod.start} to ${review.reviewPeriod.end}` : review.period || ''}</Text>
          </div>
        </div>
        <Space>
          <Tag color={review.status === 'completed' ? 'green' : 'orange'}>{review.status?.replace('_', ' ')}</Tag>
        </Space>
      </div>

      {/* Employee Info */}
      <Card bordered={false}>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={t('employee')}>{empName}</Descriptions.Item>
          <Descriptions.Item label="Type"><Tag>{review.type?.replace('_', ' ')}</Tag></Descriptions.Item>
          <Descriptions.Item label="Reviewer">{reviewerName}</Descriptions.Item>
          <Descriptions.Item label={t('status')}><Tag color={ratingColor[review.overallRating] || 'default'}>{review.overallRating?.replace('_', ' ') || 'Not rated'}</Tag></Descriptions.Item>
        </Descriptions>
      </Card>

      <Form form={form} layout="vertical" initialValues={review} onFinish={handleSave}>
        {/* Goals Assessment */}
        {goals.length > 0 && (
          <Card title="Goals Assessment" bordered={false} className="mb-6">
            {goals.map((goal: any, i: number) => (
              <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{goal.title}</div>
                    <Text type="secondary" className="text-xs">{goal.description}</Text>
                  </div>
                  <Tag color={goal.status === 'completed' ? 'green' : 'blue'}>{goal.status?.replace('_', ' ')}</Tag>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Overall Rating */}
        <Card title="Overall Assessment" bordered={false} className="mb-6">
          <Form.Item name="overallRating" label="Overall Rating" rules={[{ required: true, message: 'Please select a rating' }]}>
            <Select placeholder="Select rating" options={ratingOptions} />
          </Form.Item>
          <Form.Item name="managerComments" label="Manager Comments" rules={[{ required: true, message: 'Please provide comments' }]}>
            <TextArea rows={4} placeholder="Overall performance comments..." />
          </Form.Item>
        </Card>

        {/* Strengths & Improvements */}
        <Card title="Strengths & Areas for Improvement" bordered={false} className="mb-6">
          <Form.Item name="strengths" label="Key Strengths">
            <TextArea rows={3} placeholder="List key strengths..." />
          </Form.Item>
          <Form.Item name="areasOfImprovement" label="Areas for Improvement">
            <TextArea rows={3} placeholder="Areas that need improvement..." />
          </Form.Item>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate(-1)}>{t('cancel')}</Button>
          <Button icon={<Save size={16} />} htmlType="submit" loading={updateMutation.isPending}>{t('save')}</Button>
          <Button type="primary" icon={<Send size={16} />} onClick={handleSubmit} loading={submitMutation.isPending}>{t('submit')}</Button>
        </div>
      </Form>
    </div>
  );
};

export default ReviewForm;
