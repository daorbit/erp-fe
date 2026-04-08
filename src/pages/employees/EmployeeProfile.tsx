/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Space, Tag, Avatar, Typography, Row, Col, Badge, Tabs,
  Descriptions, Table, Statistic, Timeline, Breadcrumb, Dropdown, message,
} from 'antd';
import {
  Edit2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  FileText,
  Clock,
  Gift,
  Monitor,
  ArrowLeft,
  UserX,
  Download,
  Building2,
  CreditCard,
  Heart,
  Activity,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const mockEmployee = {
  key: '1',
  employeeId: 'EMP001',
  firstName: 'Rahul',
  lastName: 'Sharma',
  email: 'rahul.sharma@company.com',
  phone: '+91 9876543210',
  dateOfBirth: '1994-06-15',
  gender: 'Male',
  maritalStatus: 'Married',
  bloodGroup: 'B+',
  address: '42, MG Road, Indiranagar',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560038',
  department: 'Engineering',
  designation: 'Senior Developer',
  reportingManager: 'Ananya Reddy',
  joinDate: '2023-01-15',
  employmentType: 'Full-time',
  status: 'Active',
  workShift: 'General (9 AM - 6 PM)',
  bankName: 'HDFC Bank',
  bankAccountNo: '****4567',
  ifscCode: 'HDFC0001234',
  panNumber: 'ABCPS1234K',
  aadharNumber: '****-****-5678',
  emergencyContactName: 'Sunita Sharma',
  emergencyContactPhone: '+91 9876549999',
  emergencyContactRelation: 'Spouse',
};

const mockLeaves = [
  { key: '1', type: 'Casual Leave', from: '2025-12-20', to: '2025-12-22', days: 3, status: 'Approved', reason: 'Family function' },
  { key: '2', type: 'Sick Leave', from: '2025-11-05', to: '2025-11-05', days: 1, status: 'Approved', reason: 'Fever' },
  { key: '3', type: 'Earned Leave', from: '2026-01-10', to: '2026-01-15', days: 6, status: 'Pending', reason: 'Vacation' },
  { key: '4', type: 'Casual Leave', from: '2026-03-25', to: '2026-03-26', days: 2, status: 'Rejected', reason: 'Personal work' },
];

const mockPayslips = [
  { key: '1', month: 'March 2026', grossSalary: '₹85,000', deductions: '₹12,400', netSalary: '₹72,600', status: 'Paid' },
  { key: '2', month: 'February 2026', grossSalary: '₹85,000', deductions: '₹12,400', netSalary: '₹72,600', status: 'Paid' },
  { key: '3', month: 'January 2026', grossSalary: '₹85,000', deductions: '₹12,400', netSalary: '₹72,600', status: 'Paid' },
  { key: '4', month: 'December 2025', grossSalary: '₹85,000', deductions: '₹12,400', netSalary: '₹72,600', status: 'Paid' },
];

const mockAssets = [
  { key: '1', asset: 'MacBook Pro 14"', assetId: 'AST-001', category: 'Laptop', assignedDate: '2023-01-20', condition: 'Good' },
  { key: '2', asset: 'Dell Monitor 27"', assetId: 'AST-045', category: 'Monitor', assignedDate: '2023-01-20', condition: 'Good' },
  { key: '3', asset: 'iPhone 15', assetId: 'AST-112', category: 'Mobile', assignedDate: '2024-06-10', condition: 'Good' },
  { key: '4', asset: 'Access Card', assetId: 'AST-500', category: 'ID Card', assignedDate: '2023-01-15', condition: 'Active' },
];

const mockDocuments = [
  { key: '1', name: 'Aadhaar Card', type: 'ID Proof', uploadedOn: '2023-01-16', status: 'Verified' },
  { key: '2', name: 'PAN Card', type: 'Tax Document', uploadedOn: '2023-01-16', status: 'Verified' },
  { key: '3', name: 'Degree Certificate', type: 'Education', uploadedOn: '2023-01-17', status: 'Verified' },
  { key: '4', name: 'Offer Letter', type: 'Employment', uploadedOn: '2023-01-15', status: 'Verified' },
  { key: '5', name: 'Passport', type: 'ID Proof', uploadedOn: '2023-02-10', status: 'Pending' },
];

const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const emp = mockEmployee;

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} /> Overview
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title="Personal Information"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Date of Birth">{emp.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Gender">{emp.gender}</Descriptions.Item>
                <Descriptions.Item label="Marital Status">{emp.maritalStatus}</Descriptions.Item>
                <Descriptions.Item label="Blood Group">{emp.bloodGroup}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Contact Information"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">{emp.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{emp.phone}</Descriptions.Item>
                <Descriptions.Item label="Address">{emp.address}</Descriptions.Item>
                <Descriptions.Item label="City">{emp.city}, {emp.state} - {emp.pincode}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24}>
            <Card
              title="Emergency Contact"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Descriptions column={3} size="small">
                <Descriptions.Item label="Name">{emp.emergencyContactName}</Descriptions.Item>
                <Descriptions.Item label="Phone">{emp.emergencyContactPhone}</Descriptions.Item>
                <Descriptions.Item label="Relation">{emp.emergencyContactRelation}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'employment',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} /> Employment
        </span>
      ),
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Employee ID">{emp.employeeId}</Descriptions.Item>
            <Descriptions.Item label="Join Date">{emp.joinDate}</Descriptions.Item>
            <Descriptions.Item label="Department"><Tag color="blue">{emp.department}</Tag></Descriptions.Item>
            <Descriptions.Item label="Designation">{emp.designation}</Descriptions.Item>
            <Descriptions.Item label="Reporting Manager">{emp.reportingManager}</Descriptions.Item>
            <Descriptions.Item label="Employment Type"><Tag color="geekblue">{emp.employmentType}</Tag></Descriptions.Item>
            <Descriptions.Item label="Work Shift">{emp.workShift}</Descriptions.Item>
            <Descriptions.Item label="Status"><Badge status="success" text={emp.status} /></Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'bank-docs',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={14} /> Bank & Documents
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title="Bank Details"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Bank Name">{emp.bankName}</Descriptions.Item>
                <Descriptions.Item label="Account No">{emp.bankAccountNo}</Descriptions.Item>
                <Descriptions.Item label="IFSC Code">{emp.ifscCode}</Descriptions.Item>
                <Descriptions.Item label="PAN Number">{emp.panNumber}</Descriptions.Item>
                <Descriptions.Item label="Aadhaar">{emp.aadharNumber}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Documents"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Table
                dataSource={mockDocuments}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Document', dataIndex: 'name', key: 'name' },
                  { title: 'Type', dataIndex: 'type', key: 'type' },
                  {
                    title: 'Status', dataIndex: 'status', key: 'status',
                    render: (s: string) => <Tag color={s === 'Verified' ? 'green' : 'orange'}>{s}</Tag>,
                  },
                  {
                    title: '', key: 'action',
                    render: () => <Button type="link" size="small" icon={<Download size={14} />} />,
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'attendance',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} /> Attendance
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Present Days" value={22} suffix="/ 23" valueStyle={{ color: '#059669' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Absent Days" value={1} valueStyle={{ color: '#dc2626' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Attendance %" value={95.7} suffix="%" valueStyle={{ color: '#1a56db' }} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card
              title="March 2026 - Attendance Log"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Table
                dataSource={[
                  { key: '1', date: '2026-03-01', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'Present' },
                  { key: '2', date: '2026-03-02', checkIn: '08:55 AM', checkOut: '06:30 PM', hours: '9h 35m', status: 'Present' },
                  { key: '3', date: '2026-03-03', checkIn: '09:10 AM', checkOut: '06:05 PM', hours: '8h 55m', status: 'Present' },
                  { key: '4', date: '2026-03-04', checkIn: '-', checkOut: '-', hours: '-', status: 'Absent' },
                  { key: '5', date: '2026-03-05', checkIn: '09:00 AM', checkOut: '06:20 PM', hours: '9h 20m', status: 'Present' },
                  { key: '6', date: '2026-03-06', checkIn: '-', checkOut: '-', hours: '-', status: 'Weekend' },
                  { key: '7', date: '2026-03-07', checkIn: '-', checkOut: '-', hours: '-', status: 'Weekend' },
                ]}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Date', dataIndex: 'date', key: 'date' },
                  { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
                  { title: 'Check Out', dataIndex: 'checkOut', key: 'checkOut' },
                  { title: 'Working Hours', dataIndex: 'hours', key: 'hours' },
                  {
                    title: 'Status', dataIndex: 'status', key: 'status',
                    render: (s: string) => {
                      const colorMap: Record<string, string> = { Present: 'green', Absent: 'red', Weekend: 'default', Holiday: 'blue' };
                      return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
                    },
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'leaves',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} /> Leaves
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Casual Leave" value={4} suffix="/ 12" valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Sick Leave" value={2} suffix="/ 8" valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Earned Leave" value={6} suffix="/ 15" valueStyle={{ fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Statistic title="Total Available" value={23} valueStyle={{ fontSize: 24, color: '#059669' }} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card
              title="Recent Leave Requests"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Table
                dataSource={mockLeaves}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Leave Type', dataIndex: 'type', key: 'type' },
                  { title: 'From', dataIndex: 'from', key: 'from' },
                  { title: 'To', dataIndex: 'to', key: 'to' },
                  { title: 'Days', dataIndex: 'days', key: 'days' },
                  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
                  {
                    title: 'Status', dataIndex: 'status', key: 'status',
                    render: (s: string) => {
                      const colorMap: Record<string, string> = { Approved: 'green', Pending: 'orange', Rejected: 'red' };
                      return <Tag color={colorMap[s]}>{s}</Tag>;
                    },
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'payslips',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={14} /> Payslips
        </span>
      ),
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Table
            dataSource={mockPayslips}
            pagination={false}
            columns={[
              { title: 'Month', dataIndex: 'month', key: 'month' },
              { title: 'Gross Salary', dataIndex: 'grossSalary', key: 'grossSalary' },
              { title: 'Deductions', dataIndex: 'deductions', key: 'deductions' },
              { title: 'Net Salary', dataIndex: 'netSalary', key: 'netSalary', render: (v: string) => <Text strong>{v}</Text> },
              {
                title: 'Status', dataIndex: 'status', key: 'status',
                render: (s: string) => <Tag color="green">{s}</Tag>,
              },
              {
                title: '', key: 'action',
                render: () => <Button type="link" size="small" icon={<Download size={14} />}>Download</Button>,
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: 'assets',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Monitor size={14} /> Assets
        </span>
      ),
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Table
            dataSource={mockAssets}
            pagination={false}
            columns={[
              { title: 'Asset', dataIndex: 'asset', key: 'asset', render: (t: string) => <Text strong>{t}</Text> },
              { title: 'Asset ID', dataIndex: 'assetId', key: 'assetId', render: (t: string) => <Text type="secondary">{t}</Text> },
              { title: 'Category', dataIndex: 'category', key: 'category', render: (c: string) => <Tag>{c}</Tag> },
              { title: 'Assigned Date', dataIndex: 'assignedDate', key: 'assignedDate' },
              {
                title: 'Condition', dataIndex: 'condition', key: 'condition',
                render: (c: string) => <Tag color={c === 'Good' ? 'green' : c === 'Active' ? 'blue' : 'orange'}>{c}</Tag>,
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: 'timeline',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Activity size={14} /> Timeline
        </span>
      ),
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Timeline
            items={[
              { color: 'blue', children: <div><Text strong>Leave Request Submitted</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Earned Leave: Jan 10 - Jan 15, 2026</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>2 days ago</Text></div> },
              { color: 'green', children: <div><Text strong>Payslip Generated</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>March 2026 salary processed</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>5 days ago</Text></div> },
              { color: 'orange', children: <div><Text strong>Asset Assigned</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>iPhone 15 (AST-112) assigned</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Jun 10, 2024</Text></div> },
              { color: 'green', children: <div><Text strong>Promotion</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Promoted to Senior Developer</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Apr 1, 2024</Text></div> },
              { color: 'blue', children: <div><Text strong>KYC Completed</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>All documents verified</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Jan 20, 2023</Text></div> },
              { color: 'green', children: <div><Text strong>Joined Company</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>Onboarding completed for Engineering department</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>Jan 15, 2023</Text></div> },
            ]}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/employees')}>Employees</a> },
          { title: `${emp.firstName} ${emp.lastName}` },
        ]}
      />

      {/* Profile Header */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space size={20}>
            <Avatar size={80} style={{ backgroundColor: '#1a56db', fontSize: 32 }}>
              {emp.firstName[0]}
            </Avatar>
            <div>
              <Space align="center" size={12}>
                <Title level={3} style={{ margin: 0 }}>{emp.firstName} {emp.lastName}</Title>
                <Badge status="success" text={<Tag color="green">{emp.status}</Tag>} />
              </Space>
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {emp.designation} - {emp.department}
              </Text>
              <Space style={{ marginTop: 8 }} size={16}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Mail size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{emp.email}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Phone size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{emp.phone}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <Shield size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />{emp.employeeId}
                </Text>
              </Space>
            </div>
          </Space>
          <Space>
            <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/employees')}>Back</Button>
            <Button type="primary" icon={<Edit2 size={16} />}>Edit</Button>
            <Dropdown menu={{ items: [
              { key: 'deactivate', icon: <UserX size={16} />, label: 'Deactivate', danger: true, onClick: () => message.info('Deactivate action (mock)') },
            ]}} trigger={['click']}>
              <Button icon={<MoreHorizontal size={16} />} />
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* Tabs Content */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs items={tabItems} defaultActiveKey="overview" />
      </Card>
    </div>
  );
};

export default EmployeeProfile;
