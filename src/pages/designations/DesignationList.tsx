/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Typography, Row, Col,
  Dropdown, Badge, Statistic, Modal, Form, Select, message,
} from 'antd';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  Award,
  Layers,
  BarChart3,
  Upload,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

const { Title, Text } = Typography;

const mockDesignations = [
  { key: '1', title: 'Software Engineer', code: 'SE', department: 'Engineering', level: 1, band: 'L1', status: 'Active' },
  { key: '2', title: 'Senior Developer', code: 'SDE', department: 'Engineering', level: 2, band: 'L2', status: 'Active' },
  { key: '3', title: 'Team Lead', code: 'TL', department: 'Engineering', level: 3, band: 'L3', status: 'Active' },
  { key: '4', title: 'Engineering Manager', code: 'EM', department: 'Engineering', level: 4, band: 'L4', status: 'Active' },
  { key: '5', title: 'VP Engineering', code: 'VPE', department: 'Engineering', level: 5, band: 'L5', status: 'Active' },
  { key: '6', title: 'Marketing Executive', code: 'ME', department: 'Marketing', level: 1, band: 'L1', status: 'Active' },
  { key: '7', title: 'Marketing Manager', code: 'MM', department: 'Marketing', level: 3, band: 'L3', status: 'Active' },
  { key: '8', title: 'Financial Analyst', code: 'FA', department: 'Finance', level: 1, band: 'L1', status: 'Active' },
  { key: '9', title: 'Finance Manager', code: 'FM', department: 'Finance', level: 3, band: 'L3', status: 'Active' },
  { key: '10', title: 'HR Executive', code: 'HRE', department: 'HR', level: 1, band: 'L1', status: 'Active' },
  { key: '11', title: 'HR Manager', code: 'HRM', department: 'HR', level: 3, band: 'L3', status: 'Active' },
  { key: '12', title: 'Sales Lead', code: 'SL', department: 'Sales', level: 2, band: 'L2', status: 'Active' },
  { key: '13', title: 'Sales Manager', code: 'SM', department: 'Sales', level: 3, band: 'L3', status: 'Active' },
  { key: '14', title: 'System Administrator', code: 'SA', department: 'IT', level: 2, band: 'L2', status: 'Active' },
  { key: '15', title: 'Legal Counsel', code: 'LC', department: 'Legal', level: 3, band: 'L3', status: 'Inactive' },
  { key: '16', title: 'VP Operations', code: 'VPO', department: 'Operations', level: 5, band: 'L5', status: 'Active' },
];

const departmentColors: Record<string, string> = {
  Engineering: 'blue',
  Marketing: 'magenta',
  Finance: 'green',
  HR: 'purple',
  Sales: 'orange',
  IT: 'cyan',
  Operations: 'geekblue',
  Legal: 'gold',
};

const bandColors: Record<string, string> = {
  L1: 'default',
  L2: 'blue',
  L3: 'geekblue',
  L4: 'purple',
  L5: 'gold',
};

const DesignationList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const filteredDesignations = mockDesignations.filter(d => {
    const matchesSearch = !searchText ||
      d.title.toLowerCase().includes(searchText.toLowerCase()) ||
      d.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesDept = !filterDepartment || d.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = [...new Set(mockDesignations.map(d => d.department))];
  const activeCount = mockDesignations.filter(d => d.status === 'Active').length;
  const maxLevel = Math.max(...mockDesignations.map(d => d.level));

  const stats = [
    { title: 'Total Designations', value: mockDesignations.length, icon: <Award size={20} />, color: '#1a56db' },
    { title: 'Active', value: activeCount, icon: <Layers size={20} />, color: '#059669' },
    { title: 'Departments Covered', value: uniqueDepartments.length, icon: <BarChart3 size={20} />, color: '#7c3aed' },
    { title: 'Max Levels', value: maxLevel, icon: <Layers size={20} />, color: '#d97706' },
  ];

  const columns = [
    {
      title: 'Title', dataIndex: 'title', key: 'title',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text><br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
        </div>
      ),
    },
    {
      title: 'Department', dataIndex: 'department', key: 'department',
      render: (dept: string) => <Tag color={departmentColors[dept] || 'default'}>{dept}</Tag>,
    },
    {
      title: 'Level', dataIndex: 'level', key: 'level',
      sorter: (a: any, b: any) => a.level - b.level,
      render: (level: number) => <Text strong>{level}</Text>,
    },
    {
      title: 'Band', dataIndex: 'band', key: 'band',
      render: (band: string) => <Tag color={bandColors[band] || 'default'}>{band}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => <Badge status={status === 'Active' ? 'success' : 'error'} text={status} />,
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, record: any) => (
        <Dropdown menu={{ items: [
          { key: 'view', icon: <Eye size={16} />, label: 'View Details' },
          {
            key: 'edit', icon: <Edit2 size={16} />, label: 'Edit',
            onClick: () => {
              setEditingDesignation(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            },
          },
          { type: 'divider' as const },
          { key: 'delete', icon: <Trash2 size={16} />, label: 'Delete', danger: true, onClick: () => message.success('Designation deleted (mock)') },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  const handleSubmit = () => {
    form.validateFields().then(() => {
      if (editingDesignation) {
        message.success('Designation updated successfully (mock)');
      } else {
        message.success('Designation created successfully (mock)');
      }
      setModalOpen(false);
      setEditingDesignation(null);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Designations</Title>
          <Text type="secondary">Manage job titles, levels, and bands</Text>
        </div>
        <Space>
          <Button icon={<Upload size={16} />}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditingDesignation(null); form.resetFields(); setModalOpen(true); }}>
            Add Designation
          </Button>
        </Space>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
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
              <Text style={{ color: stat.color, fontSize: 12 }}>
                <ArrowUpRight size={12} /> Updated today
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Designation Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Input
              placeholder="Search designations..."
              prefix={<Search size={16} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Department"
              allowClear
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: 160 }}
              options={uniqueDepartments.map(d => ({ value: d, label: d }))}
            />
          </Space>
        </Space>
        <Table
          dataSource={filteredDesignations}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} designations`,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* Add/Edit Designation Modal */}
      <Modal
        title={editingDesignation ? 'Edit Designation' : 'Add New Designation'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingDesignation(null); form.resetFields(); }}
        onOk={handleSubmit}
        width={640}
        okText={editingDesignation ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Designation Title" rules={[{ required: true, message: 'Please enter designation title' }]}>
                <Input placeholder="e.g. Software Engineer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please enter code' }]}>
                <Input placeholder="e.g. SE" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please select department' }]}>
                <Select placeholder="Select department" options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'IT', label: 'IT' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Legal', label: 'Legal' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="level" label="Level" rules={[{ required: true, message: 'Select level' }]}>
                <Select placeholder="Level" options={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="band" label="Band" rules={[{ required: true, message: 'Select band' }]}>
                <Select placeholder="Band" options={[
                  { value: 'L1', label: 'L1' },
                  { value: 'L2', label: 'L2' },
                  { value: 'L3', label: 'L3' },
                  { value: 'L4', label: 'L4' },
                  { value: 'L5', label: 'L5' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter designation description" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Active">
            <Select options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DesignationList;
