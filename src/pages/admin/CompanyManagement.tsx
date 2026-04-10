import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Typography, Row, Col, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { useCompanyList, useDeleteCompany } from '@/hooks/queries/useCompanies';
import CompanyForm from './CompanyForm';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const CompanyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [search, setSearch] = useState('');
  const { message } = App.useApp();

  const { data: companyData, isLoading } = useCompanyList();
  const deleteMutation = useDeleteCompany();

  const companies: any[] = companyData?.data ?? [];
  const filtered = companies.filter(
    (c: any) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c: any) => c.isActive).length;
  const inactiveCompanies = totalCompanies - activeCompanies;

  const stats = [
    { title: t('total_companies'), value: totalCompanies, icon: <Building2 size={20} />, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: t('active'), value: activeCompanies, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'bg-green-50 dark:bg-green-950' },
    { title: t('inactive'), value: inactiveCompanies, icon: <XCircle size={20} />, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950' },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Company deactivated');
    } catch {
      message.error('Failed to deactivate company');
    }
  };

  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          {record.logo ? (
            <img src={record.logo} alt={name} className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Building2 size={16} className="text-blue-500" />
            </div>
          )}
          <div>
            <Text strong>{name}</Text>
            {record.industry && <div className="text-xs text-gray-500">{record.industry}</div>}
          </div>
        </div>
      ),
    },
    { title: t('company_code'), dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: t('email'), dataIndex: 'email', key: 'email' },
    { title: t('phone'), dataIndex: 'phone', key: 'phone', render: (p: string) => p || '-' },
    {
      title: t('status'),
      dataIndex: 'isActive',
      key: 'isActive',
      filters: [
        { text: t('active'), value: true },
        { text: t('inactive'), value: false },
      ],
      onFilter: (value: any, record: any) => record.isActive === value,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? t('active') : t('inactive')}</Tag>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 80,
      render: (_: any, r: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <Edit2 size={14} />,
                label: t('edit'),
                onClick: () => {
                  setEditRecord(r);
                  setDrawerOpen(true);
                },
              },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: t('deactivate'),
                danger: true,
                onClick: () => handleDelete(r._id || r.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">
            {t('company_management')}
          </Title>
          <Text type="secondary">{t('manage_companies')}</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditRecord(null);
            setDrawerOpen(true);
          }}
        >
          {t('add_company')}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card bordered={false}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">
                    {s.title}
                  </Text>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div className="mb-4">
          <Input
            prefix={<Search size={16} />}
            placeholder={t('search') + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            allowClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <CompanyForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditRecord(null);
        }}
        editData={editRecord}
      />
    </div>
  );
};

export default CompanyManagement;
