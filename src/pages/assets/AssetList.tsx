/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Avatar, Typography, Drawer, Form,
  Select, Row, Col, Statistic, DatePicker, Dropdown, Tooltip, InputNumber, Modal,
} from 'antd';
import {
  Plus, Search, Eye, Edit2, MoreHorizontal, SlidersHorizontal,
  Laptop, Monitor, Smartphone, Package, Key, UserPlus, RotateCcw,
  HardDrive, Armchair, CheckCircle2, AlertTriangle, Wrench, Archive,
} from 'lucide-react';

const { Title, Text } = Typography;

interface Asset {
  key: string;
  name: string;
  assetTag: string;
  category: string;
  brand: string;
  model: string;
  serialNo: string;
  assignedTo: string | null;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  status: 'Assigned' | 'Available' | 'In Repair' | 'Retired';
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  location: string;
}

const assets: Asset[] = [
  { key: '1', name: 'MacBook Pro 16"', assetTag: 'AST-2026-001', category: 'Laptop', brand: 'Apple', model: 'MacBook Pro M3 Max', serialNo: 'C02ZN1ABCD01', assignedTo: 'Rahul Sharma', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-11-15', purchasePrice: 289900, warrantyExpiry: '2027-11-15', location: 'Bangalore Office' },
  { key: '2', name: 'Dell UltraSharp 27" Monitor', assetTag: 'AST-2026-002', category: 'Monitor', brand: 'Dell', model: 'U2723QE', serialNo: 'DL27U2723Q001', assignedTo: 'Rahul Sharma', condition: 'Good', status: 'Assigned', purchaseDate: '2025-12-01', purchasePrice: 42500, warrantyExpiry: '2028-12-01', location: 'Bangalore Office' },
  { key: '3', name: 'iPhone 15 Pro', assetTag: 'AST-2026-003', category: 'Mobile', brand: 'Apple', model: 'iPhone 15 Pro 256GB', serialNo: 'IP15P256A001', assignedTo: 'Priya Singh', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-10-20', purchasePrice: 134900, warrantyExpiry: '2026-10-20', location: 'Mumbai Office' },
  { key: '4', name: 'ThinkPad X1 Carbon Gen 11', assetTag: 'AST-2026-004', category: 'Laptop', brand: 'Lenovo', model: 'X1 Carbon Gen 11', serialNo: 'LNV-X1C11-004', assignedTo: 'Amit Patel', condition: 'Good', status: 'Assigned', purchaseDate: '2025-08-10', purchasePrice: 156000, warrantyExpiry: '2028-08-10', location: 'Bangalore Office' },
  { key: '5', name: 'Standing Desk - Electric', assetTag: 'AST-2026-005', category: 'Furniture', brand: 'FlexiSpot', model: 'E7 Pro', serialNo: 'FS-E7P-005', assignedTo: 'Sneha Gupta', condition: 'Good', status: 'Assigned', purchaseDate: '2025-09-05', purchasePrice: 32000, warrantyExpiry: '2030-09-05', location: 'Bangalore Office' },
  { key: '6', name: 'Dell Latitude 5540', assetTag: 'AST-2026-006', category: 'Laptop', brand: 'Dell', model: 'Latitude 5540', serialNo: 'DL-5540-006', assignedTo: null, condition: 'Good', status: 'Available', purchaseDate: '2025-07-15', purchasePrice: 98500, warrantyExpiry: '2028-07-15', location: 'Bangalore Office' },
  { key: '7', name: 'Adobe Creative Cloud License', assetTag: 'AST-2026-007', category: 'Software', brand: 'Adobe', model: 'Creative Cloud All Apps', serialNo: 'ADO-CC-2026-007', assignedTo: 'Vikram Joshi', condition: 'Excellent', status: 'Assigned', purchaseDate: '2026-01-01', purchasePrice: 54000, warrantyExpiry: '2026-12-31', location: 'Cloud' },
  { key: '8', name: 'HP LaserJet Pro MFP', assetTag: 'AST-2026-008', category: 'Peripheral', brand: 'HP', model: 'M428fdw', serialNo: 'HP-M428-008', assignedTo: null, condition: 'Fair', status: 'In Repair', purchaseDate: '2024-03-20', purchasePrice: 35000, warrantyExpiry: '2025-03-20', location: 'Bangalore Office' },
  { key: '9', name: 'Ergonomic Office Chair', assetTag: 'AST-2026-009', category: 'Furniture', brand: 'Herman Miller', model: 'Aeron Remastered', serialNo: 'HM-AERON-009', assignedTo: 'Ananya Reddy', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-06-12', purchasePrice: 125000, warrantyExpiry: '2037-06-12', location: 'Bangalore Office' },
  { key: '10', name: 'Samsung Galaxy Tab S9', assetTag: 'AST-2026-010', category: 'Mobile', brand: 'Samsung', model: 'Galaxy Tab S9 FE', serialNo: 'SM-S9FE-010', assignedTo: null, condition: 'Good', status: 'Available', purchaseDate: '2025-11-01', purchasePrice: 44999, warrantyExpiry: '2026-11-01', location: 'Mumbai Office' },
  { key: '11', name: 'Logitech MX Keys + MX Master 3S', assetTag: 'AST-2026-011', category: 'Peripheral', brand: 'Logitech', model: 'MX Combo', serialNo: 'LGT-MX-011', assignedTo: 'Amit Patel', condition: 'Good', status: 'Assigned', purchaseDate: '2025-08-10', purchasePrice: 18500, warrantyExpiry: '2027-08-10', location: 'Bangalore Office' },
  { key: '12', name: 'Microsoft 365 Business License', assetTag: 'AST-2026-012', category: 'Software', brand: 'Microsoft', model: 'M365 Business Premium', serialNo: 'MS-365-012', assignedTo: null, condition: 'Excellent', status: 'Available', purchaseDate: '2026-01-01', purchasePrice: 16200, warrantyExpiry: '2026-12-31', location: 'Cloud' },
  { key: '13', name: 'Canon EOS R50', assetTag: 'AST-2026-013', category: 'Peripheral', brand: 'Canon', model: 'EOS R50', serialNo: 'CN-R50-013', assignedTo: null, condition: 'Poor', status: 'Retired', purchaseDate: '2022-06-15', purchasePrice: 65000, warrantyExpiry: '2024-06-15', location: 'Storage' },
];

const conditionColors: Record<string, string> = {
  Excellent: 'green',
  Good: 'blue',
  Fair: 'orange',
  Poor: 'red',
};

const statusColors: Record<string, string> = {
  Assigned: 'blue',
  Available: 'green',
  'In Repair': 'orange',
  Retired: 'default',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Laptop: <Laptop size={16} />,
  Monitor: <Monitor size={16} />,
  Mobile: <Smartphone size={16} />,
  Furniture: <Armchair size={16} />,
  Software: <Key size={16} />,
  Peripheral: <HardDrive size={16} />,
};

const AssetList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const totalAssets = assets.length;
  const assignedCount = assets.filter(a => a.status === 'Assigned').length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const repairCount = assets.filter(a => a.status === 'In Repair').length;

  const filteredAssets = assets.filter(a => {
    if (searchText && !a.name.toLowerCase().includes(searchText.toLowerCase()) && !a.assetTag.toLowerCase().includes(searchText.toLowerCase()) && !(a.assignedTo && a.assignedTo.toLowerCase().includes(searchText.toLowerCase()))) return false;
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (conditionFilter && a.condition !== conditionFilter) return false;
    return true;
  });

  const getActionItems = (record: Asset) => {
    const items: any[] = [{ key: 'view', icon: <Eye size={16} />, label: 'View Details' }];
    items.push({ key: 'edit', icon: <Edit2 size={16} />, label: 'Edit' });
    if (record.status === 'Available') {
      items.push({ key: 'assign', icon: <UserPlus size={16} />, label: 'Assign' });
    }
    if (record.status === 'Assigned') {
      items.push({ key: 'return', icon: <RotateCcw size={16} />, label: 'Return' });
    }
    return items;
  };

  const columns = [
    {
      title: 'Asset', dataIndex: 'name', key: 'name',
      render: (text: string, record: Asset) => (
        <Space>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db',
          }}>
            {categoryIcons[record.category] || <Package size={16} />}
          </div>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.brand} {record.model}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Asset Tag', dataIndex: 'assetTag', key: 'assetTag', render: (t: string) => <Text code>{t}</Text> },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag>{cat}</Tag>,
    },
    { title: 'Serial No', dataIndex: 'serialNo', key: 'serialNo', render: (s: string) => <Text type="secondary" style={{ fontSize: 12 }}>{s}</Text> },
    {
      title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo',
      render: (emp: string | null) => emp ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1a56db' }}>{emp[0]}</Avatar>
          <Text>{emp}</Text>
        </Space>
      ) : <Tag>Unassigned</Tag>,
    },
    {
      title: 'Condition', dataIndex: 'condition', key: 'condition',
      render: (c: string) => <Tag color={conditionColors[c]}>{c}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    { title: 'Purchase Date', dataIndex: 'purchaseDate', key: 'purchaseDate' },
    {
      title: 'Warranty', dataIndex: 'warrantyExpiry', key: 'warrantyExpiry',
      render: (date: string) => {
        const expired = new Date(date) < new Date('2026-04-08');
        return <Text type={expired ? 'danger' : 'secondary'}>{date}{expired ? ' (Expired)' : ''}</Text>;
      },
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, record: Asset) => (
        <Dropdown menu={{
          items: getActionItems(record),
          onClick: ({ key }) => {
            if (key === 'assign') setIsAssignModalOpen(true);
          },
        }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={18} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Asset Management</Title>
          <Text type="secondary">Track and manage company assets and equipment</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerOpen(true)}>
          Add Asset
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Assets', value: totalAssets, icon: <Package size={20} />, color: '#1a56db' },
          { title: 'Assigned', value: assignedCount, icon: <CheckCircle2 size={20} />, color: '#059669' },
          { title: 'Available', value: availableCount, icon: <Archive size={20} />, color: '#d97706' },
          { title: 'In Repair', value: repairCount, icon: <Wrench size={20} />, color: '#dc2626' },
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
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Input
              placeholder="Search assets..."
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
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Monitor', label: 'Monitor' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'Furniture', label: 'Furniture' },
                { value: 'Software', label: 'Software' },
                { value: 'Peripheral', label: 'Peripheral' },
              ]}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'Assigned', label: 'Assigned' },
                { value: 'Available', label: 'Available' },
                { value: 'In Repair', label: 'In Repair' },
                { value: 'Retired', label: 'Retired' },
              ]}
            />
            <Select
              placeholder="Condition"
              allowClear
              style={{ width: 140 }}
              value={conditionFilter}
              onChange={setConditionFilter}
              options={[
                { value: 'Excellent', label: 'Excellent' },
                { value: 'Good', label: 'Good' },
                { value: 'Fair', label: 'Fair' },
                { value: 'Poor', label: 'Poor' },
              ]}
            />
          </Space>
        </Space>

        <Table
          dataSource={filteredAssets}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} assets` }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Drawer
        title="Add New Asset"
        open={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); form.resetFields(); }}
        width={600}
        extra={
          <Space>
            <Button onClick={() => { setIsDrawerOpen(false); form.resetFields(); }}>Cancel</Button>
            <Button type="primary" onClick={() => { form.validateFields().then(() => { setIsDrawerOpen(false); form.resetFields(); }); }}>
              Add Asset
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Asset Name" rules={[{ required: true, message: 'Enter asset name' }]}>
                <Input placeholder="e.g., MacBook Pro 16 inch" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assetTag" label="Asset Tag">
                <Input placeholder="Auto-generated" disabled defaultValue="AST-2026-014" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" options={[
                  { value: 'Laptop', label: 'Laptop' },
                  { value: 'Monitor', label: 'Monitor' },
                  { value: 'Mobile', label: 'Mobile' },
                  { value: 'Furniture', label: 'Furniture' },
                  { value: 'Software', label: 'Software' },
                  { value: 'Peripheral', label: 'Peripheral' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                <Input placeholder="e.g., Apple" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                <Input placeholder="e.g., MacBook Pro M3 Max" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="serialNo" label="Serial Number" rules={[{ required: true }]}>
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchaseDate" label="Purchase Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purchasePrice" label="Purchase Price (INR)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="warrantyExpiry" label="Warranty Expiry">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
                <Select placeholder="Select condition" options={[
                  { value: 'Excellent', label: 'Excellent' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Fair', label: 'Fair' },
                  { value: 'Poor', label: 'Poor' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="Location">
            <Select placeholder="Select location" options={[
              { value: 'Bangalore Office', label: 'Bangalore Office' },
              { value: 'Mumbai Office', label: 'Mumbai Office' },
              { value: 'Delhi Office', label: 'Delhi Office' },
              { value: 'Cloud', label: 'Cloud' },
              { value: 'Storage', label: 'Storage' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional notes or specifications" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Assign Asset"
        open={isAssignModalOpen}
        onCancel={() => { setIsAssignModalOpen(false); assignForm.resetFields(); }}
        onOk={() => { assignForm.validateFields().then(() => { setIsAssignModalOpen(false); assignForm.resetFields(); }); }}
        okText="Assign"
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employee" label="Assign To" rules={[{ required: true, message: 'Select an employee' }]}>
            <Select placeholder="Select employee" showSearch optionFilterProp="label" options={[
              { value: 'Rahul Sharma', label: 'Rahul Sharma' },
              { value: 'Priya Singh', label: 'Priya Singh' },
              { value: 'Amit Patel', label: 'Amit Patel' },
              { value: 'Sneha Gupta', label: 'Sneha Gupta' },
              { value: 'Vikram Joshi', label: 'Vikram Joshi' },
              { value: 'Ananya Reddy', label: 'Ananya Reddy' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Assignment notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetList;
