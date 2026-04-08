/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Row, Col,
  Dropdown, Badge, Statistic, Popconfirm, message,
} from 'antd';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  Building2,
  Users,
  GitBranch,
  Upload,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import DepartmentForm from './DepartmentForm';

const { Title, Text } = Typography;

const mockDepartments = [
  { key: '1', name: 'Engineering', code: 'ENG', description: 'Software development and technology', headOfDepartment: 'Ananya Reddy', employeeCount: 45, parentDepartment: 'Operations', status: 'Active' },
  { key: '2', name: 'Marketing', code: 'MKT', description: 'Brand, digital marketing, and communications', headOfDepartment: 'Meera Nair', employeeCount: 18, parentDepartment: 'Operations', status: 'Active' },
  { key: '3', name: 'Finance', code: 'FIN', description: 'Financial planning, accounting, and compliance', headOfDepartment: 'Suresh Iyer', employeeCount: 12, parentDepartment: '', status: 'Active' },
  { key: '4', name: 'HR', code: 'HR', description: 'Human resources, recruitment, and employee relations', headOfDepartment: 'Sneha Gupta', employeeCount: 8, parentDepartment: '', status: 'Active' },
  { key: '5', name: 'Sales', code: 'SAL', description: 'Revenue generation and client management', headOfDepartment: 'Vikram Joshi', employeeCount: 22, parentDepartment: 'Operations', status: 'Active' },
  { key: '6', name: 'Operations', code: 'OPS', description: 'Business operations and process management', headOfDepartment: 'Deepak Verma', employeeCount: 10, parentDepartment: '', status: 'Active' },
  { key: '7', name: 'IT', code: 'IT', description: 'IT infrastructure and support', headOfDepartment: 'Pooja Deshmukh', employeeCount: 6, parentDepartment: 'Engineering', status: 'Active' },
  { key: '8', name: 'Legal', code: 'LEG', description: 'Legal affairs, compliance, and contracts', headOfDepartment: 'Neha Bhatt', employeeCount: 4, parentDepartment: '', status: 'Inactive' },
];

const DepartmentList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  const filteredDepartments = mockDepartments.filter(d =>
    d.name.toLowerCase().includes(searchText.toLowerCase()) ||
    d.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalEmployees = mockDepartments.reduce((sum, d) => sum + d.employeeCount, 0);
  const activeDepts = mockDepartments.filter(d => d.status === 'Active').length;
  const avgTeamSize = Math.round(totalEmployees / mockDepartments.length);

  const stats = [
    { title: 'Total Departments', value: mockDepartments.length, icon: <Building2 size={20} />, color: '#1a56db' },
    { title: 'Active Departments', value: activeDepts, icon: <GitBranch size={20} />, color: '#059669' },
    { title: 'Total Employees', value: totalEmployees, icon: <Users size={20} />, color: '#7c3aed' },
    { title: 'Avg Team Size', value: avgTeamSize, icon: <Users size={20} />, color: '#d97706' },
  ];

  const columns = [
    {
      title: 'Department', dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1a56db' }}>{text[0]}</Avatar>
          <div>
            <Text strong>{text}</Text><br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Head of Department', dataIndex: 'headOfDepartment', key: 'headOfDepartment',
      render: (name: string) => name ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{name[0]}</Avatar>
          <Text>{name}</Text>
        </Space>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: 'Employees', dataIndex: 'employeeCount', key: 'employeeCount',
      sorter: (a: any, b: any) => a.employeeCount - b.employeeCount,
      render: (count: number) => <Text strong>{count}</Text>,
    },
    {
      title: 'Parent Department', dataIndex: 'parentDepartment', key: 'parentDepartment',
      render: (p: string) => p ? <Tag>{p}</Tag> : <Text type="secondary">-</Text>,
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
          { key: 'edit', icon: <Edit2 size={16} />, label: 'Edit', onClick: () => { setEditingDepartment(record); setModalOpen(true); } },
          { type: 'divider' as const },
          { key: 'delete', icon: <Trash2 size={16} />, label: 'Delete', danger: true, onClick: () => message.success('Department deleted (mock)') },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  const handleFormSubmit = (values: any) => {
    if (editingDepartment) {
      message.success('Department updated successfully (mock)');
    } else {
      message.success('Department created successfully (mock)');
    }
    setModalOpen(false);
    setEditingDepartment(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Departments</Title>
          <Text type="secondary">Manage organizational departments and teams</Text>
        </div>
        <Space>
          <Button icon={<Upload size={16} />}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditingDepartment(null); setModalOpen(true); }}>
            Add Department
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

      {/* Department Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search departments..."
            prefix={<Search size={16} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        <Table
          dataSource={filteredDepartments}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} departments`,
          }}
        />
      </Card>

      {/* Add/Edit Department Modal */}
      <DepartmentForm
        open={modalOpen}
        editingDepartment={editingDepartment}
        onCancel={() => { setModalOpen(false); setEditingDepartment(null); }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default DepartmentList;
