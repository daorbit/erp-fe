import React, { useState } from 'react';
import { Card, Table, Button, Typography, Radio, Select, Input, Space, App } from 'antd';
import { Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const { Title } = Typography;

export default function SiteList() {
  const navigate = useNavigate();
  const [siteStatus, setSiteStatus] = useState<string>('all');
  const [lockStatus, setLockStatus] = useState<string>('all');
  const [division, setDivision] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['branches-list', siteStatus, lockStatus],
    queryFn: () => api.get('/branches', { limit: '200' }),
  });

  const allSites: any[] = data?.data ?? [];

  // Filter
  const filtered = allSites.filter((s) => {
    if (siteStatus === 'active' && !s.isActive) return false;
    if (siteStatus === 'inactive' && s.isActive) return false;
    if (lockStatus === 'locked' && !s.isLocked) return false;
    if (lockStatus === 'open' && s.isLocked) return false;
    if (division !== 'all' && s.division !== division) return false;
    return true;
  });

  // Collect unique divisions for dropdown
  const divisions = [...new Set(allSites.map((s) => s.division).filter(Boolean))];

  const columns = [
    { title: 'SrNo.', key: 'sr', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    { title: 'Company Name', key: 'company', render: (_: any, r: any) => typeof r.company === 'object' ? r.company?.name : '' },
    { title: 'Site Type', dataIndex: 'siteType', key: 'siteType', width: 80 },
    { title: 'Project Type', dataIndex: 'projectType', key: 'projectType', width: 100 },
    { title: 'Short Name', dataIndex: 'code', key: 'code', width: 90 },
    { title: 'Site Name', dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || '') },
    { title: 'Address / City', key: 'addr', render: (_: any, r: any) => [r.address01, r.city].filter(Boolean).join(', ') || '-' },
    { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contact', width: 140 },
    { title: 'Division Name', dataIndex: 'division', key: 'div', width: 130 },
    { title: 'State Name', dataIndex: 'stateName', key: 'state', width: 110 },
    { title: 'Tin No.', dataIndex: 'tinNo', key: 'tin', width: 90 },
    {
      title: 'Edit', key: 'edit', width: 50,
      render: (_: any, r: any) => (
        <Button type="text" size="small" icon={<Edit size={14} />}
          onClick={() => navigate(`/admin-module/master/site/edit/${r._id}`)} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Site / Plant / Project List</Title>
        <Button icon={<Plus size={14} />} onClick={() => navigate('/admin-module/master/site/add')}>Add</Button>
      </div>

      {/* Filters */}
      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Site Status</span>
            <Radio.Group size="small" value={siteStatus} onChange={(e) => setSiteStatus(e.target.value)}>
              <Radio value="active">Active</Radio>
              <Radio value="inactive">Inactive</Radio>
              <Radio value="all">ALL</Radio>
            </Radio.Group>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Site Lock Status</span>
            <Radio.Group size="small" value={lockStatus} onChange={(e) => setLockStatus(e.target.value)}>
              <Radio value="locked">Locked</Radio>
              <Radio value="open">Open</Radio>
              <Radio value="all">ALL</Radio>
            </Radio.Group>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Division</span>
            <Select size="small" value={division} onChange={setDivision} style={{ width: 180 }}
              options={[{ value: 'all', label: 'ALL' }, ...divisions.map((d) => ({ value: d, label: d }))]} />
          </div>
          <Space>
            <Button type="primary" danger size="small" onClick={() => refetch()}>Search</Button>
            <Button danger size="small" onClick={() => navigate('/admin-module/master/site/list')}>Close</Button>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
