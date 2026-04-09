import React, { useState } from 'react';
import { Card, Table, Tag, Button, DatePicker, Select, Drawer, Form, Input, Typography, Row, Col, Tabs, Space, Avatar, TimePicker, App } from 'antd';
import { Plus, Search, UserCheck, UserX, Clock, CalendarOff } from 'lucide-react';
import { useAttendanceList, useMarkAttendance } from '@/hooks/queries/useAttendance';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { present: 'green', absent: 'red', late: 'orange', half_day: 'blue', on_leave: 'purple' };

const AttendanceList: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const params: any = { date };
  if (statusFilter) params.status = statusFilter;

  const { data: attData, isLoading } = useAttendanceList(params);
  const { data: empData } = useEmployeeList();
  const markMutation = useMarkAttendance();

  const records: any[] = attData?.data ?? [];
  const employees: any[] = empData?.data ?? [];

  const presentCount = records.filter((r: any) => r.status === 'present').length;
  const absentCount = records.filter((r: any) => r.status === 'absent').length;
  const lateCount = records.filter((r: any) => r.status === 'late').length;
  const leaveCount = records.filter((r: any) => r.status === 'on_leave').length;

  const stats = [
    { title: t('present_today'), value: presentCount, icon: <UserCheck size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('absent_today'), value: absentCount, icon: <UserX size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
    { title: t('late_today'), value: lateCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: t('on_leave'), value: leaveCount, icon: <CalendarOff size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const handleMark = async (values: any) => {
    try {
      await markMutation.mutateAsync({
        employeeId: values.employee,
        date: values.date?.format('YYYY-MM-DD'),
        status: values.status,
        checkIn: values.checkIn?.format('HH:mm'),
        checkOut: values.checkOut?.format('HH:mm'),
      });
      message.success('Attendance marked');
      form.resetFields();
      setModalOpen(false);
    } catch {
      message.error('Failed to mark attendance');
    }
  };

  const columns = [
    {
      title: t('employee'), dataIndex: 'employee', key: 'employee',
      render: (emp: any) => {
        const name = typeof emp === 'object' ? (emp?.name || `${emp?.firstName ?? ''} ${emp?.lastName ?? ''}`) : emp;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="bg-blue-600" size={32}>{(name || '?').split(' ').map((n: string) => n[0]).join('')}</Avatar>
            <div>
              <div className="font-medium text-sm">{name || '-'}</div>
              {typeof emp === 'object' && emp?.email && <div className="text-xs text-gray-400">{emp.email}</div>}
            </div>
          </div>
        );
      },
    },
    {
      title: t('department'), dataIndex: 'department', key: 'department',
      filters: [...new Set(records.map((r: any) => typeof r.department === 'object' ? r.department?.name : r.department).filter(Boolean))].map((d: any) => ({ text: d, value: d })),
      onFilter: (value: any, record: any) => {
        const dept = typeof record.department === 'object' ? record.department?.name : record.department;
        return dept === value;
      },
      render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : (d || '-')}</Tag>,
    },
    { title: t('check_in'), dataIndex: 'checkIn', key: 'checkIn', render: (v: string) => v || '-' },
    { title: t('check_out'), dataIndex: 'checkOut', key: 'checkOut', render: (v: string) => v || '-' },
    { title: t('work_hours'), dataIndex: 'workHours', key: 'workHours', render: (h: number) => h ? `${h}h` : '-' },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' },
        { text: 'Late', value: 'late' },
        { text: 'Half Day', value: 'half_day' },
        { text: 'On Leave', value: 'on_leave' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('attendance')}</Title>
          <Text type="secondary">{t('track_attendance')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>{t('mark_attendance')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">{s.title}</Text>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <DatePicker value={dayjs(date)} onChange={(d) => setDate(d?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'))} />
          <Tabs activeKey={statusFilter || 'all'} onChange={(k) => setStatusFilter(k === 'all' ? undefined : k)}
            items={[
              { key: 'all', label: 'All' },
              { key: 'present', label: 'Present' },
              { key: 'absent', label: 'Absent' },
              { key: 'late', label: 'Late' },
              { key: 'on_leave', label: 'On Leave' },
            ]} />
        </div>
        <Table columns={columns} dataSource={records} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title={t('mark_attendance')} open={modalOpen} onClose={() => setModalOpen(false)} width={520} destroyOnClose extra={<Space><Button onClick={() => setModalOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={markMutation.isPending} onClick={() => form.submit()}>{t('save')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleMark}>
          <Form.Item name="employee" label="Employee" rules={[{ required: true }]}>
            <Select placeholder="Select employee" showSearch optionFilterProp="label"
              options={employees.map((e: any) => ({ value: e._id || e.id, label: e.name || `${e.firstName ?? ''} ${e.lastName ?? ''}` }))} />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker className="w-full" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="checkIn" label="Check In"><TimePicker className="w-full" format="HH:mm" /></Form.Item>
            <Form.Item name="checkOut" label="Check Out"><TimePicker className="w-full" format="HH:mm" /></Form.Item>
          </div>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={['present', 'absent', 'late', 'half_day', 'on_leave'].map(s => ({ value: s, label: s }))} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AttendanceList;
