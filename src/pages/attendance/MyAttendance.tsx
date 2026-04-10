import React, { useState } from 'react';
import { Card, Table, Tag, Button, Typography, Row, Col, Spin, Space, App } from 'antd';
import { LogIn, LogOut, Clock, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { useMyAttendance, useCheckIn, useCheckOut, useAttendanceSummary } from '@/hooks/queries/useAttendance';
import dayjs from 'dayjs';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { present: 'green', absent: 'red', late: 'orange', half_day: 'blue', on_leave: 'purple' };

const MyAttendance: React.FC = () => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [checkedIn, setCheckedIn] = useState(false);

  const { data: myData, isLoading } = useMyAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const records: any[] = myData?.data ?? [];
  const todayRecord = records.find((r: any) => r.date === dayjs().format('YYYY-MM-DD'));

  const isCheckedIn = checkedIn || !!todayRecord?.checkIn;
  const isCheckedOut = !!todayRecord?.checkOut;

  const presentDays = records.filter((r: any) => r.status === 'present').length;
  const absentDays = records.filter((r: any) => r.status === 'absent').length;
  const lateDays = records.filter((r: any) => r.status === 'late').length;
  const totalHours = records.reduce((sum: number, r: any) => sum + (r.workHours || 0), 0);

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({ timestamp: new Date().toISOString() });
      setCheckedIn(true);
      message.success('Checked in successfully');
    } catch {
      message.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync({ timestamp: new Date().toISOString() });
      message.success('Checked out successfully');
    } catch {
      message.error('Failed to check out');
    }
  };

  const stats = [
    { title: 'Present Days', value: presentDays, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Absent Days', value: absentDays, icon: <XCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
    { title: 'Late Days', value: lateDays, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Total Hours', value: Math.round(totalHours), icon: <CalendarDays size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
  ];

  const columns = [
    { title: t('date'), dataIndex: 'date', key: 'date', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: t('check_in'), dataIndex: 'checkIn', key: 'checkIn', render: (v: string) => v || '-' },
    { title: t('check_out'), dataIndex: 'checkOut', key: 'checkOut', render: (v: string) => v || '-' },
    { title: t('work_hours'), dataIndex: 'workHours', key: 'workHours', render: (h: number) => h ? `${h}h` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s}</Tag> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">{t('my_attendance')}</Title>
        <Text type="secondary">{t('track_attendance')}</Text>
      </div>

      {/* Check In / Out */}
      <Card bordered={false}>
        <div className="flex flex-col items-center justify-center py-6 gap-4">
          <Text type="secondary" className="text-lg">{dayjs().format('dddd, MMMM D, YYYY')}</Text>
          <Text className="text-4xl font-bold">{dayjs().format('HH:mm')}</Text>
          <Space size="large">
            <Button type="primary" size="large" icon={<LogIn size={20} />} onClick={handleCheckIn}
              disabled={isCheckedIn} loading={checkInMutation.isPending}
              className="h-14 px-8 text-base">
              {t('check_in_btn')}
            </Button>
            <Button size="large" icon={<LogOut size={20} />} onClick={handleCheckOut}
              disabled={!isCheckedIn || isCheckedOut} loading={checkOutMutation.isPending}
              className="h-14 px-8 text-base" danger>
              {t('check_out_btn')}
            </Button>
          </Space>
          {todayRecord?.checkIn && (
            <Text type="secondary">Checked in at {todayRecord.checkIn}{todayRecord.checkOut ? ` | Checked out at ${todayRecord.checkOut}` : ''}</Text>
          )}
        </div>
      </Card>

      {/* Monthly Summary */}
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

      {/* Recent Log */}
      <Card title="Recent Attendance Log" bordered={false}>
        <Table columns={columns} dataSource={records} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.date} pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
      </Card>
    </div>
  );
};

export default MyAttendance;
