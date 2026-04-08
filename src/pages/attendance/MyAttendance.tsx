/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Typography, Row, Col, Statistic, Table, Tag, Space, Badge,
} from 'antd';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock3,
  Timer,
  Laptop,
  Calendar,
} from 'lucide-react';

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  Present: 'green',
  Absent: 'red',
  Late: 'orange',
  HalfDay: 'gold',
  OnLeave: 'blue',
  WFH: 'purple',
};

const statusLabelMap: Record<string, string> = {
  Present: 'Present',
  Absent: 'Absent',
  Late: 'Late',
  HalfDay: 'Half Day',
  OnLeave: 'On Leave',
  WFH: 'WFH',
};

const recentLog = [
  { key: '1', date: '08 Apr 2026', day: 'Wednesday', checkIn: '09:15 AM', checkOut: '-', workHours: '-', status: 'Present' },
  { key: '2', date: '07 Apr 2026', day: 'Tuesday', checkIn: '09:02 AM', checkOut: '06:20 PM', workHours: '9h 18m', status: 'Present' },
  { key: '3', date: '06 Apr 2026', day: 'Monday', checkIn: '09:30 AM', checkOut: '06:00 PM', workHours: '8h 30m', status: 'Late' },
  { key: '4', date: '05 Apr 2026', day: 'Sunday', checkIn: '-', checkOut: '-', workHours: '-', status: 'Absent' },
  { key: '5', date: '04 Apr 2026', day: 'Saturday', checkIn: '-', checkOut: '-', workHours: '-', status: 'Absent' },
  { key: '6', date: '03 Apr 2026', day: 'Friday', checkIn: '09:00 AM', checkOut: '06:15 PM', workHours: '9h 15m', status: 'Present' },
  { key: '7', date: '02 Apr 2026', day: 'Thursday', checkIn: '09:10 AM', checkOut: '06:00 PM', workHours: '8h 50m', status: 'Present' },
];

// Generate calendar data for April 2026
const generateCalendarData = () => {
  const statuses: Record<number, string> = {
    1: 'Present', 2: 'Present', 3: 'Present', 4: 'Absent', 5: 'Absent',
    6: 'Late', 7: 'Present', 8: 'Present', 9: 'WFH', 10: 'Present',
    11: 'Absent', 12: 'Absent', 13: 'Present', 14: 'Present', 15: 'OnLeave',
    16: 'Present', 17: 'Present', 18: 'Absent', 19: 'Absent', 20: 'Present',
    21: 'HalfDay', 22: 'Present', 23: 'Present', 24: 'Present', 25: 'Absent',
    26: 'Absent', 27: 'Present', 28: 'Present', 29: 'Present', 30: 'Present',
  };
  return statuses;
};

const calendarStatuses = generateCalendarData();

const dayColors: Record<string, string> = {
  Present: '#059669',
  Absent: '#e5e7eb',
  Late: '#d97706',
  HalfDay: '#eab308',
  OnLeave: '#2563eb',
  WFH: '#7c3aed',
};

const MyAttendance: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const checkInTime = '09:15 AM';

  const summaryStats = [
    { title: 'Present Days', value: 17, icon: <CheckCircle2 size={20} />, color: '#059669' },
    { title: 'Absent', value: 2, icon: <XCircle size={20} />, color: '#dc2626' },
    { title: 'Late', value: 1, icon: <Clock3 size={20} />, color: '#d97706' },
    { title: 'Half Days', value: 1, icon: <Timer size={20} />, color: '#eab308' },
    { title: 'Work From Home', value: 1, icon: <Laptop size={20} />, color: '#7c3aed' },
    { title: 'Overtime Hours', value: '12h 30m', icon: <Clock3 size={20} />, color: '#1a56db' },
  ];

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Day', dataIndex: 'day', key: 'day' },
    { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
    { title: 'Work Hours', dataIndex: 'workHours', key: 'workHours', render: (h: string) => <Text strong>{h}</Text> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColorMap[status]}>{statusLabelMap[status]}</Tag>,
    },
  ];

  // April 2026 starts on Wednesday (day index 3)
  const firstDayOfWeek = 3; // 0=Sun, 3=Wed
  const daysInMonth = 30;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>My Attendance</Title>
          <Text type="secondary">View and manage your attendance records</Text>
        </div>
      </div>

      {/* Check In / Check Out Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center', padding: '12px 0' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: isCheckedIn ? '#05966915' : '#dc262615',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                {isCheckedIn ? <CheckCircle2 size={32} style={{ color: '#059669' }} /> : <XCircle size={32} style={{ color: '#dc2626' }} />}
              </div>
              <Text strong style={{ fontSize: 16 }}>
                {isCheckedIn ? `Checked In at ${checkInTime}` : 'Not Checked In'}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {isCheckedIn ? 'Working hours in progress...' : 'Click below to mark your attendance'}
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              danger={isCheckedIn}
              icon={isCheckedIn ? <LogOut size={18} /> : <LogIn size={18} />}
              style={{ width: 200, height: 48, fontSize: 16, borderRadius: 10 }}
              onClick={() => setIsCheckedIn(!isCheckedIn)}
            >
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={<Space><Calendar size={18} /> <span>April 2026</span></Space>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
              {weekDays.map(day => (
                <div key={day} style={{ padding: '4px 0', fontWeight: 600, fontSize: 12, color: '#6b7280' }}>{day}</div>
              ))}
              {calendarCells.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: day && day <= 8 ? 600 : 400,
                    color: day ? '#1f2937' : 'transparent',
                    position: 'relative',
                  }}
                >
                  {day || ''}
                  {day && calendarStatuses[day] && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dayColors[calendarStatuses[day]] || '#e5e7eb',
                      margin: '2px auto 0',
                    }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {Object.entries(dayColors).map(([label, color]) => (
                <Space key={label} size={4}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <Text style={{ fontSize: 11 }}>{statusLabelMap[label] || label}</Text>
                </Space>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Monthly Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryStats.map((stat, index) => (
          <Col xs={12} sm={8} lg={4} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: 12 }}>{stat.title}</Text>}
                  value={stat.value}
                  valueStyle={{ fontSize: 22, fontWeight: 700 }}
                />
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${stat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Attendance Log */}
      <Card
        title="Recent Attendance Log"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <Table
          dataSource={recentLog}
          columns={columns}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default MyAttendance;
