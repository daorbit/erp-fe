import React, { useEffect, useState } from 'react';
import { Card, Form, Select, Button, Space, Typography, Table, InputNumber, App } from 'antd';
import api from '@/services/api';
import { useDayAuthorization, useSaveDayAuthorization } from '@/hooks/queries/usePhase2';

const { Title } = Typography;

const DayAuthorizationPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [rows, setRows] = useState<any[]>([]);
  const { message } = App.useApp();

  const { data, isLoading, refetch } = useDayAuthorization(userId);
  const save = useSaveDayAuthorization();

  useEffect(() => {
    api.get<any>('/auth/users').then((res) => setUsers(res?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    setRows(data?.data ?? []);
  }, [data]);

  const setCell = (i: number, field: 'addLimit' | 'editLimit' | 'deleteLimit', value: number) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    if (!userId) { message.error('Pick a user'); return; }
    try {
      await save.mutateAsync({ user: userId, rows });
      message.success('Day authorization saved');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  const columns = [
    { title: 'SrNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'Module Name', dataIndex: 'moduleName' },
    { title: 'Entity Name', dataIndex: 'entityName' },
    {
      title: 'Add', dataIndex: 'addLimit', width: 120,
      render: (v: number, _: any, i: number) => (
        <InputNumber value={v} onChange={(x) => setCell(i, 'addLimit', x ?? 0)} />
      ),
    },
    {
      title: 'Edit', dataIndex: 'editLimit', width: 120,
      render: (v: number, _: any, i: number) => (
        <InputNumber value={v} onChange={(x) => setCell(i, 'editLimit', x ?? 0)} />
      ),
    },
    {
      title: 'Delete', dataIndex: 'deleteLimit', width: 120,
      render: (v: number, _: any, i: number) => (
        <InputNumber value={v} onChange={(x) => setCell(i, 'deleteLimit', x ?? 0)} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Day Authorization</Title>
      </div>
      <Card bordered={false}>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm">User Name *</div>
          <Select className="w-96" placeholder="Please Select" value={userId} onChange={setUserId} showSearch optionFilterProp="label"
            options={users.map((u) => ({ value: u._id || u.id, label: `${u.username || u.firstName || ''} (${u.userType ?? ''})` }))} />
          <Button type="primary" onClick={() => refetch()}>Show</Button>
          <Button onClick={() => { setUserId(undefined); setRows([]); }}>Close</Button>
        </div>
        {userId && (
          <>
            <div className="mb-2 text-sm">
              <span className="font-semibold">User Name: </span>
              {users.find((u) => (u._id || u.id) === userId)?.username}
            </div>
            <Table columns={columns as any} dataSource={rows} rowKey={(r: any, i?: number) => `${r.moduleName}::${r.entityName}::${i ?? 0}`}
              loading={isLoading} size="small" bordered pagination={false} />
            <div className="flex justify-center mt-4">
              <Space>
                <Button type="primary" onClick={handleSave} loading={save.isPending}>Save</Button>
              </Space>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default DayAuthorizationPage;
