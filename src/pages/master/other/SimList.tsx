import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Radio, DatePicker, App } from 'antd';
import { Plus, Trash2 } from 'lucide-react';
import { simHooks } from '@/hooks/queries/useMasterOther';
import { SIM_STATUS_LABELS } from '@/types/enums-sim';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const SimListPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [simStatus, setSimStatus] = useState<'all' | 'activated' | 'deactivated'>('all');
  const [purchaseRange, setPurchaseRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'allotted' | 'surrendered' | 'not_used'>('all');
  const [qMobile, setQMobile] = useState('');
  const [qSubscriber, setQSubscriber] = useState('');
  const [qPlan, setQPlan] = useState('');

  const { data, isLoading, refetch } = simHooks.useList({
    status: statusFilter === 'all' ? undefined : statusFilter,
    purchaseFrom: purchaseRange?.[0]?.toISOString(),
    purchaseTo: purchaseRange?.[1]?.toISOString(),
  });
  const del = simHooks.useDelete();

  const rows = useMemo(() => {
    const items = data?.data ?? [];
    return items.filter((r: any) => {
      if (qMobile && !r.simMobileNo?.toLowerCase().includes(qMobile.toLowerCase())) return false;
      if (qSubscriber && !r.subscriberName?.toLowerCase().includes(qSubscriber.toLowerCase())) return false;
      if (qPlan && !r.planTariff?.toLowerCase().includes(qPlan.toLowerCase())) return false;
      if (simStatus !== 'all') {
        const isActivated = r.status === 'allotted';
        if (simStatus === 'activated' && !isActivated) return false;
        if (simStatus === 'deactivated' && isActivated) return false;
      }
      return true;
    });
  }, [data, qMobile, qSubscriber, qPlan, simStatus]);

  const columns = [
    { title: 'SrNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Sim/Mobile No.', dataIndex: 'simMobileNo' },
    { title: 'Sim Serial No.', dataIndex: 'simSerialNo' },
    { title: 'Subscriber Name', dataIndex: 'subscriberName' },
    { title: 'Plan/Tariff', dataIndex: 'planTariff' },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      width: 140,
      render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Current Status',
      dataIndex: 'status',
      width: 140,
      render: (v: string) => SIM_STATUS_LABELS[v as keyof typeof SIM_STATUS_LABELS] || v,
    },
    {
      title: 'Del',
      width: 70,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={16} />}
          onClick={async () => {
            try {
              await del.mutateAsync(r._id || r.id);
              message.success('Deleted');
              refetch();
            } catch (err: any) {
              message.error(err?.message || 'Failed');
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Sim Number List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/other/sim/add')}>
          Add
        </Button>
      </div>
      <Card bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1">Mobile No.</div>
            <Input placeholder="Search Mobile" value={qMobile} onChange={(e) => setQMobile(e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Plan/Tariff</div>
            <Input placeholder="Search Plan" value={qPlan} onChange={(e) => setQPlan(e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Subscriber Name</div>
            <Input placeholder="Search Subscriber" value={qSubscriber} onChange={(e) => setQSubscriber(e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Purchase Date</div>
            <RangePicker
              value={purchaseRange as any}
              onChange={(r) => setPurchaseRange(r as any)}
              format="DD/MM/YYYY"
              className="w-full"
            />
          </div>
          <div>
            <div className="text-xs mb-1">Status</div>
            <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <Radio value="all">All</Radio>
              <Radio value="allotted">Allotted</Radio>
              <Radio value="surrendered">Surrendered</Radio>
              <Radio value="not_used">Not Used</Radio>
            </Radio.Group>
          </div>
          <div>
            <div className="text-xs mb-1">Sim Status</div>
            <Radio.Group value={simStatus} onChange={(e) => setSimStatus(e.target.value)}>
              <Radio value="all">All</Radio>
              <Radio value="activated">Activated</Radio>
              <Radio value="deactivated">Deactivated</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Button type="primary" onClick={() => refetch()}>Search</Button>
          <Button onClick={() => navigate('/master/other/sim/add')}>Close</Button>
        </div>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small"
          bordered
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default SimListPage;
