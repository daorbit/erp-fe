import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Typography, Checkbox, Select, Space, App, Popconfirm } from 'antd';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '@/services/api';

const { Title } = Typography;

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ userName: '', userType: undefined as any, active: true });

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.userName) params.userName = filters.userName;
      if (filters.userType) params.userType = filters.userType;
      if (filters.active) params.isActive = 'true';
      const res: any = await api.get('/auth/users', params);
      setUsers(res?.data ?? []);
    } catch (err: any) { message.error(err?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  // Initial load runs once with the default filters.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const name = (u.username || u.firstName || '').toLowerCase();
      if (filters.userName && !name.includes(filters.userName.toLowerCase())) return false;
      if (filters.userType && u.userType !== filters.userType) return false;
      if (filters.active && u.isActive === false) return false;
      return true;
    });
  }, [users, filters]);

  const columns = [
    { title: 'SNo.', render: (_: any, __: any, i: number) => i + 1, width: 70 },
    { title: 'User Name', render: (_: any, r: any) => r.username || `${r.firstName ?? ''} ${r.lastName ?? ''}` },
    { title: 'User Type', dataIndex: 'userType' },
    { title: 'Is Active', dataIndex: 'isActive', render: (v: boolean) => (v ? 'YES' : 'NO') },
    { title: 'HRM Rights', render: () => <Button type="link" size="small">View</Button> },
    {
      title: 'Edit', width: 70,
      render: (_: any, r: any) => <Button type="text" icon={<Edit2 size={14} />} onClick={() => navigate(`/master/user/edit/${r._id || r.id}`)} />,
    },
    {
      title: 'Del', width: 70,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete user?" onConfirm={async () => {
          try { await api.delete(`/auth/users/${r._id || r.id}`); message.success('Deleted'); load(); }
          catch (e: any) { message.error(e?.message || 'Failed'); }
        }}>
          <Button type="text" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">User List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/user/add')}>Add</Button>
      </div>
      <Card bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1">User Name</div>
            <Input value={filters.userName} onChange={(e) => setFilters({ ...filters, userName: e.target.value })} />
          </div>
          <div>
            <div className="text-xs mb-1">User Type</div>
            <Select allowClear className="w-full" value={filters.userType} onChange={(v) => setFilters({ ...filters, userType: v })}
              options={[{ value: 'super_admin', label: 'SUPERADMIN' }, { value: 'admin', label: 'ADMIN' }, { value: 'ho_user', label: 'HO-USER' }, { value: 'site_admin', label: 'SITE-ADMIN' }, { value: 'user', label: 'USER' }]} />
          </div>
          <div className="flex items-end gap-4">
            <Checkbox checked={filters.active} onChange={(e) => setFilters({ ...filters, active: e.target.checked })}>Active</Checkbox>
          </div>
        </div>
        <Space className="mb-4"><Button type="primary" onClick={load}>Show</Button><Button onClick={() => navigate('/master/user/add')}>Close</Button></Space>
        <Table columns={columns as any} dataSource={filtered} loading={loading} rowKey={(r: any) => r._id || r.id} size="small" bordered pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  );
};

export default UserList;
