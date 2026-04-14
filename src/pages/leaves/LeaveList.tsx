import React, { useState } from 'react';
import { Card, Table, Tag, Button, Tabs, Typography, Row, Col, Space, Avatar, Popconfirm } from 'antd';
import { App } from 'antd';
import { Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { useLeaveList, useLeaveTypeList, useApproveLeave, useRejectLeave } from '@/hooks/queries/useLeaves';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red', cancelled: 'default' };

const LeaveList: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('requests');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const { data: leaveData, isLoading: leavesLoading } = useLeaveList();
  const { data: typeData, isLoading: typesLoading } = useLeaveTypeList();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const leaves: any[] = leaveData?.data ?? [];
  const leaveTypes: any[] = typeData?.data ?? [];

  const pending = leaves.filter(l => l.status === 'pending').length;
  const approved = leaves.filter(l => l.status === 'approved').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id }, { onSuccess: () => message.success('Leave approved'), onError: (err: any) => message.error(err?.message || 'Failed to approve') });
  };
  const handleReject = (id: string) => {
    rejectMutation.mutate({ id }, { onSuccess: () => message.success('Leave rejected'), onError: (err: any) => message.error(err?.message || 'Failed to reject') });
  };

  const stats = [
    { title: t('pending_leaves'), value: pending, icon: <Clock size={20} />, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: t('approved'), value: approved, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('rejected'), value: rejected, icon: <XCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  // Helper to extract employee data from populated field
  const getEmp = (r: any) => r.employee || {};
  const getEmpName = (r: any) => {
    const e = getEmp(r);
    return `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'N/A';
  };
  const getLeaveName = (r: any) => {
    const lt = r.leaveType;
    return typeof lt === 'object' ? lt?.name : lt;
  };

  const requestColumns: any[] = [
    {
      title: t('employee'), key: 'employee',
      render: (_: any, r: any) => {
        const name = getEmpName(r);
        const email = getEmp(r).email || '';
        return (
          <div className="flex items-center gap-3">
            <Avatar src={getEmp(r).avatar} className="bg-blue-600" size={32}>{name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</Avatar>
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-gray-400">{email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: t('leave_type'), key: 'leaveType',
      filters: leaveTypes.map((lt: any) => ({ text: lt.name, value: lt.name })),
      onFilter: (value: any, record: any) => getLeaveName(record) === value,
      render: (_: any, r: any) => <Tag color="blue">{getLeaveName(r) || '-'}</Tag>,
    },
    {
      title: t('from_date'), dataIndex: 'startDate', key: 'startDate',
      render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-',
    },
    {
      title: t('to_date'), dataIndex: 'endDate', key: 'endDate',
      render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-',
    },
    {
      title: t('total_days'), dataIndex: 'totalDays', key: 'totalDays',
      render: (d: number) => d ?? '-',
    },
    { title: t('reason'), dataIndex: 'reason', key: 'reason', ellipsis: true },
    {
      title: t('status'), dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' }, { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' }, { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    {
      title: t('actions'), key: 'actions',
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
    { title: t('name'), dataIndex: 'name', key: 'name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Default Days', dataIndex: 'defaultDays', key: 'defaultDays' },
    { title: 'Carry Forward', dataIndex: 'carryForward', key: 'carryForward', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Paid', dataIndex: 'isPaid', key: 'isPaid', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><Title level={4} className="!mb-1">{t('leave_management')}</Title><Text type="secondary">{t('manage_leaves')}</Text></div>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'requests', label: `${t('leave_requests')} (${leaves.length})`,
          children: (
            <div className="space-y-4">
              <Row gutter={[16, 16]}>
                {stats.map((s, i) => (
                  <Col key={i} xs={24} sm={8}>
                    <Card bordered={false}>
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}><span style={{ color: s.color }}>{s.icon}</span></div>
                        <div><Text type="secondary" className="text-xs">{s.title}</Text><div className="text-2xl font-bold">{s.value}</div></div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Card bordered={false}>
                <Table columns={requestColumns} dataSource={leaves} loading={leavesLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
              </Card>
            </div>
          ),
        },
        {
          key: 'types', label: `Leave Types (${leaveTypes.length})`,
          children: (
            <Card bordered={false} extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/leaves/types/create')}>Add Type</Button>}>
              <Table columns={typeColumns} dataSource={leaveTypes} loading={typesLoading} rowKey={(r) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
            </Card>
          ),
        },
      ]} />

    </div>
  );
};

export default LeaveList;
