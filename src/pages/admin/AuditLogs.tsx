import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Input, Select, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Search, Activity, Shield } from 'lucide-react';
import auditService from '@/services/auditService';
import { useTranslation } from '@/hooks/useTranslation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const actionColor: Record<string, string> = {
  create: 'green', update: 'blue', delete: 'red', login: 'purple',
};

const moduleOptions = [
  'auth', 'employees', 'departments', 'designations', 'attendance',
  'payroll', 'recruitment',
  'onboarding', 'invitations', 'companies',
].map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }));

const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string | undefined>();
  const [actionFilter, setActionFilter] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, moduleFilter, actionFilter],
    queryFn: () => auditService.getAll({
      page: String(page),
      limit: '25',
      ...(search ? { search } : {}),
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(actionFilter ? { action: actionFilter } : {}),
    }),
  });

  const logs: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      title: 'Time', dataIndex: 'createdAt', key: 'time', width: 160,
      render: (d: string) => (
        <div>
          <div className="text-xs font-medium">{dayjs(d).format('MMM D, YYYY')}</div>
          <div className="text-xs text-gray-400">{dayjs(d).format('h:mm:ss A')}</div>
        </div>
      ),
    },
    {
      title: 'User', key: 'user', width: 180,
      render: (_: any, r: any) => (
        <div>
          <div className="text-sm font-medium">{r.userEmail || '-'}</div>
          <div className="text-xs text-gray-400">{r.userRole || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Action', dataIndex: 'action', key: 'action', width: 100,
      render: (a: string) => <Tag color={actionColor[a] || 'default'}>{a}</Tag>,
    },
    {
      title: 'Module', dataIndex: 'module', key: 'module', width: 120,
      render: (m: string) => <Tag>{m}</Tag>,
    },
    {
      title: 'Description', dataIndex: 'description', key: 'description',
      render: (d: string) => <Text className="text-sm">{d}</Text>,
    },
    {
      title: 'Method', dataIndex: 'method', key: 'method', width: 80,
      render: (m: string) => {
        const colors: Record<string, string> = { POST: 'green', PUT: 'blue', PATCH: 'orange', DELETE: 'red' };
        return <Tag color={colors[m] || 'default'} className="font-mono text-xs">{m}</Tag>;
      },
    },
    {
      title: 'Status', dataIndex: 'statusCode', key: 'statusCode', width: 80,
      render: (s: number) => <Tag color={s < 400 ? 'green' : s < 500 ? 'orange' : 'red'}>{s}</Tag>,
    },
    {
      title: 'IP', dataIndex: 'ip', key: 'ip', width: 120,
      render: (ip: string) => <Text className="text-xs font-mono text-gray-400">{ip || '-'}</Text>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Activity size={20} className="text-indigo-500" />
          </div>
          <div>
            <Title level={4} className="!mb-0">Audit Logs</Title>
            <Text type="secondary">Track all actions across the platform</Text>
          </div>
        </div>
      </div>

      <Card bordered={false}>
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
            allowClear
          />
          <Select
            placeholder="All modules"
            allowClear
            value={moduleFilter}
            onChange={(v) => { setModuleFilter(v); setPage(1); }}
            options={moduleOptions}
            className="min-w-[150px]"
          />
          <Select
            placeholder="All actions"
            allowClear
            value={actionFilter}
            onChange={(v) => { setActionFilter(v); setPage(1); }}
            options={[
              { value: 'create', label: 'Create' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
            ]}
            className="min-w-[130px]"
          />
        </div>
        <Table
          columns={columns}
          dataSource={logs}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: 25,
            total: pagination?.total || 0,
            onChange: (p) => setPage(p),
            showTotal: (total) => `${total} logs`,
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogs;
