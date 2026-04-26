import React from 'react';
import { Card, Typography, Table, Button } from 'antd';
import { Printer } from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const { Title } = Typography;

export default function CompanyReport() {
  const { data: companiesData } = useQuery({
    queryKey: ['companies-list-min'],
    queryFn: () => api.get('/companies', { limit: '200' }),
  });
  const { data: gstData } = useQuery({
    queryKey: ['company-gsts-list'],
    queryFn: () => api.get('/company-gsts', { limit: '500' }),
  });
  const companies: any[] = ((companiesData as any)?.data ?? []) as any[];
  const gsts: any[] = ((gstData as any)?.data ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Company Report</Title>
        <Button danger icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <div className="text-center mb-4">
          <div className="font-bold text-lg">Company List</div>
          <div className="text-xs">Date: {dayjs().format('DD-MM-YYYY')}</div>
        </div>

        {companies.map((c) => {
          const cGsts = gsts.filter((g) => {
            const cid = typeof g.company === 'object' ? g.company?._id : g.company;
            return cid === (c._id || c.id);
          });
          return (
            <div key={c._id || c.id} className="mb-6">
              <Table
                size="small"
                pagination={false}
                bordered
                dataSource={[c]}
                rowKey={(r) => r._id || r.id}
                columns={[
                  { title: 'S.No.', key: 'sr', width: 60, render: () => 1 },
                  { title: 'Company Name', dataIndex: 'name', key: 'name' },
                  { title: 'Short Name', dataIndex: 'code', key: 'code', width: 110 },
                  { title: 'Address', key: 'address',
                    render: (_, r: any) => [r.addressLine1 || r.address1, r.city].filter(Boolean).join(', ') },
                  { title: 'Contact No.', dataIndex: 'phone', key: 'phone', width: 140 },
                  { title: 'TIN No.', dataIndex: 'tinNo', key: 'tin', width: 110 },
                  { title: 'PAN No.', dataIndex: 'panNo', key: 'pan', width: 110 },
                  { title: 'TAN No.', dataIndex: 'tanNo', key: 'tan', width: 110 },
                  { title: 'ST No.', dataIndex: 'stNo', key: 'st', width: 110 },
                ]}
              />
              {cGsts.length > 0 && (
                <Table
                  size="small"
                  pagination={false}
                  bordered
                  dataSource={cGsts}
                  rowKey={(r) => r._id || r.id}
                  columns={[
                    { title: 'State Name', dataIndex: 'state', key: 'state', width: 240 },
                    { title: 'GST No.', dataIndex: 'gstNumber', key: 'gst' },
                  ]}
                />
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
