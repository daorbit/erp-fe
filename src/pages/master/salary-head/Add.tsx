import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, App } from 'antd';
import { ArrowLeft } from 'lucide-react';
import {
  useCreateSalaryHead,
  useUpdateSalaryHead,
  useSalaryHeadList,
} from '@/hooks/queries/useSalaryHeads';
import { HEAD_TYPE_OPTIONS, HeadType } from '@/types/enums';

const { Title, Text } = Typography;

const SalaryHeadAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateSalaryHead();
  const updateMutation = useUpdateSalaryHead();
  const { data: listData } = useSalaryHeadList();

  const isEdit = !!id;
  const editData = isEdit
    ? (listData?.data ?? []).find((d: any) => (d._id || d.id) === id)
    : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        printName: editData.printName,
        headType: editData.headType,
        displayOrder: editData.displayOrder ?? 0,
        status: editData.status ?? 'Active',
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Salary Head updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Salary Head created');
      }
      navigate('/master/salary-head/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} Salary Head`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
       
        <Title level={4} className="!mb-0">
          {isEdit ? 'Edit Salary Head' : 'Add Salary Head'}
        </Title>
      </div>

      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{ displayOrder: 0, headType: HeadType.ADDITION, status: 'Active' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item
              name="name"
              label={<><Text type="danger">* </Text>Salary Head Name</>}
              rules={[{ required: true, message: 'Salary Head Name is required' }]}
            >
              <Input placeholder="e.g. Basic Pay" maxLength={100} autoFocus />
            </Form.Item>

            <Form.Item
              name="headType"
              label={<><Text type="danger">* </Text>Head Type</>}
              rules={[{ required: true, message: 'Head Type is required' }]}
            >
              <Select options={HEAD_TYPE_OPTIONS} />
            </Form.Item>

            <Form.Item
              name="printName"
              label={<><Text type="danger">* </Text>Print Name</>}
              rules={[{ required: true, message: 'Print Name is required' }]}
            >
              <Input placeholder="e.g. Basic" maxLength={50} />
            </Form.Item>

            <Form.Item name="displayOrder" label="Display Order">
              <InputNumber placeholder="e.g. 1" min={0} className="!w-full" />
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
              />
            </Form.Item>
          </div>

          <Space className="mt-2">
            <Button onClick={() => navigate('/master/salary-head/list')}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SalaryHeadAdd;
