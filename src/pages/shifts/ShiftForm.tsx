import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, Checkbox, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useShiftList, useCreateShift, useUpdateShift } from '@/hooks/queries/useShifts';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const DAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const ShiftForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const { data: shiftData } = useShiftList();

  const isEdit = !!id;
  const editData = isEdit ? (shiftData?.data ?? []).find((s: any) => (s._id || s.id) === id) : null;

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        startTime: editData.startTime,
        endTime: editData.endTime,
        graceMinutes: editData.graceMinutes,
        timezone: editData.timezone,
        workingDays: editData.workingDays,
      });
    }
  }, [editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: values });
        message.success('Shift updated');
      } else {
        await createMutation.mutateAsync(values);
        message.success('Shift created');
      }
      navigate('/shifts');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} shift`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/shifts')} />
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Shift' : 'Add Shift'}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ graceMinutes: 15, timezone: 'Asia/Kolkata', workingDays: [1, 2, 3, 4, 5] }}>
            <Form.Item name="name" label="Shift Name" rules={[{ required: true, message: 'Please enter shift name' }]}>
              <Input placeholder="e.g. Morning Shift" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="startTime" label="Start Time" rules={[{ required: true, message: 'Required' }]}>
                <Input type="time" />
              </Form.Item>
              <Form.Item name="endTime" label="End Time" rules={[{ required: true, message: 'Required' }]}>
                <Input type="time" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="graceMinutes" label="Grace Period (min)" tooltip="Minutes after shift start before marked late">
                <InputNumber min={0} max={120} className="w-full" />
              </Form.Item>
              <Form.Item name="timezone" label="Timezone">
                <Select showSearch options={[
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                  { value: 'America/New_York', label: 'America/New_York (EST)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
                ]} />
              </Form.Item>
            </div>
            <Form.Item name="workingDays" label="Working Days">
              <Checkbox.Group options={DAY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate('/shifts')}>{t('cancel')}</Button>
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

export default ShiftForm;
