import React from 'react';
import { Card, Table, Button, Typography, Space, App } from 'antd';
import { Edit, Trash2, List as ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import companyService from '@/services/companyService';
import { useQuery } from '@tanstack/react-query';

const { Title } = Typography;

export default function CompanyList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const user = useAppSelector((s) => s.auth.user);

  // Company admin sees their own company; for now fetch via /companies/me
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyService.getMyCompany(),
  });

  const company = data?.data;
  const dataSource = company ? [company] : [];

  const columns = [
    {
      title: 'SrNo.',
      key: 'srno',
      width: 70,
      render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Short Name',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: 'Address',
      key: 'address',
      render: (_: any, r: any) => {
        const a = r.address;
        if (!a) return '-';
        return [a.street, a.city, a.state, a.country, a.zipCode].filter(Boolean).join(', ');
      },
    },
    {
      title: 'City',
      key: 'city',
      width: 120,
      render: (_: any, r: any) => r.address?.city || '-',
    },
    {
      title: 'Edit',
      key: 'edit',
      width: 60,
      render: (_: any, r: any) => (
        <Button
          type="text"
          icon={<Edit size={15} />}
          onClick={() => navigate(`/admin-module/master/company/edit/${r._id}`)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Company List</Title>
      </div>
      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
