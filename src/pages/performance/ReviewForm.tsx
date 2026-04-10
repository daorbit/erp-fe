import React from 'react';
import { Card, Form, Input, Button, Rate, Typography, Divider, Spin, Tag, Descriptions, Space } from 'antd';
import { App } from 'antd';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReview, useSubmitReview, useUpdateReview } from '@/hooks/queries/usePerformance';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

  const handleSave = (values: any) => {
    updateMutation.mutate({ id: id!, data: values }, {
      onSuccess: () => message.success('Review saved'),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      updateMutation.mutate({ id: id!, data: values }, {
        onSuccess: () => {
          submitMutation.mutate(id!, {
            onSuccess: () => {
              message.success('Review submitted');
              navigate(-1);
            },
          });
        },
      });
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} />
          <div>
            <Title level={4} className="!mb-1">{t('review_form')}</Title>
            <Text type="secondary">{review.employeeName} - {review.period}</Text>
          </div>
        </div>
        <Space>
          <Tag color={review.status === 'completed' ? 'green' : 'orange'}>{review.status}</Tag>
        </Space>
      </div>

      {/* Employee Info */}
      <Card bordered={false}>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={t('employee')}>{review.employeeName}</Descriptions.Item>
          <Descriptions.Item label={t('department')}>{review.department}</Descriptions.Item>
          <Descriptions.Item label="Type"><Tag>{review.type}</Tag></Descriptions.Item>
          <Descriptions.Item label="Period">{review.period}</Descriptions.Item>
          <Descriptions.Item label="Reviewer">{review.reviewerName}</Descriptions.Item>
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
                  <Tag color={goal.status === 'completed' ? 'green' : 'blue'}>{goal.status}</Tag>
                </div>
                <Form.Item name={['goalRatings', i, 'rating']} label="Rating" className="!mb-1">
                  <Rate count={5} />
                </Form.Item>
                <Form.Item name={['goalRatings', i, 'comment']} className="!mb-0">
                  <Input placeholder="Comment on this goal..." />
                </Form.Item>
              </div>
            ))}
          </Card>
        )}

        {/* Overall Rating */}
        <Card title="Overall Assessment" bordered={false} className="mb-6">
          <Form.Item name="overallRating" label="Overall Rating" rules={[{ required: true, message: 'Please provide a rating' }]}>
            <Rate count={5} />
          </Form.Item>
          <Form.Item name="comments" label="Overall Comments" rules={[{ required: true, message: 'Please provide comments' }]}>
            <TextArea rows={4} placeholder="Overall performance comments..." />
          </Form.Item>
        </Card>

        {/* Strengths & Improvements */}
        <Card title="Strengths & Areas for Improvement" bordered={false} className="mb-6">
          <Form.Item name="strengths" label="Key Strengths">
            <TextArea rows={3} placeholder="List key strengths..." />
          </Form.Item>
          <Form.Item name="improvements" label="Areas for Improvement">
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
