import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, App } from 'antd';
import { List as ListIcon } from 'lucide-react';
import {
  useCreateSalaryHead,
  useUpdateSalaryHead,
  useSalaryHeadList,
} from '@/hooks/queries/useSalaryHeads';
import { HEAD_TYPE_OPTIONS, HeadType } from '@/types/enums';

const { Title } = Typography;

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
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Salary Head' : 'Salary Head'}</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/salary-head/list')}>
          List
        </Button>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{ displayOrder: 0, headType: HeadType.ADDITION }}>
          {/* Two-column layout mirrors the screenshot. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <Form.Item name="name" label="Salary Head Name"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Salary Head Name is required' }]}>
              <Input maxLength={100} autoFocus />
            </Form.Item>

            <Form.Item name="headType" label="Head Type"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Head Type is required' }]}>
              <Select options={HEAD_TYPE_OPTIONS} />
            </Form.Item>

            <Form.Item name="printName" label="Print Name"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Print Name is required' }]}>
              <Input maxLength={50} style={{ width: 200 }} />
            </Form.Item>

            <Form.Item name="displayOrder" label="Order"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </div>

          <div className="flex justify-center mt-4">
            <Space>
              <Button type="primary" htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
              <Button onClick={() => navigate('/master/salary-head/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SalaryHeadAdd;
