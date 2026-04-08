/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Input, Space, Tag, Avatar, Typography, Drawer, Form,
  Select, Row, Col, DatePicker, Upload, Switch, Badge,
} from 'antd';
import {
  Plus, Search, Pin, Eye, Clock, SlidersHorizontal, Paperclip,
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface Announcement {
  key: string;
  title: string;
  content: string;
  category: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  postedBy: string;
  date: string;
  readCount: number;
  isPinned: boolean;
  attachments: number;
}

const announcements: Announcement[] = [
  {
    key: '1',
    title: 'Diwali Celebration 2026 - Save the Date!',
    content: 'Dear Team,\n\nWe are excited to announce our annual Diwali celebration on November 7th, 2026 at the office premises. This year\'s theme is "Festival of Joy".\n\nHighlights include:\n- Traditional rangoli competition\n- Diya decoration workshop\n- Cultural performances by employees\n- Festive lunch with authentic Indian cuisine\n- Lucky draw with exciting prizes\n\nPlease confirm your attendance by October 25th. Family members are welcome!\n\nRegards,\nHR Team',
    category: 'Event',
    priority: 'Normal',
    postedBy: 'Sneha Gupta',
    date: '2026-04-05',
    readCount: 189,
    isPinned: true,
    attachments: 1,
  },
  {
    key: '2',
    title: 'Updated Work From Home Policy - Effective May 1st',
    content: 'Dear Employees,\n\nWe are pleased to share the revised Work From Home (WFH) policy effective from May 1st, 2026.\n\nKey changes:\n- Employees can now WFH up to 3 days per week (increased from 2)\n- Flexible WFH days - no fixed schedule required\n- Mandatory in-office days: Tuesday and Thursday for team sync\n- Internet allowance increased to Rs 1,500/month\n- Ergonomic furniture reimbursement up to Rs 15,000 (one-time)\n\nPlease read the full policy document attached and reach out to HR for any queries.\n\nBest,\nHR Department',
    category: 'Policy',
    priority: 'High',
    postedBy: 'Priya Singh',
    date: '2026-04-03',
    readCount: 234,
    isPinned: true,
    attachments: 2,
  },
  {
    key: '3',
    title: 'Q4 FY2025-26 Results - Record Revenue!',
    content: 'Dear Team,\n\nWe are thrilled to share that we have achieved record revenue in Q4 FY2025-26!\n\nKey highlights:\n- Revenue: Rs 48.5 Cr (32% YoY growth)\n- New clients onboarded: 28\n- Employee satisfaction score: 4.6/5\n- Zero attrition in engineering team\n\nThis achievement was possible because of your hard work and dedication. Special thanks to the Sales and Delivery teams for their exceptional performance.\n\nCelebration party details will be shared soon!\n\nWarm regards,\nManagement',
    category: 'Achievement',
    priority: 'Normal',
    postedBy: 'Ananya Reddy',
    date: '2026-04-01',
    readCount: 210,
    isPinned: false,
    attachments: 0,
  },
  {
    key: '4',
    title: 'Scheduled System Maintenance - April 12th',
    content: 'Dear All,\n\nPlease be informed that there will be a scheduled maintenance window for our internal systems.\n\nDate: April 12th, 2026 (Sunday)\nTime: 10:00 PM to 6:00 AM IST\nAffected systems: HRMS, Email, VPN, Internal Wiki\n\nPlease plan your work accordingly. Save all work before the maintenance window.\n\nFor urgent issues during downtime, contact IT support at +91 98765 43210.\n\nRegards,\nIT Team',
    category: 'Maintenance',
    priority: 'Critical',
    postedBy: 'Vikram Joshi',
    date: '2026-04-06',
    readCount: 156,
    isPinned: false,
    attachments: 0,
  },
  {
    key: '5',
    title: 'New Health Insurance Benefits - Enhanced Coverage',
    content: 'Dear Employees,\n\nWe are happy to announce enhanced health insurance benefits starting this quarter.\n\nNew benefits include:\n- Sum insured increased to Rs 10 Lakhs (from Rs 5 Lakhs)\n- Maternity cover included for all female employees\n- OPD cover up to Rs 15,000/year\n- Mental health counselling - 12 free sessions per year\n- Dental coverage included\n- Coverage for parents at subsidised rates\n\nEnrollment for parent coverage is open until April 30th. Visit the Benefits portal to update your details.\n\nRegards,\nHR Team',
    category: 'General',
    priority: 'High',
    postedBy: 'Sneha Gupta',
    date: '2026-03-28',
    readCount: 198,
    isPinned: false,
    attachments: 1,
  },
  {
    key: '6',
    title: 'Annual Team Outing - Goa Trip Announcement',
    content: 'Dear Team,\n\nGet ready for our annual team outing!\n\nDestination: Goa\nDates: May 15-17, 2026 (Fri-Sun)\nAccommodation: Taj Vivanta, Panaji\n\nItinerary highlights:\n- Beach activities and water sports\n- Team building exercises\n- Gala dinner on Saturday night\n- Optional heritage tour of Old Goa\n\nAll expenses covered by the company. Please fill out the registration form by April 20th.\n\nLet\'s make it memorable!\n\nCheers,\nFun Committee',
    category: 'Event',
    priority: 'Normal',
    postedBy: 'Amit Patel',
    date: '2026-03-25',
    readCount: 245,
    isPinned: false,
    attachments: 1,
  },
  {
    key: '7',
    title: 'Referral Bonus Increased to Rs 75,000',
    content: 'Dear All,\n\nGreat news! Our employee referral bonus has been increased.\n\nNew referral bonus structure:\n- Senior Engineer / Lead: Rs 75,000\n- Engineer / Analyst: Rs 50,000\n- Intern: Rs 15,000\n\nBonus is paid in two instalments: 50% on joining, 50% after 6 months.\n\nWe are currently hiring for 15+ positions across Engineering, Product, and Sales. Check the Careers page for open roles.\n\nRefer and earn!\n\nBest,\nTalent Acquisition Team',
    category: 'General',
    priority: 'Normal',
    postedBy: 'Priya Singh',
    date: '2026-03-20',
    readCount: 178,
    isPinned: false,
    attachments: 0,
  },
];

const priorityColors: Record<string, string> = {
  Critical: 'red',
  High: 'orange',
  Normal: 'blue',
  Low: 'default',
};

const categoryColors: Record<string, string> = {
  General: 'blue',
  Policy: 'purple',
  Event: 'green',
  Achievement: 'gold',
  Urgent: 'red',
  Maintenance: 'volcano',
};

const AnnouncementList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [form] = Form.useForm();

  const filteredAnnouncements = announcements
    .filter(a => {
      if (searchText && !a.title.toLowerCase().includes(searchText.toLowerCase()) && !a.content.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (categoryFilter && a.category !== categoryFilter) return false;
      if (priorityFilter && a.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Announcements</Title>
          <Text type="secondary">Company news, updates and announcements</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerOpen(true)}>
          New Announcement
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Search announcements..."
          prefix={<Search size={16} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Category"
          allowClear
          style={{ width: 160 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'General', label: 'General' },
            { value: 'Policy', label: 'Policy' },
            { value: 'Event', label: 'Event' },
            { value: 'Achievement', label: 'Achievement' },
            { value: 'Urgent', label: 'Urgent' },
            { value: 'Maintenance', label: 'Maintenance' },
          ]}
        />
        <Select
          placeholder="Priority"
          allowClear
          style={{ width: 140 }}
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: 'Critical', label: 'Critical' },
            { value: 'High', label: 'High' },
            { value: 'Normal', label: 'Normal' },
            { value: 'Low', label: 'Low' },
          ]}
        />
      </Space>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredAnnouncements.map(announcement => {
          const isExpanded = expandedKey === announcement.key;
          return (
            <Card
              key={announcement.key}
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                borderLeft: announcement.isPinned ? '4px solid #1a56db' : undefined,
              }}
              onClick={() => setExpandedKey(isExpanded ? null : announcement.key)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Space style={{ marginBottom: 8 }} wrap>
                    {announcement.isPinned && (
                      <Tag icon={<Pin size={12} style={{ marginRight: 4 }} />} color="blue">Pinned</Tag>
                    )}
                    <Tag color={categoryColors[announcement.category]}>{announcement.category}</Tag>
                    <Tag color={priorityColors[announcement.priority]}>{announcement.priority}</Tag>
                  </Space>
                  <Title level={5} style={{ margin: '0 0 8px 0' }}>{announcement.title}</Title>
                  {isExpanded ? (
                    <Paragraph style={{ whiteSpace: 'pre-line', marginBottom: 12 }}>
                      {announcement.content}
                    </Paragraph>
                  ) : (
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                      {announcement.content}
                    </Paragraph>
                  )}
                  <Space split={<span style={{ color: '#d1d5db' }}>|</span>}>
                    <Space size={8}>
                      <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{announcement.postedBy[0]}</Avatar>
                      <Text type="secondary" style={{ fontSize: 13 }}>{announcement.postedBy}</Text>
                    </Space>
                    <Space size={4}>
                      <Clock size={14} style={{ color: '#9ca3af' }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{announcement.date}</Text>
                    </Space>
                    <Space size={4}>
                      <Eye size={14} style={{ color: '#9ca3af' }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{announcement.readCount} views</Text>
                    </Space>
                    {announcement.attachments > 0 && (
                      <Space size={4}>
                        <Paperclip size={14} style={{ color: '#9ca3af' }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>{announcement.attachments} attachment{announcement.attachments > 1 ? 's' : ''}</Text>
                      </Space>
                    )}
                  </Space>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Drawer
        title="New Announcement"
        open={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); form.resetFields(); }}
        width={600}
        extra={
          <Space>
            <Button onClick={() => { setIsDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={() => { form.validateFields().then(() => { setIsDrawerOpen(false); form.resetFields(); }); }}>
              Publish
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter announcement title' }]}>
            <Input placeholder="Enter announcement title" />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please enter content' }]}>
            <Input.TextArea rows={8} placeholder="Write your announcement here..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={[
                  { value: 'General', label: 'General' },
                  { value: 'Policy', label: 'Policy' },
                  { value: 'Event', label: 'Event' },
                  { value: 'Achievement', label: 'Achievement' },
                  { value: 'Urgent', label: 'Urgent' },
                  { value: 'Maintenance', label: 'Maintenance' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select placeholder="Select priority" options={[
                  { value: 'Critical', label: 'Critical' },
                  { value: 'High', label: 'High' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Low', label: 'Low' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="targetAudience" label="Target Audience">
            <Select defaultValue="all" options={[
              { value: 'all', label: 'All Employees' },
              { value: 'department', label: 'Specific Departments' },
              { value: 'specific', label: 'Specific Employees' },
            ]} />
          </Form.Item>
          <Form.Item name="departments" label="Departments">
            <Select mode="multiple" placeholder="Select departments" options={[
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Finance', label: 'Finance' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
            ]} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="publishDate" label="Publish Date">
                <DatePicker style={{ width: '100%' }} placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label="Expiry Date">
                <DatePicker style={{ width: '100%' }} placeholder="Select date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="attachments" label="Attachments">
            <Upload.Dragger maxCount={5} beforeUpload={() => false}>
              <p style={{ marginBottom: 4 }}><Paperclip size={24} style={{ color: '#1a56db' }} /></p>
              <p><Text strong>Click or drag files to attach</Text></p>
              <p><Text type="secondary" style={{ fontSize: 12 }}>Max 5 files, 10 MB each</Text></p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="isPinned" label="Pin Announcement" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AnnouncementList;
