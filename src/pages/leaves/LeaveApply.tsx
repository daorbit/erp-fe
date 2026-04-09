import React from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Upload, Typography, Row, Col, Tag } from 'antd';
import { App } from 'antd';
import { Upload as UploadIcon, Send } from 'lucide-react';
import { useApplyLeave, useLeaveBalance, useLeaveTypeList } from '@/hooks/queries/useLeaves';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const LeaveApply: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const applyMutation = useApplyLeave();
  const { data: typeData } = useLeaveTypeList();
  const { data: balanceData } = useLeaveBalance('me');

  const leaveTypes: any[] = typeData?.data ?? [];
  const balances: any[] = balanceData?.data ?? [];

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    delete payload.dateRange;
    applyMutation.mutate(payload, {
      onSuccess: () => {
        message.success('Leave application submitted');
        form.resetFields();
      },
      onError: () => message.error('Failed to submit leave application'),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">{t('apply_leave')}</Title>
        <Text type="secondary">{t('manage_leaves')}</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Leave Application" bordered={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true, message: 'Please select leave type' }]}>
                <Select placeholder="Select leave type" options={leaveTypes.map(t => ({ value: t._id || t.id, label: t.name }))} />
              </Form.Item>
              <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Please select dates' }]}>
                <RangePicker className="w-full" />
              </Form.Item>
              <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please provide a reason' }]}>
                <TextArea rows={4} placeholder="Describe the reason for your leave..." />
              </Form.Item>
              <Form.Item name="attachment" label="Attachment (Optional)">
                <Upload maxCount={1} beforeUpload={() => false}>
                  <Button icon={<UploadIcon size={16} />}>Upload File</Button>
                </Upload>
              </Form.Item>
              <div className="flex justify-end">
                <Button type="primary" htmlType="submit" loading={applyMutation.isPending} icon={<Send size={16} />}>
                  {t('submit')}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Leave Balance" bordered={false}>
            {balances.length === 0 ? (
              <Text type="secondary">No balance data available</Text>
            ) : (
              <div className="space-y-3">
                {balances.map((b: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <div className="font-medium text-sm">{b.leaveType || b.name}</div>
                      <Text type="secondary" className="text-xs">Used: {b.used ?? 0} / {b.total ?? 0}</Text>
                    </div>
                    <Tag color={(b.balance ?? 0) > 0 ? 'green' : 'red'} className="!text-lg !px-3">{b.balance ?? 0}</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LeaveApply;
