import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, Button, Space, Typography, App, Alert } from 'antd';
import { useDesignationList, useMergeDesignations } from '@/hooks/queries/useDesignations';

const { Title } = Typography;

const DesignationMerge: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const { data: listData } = useDesignationList();
  const mergeMutation = useMergeDesignations();

  const items: any[] = listData?.data ?? [];
  const options = items.map((d) => ({ value: d._id || d.id, label: d.name }));

  const runMerge = async (fromId: string, toId: string) => {
    try {
      const res: any = await mergeMutation.mutateAsync({
        fromDesignation: fromId,
        toDesignation: toId,
      });
      const moved = res?.data?.movedUsers ?? 0;
      message.success(`Merged successfully. ${moved} employee(s) reassigned.`);
      navigate('/master/designation/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed to merge designations');
    }
  };

  const handleSubmit = (values: { fromDesignation: string; toDesignation: string }) => {
    if (values.fromDesignation === values.toDesignation) {
      message.error('From and To designations must be different');
      return;
    }
    const fromName = items.find((d) => (d._id || d.id) === values.fromDesignation)?.name;
    const toName = items.find((d) => (d._id || d.id) === values.toDesignation)?.name;
    modal.confirm({
      title: 'Merge designations?',
      content: (
        <div>
          All employees holding <b>{fromName}</b> will be reassigned to <b>{toName}</b>, and{' '}
          <b>{fromName}</b> will be deactivated.
        </div>
      ),
      okText: 'Merge',
      okButtonProps: { danger: true },
      onOk: () => runMerge(values.fromDesignation, values.toDesignation),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Designation Merge</Title>
      </div>

      <Card bordered={false}>
        <Alert
          type="info" showIcon
          message="Merging reassigns every employee on the source designation to the target, then deactivates the source."
          className="mb-4 max-w-3xl mx-auto"
        />
        <Form form={form} layout="horizontal" labelCol={{ span: 8 }} wrapperCol={{ span: 12 }}
          onFinish={handleSubmit} className="max-w-3xl mx-auto">
          <Form.Item name="fromDesignation" label="From Designation"
            rules={[{ required: true, message: 'From Designation is required' }]}>
            <Select placeholder="Please Select" showSearch optionFilterProp="label" options={options} />
          </Form.Item>
          <Form.Item name="toDesignation" label="To Designation"
            rules={[{ required: true, message: 'To Designation is required' }]}>
            <Select placeholder="Please Select" showSearch optionFilterProp="label" options={options} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 12 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={mergeMutation.isPending}>Save</Button>
              <Button onClick={() => navigate('/master/designation/list')}>Close</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DesignationMerge;
