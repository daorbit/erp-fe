/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Space, Tag, Typography, Modal, Form,
  Select, Row, Col, Statistic, Input, DatePicker, Checkbox, Tooltip, Badge,
} from 'antd';
import {
  Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight,
  PartyPopper, Globe, Building2, Star,
} from 'lucide-react';

const { Title, Text } = Typography;

interface Holiday {
  key: string;
  name: string;
  date: string;
  day: string;
  type: 'Public' | 'Religious' | 'Company' | 'Optional';
  description: string;
  isOptional: boolean;
}

const holidays2026: Holiday[] = [
  { key: '1', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'Public', description: 'National holiday celebrating the Constitution', isOptional: false },
  { key: '2', name: 'Maha Shivaratri', date: '2026-02-15', day: 'Sunday', type: 'Religious', description: 'Hindu festival dedicated to Lord Shiva', isOptional: true },
  { key: '3', name: 'Holi', date: '2026-03-17', day: 'Tuesday', type: 'Religious', description: 'Festival of colours', isOptional: false },
  { key: '4', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'Religious', description: 'Christian observance of crucifixion of Jesus', isOptional: false },
  { key: '5', name: 'Eid ul-Fitr', date: '2026-04-21', day: 'Tuesday', type: 'Religious', description: 'End of Ramadan', isOptional: false },
  { key: '6', name: 'May Day', date: '2026-05-01', day: 'Friday', type: 'Public', description: 'International Workers Day', isOptional: false },
  { key: '7', name: 'Company Foundation Day', date: '2026-06-15', day: 'Monday', type: 'Company', description: 'Annual celebration of company founding', isOptional: false },
  { key: '8', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'Public', description: 'National independence day', isOptional: false },
  { key: '9', name: 'Janmashtami', date: '2026-08-25', day: 'Tuesday', type: 'Religious', description: 'Birth of Lord Krishna', isOptional: true },
  { key: '10', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'Public', description: 'Birthday of Mahatma Gandhi', isOptional: false },
  { key: '11', name: 'Dussehra', date: '2026-10-19', day: 'Monday', type: 'Religious', description: 'Victory of good over evil', isOptional: false },
  { key: '12', name: 'Diwali', date: '2026-11-08', day: 'Sunday', type: 'Religious', description: 'Festival of lights', isOptional: false },
  { key: '13', name: 'Guru Nanak Jayanti', date: '2026-11-18', day: 'Wednesday', type: 'Religious', description: 'Birth anniversary of Guru Nanak Dev Ji', isOptional: true },
  { key: '14', name: 'Christmas', date: '2026-12-25', day: 'Friday', type: 'Public', description: 'Christian celebration of birth of Jesus', isOptional: false },
  { key: '15', name: 'Year End Holiday', date: '2026-12-31', day: 'Thursday', type: 'Company', description: 'Company holiday for year-end celebrations', isOptional: false },
];

const typeColors: Record<string, string> = {
  Public: 'blue',
  Religious: 'purple',
  Company: 'green',
  Optional: 'orange',
};

