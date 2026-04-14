import React, { useState } from 'react';
import { Card, Table, Tag, Button, DatePicker, Select, Typography, Row, Col, Tabs, Space, Avatar, App } from 'antd';
import { Plus, UserCheck, UserX, Clock, CalendarOff } from 'lucide-react';
import { useAttendanceList } from '@/hooks/queries/useAttendance';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { present: 'green', absent: 'red', late: 'orange', half_day: 'blue', on_leave: 'purple', work_from_home: 'cyan' };

const AttendanceList: React.FC = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const params: any = { date };
  if (statusFilter) params.status = statusFilter;

  const { data: attData, isLoading } = useAttendanceList(params);

  const records: any[] = attData?.data ?? [];

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
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/attendance/mark')}>{t('mark_attendance')}</Button>
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

    </div>
  );
};

export default AttendanceList;
