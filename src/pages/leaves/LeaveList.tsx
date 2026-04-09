import React, { useState } from 'react';
import { Card, Table, Tag, Button, Tabs, Modal, Form, Input, InputNumber, Typography, Row, Col, Space, Avatar, Popconfirm } from 'antd';
import { App } from 'antd';
import { Clock, CheckCircle2, XCircle, Plus, Calendar } from 'lucide-react';
import { useLeaveList, useLeaveTypeList, useLeaveBalance, useApproveLeave, useRejectLeave, useCreateLeaveType } from '@/hooks/queries/useLeaves';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const LeaveList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: leaveData, isLoading: leavesLoading } = useLeaveList();
  const { data: typeData, isLoading: typesLoading } = useLeaveTypeList();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const createTypeMutation = useCreateLeaveType();

  const leaves: any[] = leaveData?.data ?? [];
  const leaveTypes: any[] = typeData?.data ?? [];

  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id }, { onSuccess: () => message.success('Leave approved') });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ id }, { onSuccess: () => message.success('Leave rejected') });
  };

  const handleCreateType = (values: any) => {
    createTypeMutation.mutate(values, {
      onSuccess: () => {
        message.success('Leave type created');
        setTypeModalOpen(false);
        form.resetFields();
      },
    });
  };

  const stats = [
    { title: 'Pending', value: pending, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Approved', value: approved, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Rejected', value: rejected, icon: <XCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  const requestColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <div>
            <div className="font-medium text-sm">{r.employeeName}</div>
            <div className="text-xs text-gray-400">{r.employeeEmail}</div>
          </div>
        </div>
      ),
    },
    { title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'From', dataIndex: 'startDate', key: 'startDate' },
    { title: 'To', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Days', dataIndex: 'days', key: 'days' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: any) => r.status === 'pending' ? (
        <Space>
          <Popconfirm title="Approve this leave?" onConfirm={() => handleApprove(r._id || r.id)}>
            <Button size="small" type="link" className="!text-green-600"><CheckCircle2 size={16} /></Button>
          </Popconfirm>
          <Popconfirm title="Reject this leave?" onConfirm={() => handleReject(r._id || r.id)}>
            <Button size="small" type="link" danger><XCircle size={16} /></Button>
          </Popconfirm>
        </Space>
      ) : null,
    },
  ];

  const typeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Max Days/Year', dataIndex: 'maxDaysPerYear', key: 'maxDaysPerYear' },
    { title: 'Carry Forward', dataIndex: 'carryForward', key: 'carryForward', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Paid', dataIndex: 'isPaid', key: 'isPaid', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
  ];

  const balanceColumns = [
    {
      title: 'Employee', dataIndex: 'employeeName', key: 'employeeName',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600" size={32}>{(r.employeeName || 'U').charAt(0)}</Avatar>
          <span className="font-medium">{r.employeeName}</span>
        </div>
      ),
    },
    { title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    { title: 'Used', dataIndex: 'used', key: 'used' },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', render: (v: number) => <Tag color={v > 0 ? 'green' : 'red'}>{v}</Tag> },
  ];

  const tabItems = [
    {
      key: 'requests',
      label: 'Leave Requests',
      children: (
        <div className="space-y-4">
          <Row gutter={[16, 16]}>
            {stats.map((stat, i) => (
              <Col key={i} xs={24} sm={8}>
                <Card bordered={false}>
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      <span style={{ color: stat.color }}>{stat.icon}</span>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">{stat.title}</Text>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Card bordered={false}>
            <Table columns={requestColumns} dataSource={leaves} loading={leavesLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
          </Card>
        </div>
      ),
    },
    {
      key: 'types',
      label: 'Leave Types',
      children: (
        <Card bordered={false} extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setTypeModalOpen(true)}>Add Type</Button>}>
          <Table columns={typeColumns} dataSource={leaveTypes} loading={typesLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
    {
      key: 'balances',
      label: 'Leave Balances',
      children: (
        <Card bordered={false}>
          <Table columns={balanceColumns} dataSource={[]} loading={false} rowKey={(r) => `${r.employeeId}-${r.leaveType}`} pagination={{ pageSize: 10 }} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">Leave Management</Title>
          <Text type="secondary">View and manage leave requests, types, and balances</Text>
        </div>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title="Add Leave Type" open={typeModalOpen} onCancel={() => setTypeModalOpen(false)} footer={null} width={500}>
        <Form form={form} layout="vertical" onFinish={handleCreateType}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sick Leave" />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. SL" />
          </Form.Item>
          <Form.Item name="maxDaysPerYear" label="Max Days Per Year" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" placeholder="e.g. 12" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setTypeModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createTypeMutation.isPending}>Create</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveList;
