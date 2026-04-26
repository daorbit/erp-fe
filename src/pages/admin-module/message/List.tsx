import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Typography, DatePicker, Input, Tag, App, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Paperclip } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { manageMessageHooks } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

type FilterState = {
  dateFrom: Dayjs;
  dateTo: Dayjs;
  title: string;
};

export default function MessageFromMngList() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const today = dayjs();
  const [draft, setDraft] = useState<FilterState>({ dateFrom: today, dateTo: today, title: '' });
  const [applied, setApplied] = useState<FilterState>({ dateFrom: today, dateTo: today, title: '' });
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = manageMessageHooks.useList({ limit: '500' });
  const allMessages: any[] = ((data as any)?.data ?? []) as any[];

  const deleteMutation = manageMessageHooks.useDelete();

  const filtered = useMemo(() => {
    return allMessages.filter((m) => {
      const d = dayjs(m.date);
      if (applied.dateFrom && d.isBefore(applied.dateFrom.startOf('day'))) return false;
      if (applied.dateTo && d.isAfter(applied.dateTo.endOf('day'))) return false;
      if (applied.title && !String(m.title || '').toLowerCase().includes(applied.title.toLowerCase())) return false;

      for (const [k, v] of Object.entries(colFilters)) {
        if (!v) continue;
        const val = (() => {
          switch (k) {
            case 'title': return m.title;
            case 'message': return m.description;
            case 'date': return dayjs(m.date).format('DD/MM/YYYY');
            case 'status': return m.isActive ? 'Active' : 'Inactive';
            case 'attachment': return m.attachmentUrl ? 'Yes' : 'No';
            default: return '';
          }
        })();
        if (!String(val ?? '').toLowerCase().includes(v.toLowerCase())) return false;
      }
      return true;
    });
  }, [allMessages, applied, colFilters]);

  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Message deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      title: <div><div>SrNo.</div>{filterCell('sr')}</div>,
      key: 'sr', width: 80, render: (_: any, __: any, i: number) => i + 1,
    },
    {
      title: <div><div>Message Title</div>{filterCell('title')}</div>,
      dataIndex: 'title', key: 'title',
      sorter: (a: any, b: any) => (a.title || '').localeCompare(b.title || ''),
    },
    {
      title: <div><div>Message</div>{filterCell('message')}</div>,
      dataIndex: 'description', key: 'message',
      render: (v: string) => <span className="line-clamp-2">{v}</span>,
    },
    {
      title: <div><div>Message Date</div>{filterCell('date')}</div>,
      dataIndex: 'date', key: 'date', width: 140,
      sorter: (a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: <div><div>Status</div>{filterCell('status')}</div>,
      dataIndex: 'isActive', key: 'status', width: 110,
      render: (v: boolean) => v
        ? <Tag color="green">Active</Tag>
        : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Attachment', key: 'attachment', width: 110,
      render: (_: any, r: any) => r.attachmentUrl
        ? <a href={r.attachmentUrl} target="_blank" rel="noreferrer"><Paperclip size={14} /></a>
        : '-',
    },
    {
      title: 'Edit', key: 'edit', width: 60,
      render: (_: any, r: any) => (
        <Button type="text" size="small" icon={<Edit size={14} />}
          onClick={() => navigate(`/admin-module/master/message-from-mng/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Delete', key: 'delete', width: 70,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this message?" onConfirm={() => handleDelete(r._id || r.id)}>
          <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Message From Management List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/admin-module/master/message-from-mng/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-20 text-right">Date From</span>
            <DatePicker size="small" format="DD/MM/YYYY" value={draft.dateFrom}
              onChange={(d) => setDraft((p) => ({ ...p, dateFrom: d || dayjs() }))} />
            <span className="text-xs font-medium">To</span>
            <DatePicker size="small" format="DD/MM/YYYY" value={draft.dateTo}
              onChange={(d) => setDraft((p) => ({ ...p, dateTo: d || dayjs() }))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-20 text-right">Title Name</span>
            <Input size="small" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => { setApplied(draft); refetch(); }}>Search</Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
