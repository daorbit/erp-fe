/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Typography, Drawer, Form,
  Select, Row, Col, Statistic, Tabs, DatePicker, InputNumber, Dropdown,
  Badge, message,
} from 'antd';
import {
  Plus, Search, Briefcase, Users, CalendarCheck, UserCheck,
  MoreHorizontal, Edit2, Eye, XCircle, MapPin, Clock,
} from 'lucide-react';

const { Title, Text } = Typography;

type JobStatus = 'Draft' | 'Open' | 'On Hold' | 'Closed' | 'Filled';

interface JobPosting {
  key: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  applications: number;
  vacancies: number;
  status: JobStatus;
  deadline: string;
  skills: string[];
  postedDate: string;
}

const jobPostings: JobPosting[] = [
  { key: '1', title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 4, experienceMax: 8, salaryMin: 1500000, salaryMax: 2500000, applications: 42, vacancies: 3, status: 'Open', deadline: '2026-05-15', skills: ['React', 'TypeScript', 'Node.js'], postedDate: '2026-03-20' },
  { key: '2', title: 'DevOps Engineer', department: 'Engineering', location: 'Hyderabad', employmentType: 'Full-time', experienceMin: 3, experienceMax: 6, salaryMin: 1200000, salaryMax: 2000000, applications: 28, vacancies: 2, status: 'Open', deadline: '2026-05-10', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], postedDate: '2026-03-18' },
  { key: '3', title: 'Marketing Manager', department: 'Marketing', location: 'Mumbai', employmentType: 'Full-time', experienceMin: 5, experienceMax: 10, salaryMin: 1800000, salaryMax: 3000000, applications: 15, vacancies: 1, status: 'Open', deadline: '2026-04-30', skills: ['Digital Marketing', 'SEO', 'Content Strategy'], postedDate: '2026-03-15' },
  { key: '4', title: 'Data Analyst Intern', department: 'Analytics', location: 'Pune', employmentType: 'Internship', experienceMin: 0, experienceMax: 1, salaryMin: 300000, salaryMax: 500000, applications: 65, vacancies: 5, status: 'Open', deadline: '2026-04-25', skills: ['Python', 'SQL', 'Excel', 'Power BI'], postedDate: '2026-03-10' },
  { key: '5', title: 'HR Business Partner', department: 'HR', location: 'Delhi NCR', employmentType: 'Full-time', experienceMin: 6, experienceMax: 12, salaryMin: 2000000, salaryMax: 3500000, applications: 8, vacancies: 1, status: 'On Hold', deadline: '2026-05-20', skills: ['HRBP', 'Employee Relations', 'Talent Management'], postedDate: '2026-03-05' },
  { key: '6', title: 'UI/UX Designer', department: 'Design', location: 'Bangalore', employmentType: 'Contract', experienceMin: 2, experienceMax: 5, salaryMin: 900000, salaryMax: 1600000, applications: 34, vacancies: 2, status: 'Closed', deadline: '2026-03-30', skills: ['Figma', 'Adobe XD', 'Prototyping'], postedDate: '2026-02-20' },
  { key: '7', title: 'Finance Controller', department: 'Finance', location: 'Mumbai', employmentType: 'Full-time', experienceMin: 8, experienceMax: 15, salaryMin: 3000000, salaryMax: 5000000, applications: 5, vacancies: 1, status: 'Filled', deadline: '2026-03-15', skills: ['CA', 'Financial Planning', 'Compliance'], postedDate: '2026-01-25' },
  { key: '8', title: 'Sales Executive', department: 'Sales', location: 'Chennai', employmentType: 'Full-time', experienceMin: 1, experienceMax: 4, salaryMin: 600000, salaryMax: 1000000, applications: 0, vacancies: 4, status: 'Draft', deadline: '2026-05-30', skills: ['B2B Sales', 'CRM', 'Negotiation'], postedDate: '2026-04-05' },
];

const statusColors: Record<JobStatus, string> = {
  Draft: 'default',
  Open: 'green',
  'On Hold': 'orange',
  Closed: 'red',
  Filled: 'blue',
};

const employmentTypeColors: Record<string, string> = {
  'Full-time': 'blue',
  'Part-time': 'cyan',
  Contract: 'purple',
  Internship: 'gold',
};

const formatSalary = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  return `${(val / 1000).toFixed(0)}K`;
};

