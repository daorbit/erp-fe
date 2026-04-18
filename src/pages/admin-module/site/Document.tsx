import React, { useState } from 'react';
import { Card, Table, Button, Typography, Radio, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const { Title } = Typography;

export default function SiteDocument() {
  const navigate = useNavigate();
  const [siteStatus, setSiteStatus] = useState<string>('active');
  const [lockStatus, setLockStatus] = useState<string>('open');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['branches-documents', siteStatus, lockStatus],
    queryFn: () => api.get('/branches', { limit: '200' }),
  });

  const allSites: any[] = data?.data ?? [];

  const filtered = allSites.filter((s) => {
    if (siteStatus === 'active' && !s.isActive) return false;
    if (siteStatus === 'inactive' && s.isActive) return false;
    if (lockStatus === 'locked' && !s.isLocked) return false;
    if (lockStatus === 'open' && s.isLocked) return false;
    return true;
  });

  const columns = [
    { title: 'SrNo.', key: 'sr', width: 60, render: (_: any, __: any, i: number) => i + 1 },
    {
      title: 'Company Name', key: 'company',
      render: (_: any, r: any) => typeof r.company === 'object' ? r.company?.name : '',
    },
    { title: 'Site Name', dataIndex: 'name', key: 'name', sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || '') },
    {
      title: 'GST Detail', key: 'gst', width: 150,
      render: (_: any, r: any) => (r.gstEntries || []).map((g: any) => g.gstNumber).filter(Boolean).join(', ') || '-',
    },
    {
      title: 'Letter of Acceptance', key: 'loa', width: 180,
      render: (_: any, r: any) => r.loiLoaNo || '-',
    },
    {
      title: 'Tender', key: 'tender', width: 120,
      render: () => '-',
    },
  ];

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Site/Plant/Project - Document</Title>

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
          <Space>
            <Button type="primary" danger size="small" onClick={() => refetch()}>Search</Button>
            <Button danger size="small" onClick={() => navigate('/admin-module/master/site/list')}>Close</Button>
          </Space>
        </div>
      </Card>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
}
