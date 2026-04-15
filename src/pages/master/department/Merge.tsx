import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, Button, Space, Typography, App, Alert } from 'antd';
import { useDepartmentList, useMergeDepartments } from '@/hooks/queries/useDepartments';

const { Title } = Typography;

// Merge one department into another. Every employee assigned to "From" is
// reassigned to "To", then "From" is soft-deleted. Shown as a confirmation step
// before hitting the API because the action affects employee records.
const DepartmentMerge: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();

  const { data: listData } = useDepartmentList();
  const mergeMutation = useMergeDepartments();

  const items: any[] = listData?.data ?? [];
  const options = items.map((d) => ({
    value: d._id || d.id,
    label: d.name,
  }));

  const runMerge = async (fromId: string, toId: string) => {
    try {
      const res: any = await mergeMutation.mutateAsync({ fromDepartment: fromId, toDepartment: toId });
      const moved = res?.data?.movedUsers ?? 0;
      message.success(`Merged successfully. ${moved} employee(s) reassigned.`);
      navigate('/master/department/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed to merge departments');
    }
  };

  const handleSubmit = (values: { fromDepartment: string; toDepartment: string }) => {
    if (values.fromDepartment === values.toDepartment) {
      message.error('From and To departments must be different');
      return;
    }
    const fromName = items.find((d) => (d._id || d.id) === values.fromDepartment)?.name;
    const toName = items.find((d) => (d._id || d.id) === values.toDepartment)?.name;

    modal.confirm({
      title: 'Merge departments?',
      content: (
        <div>
          All employees in <b>{fromName}</b> will be reassigned to <b>{toName}</b>, and{' '}
          <b>{fromName}</b> will be deactivated. This action cannot be undone from this screen.
        </div>
      ),
      okText: 'Merge',
      okButtonProps: { danger: true },
      onOk: () => runMerge(values.fromDepartment, values.toDepartment),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Department Merge</Title>
      </div>

      <Card bordered={false}>
        <Alert
          type="info"
          showIcon
          message="Merging moves all employees from the source department into the target, then deactivates the source."
          className="mb-4 max-w-3xl mx-auto"
        />

        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 12 }}
          onFinish={handleSubmit}
          className="max-w-3xl mx-auto"
        >
          <Form.Item
            name="fromDepartment"
            label="From Department"
            rules={[{ required: true, message: 'From Department is required' }]}
          >
            <Select
              placeholder="Please Select"
              showSearch
              optionFilterProp="label"
              options={options}
            />
          </Form.Item>

          <Form.Item
            name="toDepartment"
            label="To Department"
            rules={[{ required: true, message: 'To Department is required' }]}
          >
            <Select
              placeholder="Please Select"
              showSearch
              optionFilterProp="label"
              options={options}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 12 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={mergeMutation.isPending}
              >
                Save
              </Button>
              <Button onClick={() => navigate('/master/department/list')}>Close</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DepartmentMerge;
