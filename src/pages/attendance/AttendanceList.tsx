/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Modal, Form,
  Select, Row, Col, DatePicker, TimePicker, Statistic, Tabs,
} from 'antd';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  Palmtree,
  Users,
  Laptop,
  MoreHorizontal,
  Edit2,
  Eye,
} from 'lucide-react';

const { Title, Text } = Typography;

const attendanceData = [
  { key: '1', name: 'Rahul Sharma', department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:15 PM', workHours: '9h 13m', status: 'Present', overtime: '0h 13m' },
  { key: '2', name: 'Priya Singh', department: 'Marketing', checkIn: '09:28 AM', checkOut: '06:30 PM', workHours: '9h 02m', status: 'Present', overtime: '0h 02m' },
  { key: '3', name: 'Amit Patel', department: 'Finance', checkIn: '-', checkOut: '-', workHours: '-', status: 'Absent', overtime: '-' },
  { key: '4', name: 'Sneha Gupta', department: 'HR', checkIn: '09:45 AM', checkOut: '06:00 PM', workHours: '8h 15m', status: 'Late', overtime: '-' },
  { key: '5', name: 'Vikram Joshi', department: 'Sales', checkIn: '-', checkOut: '-', workHours: '-', status: 'OnLeave', overtime: '-' },
  { key: '6', name: 'Ananya Reddy', department: 'Engineering', checkIn: '09:00 AM', checkOut: '06:20 PM', workHours: '9h 20m', status: 'Present', overtime: '0h 20m' },
  { key: '7', name: 'Karan Mehta', department: 'Sales', checkIn: '09:05 AM', checkOut: '06:00 PM', workHours: '8h 55m', status: 'Present', overtime: '-' },
  { key: '8', name: 'Deepika Nair', department: 'Engineering', checkIn: '09:15 AM', checkOut: '01:00 PM', workHours: '3h 45m', status: 'HalfDay', overtime: '-' },
  { key: '9', name: 'Rajesh Kumar', department: 'Finance', checkIn: '09:10 AM', checkOut: '06:25 PM', workHours: '9h 15m', status: 'Present', overtime: '0h 15m' },
  { key: '10', name: 'Meera Iyer', department: 'Marketing', checkIn: '09:00 AM', checkOut: '06:00 PM', workHours: '9h 00m', status: 'WFH', overtime: '-' },
  { key: '11', name: 'Suresh Pillai', department: 'HR', checkIn: '-', checkOut: '-', workHours: '-', status: 'Absent', overtime: '-' },
  { key: '12', name: 'Neha Deshmukh', department: 'Engineering', checkIn: '09:50 AM', checkOut: '06:30 PM', workHours: '8h 40m', status: 'Late', overtime: '-' },
  { key: '13', name: 'Arjun Malhotra', department: 'Sales', checkIn: '09:08 AM', checkOut: '06:10 PM', workHours: '9h 02m', status: 'Present', overtime: '0h 02m' },
  { key: '14', name: 'Pooja Verma', department: 'Finance', checkIn: '-', checkOut: '-', workHours: '-', status: 'OnLeave', overtime: '-' },
];

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

const AttendanceList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [form] = Form.useForm();

  const filteredData = attendanceData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.department.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const presentCount = attendanceData.filter(a => a.status === 'Present').length;
  const absentCount = attendanceData.filter(a => a.status === 'Absent').length;
  const lateCount = attendanceData.filter(a => a.status === 'Late').length;
  const onLeaveCount = attendanceData.filter(a => a.status === 'OnLeave').length;

  const statsCards = [
    { title: 'Present Today', value: presentCount, icon: <CheckCircle2 size={20} />, color: '#059669' },
    { title: 'Absent', value: absentCount, icon: <XCircle size={20} />, color: '#dc2626' },
    { title: 'Late', value: lateCount, icon: <Clock3 size={20} />, color: '#d97706' },
    { title: 'On Leave', value: onLeaveCount, icon: <Palmtree size={20} />, color: '#2563eb' },
  ];

  const columns = [
    {
      title: 'Employee', dataIndex: 'name', key: 'name',
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
    { title: 'Work Hours', dataIndex: 'workHours', key: 'workHours', render: (h: string) => <Text strong>{h}</Text> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColorMap[status]}>{statusLabelMap[status]}</Tag>,
    },
    {
      title: 'Overtime', dataIndex: 'overtime', key: 'overtime',
      render: (ot: string) => ot !== '-' ? <Text style={{ color: '#059669' }}>{ot}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Actions', key: 'actions',
      render: () => (
        <Space>
          <Button type="text" size="small" icon={<Eye size={16} />} />
          <Button type="text" size="small" icon={<Edit2 size={16} />} />
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'All', label: `All (${attendanceData.length})` },
    { key: 'Present', label: `Present (${presentCount})` },
    { key: 'Absent', label: `Absent (${absentCount})` },
    { key: 'Late', label: `Late (${lateCount})` },
    { key: 'OnLeave', label: `On Leave (${onLeaveCount})` },
    { key: 'WFH', label: `WFH (${attendanceData.filter(a => a.status === 'WFH').length})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Attendance Management</Title>
          <Text type="secondary">Track and manage employee attendance</Text>
        </div>
        <Space>
          <DatePicker style={{ width: 200 }} />
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Mark Attendance
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
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

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search employees..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Department"
            allowClear
            style={{ width: 180 }}
            options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Finance', label: 'Finance' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
            ]}
          />
        </Space>
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} records` }}
        />
      </Card>

      <Modal
        title="Mark Attendance"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        onOk={() => { form.validateFields().then(() => { setIsModalOpen(false); form.resetFields(); }); }}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employee" label="Employee" rules={[{ required: true }]}>
            <Select
              placeholder="Select employee"
              showSearch
              optionFilterProp="label"
              options={attendanceData.map(e => ({ value: e.key, label: e.name }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select
                  placeholder="Select status"
                  options={[
                    { value: 'Present', label: 'Present' },
                    { value: 'Absent', label: 'Absent' },
                    { value: 'Late', label: 'Late' },
                    { value: 'HalfDay', label: 'Half Day' },
                    { value: 'OnLeave', label: 'On Leave' },
                    { value: 'WFH', label: 'Work From Home' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="checkIn" label="Check In Time">
                <TimePicker use12Hours format="h:mm A" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="checkOut" label="Check Out Time">
                <TimePicker use12Hours format="h:mm A" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceList;
