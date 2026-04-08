/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Typography, Tabs, Avatar,
  Row, Col, Select, Rate, Progress, Modal, Form, DatePicker,
  message,
} from 'antd';
import {
  Plus, Search, Star, Target, TrendingUp, ClipboardCheck,
  Eye, Edit2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

type ReviewStatus = 'Draft' | 'Self Review' | 'Manager Review' | 'HR Review' | 'Completed';
type ReviewType = 'Annual' | 'Quarterly' | 'Probation' | 'Mid-Year';
type RatingLabel = 'Outstanding' | 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement' | 'Unsatisfactory';
type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
type GoalPriority = 'High' | 'Medium' | 'Low';
type GoalCategory = 'Technical' | 'Leadership' | 'Communication' | 'Business' | 'Personal Development';

interface Review {
  key: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  reviewer: string;
  period: string;
  type: ReviewType;
  overallRating: number;
  ratingLabel: RatingLabel;
  status: ReviewStatus;
}

interface Goal {
  key: string;
  employeeName: string;
  employeeEmail: string;
  goalTitle: string;
  category: GoalCategory;
  priority: GoalPriority;
  startDate: string;
  dueDate: string;
  progress: number;
  status: GoalStatus;
}

const reviewStatusColors: Record<ReviewStatus, string> = {
  'Draft': 'default',
  'Self Review': 'blue',
  'Manager Review': 'orange',
  'HR Review': 'purple',
  'Completed': 'green',
};

const reviewTypeColors: Record<ReviewType, string> = {
  'Annual': 'blue',
  'Quarterly': 'cyan',
  'Probation': 'gold',
  'Mid-Year': 'purple',
};

const ratingColors: Record<RatingLabel, string> = {
  'Outstanding': 'green',
  'Exceeds Expectations': 'blue',
  'Meets Expectations': 'gold',
  'Needs Improvement': 'orange',
  'Unsatisfactory': 'red',
};

const goalStatusColors: Record<GoalStatus, string> = {
  'Not Started': 'default',
  'In Progress': 'blue',
  'Completed': 'green',
  'Overdue': 'red',
};

const goalPriorityColors: Record<GoalPriority, string> = {
  'High': 'red',
  'Medium': 'orange',
  'Low': 'default',
};

const goalCategoryColors: Record<GoalCategory, string> = {
  'Technical': 'blue',
  'Leadership': 'purple',
  'Communication': 'cyan',
  'Business': 'gold',
  'Personal Development': 'green',
};

const reviews: Review[] = [
  { key: '1', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', department: 'Engineering', reviewer: 'Ananya Reddy', period: 'Apr 2025 - Mar 2026', type: 'Annual', overallRating: 4.5, ratingLabel: 'Outstanding', status: 'Completed' },
  { key: '2', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', department: 'Marketing', reviewer: 'Ravi Mehta', period: 'Apr 2025 - Mar 2026', type: 'Annual', overallRating: 4, ratingLabel: 'Exceeds Expectations', status: 'Completed' },
  { key: '3', employeeName: 'Amit Patel', employeeEmail: 'amit@company.com', department: 'Finance', reviewer: 'Sunita Agarwal', period: 'Jan 2026 - Mar 2026', type: 'Quarterly', overallRating: 3, ratingLabel: 'Meets Expectations', status: 'Manager Review' },
  { key: '4', employeeName: 'Sneha Gupta', employeeEmail: 'sneha@company.com', department: 'HR', reviewer: 'Deepak Joshi', period: 'Apr 2025 - Mar 2026', type: 'Annual', overallRating: 3.5, ratingLabel: 'Meets Expectations', status: 'HR Review' },
  { key: '5', employeeName: 'Vikram Joshi', employeeEmail: 'vikram@company.com', department: 'Sales', reviewer: 'Meera Nair', period: 'Oct 2025 - Mar 2026', type: 'Probation', overallRating: 2.5, ratingLabel: 'Needs Improvement', status: 'Completed' },
  { key: '6', employeeName: 'Ananya Reddy', employeeEmail: 'ananya@company.com', department: 'Engineering', reviewer: 'Deepak Joshi', period: 'Apr 2025 - Sep 2025', type: 'Mid-Year', overallRating: 4, ratingLabel: 'Exceeds Expectations', status: 'Completed' },
  { key: '7', employeeName: 'Deepak Joshi', employeeEmail: 'deepak@company.com', department: 'Engineering', reviewer: 'VP Engineering', period: 'Apr 2025 - Mar 2026', type: 'Annual', overallRating: 0, ratingLabel: 'Meets Expectations', status: 'Self Review' },
  { key: '8', employeeName: 'Kavita Mishra', employeeEmail: 'kavita@company.com', department: 'Marketing', reviewer: 'Ravi Mehta', period: 'Jan 2026 - Mar 2026', type: 'Quarterly', overallRating: 0, ratingLabel: 'Meets Expectations', status: 'Draft' },
  { key: '9', employeeName: 'Suresh Reddy', employeeEmail: 'suresh@company.com', department: 'Engineering', reviewer: 'Ananya Reddy', period: 'Apr 2025 - Mar 2026', type: 'Annual', overallRating: 2, ratingLabel: 'Unsatisfactory', status: 'Completed' },
];

const goals: Goal[] = [
  { key: '1', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', goalTitle: 'Complete AWS Solutions Architect Certification', category: 'Technical', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 70, status: 'In Progress' },
  { key: '2', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', goalTitle: 'Mentor 2 junior developers', category: 'Leadership', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-12-31', progress: 50, status: 'In Progress' },
  { key: '3', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', goalTitle: 'Increase organic traffic by 40%', category: 'Business', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 60, status: 'In Progress' },
  { key: '4', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', goalTitle: 'Launch content marketing framework', category: 'Business', priority: 'High', startDate: '2025-10-01', dueDate: '2026-03-31', progress: 100, status: 'Completed' },
  { key: '5', employeeName: 'Amit Patel', employeeEmail: 'amit@company.com', goalTitle: 'Implement automated reconciliation system', category: 'Technical', priority: 'High', startDate: '2026-01-15', dueDate: '2026-04-30', progress: 30, status: 'In Progress' },
  { key: '6', employeeName: 'Sneha Gupta', employeeEmail: 'sneha@company.com', goalTitle: 'Improve employee retention by 15%', category: 'Business', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', progress: 25, status: 'In Progress' },
  { key: '7', employeeName: 'Vikram Joshi', employeeEmail: 'vikram@company.com', goalTitle: 'Achieve quarterly sales target of 50L', category: 'Business', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', progress: 80, status: 'Overdue' },
  { key: '8', employeeName: 'Ananya Reddy', employeeEmail: 'ananya@company.com', goalTitle: 'Deliver microservices migration project', category: 'Technical', priority: 'High', startDate: '2025-07-01', dueDate: '2026-06-30', progress: 85, status: 'In Progress' },
  { key: '9', employeeName: 'Deepak Joshi', employeeEmail: 'deepak@company.com', goalTitle: 'Complete public speaking course', category: 'Communication', priority: 'Low', startDate: '2026-02-01', dueDate: '2026-08-31', progress: 10, status: 'In Progress' },
  { key: '10', employeeName: 'Kavita Mishra', employeeEmail: 'kavita@company.com', goalTitle: 'Learn advanced analytics tools', category: 'Personal Development', priority: 'Medium', startDate: '2026-03-01', dueDate: '2026-09-30', progress: 0, status: 'Not Started' },
  { key: '11', employeeName: 'Suresh Reddy', employeeEmail: 'suresh@company.com', goalTitle: 'Improve code review turnaround time', category: 'Technical', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 45, status: 'In Progress' },
];

const PerformanceList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [reviewTypeFilter, setReviewTypeFilter] = useState<string>('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('All');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm] = Form.useForm();

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.employeeName.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = reviewTypeFilter === 'All' || r.type === reviewTypeFilter;
    const matchesStatus = reviewStatusFilter === 'All' || r.status === reviewStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredGoals = goals.filter(g =>
    g.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
    g.goalTitle.toLowerCase().includes(searchText.toLowerCase())
  );

  const reviewColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (text: string, record: Review) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.department}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Reviewer', dataIndex: 'reviewer', key: 'reviewer' },
    { title: 'Period', dataIndex: 'period', key: 'period', render: (p: string) => <Text type="secondary" style={{ fontSize: 13 }}>{p}</Text> },
    {
      title: 'Type', dataIndex: 'type', key: 'type',
      render: (t: ReviewType) => <Tag color={reviewTypeColors[t]}>{t}</Tag>,
    },
    {
      title: 'Rating', key: 'rating',
      render: (_: any, record: Review) => record.overallRating > 0 ? (
        <Space>
          <Rate disabled defaultValue={record.overallRating} allowHalf style={{ fontSize: 14 }} />
          <Tag color={ratingColors[record.ratingLabel]}>{record.ratingLabel}</Tag>
        </Space>
      ) : <Text type="secondary">Pending</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: ReviewStatus) => <Tag color={reviewStatusColors[s]}>{s}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Review) => (
        <Space>
          <Button type="link" icon={<Eye size={14} />} onClick={() => navigate('/performance/review')}>View</Button>
          {record.status !== 'Completed' && (
            <Button type="link" icon={<Edit2 size={14} />} onClick={() => navigate('/performance/review')}>Edit</Button>
          )}
        </Space>
      ),
    },
  ];

  const goalColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (text: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Goal', dataIndex: 'goalTitle', key: 'goalTitle',
      render: (text: string) => <Text style={{ maxWidth: 280, display: 'block' }} ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (c: GoalCategory) => <Tag color={goalCategoryColors[c]}>{c}</Tag>,
    },
    {
      title: 'Priority', dataIndex: 'priority', key: 'priority',
      render: (p: GoalPriority) => <Tag color={goalPriorityColors[p]}>{p}</Tag>,
    },
    { title: 'Start', dataIndex: 'startDate', key: 'startDate', render: (d: string) => <Text type="secondary" style={{ fontSize: 13 }}>{d}</Text> },
    { title: 'Due', dataIndex: 'dueDate', key: 'dueDate', render: (d: string) => <Text type="secondary" style={{ fontSize: 13 }}>{d}</Text> },
    {
      title: 'Progress', dataIndex: 'progress', key: 'progress',
      render: (val: number) => <Progress percent={val} size="small" strokeColor={val === 100 ? '#059669' : val >= 60 ? '#1a56db' : '#d97706'} style={{ width: 120 }} />,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: GoalStatus) => <Tag color={goalStatusColors[s]}>{s}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: () => (
        <Button type="link" icon={<Edit2 size={14} />}>Edit</Button>
      ),
    },
  ];

  const handleAddGoal = () => {
    goalForm.validateFields().then(() => {
      message.success('Goal added successfully');
      setGoalModalOpen(false);
      goalForm.resetFields();
    }).catch(() => {});
  };

  const reviewsTab = (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Space>
          <Input
            placeholder="Search employees..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            value={reviewTypeFilter}
            onChange={setReviewTypeFilter}
            style={{ width: 150 }}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'Annual', label: 'Annual' },
              { value: 'Quarterly', label: 'Quarterly' },
              { value: 'Mid-Year', label: 'Mid-Year' },
              { value: 'Probation', label: 'Probation' },
            ]}
          />
          <Select
            value={reviewStatusFilter}
            onChange={setReviewStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Self Review', label: 'Self Review' },
              { value: 'Manager Review', label: 'Manager Review' },
              { value: 'HR Review', label: 'HR Review' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </Space>
      </Space>
      <Table
        dataSource={filteredReviews}
        columns={reviewColumns}
        pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} reviews` }}
      />
    </div>
  );

  const goalsTab = (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search goals..."
          prefix={<Search size={16} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setGoalModalOpen(true)}>
          Add Goal
        </Button>
      </Space>
      <Table
        dataSource={filteredGoals}
        columns={goalColumns}
        pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} goals` }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Performance Management</Title>
          <Text type="secondary">Track employee reviews, ratings, and goals</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/performance/review')}>
          Create Review
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Reviews', value: reviews.length, icon: <ClipboardCheck size={20} />, color: '#1a56db' },
          { title: 'Pending Reviews', value: reviews.filter(r => r.status !== 'Completed').length, icon: <Star size={20} />, color: '#d97706' },
          { title: 'Active Goals', value: goals.filter(g => g.status === 'In Progress').length, icon: <Target size={20} />, color: '#059669' },
          { title: 'Avg. Rating', value: '3.8', icon: <TrendingUp size={20} />, color: '#7c3aed' },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary">{stat.title}</Text>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{stat.value}</div>
                </div>
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
          defaultActiveKey="reviews"
          items={[
            { key: 'reviews', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Star size={16} /> Reviews</span>, children: reviewsTab },
            { key: 'goals', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Target size={16} /> Goals</span>, children: goalsTab },
          ]}
        />
      </Card>

      <Modal
        title="Add New Goal"
        open={goalModalOpen}
        onCancel={() => setGoalModalOpen(false)}
        onOk={handleAddGoal}
        width={640}
      >
        <Form form={goalForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employee" label="Employee" rules={[{ required: true }]}>
            <Select placeholder="Select employee" options={[
              { value: 'rahul', label: 'Rahul Sharma' },
              { value: 'priya', label: 'Priya Singh' },
              { value: 'amit', label: 'Amit Patel' },
              { value: 'sneha', label: 'Sneha Gupta' },
              { value: 'vikram', label: 'Vikram Joshi' },
              { value: 'ananya', label: 'Ananya Reddy' },
            ]} />
          </Form.Item>
          <Form.Item name="goalTitle" label="Goal Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Complete AWS certification" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={[
                  { value: 'Technical', label: 'Technical' },
                  { value: 'Leadership', label: 'Leadership' },
                  { value: 'Communication', label: 'Communication' },
                  { value: 'Business', label: 'Business' },
                  { value: 'Personal Development', label: 'Personal Development' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority" options={[
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
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
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe the goal in detail" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceList;
