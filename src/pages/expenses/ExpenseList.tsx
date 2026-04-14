import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Select, Tabs, Row, Col, Typography, Space, Popconfirm } from 'antd';
import { App } from 'antd';
import { Plus, Search, IndianRupee, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { useExpenseList, useApproveExpense, useRejectExpense } from '@/hooks/queries/useExpenses';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const { Title, Text } = Typography;

const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const statusColor: Record<string, string> = {
  pending: 'orange', approved: 'green', rejected: 'red', reimbursed: 'blue', draft: 'default',
};

const ExpenseList: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HR_MANAGER;
  const isManager = isAdmin || currentUser?.role === UserRole.MANAGER;
  const isViewer = currentUser?.role === UserRole.VIEWER;

  const { data, isLoading } = useExpenseList({ tab: activeTab === 'all' ? undefined : activeTab });
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const expenses: any[] = data?.data ?? [];
  const filtered = expenses.filter((e: any) =>
    e.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalAmount = expenses.reduce((sum: number, e: any) => sum + (e.amount ?? 0), 0);
  const pendingCount = expenses.filter((e: any) => e.status === 'pending').length;
  const approvedCount = expenses.filter((e: any) => e.status === 'approved').length;
  const reimbursedCount = expenses.filter((e: any) => e.status === 'reimbursed').length;

  const stats = [
    { title: 'Total Claims', value: formatINR(totalAmount), icon: <IndianRupee size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Pending', value: pendingCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Approved', value: approvedCount, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Reimbursed', value: reimbursedCount, icon: <Wallet size={20} />, color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-950' },
  ];

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id });
      message.success('Expense approved');
    } catch {
      message.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id });
      message.success('Expense rejected');
    } catch {
      message.error('Failed to reject');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    {
      title: t('category'), dataIndex: 'category', key: 'category',
      filters: ['travel', 'meals', 'accommodation', 'transportation', 'office_supplies', 'training', 'medical', 'other'].map(c => ({ text: c, value: c })),
      onFilter: (value: any, record: any) => record.category === value,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    { title: t('amount'), dataIndex: 'amount', key: 'amount', render: (a: number) => <Text strong>{formatINR(a ?? 0)}</Text> },
    { title: t('date'), dataIndex: 'date', key: 'date', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: t('employee'), dataIndex: 'employeeName', key: 'employeeName', responsive: ['lg'] as any },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Reimbursed', value: 'reimbursed' },
        { text: 'Draft', value: 'draft' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s] ?? 'default'}>{s}</Tag>,
    },
    ...(isManager ? [{
      title: t('actions'), key: 'actions', width: 180,
      render: (_: any, r: any) => (
        <Space>
          {r.status === 'pending' && (
            <>
              <Popconfirm title="Approve this expense?" onConfirm={() => handleApprove(r._id ?? r.id)}>
                <Button type="link" size="small">{t('approve')}</Button>
              </Popconfirm>
              <Popconfirm title="Reject this expense?" onConfirm={() => handleReject(r._id ?? r.id)}>
                <Button type="link" size="small" danger>{t('reject')}</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('expenses')}</Title>
          <Text type="secondary">{t('manage_expenses')}</Text>
        </div>
        {!isViewer && <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/expenses/create')}>{t('new_expense')}</Button>}
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
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: 'All Expenses' },
          { key: 'my', label: 'My Expenses' },
          { key: 'pending', label: 'Pending Approvals' },
        ]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <Input prefix={<Search size={16} />} placeholder={`${t('search')}...`} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
        </div>
        <Table columns={columns} dataSource={filtered} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 800 }} />
      </Card>

    </div>
  );
};

export default ExpenseList;
