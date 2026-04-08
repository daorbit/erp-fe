/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Drawer, Form,
  Select, Row, Col, Statistic, Upload, Dropdown, Tooltip, Rate, Divider, Badge,
} from 'antd';
import {
  Plus, Search, Eye, MoreHorizontal, SlidersHorizontal,
  MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Paperclip,
  Timer, TrendingDown,
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  isStaff: boolean;
}

interface Ticket {
  key: string;
  ticketNo: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  employee: string;
  assignedTo: string | null;
  status: 'Open' | 'In Progress' | 'Waiting on User' | 'Resolved' | 'Closed';
  created: string;
  lastUpdated: string;
  resolution: string | null;
  satisfaction: number | null;
  comments: Comment[];
}

const tickets: Ticket[] = [
  {
    key: '1', ticketNo: 'TKT-2026-001', subject: 'Laptop not working - Screen flickering', description: 'My MacBook Pro screen has been flickering intermittently since yesterday. It happens especially when connected to the external monitor. I have tried restarting and resetting NVRAM but the issue persists.', category: 'IT Hardware', priority: 'High', employee: 'Rahul Sharma', assignedTo: 'Vikram Joshi', status: 'In Progress', created: '2026-04-07', lastUpdated: '2026-04-08', resolution: null, satisfaction: null,
    comments: [
      { id: '1', author: 'Rahul Sharma', content: 'Screen started flickering since yesterday morning. Attached a video of the issue.', date: '2026-04-07 09:30', isStaff: false },
      { id: '2', author: 'Vikram Joshi', content: 'Thanks Rahul. I have checked the logs. It seems like a display driver issue. Can you try updating to the latest macOS version? I will also arrange a replacement monitor for testing.', date: '2026-04-07 11:15', isStaff: true },
      { id: '3', author: 'Rahul Sharma', content: 'Updated the macOS but issue still persists with external monitor.', date: '2026-04-08 10:00', isStaff: false },
    ],
  },
  {
    key: '2', ticketNo: 'TKT-2026-002', subject: 'VPN access required for WFH', description: 'I need VPN access configured for work from home. I recently got approval for 3 days WFH and need the VPN client set up on my laptop.', category: 'IT Access', priority: 'Medium', employee: 'Amit Patel', assignedTo: 'Vikram Joshi', status: 'Resolved', created: '2026-04-05', lastUpdated: '2026-04-06', resolution: 'VPN client installed and configured. Credentials shared via secure channel.', satisfaction: 5,
    comments: [
      { id: '1', author: 'Amit Patel', content: 'Need VPN access for WFH starting next week. Manager approval attached.', date: '2026-04-05 14:00', isStaff: false },
      { id: '2', author: 'Vikram Joshi', content: 'VPN access has been configured. Please check your email for setup instructions and credentials.', date: '2026-04-06 10:30', isStaff: true },
    ],
  },
  {
    key: '3', ticketNo: 'TKT-2026-003', subject: 'Leave balance discrepancy - Casual Leave', description: 'My casual leave balance shows 5 days but I believe it should be 7 days. I have only taken 3 casual leaves this year but the system shows 5 taken.', category: 'HR Query', priority: 'Medium', employee: 'Priya Singh', assignedTo: 'Sneha Gupta', status: 'Waiting on User', created: '2026-04-04', lastUpdated: '2026-04-07', resolution: null, satisfaction: null,
    comments: [
      { id: '1', author: 'Priya Singh', content: 'Please check my CL balance. It shows 5 remaining but should be 7.', date: '2026-04-04 11:00', isStaff: false },
      { id: '2', author: 'Sneha Gupta', content: 'Hi Priya, I checked the records. You had 2 CLs carried forward from a late cancellation in March. Can you confirm if you applied for leave on March 12-13?', date: '2026-04-05 09:00', isStaff: true },
    ],
  },
  {
    key: '4', ticketNo: 'TKT-2026-004', subject: 'AC not working in 3rd floor conference room', description: 'The air conditioning in the 3rd floor conference room (Room 301) has not been working since Monday. Multiple meetings are scheduled there this week.', category: 'Facilities', priority: 'High', employee: 'Ananya Reddy', assignedTo: null, status: 'Open', created: '2026-04-07', lastUpdated: '2026-04-07', resolution: null, satisfaction: null,
    comments: [
      { id: '1', author: 'Ananya Reddy', content: 'AC has been down since Monday morning. Room temperature is very uncomfortable for meetings.', date: '2026-04-07 08:45', isStaff: false },
    ],
  },
  {
    key: '5', ticketNo: 'TKT-2026-005', subject: 'Salary slip download not working', description: 'Unable to download salary slip for March 2026 from the HRMS portal. Getting a 404 error when clicking the download button.', category: 'HR Query', priority: 'Medium', employee: 'Vikram Joshi', assignedTo: 'Sneha Gupta', status: 'Resolved', created: '2026-04-03', lastUpdated: '2026-04-04', resolution: 'The payroll module had a temporary issue. Fixed and salary slips are now downloadable.', satisfaction: 4,
    comments: [
      { id: '1', author: 'Vikram Joshi', content: 'Getting 404 error when trying to download March salary slip. Screenshot attached.', date: '2026-04-03 16:00', isStaff: false },
      { id: '2', author: 'Sneha Gupta', content: 'This was a known issue with the payroll system update. It has been fixed now. Please try again.', date: '2026-04-04 10:00', isStaff: true },
    ],
  },
  {
    key: '6', ticketNo: 'TKT-2026-006', subject: 'Request for standing desk', description: 'I would like to request a standing desk for my workstation. I have a doctor\'s recommendation due to back issues.', category: 'Facilities', priority: 'Low', employee: 'Amit Patel', assignedTo: null, status: 'Open', created: '2026-04-06', lastUpdated: '2026-04-06', resolution: null, satisfaction: null,
    comments: [
      { id: '1', author: 'Amit Patel', content: 'Requesting a standing desk. Doctor recommendation attached. Current seat is causing back pain.', date: '2026-04-06 12:00', isStaff: false },
    ],
  },
  {
    key: '7', ticketNo: 'TKT-2026-007', subject: 'Email not syncing on mobile', description: 'Company email stopped syncing on my iPhone since the recent password change. I have tried reconfiguring but getting authentication errors.', category: 'IT Access', priority: 'Medium', employee: 'Sneha Gupta', assignedTo: 'Vikram Joshi', status: 'In Progress', created: '2026-04-08', lastUpdated: '2026-04-08', resolution: null, satisfaction: null,
    comments: [
      { id: '1', author: 'Sneha Gupta', content: 'Email stopped working on phone after password reset yesterday.', date: '2026-04-08 08:00', isStaff: false },
      { id: '2', author: 'Vikram Joshi', content: 'This usually happens when the app password is not updated. I will send you the steps to generate a new app-specific password.', date: '2026-04-08 09:30', isStaff: true },
    ],
  },
  {
    key: '8', ticketNo: 'TKT-2026-008', subject: 'Reimbursement for online course - Coursera', description: 'Requesting reimbursement for Coursera subscription used for AWS Cloud Practitioner course. Rs 4,999 paid. Manager has approved the learning plan.', category: 'HR Query', priority: 'Low', employee: 'Rahul Sharma', assignedTo: 'Sneha Gupta', status: 'Closed', created: '2026-03-25', lastUpdated: '2026-03-30', resolution: 'Reimbursement approved and processed. Amount will be credited in April payroll.', satisfaction: 5,
    comments: [
      { id: '1', author: 'Rahul Sharma', content: 'Requesting reimbursement for Coursera subscription. Invoice and manager approval attached.', date: '2026-03-25 10:00', isStaff: false },
      { id: '2', author: 'Sneha Gupta', content: 'Approved. The amount of Rs 4,999 will be included in your April salary.', date: '2026-03-30 14:00', isStaff: true },
    ],
  },
];

