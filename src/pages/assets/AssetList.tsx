import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Drawer, Form, Select, Modal, Row, Col, Typography, Space, Popconfirm } from 'antd';
import { App } from 'antd';
import { Plus, Search, Monitor, CheckCircle2, Package, Wrench, UserPlus, RotateCcw } from 'lucide-react';
import { useAssetList, useCreateAsset, useAssignAsset, useReturnAsset } from '@/hooks/queries/useAssets';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  available: 'green', assigned: 'blue', in_repair: 'orange', retired: 'red', lost: 'default',
};
const conditionColor: Record<string, string> = {
  new: 'green', good: 'blue', fair: 'orange', poor: 'red',
};

const AssetList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const { data, isLoading } = useAssetList();
  const createMutation = useCreateAsset();
  const assignMutation = useAssignAsset();
  const returnMutation = useReturnAsset();

  const assets: any[] = data?.data ?? [];
  const filtered = assets.filter((a: any) =>
    a.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    a.assetTag?.toLowerCase().includes(searchText.toLowerCase())
  );

  const total = assets.length;
  const assigned = assets.filter((a: any) => a.status === 'assigned').length;
  const available = assets.filter((a: any) => a.status === 'available').length;
  const inRepair = assets.filter((a: any) => a.status === 'in_repair').length;

  const stats = [
    { title: 'Total Assets', value: total, icon: <Package size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Assigned', value: assigned, icon: <Monitor size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
    { title: 'Available', value: available, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'In Repair', value: inRepair, icon: <Wrench size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
  ];

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Asset created');
      form.resetFields();
      setDrawerOpen(false);
    } catch {
      message.error('Failed to create asset');
    }
  };

  const handleAssign = async (values: any) => {
    try {
      await assignMutation.mutateAsync({ id: selectedAsset._id ?? selectedAsset.id, data: values });
      message.success('Asset assigned');
      assignForm.resetFields();
      setAssignOpen(false);
      setSelectedAsset(null);
    } catch {
      message.error('Failed to assign asset');
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await returnMutation.mutateAsync({ id });
      message.success('Asset returned');
    } catch {
      message.error('Failed to return asset');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Tag', dataIndex: 'assetTag', key: 'assetTag', render: (t: string) => <Text code>{t}</Text> },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      filters: ['laptop', 'desktop', 'monitor', 'phone', 'furniture', 'other'].map(c => ({ text: c, value: c })),
      onFilter: (value: any, record: any) => record.category === value,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', responsive: ['lg'] as any },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo', render: (a: any) => a ? (typeof a === 'string' ? a : a.name ?? '-') : '-' },
    {
      title: 'Condition', dataIndex: 'condition', key: 'condition',
      filters: [
        { text: 'New', value: 'new' },
        { text: 'Good', value: 'good' },
        { text: 'Fair', value: 'fair' },
        { text: 'Poor', value: 'poor' },
      ],
      onFilter: (value: any, record: any) => record.condition === value,
      render: (c: string) => <Tag color={conditionColor[c] ?? 'default'}>{c}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Assigned', value: 'assigned' },
        { text: 'In Repair', value: 'in_repair' },
        { text: 'Retired', value: 'retired' },
        { text: 'Lost', value: 'lost' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] ?? 'default'}>{s}</Tag>,
    },
    {
      title: 'Actions', key: 'actions', width: 180,
      render: (_: any, r: any) => (
        <Space>
          {r.status === 'available' && (
            <Button type="link" size="small" icon={<UserPlus size={14} />} onClick={() => { setSelectedAsset(r); setAssignOpen(true); }}>Assign</Button>
          )}
          {r.status === 'assigned' && (
            <Popconfirm title="Return this asset?" onConfirm={() => handleReturn(r._id ?? r.id)}>
              <Button type="link" size="small" icon={<RotateCcw size={14} />}>Return</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Asset Management</Title>
          <Text type="secondary">Track and manage company assets</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setDrawerOpen(true)}>Add Asset</Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((stat, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="h-full hover:shadow-md transition-shadow" bordered={false}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
              </div>
              <div className="mt-4">
                <Text type="secondary" className="text-xs">{stat.title}</Text>
                <div className="text-2xl font-bold mt-0.5">{stat.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <Input prefix={<Search size={16} />} placeholder="Search assets..." value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
        </div>
        <Table columns={columns} dataSource={filtered} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 900 }} />
      </Card>

      <Drawer title="Add Asset" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={500} footer={
        <div className="flex justify-end gap-3">
          <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
          <Button type="primary" loading={createMutation.isPending} onClick={() => form.submit()}>Create</Button>
        </div>
      }>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Asset Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. MacBook Pro 14" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Category" options={['laptop', 'desktop', 'monitor', 'phone', 'furniture', 'other'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="brand" label="Brand">
              <Input placeholder="Brand name" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="assetTag" label="Asset Tag">
              <Input placeholder="e.g. AST-001" />
            </Form.Item>
            <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
              <Select placeholder="Condition" options={['new', 'good', 'fair', 'poor'].map(c => ({ value: c, label: c }))} />
            </Form.Item>
          </div>
          <Form.Item name="serialNumber" label="Serial Number">
            <Input placeholder="Serial number" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="Purchase Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="Notes">
            <Input.TextArea rows={2} placeholder="Additional notes" />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal title="Assign Asset" open={assignOpen} onCancel={() => { setAssignOpen(false); setSelectedAsset(null); }} footer={null}>
        <Form form={assignForm} layout="vertical" onFinish={handleAssign}>
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Text type="secondary">Assigning: </Text><Text strong>{selectedAsset?.name}</Text>
          </div>
          <Form.Item name="employeeId" label="Employee ID" rules={[{ required: true }]}>
            <Input placeholder="Enter employee ID" />
          </Form.Item>
          <Form.Item name="employeeName" label="Employee Name">
            <Input placeholder="Enter employee name" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Assignment notes" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => { setAssignOpen(false); setSelectedAsset(null); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={assignMutation.isPending}>Assign</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetList;
