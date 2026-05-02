import { Card, Descriptions, Empty, Skeleton, Typography, Button, Space, Tag, Table } from 'antd';
import { ArrowLeft, Edit3 } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import companyService from '@/services/companyService';
import { useAppSelector } from '@/store';

const { Title, Text } = Typography;

function fmt(d: any) {
  return d ? dayjs(d).format('DD MMM YYYY') : '—';
}

export default function CompanyView() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const companyId = typeof user?.company === 'object' ? (user.company as any)?._id : user?.company;

  const { data, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getById(companyId as string),
    enabled: !!companyId,
  });

  const company: any = (data as any)?.data ?? data ?? null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <Empty description="Company not found" />
      </Card>
    );
  }

  const itReturns: any[] = company.itReturns ?? [];
  const documents: any[] = company.documents ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Title level={4} className="!mb-0.5">{company.name || 'Company'}</Title>
          <Text type="secondary" className="text-sm">
            {[company.code, company.address?.city, company.address?.country].filter(Boolean).join(' · ')}
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Edit3 size={14} />}
            onClick={() => navigate(`/admin-module/master/company/edit/${company._id || companyId}`)}
          >
            Edit
          </Button>
        </Space>
      </div>

      {/* Identity */}
      <Card title="Identity">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Name">{company.name || '—'}</Descriptions.Item>
          <Descriptions.Item label="Short Name">{company.code || '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={company.isActive === false ? 'red' : 'green'}>
              {company.isActive === false ? 'INACTIVE' : 'ACTIVE'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{company.email || '—'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{company.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Website">{company.website || '—'}</Descriptions.Item>
          <Descriptions.Item label="Industry">{company.industry || '—'}</Descriptions.Item>
          <Descriptions.Item label="Financial Year">{company.financialYear || '—'}</Descriptions.Item>
          <Descriptions.Item label="LUT Date">{fmt(company.lutDate)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Address */}
      <Card title="Address">
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Street">{company.address?.street || '—'}</Descriptions.Item>
          <Descriptions.Item label="City">{company.address?.city || '—'}</Descriptions.Item>
          <Descriptions.Item label="State">{company.address?.state || '—'}</Descriptions.Item>
          <Descriptions.Item label="Pincode">{company.address?.zipCode || '—'}</Descriptions.Item>
          <Descriptions.Item label="Country" span={2}>{company.address?.country || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tax info */}
      <Card title="Tax & Registration">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="GSTIN">{company.gstin || '—'}</Descriptions.Item>
          <Descriptions.Item label="PAN">{company.pan || '—'}</Descriptions.Item>
          <Descriptions.Item label="TAN">{company.tan || '—'}</Descriptions.Item>
          <Descriptions.Item label="CIN">{company.cin || '—'}</Descriptions.Item>
          <Descriptions.Item label="LIN">{company.lin || '—'}</Descriptions.Item>
          <Descriptions.Item label="Registration No.">{company.registrationNumber || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* IT returns */}
      <Card title={`IT Returns (${itReturns.length})`}>
        {itReturns.length === 0 ? (
          <Empty description="No IT return entries" />
        ) : (
          <Table
            size="small"
            pagination={false}
            dataSource={itReturns.map((r: any, i: number) => ({ ...r, key: r._id ?? i }))}
            columns={[
              { title: 'Year', dataIndex: 'financialYear', key: 'year' },
              { title: 'Filing Date', dataIndex: 'fillingDate', key: 'fillingDate', render: fmt },
              { title: 'Acknowledgement', dataIndex: 'acknowledgementNumber', key: 'ack' },
            ]}
          />
        )}
      </Card>

      {/* Documents */}
      <Card title={`Documents (${documents.length})`}>
        {documents.length === 0 ? (
          <Empty description="No documents" />
        ) : (
          <Table
            size="small"
            pagination={false}
            dataSource={documents.map((d: any, i: number) => ({ ...d, key: d._id ?? i }))}
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Type', dataIndex: 'type', key: 'type' },
              {
                title: 'File',
                dataIndex: 'url',
                key: 'url',
                render: (u?: string) =>
                  u ? <a href={u} target="_blank" rel="noreferrer">Open</a> : '—',
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
