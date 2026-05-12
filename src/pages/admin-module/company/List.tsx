import React from 'react';
import { Card, Table, Button, Typography, Space, App, Tag, Popconfirm } from 'antd';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import companyService from '@/services/companyService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title } = Typography;

export default function CompanyList() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // Fetch all companies in the group (main + siblings)
  const { data, isLoading } = useQuery({
    queryKey: ['companies-group'],
    queryFn: () => companyService.getAll(),
  });

  const companies: any[] = (data as any)?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyService.delete(id),
    onSuccess: () => {
      message.success('Company deleted');
      queryClient.invalidateQueries({ queryKey: ['companies-group'] });
    },
    onError: (err: any) => {
      message.error(err?.message || 'Failed to delete company');
    },
  });

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
      render: (name: string, r: any) => (
        <Space>
          {name}
          {!r.parentCompany
            ? <Tag color="blue">Main</Tag>
            : <Tag color="purple">Sibling</Tag>}
        </Space>
      ),
    },
    {
      title: 'Short Name',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      title: 'Status',
      key: 'status',
      width: 90,
      render: (_: any, r: any) => (
        <Tag color={r.isActive === false ? 'red' : 'green'}>
          {r.isActive === false ? 'Inactive' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, r: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit size={15} />}
            onClick={() => navigate(`/admin-module/master/company/edit/${r._id}`)}
          />
          {/* Only sibling companies can be deleted by admin */}
          {r.parentCompany && (
            <Popconfirm
              title="Delete this sibling company?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteMutation.mutate(r._id)}
            >
              <Button
                type="text"
                danger
                icon={<Trash2 size={15} />}
                loading={deleteMutation.isPending}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Company List</Title>
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => navigate('/admin-module/master/company/add')}
        >
          Add Company
        </Button>
      </div>
      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={companies}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