const JobPostings: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [form] = Form.useForm();

  const filteredPostings = jobPostings.filter(jp => {
    const matchesSearch = jp.title.toLowerCase().includes(searchText.toLowerCase()) ||
      jp.department.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = activeTab === 'All' || jp.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabCounts = {
    All: jobPostings.length,
    Draft: jobPostings.filter(j => j.status === 'Draft').length,
    Open: jobPostings.filter(j => j.status === 'Open').length,
    'On Hold': jobPostings.filter(j => j.status === 'On Hold').length,
    Closed: jobPostings.filter(j => j.status === 'Closed').length,
    Filled: jobPostings.filter(j => j.status === 'Filled').length,
  };

  const columns = [
    {
      title: 'Job Title', dataIndex: 'title', key: 'title',
      render: (text: string, record: JobPosting) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Space size={4} style={{ marginTop: 4 }}>
            <MapPin size={12} style={{ color: '#6b7280' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.location}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>|</Text>
            <Clock size={12} style={{ color: '#6b7280' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.experienceMin}-{record.experienceMax} yrs</Text>
          </Space>
        </div>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: string) => <Tag color="blue">{d}</Tag> },
    {
      title: 'Type', dataIndex: 'employmentType', key: 'employmentType',
      render: (t: string) => <Tag color={employmentTypeColors[t] || 'default'}>{t}</Tag>,
    },
    {
      title: 'Salary Range', key: 'salary',
      render: (_: any, record: JobPosting) => (
        <Text style={{ fontSize: 13 }}>{formatSalary(record.salaryMin)} - {formatSalary(record.salaryMax)}</Text>
      ),
    },
    {
      title: 'Applications', dataIndex: 'applications', key: 'applications',
      render: (val: number) => <Badge count={val} showZero style={{ backgroundColor: val > 0 ? '#1a56db' : '#d1d5db' }} />,
    },
    { title: 'Vacancies', dataIndex: 'vacancies', key: 'vacancies' },
    {
      title: 'Deadline', dataIndex: 'deadline', key: 'deadline',
      render: (d: string) => <Text type="secondary" style={{ fontSize: 13 }}>{d}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: JobStatus) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: JobPosting) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={14} />, label: 'View Applications' },
          { key: 'edit', icon: <Edit2 size={14} />, label: 'Edit' },
          { key: 'close', icon: <XCircle size={14} />, label: record.status === 'Open' ? 'Close Posting' : 'Reopen', danger: record.status === 'Open' },
        ], onClick: ({ key }) => {
          if (key === 'close') message.success(`Job posting "${record.title}" status updated`);
        }}} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  const handleCreate = () => {
    form.validateFields().then(() => {
      message.success('Job posting created successfully');
      setDrawerOpen(false);
      form.resetFields();
    }).catch(() => {});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Recruitment</Title>
          <Text type="secondary">Manage job postings and track applications</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>
          Create Job Posting
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Open Positions', value: jobPostings.filter(j => j.status === 'Open').length, icon: <Briefcase size={20} />, color: '#1a56db' },
          { title: 'Total Applications', value: jobPostings.reduce((s, j) => s + j.applications, 0), icon: <Users size={20} />, color: '#059669' },
          { title: 'Interviews Scheduled', value: 18, icon: <CalendarCheck size={20} />, color: '#d97706' },
          { title: 'Hired This Month', value: 6, icon: <UserCheck size={20} />, color: '#7c3aed' },
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

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={Object.entries(tabCounts).map(([key, count]) => ({
            key,
            label: <span>{key} <Badge count={count} style={{ backgroundColor: key === activeTab ? '#1a56db' : '#d1d5db', marginLeft: 6 }} size="small" /></span>,
          }))}
          style={{ marginBottom: 16 }}
        />
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search job postings..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Table
          dataSource={filteredPostings}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} postings` }}
        />
      </Card>

      <Drawer
        title="Create Job Posting"
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
          <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Senior React Developer" />
          </Form.Item>
          <Form.Item name="description" label="Job Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe the role, responsibilities, and requirements" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select placeholder="Select department" options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Analytics', label: 'Analytics' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="designation" label="Designation">
                <Input placeholder="e.g. Senior Engineer" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <Select placeholder="Select location" options={[
                  { value: 'Bangalore', label: 'Bangalore' },
                  { value: 'Mumbai', label: 'Mumbai' },
                  { value: 'Hyderabad', label: 'Hyderabad' },
                  { value: 'Delhi NCR', label: 'Delhi NCR' },
                  { value: 'Pune', label: 'Pune' },
                  { value: 'Chennai', label: 'Chennai' },
                  { value: 'Remote', label: 'Remote' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Internship', label: 'Internship' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="experienceMin" label="Min Experience (years)" rules={[{ required: true }]}>
                <InputNumber min={0} max={30} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experienceMax" label="Max Experience (years)" rules={[{ required: true }]}>
                <InputNumber min={0} max={30} style={{ width: '100%' }} placeholder="5" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salaryMin" label="Min Salary (Annual INR)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 1200000" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salaryMax" label="Max Salary (Annual INR)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 2000000" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="skills" label="Required Skills">
            <Select mode="tags" placeholder="Type and press enter to add skills" />
          </Form.Item>
          <Form.Item name="qualifications" label="Qualifications">
            <Input.TextArea rows={2} placeholder="e.g. B.Tech/B.E. in Computer Science or equivalent" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vacancies" label="Number of Vacancies" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default JobPostings;
