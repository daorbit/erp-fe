import React, { useState } from 'react';
import { Card, Table, Tag, Button, DatePicker, Select, Drawer, Form, Typography, Row, Col, Tabs, Space, Avatar, TimePicker, App } from 'antd';
import { Plus, UserCheck, UserX, Clock, CalendarOff } from 'lucide-react';
import { useAttendanceList, useMarkAttendance } from '@/hooks/queries/useAttendance';
import { useEmployeeList } from '@/hooks/queries/useEmployees';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { present: 'green', absent: 'red', late: 'orange', half_day: 'blue', on_leave: 'purple', work_from_home: 'cyan' };

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

  // Employee name helper — employee is populated object from backend
  const getEmpName = (emp: any) => {
    if (!emp || typeof emp !== 'object') return String(emp || '-');
    return `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'N/A';
  };

  // Employee select options — from EmployeeProfile (which has userId populated)
  const employeeOptions = employees.map((e: any) => {
    const u = e.userId || e;
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return { value: u._id || e._id || e.id, label: `${name} (${e.employeeId || ''})` };
  });

  const handleMark = async (values: any) => {
    try {
      const markDate = values.date?.format('YYYY-MM-DD') || date;
      await markMutation.mutateAsync({
        employee: values.employee,
        date: markDate,
        status: values.status,
        checkIn: values.checkIn ? `${markDate}T${values.checkIn.format('HH:mm')}:00.000Z` : undefined,
        checkOut: values.checkOut ? `${markDate}T${values.checkOut.format('HH:mm')}:00.000Z` : undefined,
      });
      message.success('Attendance marked');
      form.resetFields();
      setModalOpen(false);
    } catch (err: any) {
      message.error(err?.message || 'Failed to mark attendance');
    }
  };

  const columns: any[] = [
    {
      title: t('employee'), dataIndex: 'employee', key: 'employee',
      render: (emp: any) => {
        const name = getEmpName(emp);
        return (
          <div className="flex items-center gap-3">
            <Avatar src={typeof emp === 'object' ? emp?.avatar : undefined} className="bg-blue-600" size={32}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div>
              <div className="font-medium text-sm">{name}</div>
              {typeof emp === 'object' && emp?.email && <div className="text-xs text-gray-400">{emp.email}</div>}
            </div>
          </div>
        );
      },
    },
    {
      title: t('check_in'), dataIndex: 'checkIn', key: 'checkIn',
      render: (v: string) => v ? dayjs(v).format('h:mm A') : '-',
    },
    {
      title: t('check_out'), dataIndex: 'checkOut', key: 'checkOut',
      render: (v: string) => v ? dayjs(v).format('h:mm A') : '-',
    },
    {
      title: t('work_hours'), dataIndex: 'workHours', key: 'workHours',
      render: (h: number) => h ? `${h.toFixed(1)}h` : '-',
    },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Present', value: 'present' }, { text: 'Absent', value: 'absent' },
        { text: 'Late', value: 'late' }, { text: 'Half Day', value: 'half_day' },
        { text: 'On Leave', value: 'on_leave' }, { text: 'WFH', value: 'work_from_home' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s?.replace('_', ' ')}</Tag>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Title level={4} className="!mb-1">{t('attendance')}</Title><Text type="secondary">{t('track_attendance')}</Text></div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>{t('mark_attendance')}</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}><span style={{ color: s.color }}>{s.icon}</span></div>
                <div><Text type="secondary" className="text-xs">{s.title}</Text><div className="text-2xl font-bold">{s.value}</div></div>
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
              { key: 'all', label: `All (${records.length})` },
              { key: 'present', label: `Present (${presentCount})` },
              { key: 'absent', label: `Absent (${absentCount})` },
              { key: 'late', label: `Late (${lateCount})` },
            ]} />
        </div>
        <Table columns={columns} dataSource={records} loading={isLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 15 }} scroll={{ x: 700 }} />
      </Card>

      {/* Mark Attendance Drawer */}
      <Drawer title={t('mark_attendance')} open={modalOpen} onClose={() => setModalOpen(false)} width={520} destroyOnClose
        extra={<Space><Button onClick={() => setModalOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={markMutation.isPending} onClick={() => form.submit()}>{t('save')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleMark}>
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
        </Form>
      </Drawer>
    </div>
  );
};

export default AttendanceList;
