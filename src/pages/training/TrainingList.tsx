/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Input, Space, Tag, Typography, Drawer, Form,
  Select, Row, Col, Statistic, DatePicker, InputNumber, Progress,
  Avatar, Dropdown, message,
} from 'antd';
import {
  Plus, Search, BookOpen, Users, CheckCircle2, Calendar,
  MoreHorizontal, Eye, Edit2, UserPlus, MapPin, Clock,
  Monitor, Building2, Laptop,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type TrainingStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
type TrainingMode = 'Online' | 'Offline' | 'Hybrid';
type TrainingCategory = 'Technical' | 'Soft Skills' | 'Compliance' | 'Leadership' | 'Domain' | 'Safety';

interface TrainingProgram {
  key: string;
  title: string;
  description: string;
  category: TrainingCategory;
  trainer: string;
  trainerType: string;
  duration: string;
  mode: TrainingMode;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: TrainingStatus;
  location: string;
  cost: number;
}

const statusColors: Record<TrainingStatus, string> = {
  'Planned': 'blue',
  'In Progress': 'orange',
  'Completed': 'green',
  'Cancelled': 'red',
};

const modeColors: Record<TrainingMode, string> = {
  'Online': 'cyan',
  'Offline': 'purple',
  'Hybrid': 'gold',
};

const modeIcons: Record<TrainingMode, React.ReactNode> = {
  'Online': <Monitor size={12} />,
  'Offline': <Building2 size={12} />,
  'Hybrid': <Laptop size={12} />,
};

const categoryColors: Record<TrainingCategory, string> = {
  'Technical': 'blue',
  'Soft Skills': 'purple',
  'Compliance': 'red',
  'Leadership': 'gold',
  'Domain': 'cyan',
  'Safety': 'orange',
};

const programs: TrainingProgram[] = [
  {
    key: '1', title: 'React Advanced Workshop', description: 'Deep dive into advanced React patterns, performance optimization, and state management strategies including server components and concurrent features.',
    category: 'Technical', trainer: 'Rajesh Krishnan', trainerType: 'External', duration: '3 days',
    mode: 'Offline', startDate: '2026-04-15', endDate: '2026-04-17', maxParticipants: 30,
    currentParticipants: 24, status: 'Planned', location: 'Bangalore - Training Hall A', cost: 150000,
  },
  {
    key: '2', title: 'Leadership Skills for Managers', description: 'Comprehensive program on people management, strategic thinking, conflict resolution, and building high-performing teams.',
    category: 'Leadership', trainer: 'Dr. Meenakshi Iyer', trainerType: 'External', duration: '5 days',
    mode: 'Hybrid', startDate: '2026-04-10', endDate: '2026-04-14', maxParticipants: 25,
    currentParticipants: 25, status: 'In Progress', location: 'Mumbai - Conference Center', cost: 250000,
  },
  {
    key: '3', title: 'Workplace Safety & Compliance', description: 'Mandatory safety training covering fire safety, emergency procedures, first aid basics, and workplace hazard identification.',
    category: 'Safety', trainer: 'Sunil Patil', trainerType: 'Internal', duration: '1 day',
    mode: 'Offline', startDate: '2026-03-20', endDate: '2026-03-20', maxParticipants: 100,
    currentParticipants: 88, status: 'Completed', location: 'All Offices - Auditorium', cost: 25000,
  },
  {
    key: '4', title: 'AWS Cloud Practitioner Training', description: 'Prepare for AWS Cloud Practitioner certification with hands-on labs covering core AWS services, security, pricing, and architecture.',
    category: 'Technical', trainer: 'Deepak Bhatt', trainerType: 'External', duration: '4 days',
    mode: 'Online', startDate: '2026-05-01', endDate: '2026-05-04', maxParticipants: 50,
    currentParticipants: 32, status: 'Planned', location: 'Virtual - Zoom', cost: 200000,
  },
  {
    key: '5', title: 'Effective Communication Workshop', description: 'Enhance verbal and written communication, presentation skills, and cross-cultural communication in professional settings.',
    category: 'Soft Skills', trainer: 'Anjali Desai', trainerType: 'Internal', duration: '2 days',
    mode: 'Offline', startDate: '2026-03-10', endDate: '2026-03-11', maxParticipants: 40,
    currentParticipants: 38, status: 'Completed', location: 'Hyderabad - Training Room B', cost: 45000,
  },
  {
    key: '6', title: 'POSH Awareness Training', description: 'Prevention of Sexual Harassment at workplace. Mandatory compliance training covering legal framework, identification, and reporting mechanisms.',
    category: 'Compliance', trainer: 'Adv. Kavita Sharma', trainerType: 'External', duration: '1 day',
    mode: 'Online', startDate: '2026-04-22', endDate: '2026-04-22', maxParticipants: 200,
    currentParticipants: 145, status: 'Planned', location: 'Virtual - Microsoft Teams', cost: 75000,
  },
  {
    key: '7', title: 'Agile & Scrum Masterclass', description: 'Hands-on training on Agile methodologies, Scrum framework, sprint planning, and backlog management for development teams.',
    category: 'Domain', trainer: 'Vikas Malhotra', trainerType: 'External', duration: '2 days',
    mode: 'Hybrid', startDate: '2026-04-08', endDate: '2026-04-09', maxParticipants: 35,
    currentParticipants: 30, status: 'In Progress', location: 'Pune - Innovation Lab', cost: 120000,
  },
];

const TrainingList: React.FC = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [form] = Form.useForm();

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.trainer.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesMode = modeFilter === 'All' || p.mode === modeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMode;
  });

  const handleCreate = () => {
    form.validateFields().then(() => {
      message.success('Training program created successfully');
      setDrawerOpen(false);
      form.resetFields();
    }).catch(() => {});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Training & Development</Title>
          <Text type="secondary">Manage training programs and employee development</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>
          Create Program
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Active Programs', value: programs.filter(p => p.status === 'In Progress').length, icon: <BookOpen size={20} />, color: '#1a56db' },
          { title: 'Completed', value: programs.filter(p => p.status === 'Completed').length, icon: <CheckCircle2 size={20} />, color: '#059669' },
          { title: 'Total Participants', value: programs.reduce((s, p) => s + p.currentParticipants, 0), icon: <Users size={20} />, color: '#d97706' },
          { title: 'Upcoming', value: programs.filter(p => p.status === 'Planned').length, icon: <Calendar size={20} />, color: '#7c3aed' },
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

      {/* Filters */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Space wrap>
          <Input
            placeholder="Search programs..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 260 }}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            options={[
              { value: 'All', label: 'All Categories' },
              ...Object.keys(categoryColors).map(c => ({ value: c, label: c })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'All', label: 'All Statuses' },
              ...Object.keys(statusColors).map(s => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={modeFilter}
            onChange={setModeFilter}
            style={{ width: 130 }}
            options={[
              { value: 'All', label: 'All Modes' },
              { value: 'Online', label: 'Online' },
              { value: 'Offline', label: 'Offline' },
              { value: 'Hybrid', label: 'Hybrid' },
            ]}
          />
        </Space>
      </Card>

      {/* Program Cards Grid */}
      <Row gutter={[16, 16]}>
        {filteredPrograms.map(program => (
          <Col xs={24} sm={12} lg={8} key={program.key}>
            <Card
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}
              actions={[
                <Button type="link" icon={<Eye size={14} />} onClick={() => navigate(`/training/${program.key}`)}>View</Button>,
                <Button type="link" icon={<UserPlus size={14} />} onClick={() => message.success('Enrollment request sent')}>Enroll</Button>,
                <Dropdown menu={{ items: [
                  { key: 'edit', icon: <Edit2 size={14} />, label: 'Edit' },
                ]}} trigger={['click']}>
                  <Button type="text" icon={<MoreHorizontal size={16} />} />
                </Dropdown>,
              ]}
            >
              <div style={{ marginBottom: 12 }}>
                <Space style={{ marginBottom: 8 }}>
                  <Tag color={categoryColors[program.category]}>{program.category}</Tag>
                  <Tag color={statusColors[program.status]}>{program.status}</Tag>
                  <Tag color={modeColors[program.mode]} icon={modeIcons[program.mode]}>{program.mode}</Tag>
                </Space>
                <Title level={5} style={{ margin: 0, marginBottom: 4 }}>{program.title}</Title>
                <Text type="secondary" style={{ fontSize: 13 }} ellipsis={{ tooltip: program.description }}>
                  {program.description.length > 100 ? program.description.substring(0, 100) + '...' : program.description}
                </Text>
              </div>

              <Space direction="vertical" size={6} style={{ width: '100%', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{program.trainer[0]}</Avatar>
                  <Text style={{ fontSize: 13 }}>{program.trainer}</Text>
                  <Tag style={{ fontSize: 11 }}>{program.trainerType}</Tag>
                </div>
                <Space size={16}>
                  <Space size={4}>
                    <Clock size={13} style={{ color: '#6b7280' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{program.duration}</Text>
                  </Space>
                  <Space size={4}>
                    <Calendar size={13} style={{ color: '#6b7280' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{program.startDate}</Text>
                  </Space>
                </Space>
                <Space size={4}>
                  <MapPin size={13} style={{ color: '#6b7280' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>{program.location}</Text>
                </Space>
              </Space>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Enrollment</Text>
                  <Text style={{ fontSize: 12 }}>{program.currentParticipants}/{program.maxParticipants}</Text>
                </div>
                <Progress
                  percent={Math.round(program.currentParticipants / program.maxParticipants * 100)}
                  size="small"
                  strokeColor={program.currentParticipants >= program.maxParticipants ? '#059669' : '#1a56db'}
                  showInfo={false}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title="Create Training Program"
        width={720}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleCreate}>Create</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Program Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. React Advanced Workshop" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe the training program objectives and content" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={
                  Object.keys(categoryColors).map(c => ({ value: c, label: c }))
                } />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mode" label="Mode" rules={[{ required: true }]}>
                <Select placeholder="Select mode" options={[
                  { value: 'Online', label: 'Online' },
                  { value: 'Offline', label: 'Offline' },
                  { value: 'Hybrid', label: 'Hybrid' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trainer" label="Trainer Name" rules={[{ required: true }]}>
                <Input placeholder="Trainer's full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trainerType" label="Trainer Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" options={[
                  { value: 'Internal', label: 'Internal' },
                  { value: 'External', label: 'External' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
                <Input placeholder="e.g. 3 days, 8 hours" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Input placeholder="e.g. Bangalore - Training Hall A" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxParticipants" label="Max Participants" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cost" label="Total Cost (INR)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 150000" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default TrainingList;