const priorityColors: Record<string, string> = {
  Low: 'default',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
};

const statusColors: Record<string, string> = {
  Open: 'red',
  'In Progress': 'blue',
  'Waiting on User': 'orange',
  Resolved: 'green',
  Closed: 'default',
};

const categoryColors: Record<string, string> = {
  'IT Hardware': 'volcano',
  'IT Access': 'blue',
  'HR Query': 'purple',
  Facilities: 'green',
};

const TicketList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [form] = Form.useForm();

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTodayCount = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status) && t.lastUpdated >= '2026-04-08').length;

  const filteredTickets = tickets.filter(t => {
    if (searchText && !t.subject.toLowerCase().includes(searchText.toLowerCase()) && !t.ticketNo.toLowerCase().includes(searchText.toLowerCase()) && !t.employee.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      title: 'Ticket #', dataIndex: 'ticketNo', key: 'ticketNo',
      render: (t: string) => <Text strong style={{ color: '#1a56db' }}>{t}</Text>,
    },
    {
      title: 'Subject', dataIndex: 'subject', key: 'subject',
      render: (text: string) => <Text strong>{text}</Text>,
      ellipsis: true,
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag color={categoryColors[cat] || 'default'}>{cat}</Tag>,
    },
    {
      title: 'Priority', dataIndex: 'priority', key: 'priority',
      render: (p: string) => <Tag color={priorityColors[p]}>{p}</Tag>,
    },
    {
      title: 'Employee', dataIndex: 'employee', key: 'employee',
      render: (emp: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{emp[0]}</Avatar>
          <Text>{emp}</Text>
        </Space>
      ),
    },
    {
      title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo',
      render: (name: string | null) => name ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#059669' }}>{name[0]}</Avatar>
          <Text>{name}</Text>
        </Space>
      ) : <Tag>Unassigned</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    { title: 'Created', dataIndex: 'created', key: 'created' },
    { title: 'Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Ticket) => (
        <Tooltip title="View Details">
          <Button type="text" icon={<Eye size={16} />} onClick={() => setDetailTicket(record)} />
        </Tooltip>
      ),
    },
  ];

  const renderTicketDetail = () => {
    if (!detailTicket) return null;
    return (
      <Drawer
        title={
          <Space>
            <Text strong>{detailTicket.ticketNo}</Text>
            <Tag color={statusColors[detailTicket.status]}>{detailTicket.status}</Tag>
            <Tag color={priorityColors[detailTicket.priority]}>{detailTicket.priority}</Tag>
          </Space>
        }
        open={!!detailTicket}
        onClose={() => { setDetailTicket(null); setNewComment(''); }}
        width={600}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 8 }}>{detailTicket.subject}</Title>
          <Space split={<Divider type="vertical" />} wrap>
            <Space size={4}>
              <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{detailTicket.employee[0]}</Avatar>
              <Text type="secondary">{detailTicket.employee}</Text>
            </Space>
            <Text type="secondary">{detailTicket.category}</Text>
            <Text type="secondary">Created {detailTicket.created}</Text>
          </Space>
        </div>

        <Card bordered={false} style={{ borderRadius: 12, background: '#f8fafc', marginBottom: 16 }}>
          <Paragraph>{detailTicket.description}</Paragraph>
        </Card>

        {detailTicket.assignedTo && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Assigned to: </Text>
            <Space size={4}>
              <Avatar size="small" style={{ backgroundColor: '#059669' }}>{detailTicket.assignedTo[0]}</Avatar>
              <Text strong>{detailTicket.assignedTo}</Text>
            </Space>
          </div>
        )}

        {detailTicket.resolution && (
          <Card bordered={false} style={{ borderRadius: 12, background: '#f0fdf4', marginBottom: 16, border: '1px solid #bbf7d0' }}>
            <Text strong style={{ color: '#059669' }}>Resolution</Text>
            <Paragraph style={{ marginBottom: 0, marginTop: 4 }}>{detailTicket.resolution}</Paragraph>
          </Card>
        )}

        {detailTicket.satisfaction !== null && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Satisfaction Rating: </Text>
            <Rate disabled defaultValue={detailTicket.satisfaction} style={{ fontSize: 16 }} />
          </div>
        )}

        <Divider>Comments</Divider>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {detailTicket.comments.map(comment => (
            <div
              key={comment.id}
              style={{
                padding: 12, borderRadius: 12,
                background: comment.isStaff ? '#eff6ff' : '#f8fafc',
                borderLeft: comment.isStaff ? '3px solid #1a56db' : '3px solid #e5e7eb',
              }}
            >
              <Space style={{ marginBottom: 4 }}>
                <Avatar size="small" style={{ backgroundColor: comment.isStaff ? '#1a56db' : '#6b7280' }}>
                  {comment.author[0]}
                </Avatar>
                <Text strong style={{ fontSize: 13 }}>{comment.author}</Text>
                {comment.isStaff && <Tag color="blue" style={{ fontSize: 10 }}>Staff</Tag>}
                <Text type="secondary" style={{ fontSize: 11 }}>{comment.date}</Text>
              </Space>
              <Paragraph style={{ marginBottom: 0, marginLeft: 32, fontSize: 13 }}>{comment.content}</Paragraph>
            </div>
          ))}
        </div>

        {!['Closed', 'Resolved'].includes(detailTicket.status) && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              placeholder="Write a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={2}
              style={{ flex: 1 }}
            />
            <Button type="primary" icon={<Send size={14} />} style={{ alignSelf: 'flex-end' }}>
              Send
            </Button>
          </div>
        )}

        {!['Closed', 'Resolved'].includes(detailTicket.status) && (
          <>
            <Divider />
            <Space>
              <Select placeholder="Change Status" style={{ width: 180 }} options={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Waiting on User', label: 'Waiting on User' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
              ]} />
              <Select placeholder="Assign To" style={{ width: 180 }} options={[
                { value: 'Vikram Joshi', label: 'Vikram Joshi' },
                { value: 'Sneha Gupta', label: 'Sneha Gupta' },
                { value: 'Priya Singh', label: 'Priya Singh' },
              ]} />
            </Space>
          </>
        )}
      </Drawer>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Helpdesk</Title>
          <Text type="secondary">Manage employee support tickets and requests</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerOpen(true)}>
          Create Ticket
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Open Tickets', value: openCount, icon: <AlertCircle size={20} />, color: '#dc2626' },
          { title: 'In Progress', value: inProgressCount, icon: <Clock size={20} />, color: '#d97706' },
          { title: 'Resolved Today', value: resolvedTodayCount, icon: <CheckCircle2 size={20} />, color: '#059669' },
          { title: 'Avg Resolution Time', value: '1.8', suffix: 'days', icon: <Timer size={20} />, color: '#1a56db' },
        ].map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary">{stat.title}</Text>}
                  value={stat.value}
                  suffix={(stat as any).suffix}
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
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Input
              placeholder="Search tickets..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Category"
              allowClear
              style={{ width: 140 }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'IT Hardware', label: 'IT Hardware' },
                { value: 'IT Access', label: 'IT Access' },
                { value: 'HR Query', label: 'HR Query' },
                { value: 'Facilities', label: 'Facilities' },
              ]}
            />
            <Select
              placeholder="Priority"
              allowClear
              style={{ width: 120 }}
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Waiting on User', label: 'Waiting on User' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />
          </Space>
        </Space>

        <Table
          dataSource={filteredTickets}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} tickets` }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Drawer
        title="Create New Ticket"
        open={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); form.resetFields(); }}
        width={560}
        extra={
          <Space>
            <Button onClick={() => { setIsDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={() => { form.validateFields().then(() => { setIsDrawerOpen(false); form.resetFields(); }); }}>
              Submit Ticket
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: 'Please enter subject' }]}>
            <Input placeholder="Brief summary of the issue" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please describe the issue' }]}>
            <Input.TextArea rows={5} placeholder="Describe your issue in detail. Include steps to reproduce if applicable." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={[
                  { value: 'IT Hardware', label: 'IT Hardware' },
                  { value: 'IT Access', label: 'IT Access' },
                  { value: 'HR Query', label: 'HR Query' },
                  { value: 'Facilities', label: 'Facilities' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority" options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Critical', label: 'Critical' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="attachments" label="Attachments">
            <Upload.Dragger maxCount={3} beforeUpload={() => false} multiple>
              <p style={{ marginBottom: 4 }}><Paperclip size={24} style={{ color: '#1a56db' }} /></p>
              <p><Text strong>Attach files</Text></p>
              <p><Text type="secondary" style={{ fontSize: 12 }}>Screenshots, logs, or other relevant files (Max 3 files)</Text></p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Drawer>

      {renderTicketDetail()}
    </div>
  );
};

export default TicketList;
