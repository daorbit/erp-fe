/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Typography, Drawer, Avatar,
  Row, Col, Select, Rate, Descriptions, Divider, DatePicker, TimePicker,
  Form, message, Steps,
} from 'antd';
import {
  Search, ArrowLeft, Eye, Phone, Mail, Calendar, Star,
  ChevronRight, UserCheck, UserX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type AppStatus = 'Applied' | 'Screening' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'Offered' | 'Hired';

interface Application {
  key: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  currentSalary: number;
  expectedSalary: number;
  skills: string[];
  status: AppStatus;
  rating: number;
  appliedDate: string;
  currentCompany: string;
  noticePeriod: string;
  resumeUrl: string;
  position: string;
}

const statusColors: Record<AppStatus, string> = {
  'Applied': 'blue',
  'Screening': 'cyan',
  'Shortlisted': 'gold',
  'Interview Scheduled': 'orange',
  'Selected': 'green',
  'Rejected': 'red',
  'Offered': 'purple',
  'Hired': 'lime',
};

const statusStepMap: Record<AppStatus, number> = {
  'Applied': 0,
  'Screening': 1,
  'Shortlisted': 2,
  'Interview Scheduled': 3,
  'Selected': 4,
  'Offered': 5,
  'Hired': 6,
};

const applications: Application[] = [
  { key: '1', name: 'Arun Kumar', email: 'arun.kumar@gmail.com', phone: '+91 9876543210', experience: 5, currentSalary: 1400000, expectedSalary: 2000000, skills: ['React', 'TypeScript', 'Node.js'], status: 'Interview Scheduled', rating: 4, appliedDate: '2026-03-22', currentCompany: 'Infosys', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '2', name: 'Meera Nair', email: 'meera.nair@outlook.com', phone: '+91 9876543211', experience: 6, currentSalary: 1800000, expectedSalary: 2400000, skills: ['React', 'Next.js', 'GraphQL'], status: 'Shortlisted', rating: 5, appliedDate: '2026-03-21', currentCompany: 'Wipro', noticePeriod: '90 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '3', name: 'Rajesh Verma', email: 'rajesh.v@yahoo.com', phone: '+91 9876543212', experience: 3, currentSalary: 900000, expectedSalary: 1500000, skills: ['React', 'JavaScript', 'CSS'], status: 'Applied', rating: 3, appliedDate: '2026-03-25', currentCompany: 'TCS', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '4', name: 'Divya Sharma', email: 'divya.s@gmail.com', phone: '+91 9876543213', experience: 7, currentSalary: 2000000, expectedSalary: 2800000, skills: ['React', 'Redux', 'AWS', 'Docker'], status: 'Selected', rating: 5, appliedDate: '2026-03-18', currentCompany: 'Flipkart', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '5', name: 'Suresh Reddy', email: 'suresh.r@gmail.com', phone: '+91 9876543214', experience: 4, currentSalary: 1200000, expectedSalary: 1800000, skills: ['React', 'Angular', 'TypeScript'], status: 'Screening', rating: 3, appliedDate: '2026-03-24', currentCompany: 'HCL Technologies', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '6', name: 'Pooja Iyer', email: 'pooja.i@hotmail.com', phone: '+91 9876543215', experience: 2, currentSalary: 700000, expectedSalary: 1200000, skills: ['React', 'Vue.js', 'Tailwind'], status: 'Rejected', rating: 2, appliedDate: '2026-03-20', currentCompany: 'Zoho', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '7', name: 'Karthik Menon', email: 'karthik.m@gmail.com', phone: '+91 9876543216', experience: 8, currentSalary: 2500000, expectedSalary: 3200000, skills: ['React', 'System Design', 'Microservices'], status: 'Offered', rating: 5, appliedDate: '2026-03-15', currentCompany: 'Amazon', noticePeriod: '90 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '8', name: 'Anita Deshmukh', email: 'anita.d@gmail.com', phone: '+91 9876543217', experience: 5, currentSalary: 1600000, expectedSalary: 2200000, skills: ['React', 'Python', 'REST APIs'], status: 'Hired', rating: 4, appliedDate: '2026-03-10', currentCompany: 'Capgemini', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '9', name: 'Vikram Singh', email: 'vikram.s@gmail.com', phone: '+91 9876543218', experience: 4, currentSalary: 1100000, expectedSalary: 1700000, skills: ['React', 'MongoDB', 'Express'], status: 'Applied', rating: 3, appliedDate: '2026-03-26', currentCompany: 'Tech Mahindra', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '10', name: 'Lakshmi Prasad', email: 'lakshmi.p@gmail.com', phone: '+91 9876543219', experience: 6, currentSalary: 1900000, expectedSalary: 2500000, skills: ['React', 'Next.js', 'PostgreSQL'], status: 'Interview Scheduled', rating: 4, appliedDate: '2026-03-19', currentCompany: 'Mindtree', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '11', name: 'Rohit Jain', email: 'rohit.j@gmail.com', phone: '+91 9876543220', experience: 3, currentSalary: 800000, expectedSalary: 1400000, skills: ['React', 'Firebase', 'Material UI'], status: 'Screening', rating: 3, appliedDate: '2026-03-23', currentCompany: 'Freshworks', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '12', name: 'Neha Kulkarni', email: 'neha.k@gmail.com', phone: '+91 9876543221', experience: 5, currentSalary: 1500000, expectedSalary: 2100000, skills: ['React', 'Storybook', 'Jest', 'Cypress'], status: 'Shortlisted', rating: 4, appliedDate: '2026-03-17', currentCompany: 'Thoughtworks', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
];

const formatSalary = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  return `${(val / 1000).toFixed(0)}K`;
};

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [scheduleForm] = Form.useForm();

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchText.toLowerCase()) ||
      app.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pipelineCounts: Record<string, number> = {
    Applied: applications.filter(a => a.status === 'Applied').length,
    Screening: applications.filter(a => a.status === 'Screening').length,
    Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    'Interview Scheduled': applications.filter(a => a.status === 'Interview Scheduled').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Offered: applications.filter(a => a.status === 'Offered').length,
    Hired: applications.filter(a => a.status === 'Hired').length,
  };

  const columns = [
    {
      title: 'Candidate', dataIndex: 'name', key: 'name',
      render: (text: string, record: Application) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.currentCompany}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact', key: 'contact',
      render: (_: any, record: Application) => (
        <div>
          <Space size={4}><Mail size={12} style={{ color: '#6b7280' }} /><Text style={{ fontSize: 12 }}>{record.email}</Text></Space>
          <br />
          <Space size={4}><Phone size={12} style={{ color: '#6b7280' }} /><Text style={{ fontSize: 12 }}>{record.phone}</Text></Space>
        </div>
      ),
    },
    { title: 'Exp (yrs)', dataIndex: 'experience', key: 'experience', width: 90 },
    {
      title: 'Expected CTC', key: 'salary',
      render: (_: any, record: Application) => <Text>{formatSalary(record.expectedSalary)}</Text>,
    },
    {
      title: 'Skills', dataIndex: 'skills', key: 'skills',
      render: (skills: string[]) => (
        <Space size={[4, 4]} wrap>
          {skills.slice(0, 3).map(s => <Tag key={s} style={{ fontSize: 11 }}>{s}</Tag>)}
          {skills.length > 3 && <Tag>+{skills.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: AppStatus) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Rating', dataIndex: 'rating', key: 'rating',
      render: (val: number) => <Rate disabled defaultValue={val} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Applied', dataIndex: 'appliedDate', key: 'appliedDate',
      render: (d: string) => <Text type="secondary" style={{ fontSize: 13 }}>{d}</Text>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Application) => (
        <Button type="link" icon={<Eye size={14} />} onClick={() => { setSelectedApp(record); setDrawerOpen(true); }}>
          View
        </Button>
      ),
    },
  ];

  const handleStatusChange = (newStatus: AppStatus) => {
    if (selectedApp) {
      message.success(`${selectedApp.name} moved to "${newStatus}"`);
      setDrawerOpen(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/recruitment')} />
            <Title level={3} style={{ margin: 0 }}>Applications</Title>
          </Space>
          <Text type="secondary" style={{ marginLeft: 40 }}>Senior React Developer - 42 Applications</Text>
        </div>
      </div>

      {/* Pipeline summary */}
      <Row gutter={[8, 8]} style={{ marginBottom: 24 }}>
        {Object.entries(pipelineCounts).map(([status, count], index) => (
          <Col key={status} flex="1">
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                textAlign: 'center',
                cursor: 'pointer',
                borderBottom: `3px solid ${statusColors[status as AppStatus] === 'default' ? '#d1d5db' : ''}`,
              }}
              styles={{ body: { padding: '12px 8px' } }}
              onClick={() => setStatusFilter(status === statusFilter ? 'All' : status)}
            >
              <Tag color={statusColors[status as AppStatus]} style={{ marginBottom: 4 }}>{status}</Tag>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
              {index < Object.keys(pipelineCounts).length - 1 && (
                <ChevronRight size={14} style={{ position: 'absolute', right: -11, top: '50%', transform: 'translateY(-50%)', color: '#d1d5db' }} />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search candidates..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            options={[
              { value: 'All', label: 'All Statuses' },
              ...Object.keys(statusColors).map(s => ({ value: s, label: s })),
            ]}
          />
        </Space>
        <Table
          dataSource={filteredApps}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} applications` }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => { setSelectedApp(record); setDrawerOpen(true); },
          })}
        />
      </Card>

      {/* Application Detail Drawer */}
      <Drawer
        title="Application Details"
        width={640}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedApp(null); }}
      >
        {selectedApp && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <Avatar size={64} style={{ backgroundColor: '#1a56db', fontSize: 24 }}>{selectedApp.name[0]}</Avatar>
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedApp.name}</Title>
                <Text type="secondary">{selectedApp.currentCompany} | {selectedApp.experience} years experience</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusColors[selectedApp.status]}>{selectedApp.status}</Tag>
                  <Rate disabled defaultValue={selectedApp.rating} style={{ fontSize: 14, marginLeft: 8 }} />
                </div>
              </div>
            </div>

            <Steps
              current={statusStepMap[selectedApp.status]}
              size="small"
              style={{ marginBottom: 24 }}
              items={[
                { title: 'Applied' },
                { title: 'Screening' },
                { title: 'Shortlisted' },
                { title: 'Interview' },
                { title: 'Selected' },
                { title: 'Offered' },
                { title: 'Hired' },
              ]}
            />

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Email">{selectedApp.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedApp.phone}</Descriptions.Item>
              <Descriptions.Item label="Current Salary">{formatSalary(selectedApp.currentSalary)} / year</Descriptions.Item>
              <Descriptions.Item label="Expected Salary">{formatSalary(selectedApp.expectedSalary)} / year</Descriptions.Item>
              <Descriptions.Item label="Notice Period">{selectedApp.noticePeriod}</Descriptions.Item>
              <Descriptions.Item label="Applied Date">{selectedApp.appliedDate}</Descriptions.Item>
              <Descriptions.Item label="Applied For" span={2}>{selectedApp.position}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <Text strong>Skills</Text>
              <div style={{ marginTop: 8 }}>
                {selectedApp.skills.map(s => <Tag key={s} color="blue" style={{ marginBottom: 4 }}>{s}</Tag>)}
              </div>
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Update Status</Title>
              <Space wrap>
                {selectedApp.status !== 'Rejected' && (
                  <Button icon={<UserX size={14} />} danger onClick={() => handleStatusChange('Rejected')}>Reject</Button>
                )}
                {selectedApp.status === 'Applied' && (
                  <Button type="primary" onClick={() => handleStatusChange('Screening')}>Move to Screening</Button>
                )}
                {selectedApp.status === 'Screening' && (
                  <Button type="primary" onClick={() => handleStatusChange('Shortlisted')}>Shortlist</Button>
                )}
                {selectedApp.status === 'Shortlisted' && (
                  <Button type="primary" icon={<Calendar size={14} />} onClick={() => handleStatusChange('Interview Scheduled')}>Schedule Interview</Button>
                )}
                {selectedApp.status === 'Interview Scheduled' && (
                  <>
                    <Button type="primary" icon={<UserCheck size={14} />} onClick={() => handleStatusChange('Selected')}>Select</Button>
                  </>
                )}
                {selectedApp.status === 'Selected' && (
                  <Button type="primary" onClick={() => handleStatusChange('Offered')}>Send Offer</Button>
                )}
                {selectedApp.status === 'Offered' && (
                  <Button type="primary" style={{ backgroundColor: '#65a30d' }} onClick={() => handleStatusChange('Hired')}>Mark as Hired</Button>
                )}
              </Space>
            </div>

            {selectedApp.status === 'Shortlisted' && (
              <>
                <Divider />
                <Title level={5}>Schedule Interview</Title>
                <Form form={scheduleForm} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="interviewDate" label="Date">
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="interviewTime" label="Time">
                        <TimePicker style={{ width: '100%' }} format="HH:mm" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="interviewer" label="Interviewer">
                    <Select placeholder="Select interviewer" options={[
                      { value: 'ananya', label: 'Ananya Reddy - Engineering Manager' },
                      { value: 'sneha', label: 'Sneha Gupta - HR Lead' },
                      { value: 'vikram', label: 'Vikram Joshi - Tech Lead' },
                    ]} />
                  </Form.Item>
                  <Form.Item name="interviewType" label="Interview Type">
                    <Select placeholder="Select type" options={[
                      { value: 'phone', label: 'Phone Screening' },
                      { value: 'technical', label: 'Technical Round' },
                      { value: 'hr', label: 'HR Round' },
                      { value: 'managerial', label: 'Managerial Round' },
                    ]} />
                  </Form.Item>
                  <Button type="primary" icon={<Calendar size={14} />} onClick={() => {
                    scheduleForm.validateFields().then(() => {
                      message.success('Interview scheduled successfully');
                      handleStatusChange('Interview Scheduled');
                    }).catch(() => {});
                  }}>
                    Confirm Schedule
                  </Button>
                </Form>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Applications;