const typeDotColors: Record<string, string> = {
  Public: '#2563eb',
  Religious: '#7c3aed',
  Company: '#059669',
  Optional: '#d97706',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HolidayCalendar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [form] = Form.useForm();

  const filteredHolidays = holidays2026;
  const publicCount = filteredHolidays.filter(h => h.type === 'Public').length;
  const optionalCount = filteredHolidays.filter(h => h.isOptional).length;
  const now = new Date('2026-04-08');
  const upcomingCount = filteredHolidays.filter(h => new Date(h.date) >= now).length;

  const columns = [
    { title: 'Holiday', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Day', dataIndex: 'day', key: 'day', render: (d: string) => <Text type="secondary">{d}</Text> },
    {
      title: 'Type', dataIndex: 'type', key: 'type',
      render: (type: string) => <Tag color={typeColors[type]}>{type}</Tag>,
    },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (d: string) => <Text type="secondary">{d}</Text> },
    {
      title: 'Optional', dataIndex: 'isOptional', key: 'isOptional',
      render: (opt: boolean) => opt ? <Badge status="warning" text="Optional" /> : <Badge status="success" text="Mandatory" />,
    },
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const getHolidaysForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredHolidays.filter(h => h.date === dateStr);
  };

  const renderCalendarView = () => (
    <Row gutter={[16, 16]}>
      {monthNames.map((monthName, monthIndex) => {
        const daysInMonth = getDaysInMonth(selectedYear, monthIndex);
        const firstDay = getFirstDayOfMonth(selectedYear, monthIndex);
        const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={monthIndex}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: 16 } }}
            >
              <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontSize: 14 }}>
                {monthName} {selectedYear}
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
                {dayLabels.map(d => (
                  <div key={d} style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, padding: '2px 0' }}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayHolidays = getHolidaysForDate(selectedYear, monthIndex, day);
                  const isToday = selectedYear === 2026 && monthIndex === 3 && day === 8;
                  return (
                    <Tooltip
                      key={day}
                      title={dayHolidays.length > 0 ? dayHolidays.map(h => h.name).join(', ') : undefined}
                    >
                      <div style={{
                        padding: '3px 0',
                        fontSize: 12,
                        borderRadius: 6,
                        cursor: dayHolidays.length > 0 ? 'pointer' : 'default',
                        background: isToday ? '#1a56db' : 'transparent',
                        color: isToday ? '#fff' : dayHolidays.length > 0 ? typeDotColors[dayHolidays[0].type] : undefined,
                        fontWeight: dayHolidays.length > 0 || isToday ? 700 : 400,
                        position: 'relative',
                      }}>
                        {day}
                        {dayHolidays.length > 0 && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', gap: 2,
                          }}>
                            {dayHolidays.map((h, idx) => (
                              <div key={idx} style={{
                                width: 4, height: 4, borderRadius: '50%',
                                backgroundColor: typeDotColors[h.type],
                              }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Holiday Calendar</Title>
          <Text type="secondary">Manage public, religious and company holidays</Text>
        </div>
        <Space>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 100 }}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
            ]}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Holiday
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Holidays', value: filteredHolidays.length, icon: <CalendarIcon size={20} />, color: '#1a56db' },
          { title: 'Public Holidays', value: publicCount, icon: <Globe size={20} />, color: '#059669' },
          { title: 'Optional Holidays', value: optionalCount, icon: <Star size={20} />, color: '#d97706' },
          { title: 'Upcoming', value: upcomingCount, icon: <PartyPopper size={20} />, color: '#7c3aed' },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary">{stat.title}</Text>}
                  value={stat.value}
                  valueStyle={{ fontSize: 28, fontWeight: 700 }}
                />
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
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

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Tag color={typeColors.Public}>Public</Tag>
            <Tag color={typeColors.Religious}>Religious</Tag>
            <Tag color={typeColors.Company}>Company</Tag>
            <Tag color={typeColors.Optional}>Optional</Tag>
          </Space>
          <Space>
            <Tooltip title="Calendar View">
              <Button
                type={viewMode === 'calendar' ? 'primary' : 'default'}
                icon={<CalendarIcon size={16} />}
                onClick={() => setViewMode('calendar')}
              />
            </Tooltip>
            <Tooltip title="List View">
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<List size={16} />}
                onClick={() => setViewMode('list')}
              />
            </Tooltip>
          </Space>
        </Space>

        {viewMode === 'list' ? (
          <Table
            dataSource={filteredHolidays}
            columns={columns}
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} holidays` }}
          />
        ) : (
          renderCalendarView()
        )}
      </Card>

      <Modal
        title="Add Holiday"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => { form.validateFields().then(() => { setIsModalOpen(false); form.resetFields(); }); }}
        okText="Add Holiday"
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Holiday Name" rules={[{ required: true, message: 'Please enter holiday name' }]}>
            <Input placeholder="Enter holiday name" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select type' }]}>
                <Select placeholder="Select type" options={[
                  { value: 'Public', label: 'Public' },
                  { value: 'Religious', label: 'Religious' },
                  { value: 'Company', label: 'Company' },
                  { value: 'Optional', label: 'Optional' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description" />
          </Form.Item>
          <Form.Item name="isOptional" valuePropName="checked">
            <Checkbox>This is an optional holiday</Checkbox>
          </Form.Item>
          <Form.Item name="applicableFor" label="Applicable For">
            <Select defaultValue="all" options={[
              { value: 'all', label: 'All Departments' },
              { value: 'specific', label: 'Specific Departments' },
            ]} />
          </Form.Item>
          <Form.Item name="departments" label="Departments" hidden>
            <Select mode="multiple" placeholder="Select departments" options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Finance', label: 'Finance' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HolidayCalendar;
