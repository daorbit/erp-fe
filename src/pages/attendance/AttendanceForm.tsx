import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, TimePicker, App, Button, Typography, Space } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useMarkAttendance } from '@/hooks/queries/useAttendance';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const AttendanceForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const markMutation = useMarkAttendance();

  const { data: empData } = useEmployeeList();
  const employees: any[] = empData?.data ?? [];
  const employeeOptions = employees.map((e: any) => {
    const u = e.userId || e;
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return { value: u._id || e._id || e.id, label: `${name} (${e.employeeId || ''})` };
  });

  const handleSubmit = async (values: any) => {
    try {
      const markDate = values.date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
      await markMutation.mutateAsync({
        employee: values.employee,
        date: markDate,
        status: values.status,
        checkIn: values.checkIn ? `${markDate}T${values.checkIn.format('HH:mm')}:00.000Z` : undefined,
        checkOut: values.checkOut ? `${markDate}T${values.checkOut.format('HH:mm')}:00.000Z` : undefined,
      });
      message.success('Attendance marked');
      navigate('/attendance');
    } catch (err: any) {
      message.error(err?.message || 'Failed to mark attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/attendance')} />
        <Title level={4} className="!mb-0">{t('mark_attendance')}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="employee" label={t('employee')} rules={[{ required: true, message: 'Please select an employee' }]}>
              <Select placeholder="Search employee..." showSearch optionFilterProp="label" options={employeeOptions} />
            </Form.Item>
            <Form.Item name="date" label={t('date')} rules={[{ required: true }]} initialValue={dayjs()}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="status" label={t('status')} rules={[{ required: true }]}>
              <Select placeholder="Select status" options={[
                { value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' },
                { value: 'late', label: 'Late' }, { value: 'half_day', label: 'Half Day' },
                { value: 'on_leave', label: 'On Leave' }, { value: 'work_from_home', label: 'Work From Home' },
              ]} />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="checkIn" label={t('check_in')}><TimePicker className="w-full" format="HH:mm" /></Form.Item>
              <Form.Item name="checkOut" label={t('check_out')}><TimePicker className="w-full" format="HH:mm" /></Form.Item>
            </div>
            <Space>
              <Button onClick={() => navigate('/attendance')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={markMutation.isPending}>{t('save')}</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceForm;
