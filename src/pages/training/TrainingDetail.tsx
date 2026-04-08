/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Typography, Avatar, Space, Tag, Row, Col,
  Tabs, Modal, Select, Form, Descriptions, Progress, List, Badge,
  message,
} from 'antd';
import {
  ArrowLeft, UserPlus, User, Users, Calendar, Clock, MapPin,
  Monitor, DollarSign, BookOpen, Award, Download, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type ParticipantStatus = 'Enrolled' | 'Completed' | 'Dropped';

interface Participant {
  key: string;
  name: string;
  email: string;
  department: string;
  status: ParticipantStatus;
  enrolledDate: string;
  score: number | null;
  certificate: boolean;
  attendance: number;
}

const participantStatusColors: Record<ParticipantStatus, string> = {
  'Enrolled': 'blue',
  'Completed': 'green',
  'Dropped': 'red',
};

const participants: Participant[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 92, certificate: true, attendance: 100 },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', status: 'Completed', enrolledDate: '2026-03-18', score: 88, certificate: true, attendance: 95 },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', status: 'Enrolled', enrolledDate: '2026-03-20', score: null, certificate: false, attendance: 80 },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', status: 'Enrolled', enrolledDate: '2026-03-19', score: null, certificate: false, attendance: 90 },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', status: 'Dropped', enrolledDate: '2026-03-18', score: null, certificate: false, attendance: 30 },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 95, certificate: true, attendance: 100 },
  { key: '7', name: 'Deepak Joshi', email: 'deepak@company.com', department: 'Engineering', status: 'Enrolled', enrolledDate: '2026-03-21', score: null, certificate: false, attendance: 85 },
  { key: '8', name: 'Kavita Mishra', email: 'kavita@company.com', department: 'Marketing', status: 'Completed', enrolledDate: '2026-03-18', score: 78, certificate: true, attendance: 90 },
  { key: '9', name: 'Suresh Reddy', email: 'suresh@company.com', department: 'Engineering', status: 'Enrolled', enrolledDate: '2026-03-22', score: null, certificate: false, attendance: 75 },
  { key: '10', name: 'Lakshmi Prasad', email: 'lakshmi@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 85, certificate: true, attendance: 95 },
];

const materials = [
  { title: 'React Advanced Patterns - Slide Deck', type: 'PDF', size: '4.2 MB' },
  { title: 'State Management Comparison Guide', type: 'PDF', size: '1.8 MB' },
  { title: 'Performance Optimization Checklist', type: 'DOCX', size: '856 KB' },
  { title: 'Hands-on Lab Instructions', type: 'PDF', size: '2.1 MB' },
  { title: 'Code Repository Access Link', type: 'LINK', size: '-' },
  { title: 'Recording - Day 1 Session', type: 'MP4', size: '1.2 GB' },
  { title: 'Recording - Day 2 Session', type: 'MP4', size: '980 MB' },
];

