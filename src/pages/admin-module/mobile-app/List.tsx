import React, { useMemo, useState } from 'react';
import { Card, Button, Typography, Input, Radio, Checkbox, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

const { Title } = Typography;

type FilterState = {
  name: string;
  userStatus: 'active' | 'inactive' | 'all';
  appAllow: 'active' | 'inactive' | 'all';
  userTypes: Record<string, boolean>;
};

const USER_TYPES = [
  { key: 'super_admin', label: 'SUPER ADMIN' },
  { key: 'admin', label: 'ADMIN' },
  { key: 'ho_user', label: 'HO-USER' },
  { key: 'user', label: 'USER' },
  { key: 'site_admin', label: 'SITE-ADMIN' },
];

export default function MobileAppCountList() {
  const navigate = useNavigate();

  const initial: FilterState = { name: '', userStatus: 'active', appAllow: 'active', userTypes: {} };
  const [draft, setDraft] = useState<FilterState>(initial);
  const [applied, setApplied] = useState<FilterState>(initial);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (applied.name) p.name = applied.name;
    if (applied.userStatus !== 'all') p.userStatus = applied.userStatus;
    if (applied.appAllow !== 'all') p.appAllow = applied.appAllow;
    return p;
  }, [applied]);

  const { data, isLoading } = useQuery({
    queryKey: ['mobile-app-count-users', params],
    queryFn: () => api.get('/mobile-app-counts/activation-users', params),
  });
  const users: any[] = ((data as any)?.data ?? []) as any[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">Mobile App Count List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/admin-module/master/mobile-app-count/add')}>
          Add
        </Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Name</span>
              <Input size="small" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Status</span>
              <Radio.Group size="small" value={draft.userStatus}
                onChange={(e) => setDraft({ ...draft, userStatus: e.target.value })}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">All</Radio>
              </Radio.Group>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">User Type</span>
              <div className="flex flex-wrap gap-3">
                {USER_TYPES.map((t) => (
                  <Checkbox
                    key={t.key}
                    checked={!!draft.userTypes[t.key]}
                    onChange={(e) => setDraft({
                      ...draft,
                      userTypes: { ...draft.userTypes, [t.key]: e.target.checked },
                    })}
                  >{t.label}</Checkbox>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <span className="text-xs font-medium text-right">App Allow</span>
              <Radio.Group size="small" value={draft.appAllow}
                onChange={(e) => setDraft({ ...draft, appAllow: e.target.value })}>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
                <Radio value="all">All</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => setApplied(draft)}>Search</Button>
          <Button danger onClick={() => navigate('/admin-module')}>Close</Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button danger icon={<FileSpreadsheet size={14} />}>Export To Excel</Button>
      </div>

      <Card bordered={false} className="!rounded-lg !shadow-sm">
        <Table
          dataSource={users}
          loading={isLoading}
          rowKey={(r: any) => r._id || r.id}
          size="small"
          pagination={{ pageSize: 20 }}
          columns={[
            { title: 'SrNo.', key: 'sr', width: 80, render: (_, __, i) => i + 1 },
            { title: 'User Name', dataIndex: 'userName', key: 'userName' },
            { title: 'Mobile No.', dataIndex: 'mobile', key: 'mobile', width: 160 },
            { title: 'App Type', dataIndex: 'appType', key: 'appType', width: 160,
              render: (v: string) => v ? v.replace(/_/g, ' ').toUpperCase() : '' },
            { title: 'Status', dataIndex: 'isActive', key: 'isActive', width: 110,
              render: (v: boolean) => v ? 'Active' : 'Inactive' },
          ]}
        />
      </Card>
    </div>
  );
}
