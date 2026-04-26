import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, DatePicker, Radio, Space, Typography, Card, Button, App } from 'antd';
import { List as ListIcon } from 'lucide-react';
import { simHooks } from '@/hooks/queries/useMasterOther';
import { toDayjs } from '@/lib/formValues';
import dayjs from 'dayjs';

const { Title } = Typography;

const SimAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const create = simHooks.useCreate();
  const update = simHooks.useUpdate();
  const { data: detail } = simHooks.useDetail(id!);

  useEffect(() => {
    if (!isEdit) return;
    const s = detail?.data;
    if (!s) return;
    form.setFieldsValue({ ...s, purchaseDate: toDayjs(s.purchaseDate) });
  }, [isEdit, detail, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        purchaseDate: values.purchaseDate ? dayjs(values.purchaseDate).toISOString() : undefined,
      };
      if (isEdit && id) {
        await update.mutateAsync({ id, data: payload });
        message.success('Sim updated');
      } else {
        await create.mutateAsync(payload);
        message.success('Sim saved');
        form.resetFields();
      }
      navigate('/master/other/sim/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed to save Sim');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Sim' : 'Sim'}</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/other/sim/list')}>
          List
        </Button>
      </div>
      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          initialValues={{ simType: 'postpaid', purchaseOrderBillNo: '0' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <Form.Item
              name="simMobileNo"
              label="Sim/Mobile No."
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'Sim/Mobile No. is required' }]}
            >
              <Input maxLength={20} autoFocus />
            </Form.Item>
            <Form.Item name="simSerialNo" label="Sim Serial No." labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item name="purchaseOrderBillNo" label="Purchase Order/Bill No." labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item name="purchaseDate" label="Purchase Date" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item name="stateCircle" label="State Name/Circle" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item name="localStd" label="LOCAL/STD" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input maxLength={20} />
            </Form.Item>
            <Form.Item name="subscriberName" label="Subscriber Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input maxLength={150} />
            </Form.Item>
            <Form.Item name="planTariff" label="Plan/Tariff" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input maxLength={150} />
            </Form.Item>
            <Form.Item name="simType" label="Sim Type" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Radio.Group>
                <Radio value="prepaid">Prepaid</Radio>
                <Radio value="postpaid">Postpaid</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending}>Save</Button>
              <Button onClick={() => navigate('/master/other/sim/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SimAddPage;