const TrainingDetail: React.FC = () => {
  const navigate = useNavigate();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollForm] = Form.useForm();

  const handleEnroll = () => {
    enrollForm.validateFields().then(() => {
      message.success('Employee enrolled successfully');
      setEnrollModalOpen(false);
      enrollForm.resetFields();
    }).catch(() => {});
  };

  const participantColumns = [
    {
      title: 'Participant', dataIndex: 'name', key: 'name',
      render: (text: string, record: Participant) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    { title: 'Enrolled', dataIndex: 'enrolledDate', key: 'enrolledDate', render: (d: string) => <Text type="secondary" style={{ fontSize: 13 }}>{d}</Text> },
    {
      title: 'Attendance', dataIndex: 'attendance', key: 'attendance',
      render: (val: number) => <Progress percent={val} size="small" strokeColor={val >= 90 ? '#059669' : val >= 70 ? '#1a56db' : '#dc2626'} style={{ width: 100 }} />,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: ParticipantStatus) => <Tag color={participantStatusColors[s]}>{s}</Tag>,
    },
    {
      title: 'Score', dataIndex: 'score', key: 'score',
      render: (val: number | null) => val !== null ? (
        <Tag color={val >= 90 ? 'green' : val >= 75 ? 'blue' : val >= 60 ? 'gold' : 'red'}>{val}%</Tag>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: 'Certificate', dataIndex: 'certificate', key: 'certificate',
      render: (val: boolean) => val ? (
        <Button type="link" size="small" icon={<Download size={14} />}>Download</Button>
      ) : <Text type="secondary">-</Text>,
    },
  ];

  const overviewTab = (
    <div>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Title level={5}>Program Description</Title>
        <Text>
          Deep dive into advanced React patterns, performance optimization, and state management strategies
          including server components and concurrent features. This workshop covers:
        </Text>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li><Text>Advanced component patterns (Compound, Render Props, HOC)</Text></li>
          <li><Text>React Server Components and Streaming SSR</Text></li>
          <li><Text>State management with Zustand, Jotai, and React Query</Text></li>
          <li><Text>Performance profiling and optimization techniques</Text></li>
          <li><Text>Testing strategies for complex React applications</Text></li>
          <li><Text>Micro-frontend architecture patterns</Text></li>
        </ul>
        <div style={{ marginTop: 16 }}>
          <Text strong>Prerequisites: </Text>
          <Text>Minimum 2 years experience with React, familiarity with TypeScript, understanding of REST APIs.</Text>
        </div>
      </Card>

      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        title={<Space><FileText size={18} style={{ color: '#1a56db' }} /><span>Training Materials</span></Space>}
      >
        <List
          dataSource={materials}
          renderItem={(item) => (
            <List.Item
              actions={[
                item.type !== 'LINK' ? (
                  <Button type="link" icon={<Download size={14} />}>Download</Button>
                ) : (
                  <Button type="link" icon={<Monitor size={14} />}>Open</Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: item.type === 'PDF' ? '#dc262615' : item.type === 'DOCX' ? '#1a56db15' : item.type === 'MP4' ? '#7c3aed15' : '#05966915',
                    }}
                    icon={
                      <FileText
                        size={18}
                        style={{
                          color: item.type === 'PDF' ? '#dc2626' : item.type === 'DOCX' ? '#1a56db' : item.type === 'MP4' ? '#7c3aed' : '#059669',
                        }}
                      />
                    }
                  />
                }
                title={<Text>{item.title}</Text>}
                description={
                  <Space>
                    <Tag>{item.type}</Tag>
                    {item.size !== '-' && <Text type="secondary" style={{ fontSize: 12 }}>{item.size}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const participantsTab = (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Badge count={participants.filter(p => p.status === 'Enrolled').length} style={{ backgroundColor: '#1a56db' }}>
            <Tag>Enrolled</Tag>
          </Badge>
          <Badge count={participants.filter(p => p.status === 'Completed').length} style={{ backgroundColor: '#059669' }}>
            <Tag>Completed</Tag>
          </Badge>
          <Badge count={participants.filter(p => p.status === 'Dropped').length} style={{ backgroundColor: '#dc2626' }}>
            <Tag>Dropped</Tag>
          </Badge>
        </Space>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setEnrollModalOpen(true)}>
          Enroll Employee
        </Button>
      </div>
      <Table
        dataSource={participants}
        columns={participantColumns}
        pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} participants` }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space align="center">
          <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/training')} />
          <div>
            <Space>
              <Title level={3} style={{ margin: 0 }}>React Advanced Workshop</Title>
              <Tag color="blue">Technical</Tag>
              <Tag color="blue">Planned</Tag>
              <Tag color="purple">Offline</Tag>
            </Space>
            <br />
            <Text type="secondary" style={{ marginLeft: 0 }}>3-day intensive hands-on workshop</Text>
          </div>
        </Space>
        <Space>
          <Button icon={<Award size={16} />}>Issue Certificates</Button>
          <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setEnrollModalOpen(true)}>
            Enroll Employee
          </Button>
        </Space>
      </div>

      {/* Info Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Trainer', value: 'Rajesh Krishnan', sub: 'External Trainer', icon: <User size={18} />, color: '#1a56db' },
          { label: 'Duration', value: '3 Days', sub: 'Apr 15 - Apr 17, 2026', icon: <Clock size={18} />, color: '#d97706' },
          { label: 'Location', value: 'Bangalore', sub: 'Training Hall A', icon: <MapPin size={18} />, color: '#059669' },
          { label: 'Participants', value: '24 / 30', sub: '80% enrolled', icon: <Users size={18} />, color: '#7c3aed' },
          { label: 'Cost', value: '1,50,000', sub: 'Total budget', icon: <DollarSign size={18} />, color: '#dc2626' },
          { label: 'Avg. Score', value: '87.6%', sub: 'Completed only', icon: <Award size={18} />, color: '#0891b2' },
        ].map((item, index) => (
          <Col xs={24} sm={12} lg={4} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '16px' } }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.color, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.label}</Text>
                  <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{item.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{item.sub}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> Overview</span>,
              children: overviewTab,
            },
            {
              key: 'participants',
              label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Users size={16} /> Participants ({participants.length})</span>,
              children: participantsTab,
            },
          ]}
        />
      </Card>

      <Modal
        title="Enroll Employee"
        open={enrollModalOpen}
        onCancel={() => setEnrollModalOpen(false)}
        onOk={handleEnroll}
        width={480}
      >
        <Form form={enrollForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employees" label="Select Employees" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="Search and select employees"
              options={[
                { value: 'rohit', label: 'Rohit Jain - Engineering' },
                { value: 'neha', label: 'Neha Kulkarni - Engineering' },
                { value: 'arun', label: 'Arun Kumar - Engineering' },
                { value: 'meera', label: 'Meera Nair - Marketing' },
                { value: 'karthik', label: 'Karthik Menon - Sales' },
                { value: 'divya', label: 'Divya Sharma - Finance' },
                { value: 'pooja', label: 'Pooja Iyer - Design' },
              ]}
              filterOption={(input, option) =>
                (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea rows={2} placeholder="Any special requirements or notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingDetail;
