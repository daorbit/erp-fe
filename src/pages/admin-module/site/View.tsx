import React, { useMemo, useState } from 'react';
import {
  Card, Descriptions, Skeleton, Tag, Typography, Button, Space, Empty, Table,
  Drawer, Checkbox, Input, App, Popconfirm,
} from 'antd';
import { ArrowLeft, Edit3, BarChart2, FileText, UserPlus, Trash2, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useBranch } from '@/hooks/queries/useBranches';
import { useEmployeeList, employeeKeys } from '@/hooks/queries/useEmployees';
import api from '@/services/api';

const { Title, Text } = Typography;

function fmtDate(d: any) {
  return d ? dayjs(d).format('DD MMM YYYY') : '—';
}

function YesNo({ value }: { value?: boolean }) {
  return value ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>;
}

export default function SiteView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { data, isLoading } = useBranch(id || '');
  const site: any = (data as any)?.data ?? data ?? null;

  // Pull all employees for the company; assignment is derived from each
  // employee's user.allowedBranches in-memory.
  const { data: employeesData, isLoading: employeesLoading } = useEmployeeList({ limit: '1000' });
  const employees: any[] = (employeesData as any)?.data ?? [];

  const siteId = site?._id || id || '';
  const { assigned, unassigned } = useMemo(() => {
    const a: any[] = [];
    const u: any[] = [];
    for (const emp of employees) {
      const branches: any[] = emp.userId?.allowedBranches ?? [];
      const ids = branches.map((b: any) => String(b?._id ?? b));
      if (ids.includes(String(siteId))) a.push(emp);
      else u.push(emp);
    }
    return { assigned: a, unassigned: u };
  }, [employees, siteId]);

  // Assign drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredUnassigned = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return unassigned;
    return unassigned.filter((emp: any) => {
      const u = emp.userId ?? {};
      const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim().toLowerCase();
      return (
        name.includes(s) ||
        (emp.employeeId ?? '').toLowerCase().includes(s) ||
        (u.email ?? '').toLowerCase().includes(s)
      );
    });
  }, [unassigned, search]);

  const updateUserBranches = async (userId: string, branchIds: string[]) => {
    await api.put<any>(`/auth/users/${userId}`, { allowedBranches: branchIds });
  };

  const refreshEmployees = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });

  const handleAssign = async () => {
    if (pickedIds.length === 0) {
      setDrawerOpen(false);
      return;
    }
    setSaving(true);
    try {
      const targets = unassigned.filter((e: any) => pickedIds.includes(String(e._id)));
      await Promise.all(
        targets.map((emp: any) => {
          const userId = emp.userId?._id;
          if (!userId) return Promise.resolve();
          const current: string[] = (emp.userId?.allowedBranches ?? []).map((b: any) =>
            String(b?._id ?? b),
          );
          const next = Array.from(new Set([...current, String(siteId)]));
          return updateUserBranches(String(userId), next);
        }),
      );
      message.success(`Assigned ${targets.length} employee(s) to this site`);
      setPickedIds([]);
      setDrawerOpen(false);
      void refreshEmployees();
    } catch (err: any) {
      message.error(err?.message || 'Failed to assign employees');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (emp: any) => {
    const userId = emp.userId?._id;
    if (!userId) return;
    try {
      const current: string[] = (emp.userId?.allowedBranches ?? []).map((b: any) =>
        String(b?._id ?? b),
      );
      const next = current.filter((bid) => bid !== String(siteId));
      await updateUserBranches(String(userId), next);
      message.success('Employee removed from this site');
      void refreshEmployees();
    } catch (err: any) {
      message.error(err?.message || 'Failed to remove employee');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!site) {
    return (
      <Card>
        <Empty description="Site not found" />
      </Card>
    );
  }

  const gstEntries: any[] = site.gstEntries ?? [];

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
          <Title level={4} className="!mb-0.5">{site.name || 'Site Details'}</Title>
          <Text type="secondary" className="text-sm">
            {[site.code, site.siteType?.toUpperCase(), site.division].filter(Boolean).join(' · ')}
          </Text>
        </div>
        <Space>
          <Button
            icon={<BarChart2 size={14} />}
            onClick={() => navigate(`/shift-sessions/report?site=${site._id || id}`)}
          >
            Shift Report
          </Button>
          <Button
            icon={<FileText size={14} />}
            onClick={() => navigate(`/admin-module/master/site/document?id=${site._id || id}`)}
          >
            Documents
          </Button>
          <Button
            type="primary"
            icon={<Edit3 size={14} />}
            onClick={() => navigate(`/admin-module/master/site/edit/${site._id || id}`)}
          >
            Edit
          </Button>
        </Space>
      </div>

      {/* Identity */}
      <Card title="Identity">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Site Name">{site.name || '—'}</Descriptions.Item>
          <Descriptions.Item label="Short Name">{site.code || '—'}</Descriptions.Item>
          <Descriptions.Item label="Site Type">
            {site.siteType ? <Tag>{String(site.siteType).toUpperCase()}</Tag> : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Project Type">{site.projectType || '—'}</Descriptions.Item>
          <Descriptions.Item label="Department Type">{site.departmentType || '—'}</Descriptions.Item>
          <Descriptions.Item label="Division">{site.division || '—'}</Descriptions.Item>
          <Descriptions.Item label="Is HO"><YesNo value={site.isHO} /></Descriptions.Item>
          <Descriptions.Item label="Locked"><YesNo value={site.isLocked} /></Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={site.isActive === false ? 'red' : 'green'}>
              {site.isActive === false ? 'INACTIVE' : 'ACTIVE'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Address */}
      <Card title="Address">
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Address Line 1">{site.address01 || '—'}</Descriptions.Item>
          <Descriptions.Item label="Address Line 2">{site.address02 || '—'}</Descriptions.Item>
          <Descriptions.Item label="Address Line 3">{site.address03 || '—'}</Descriptions.Item>
          <Descriptions.Item label="City">{site.city || '—'}</Descriptions.Item>
          <Descriptions.Item label="State">{site.stateName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Pincode">{site.pincode || '—'}</Descriptions.Item>
          <Descriptions.Item label="Latitude">{site.latitude ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Longitude">{site.longitude ?? '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Contact */}
      <Card title="Contact">
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Contact Person">{site.contactPerson || '—'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{site.phone || site.contactPhone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Email">{site.email || site.contactEmail || '—'}</Descriptions.Item>
          <Descriptions.Item label="Order No.">{site.orderNo ?? '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Dates */}
      <Card title="Important Dates">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }} size="small">
          <Descriptions.Item label="Start Date">{fmtDate(site.startDate)}</Descriptions.Item>
          <Descriptions.Item label="LOI/LOA Date">{fmtDate(site.loiLoaDate)}</Descriptions.Item>
          <Descriptions.Item label="Agreement Date">{fmtDate(site.agreementDate)}</Descriptions.Item>
          <Descriptions.Item label="Tender Date">{fmtDate(site.tenderDate)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Employees assigned to this site */}
      <Card
        title={`Assigned Employees (${assigned.length})`}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<UserPlus size={14} />}
            onClick={() => { setSearch(''); setPickedIds([]); setDrawerOpen(true); }}
          >
            Assign Employees
          </Button>
        }
      >
        <Table
          size="small"
          loading={employeesLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} employees` }}
          dataSource={assigned}
          rowKey="_id"
          locale={{ emptyText: 'No employees assigned to this site yet' }}
          columns={[
            {
              title: 'Employee',
              key: 'employee',
              render: (_: unknown, emp: any) => {
                const u = emp.userId ?? {};
                const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—';
                return (
                  <div className="leading-tight">
                    <div className="font-medium">{name}</div>
                    <Text type="secondary" className="text-xs">
                      {[emp.employeeId, u.email].filter(Boolean).join(' · ')}
                    </Text>
                  </div>
                );
              },
            },
            {
              title: 'Department',
              key: 'department',
              render: (_: unknown, emp: any) => emp.department?.name || '—',
            },
            {
              title: 'Designation',
              key: 'designation',
              render: (_: unknown, emp: any) => emp.designation?.name || '—',
            },
            {
              title: '',
              key: 'remove',
              width: 90,
              render: (_: unknown, emp: any) => (
                <Popconfirm
                  title="Remove from site?"
                  description="The employee will no longer be able to start a shift at this site."
                  okText="Remove"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleRemove(emp)}
                >
                  <Button type="text" size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>

      {/* GST entries */}
      <Card title={`GST Entries (${gstEntries.length})`}>
        {gstEntries.length === 0 ? (
          <Empty description="No GST entries" />
        ) : (
          <Table
            size="small"
            pagination={false}
            dataSource={gstEntries.map((g: any, i: number) => ({ ...g, key: g._id ?? i }))}
            columns={[
              { title: 'GSTIN', dataIndex: 'gstin', key: 'gstin' },
              { title: 'State', dataIndex: 'stateName', key: 'stateName' },
              { title: 'TIN', dataIndex: 'tin', key: 'tin' },
              { title: 'Effective From', dataIndex: 'effectiveFrom', key: 'effectiveFrom', render: fmtDate },
            ]}
          />
        )}
      </Card>

      {/* Assign-employees drawer */}
      <Drawer
        title="Assign Employees"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={460}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" loading={saving} disabled={pickedIds.length === 0} onClick={handleAssign}>
              Assign{pickedIds.length > 0 ? ` (${pickedIds.length})` : ''}
            </Button>
          </Space>
        }
      >
        <Input
          placeholder="Search by name, code, or email"
          prefix={<Search size={14} className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="mb-3"
        />
        {filteredUnassigned.length === 0 ? (
          <Empty description={search ? 'No matches' : 'All employees are already assigned'} />
        ) : (
          <Checkbox.Group
            value={pickedIds}
            onChange={(v) => setPickedIds(v as string[])}
            className="block"
          >
            <div className="space-y-1.5">
              {filteredUnassigned.map((emp: any) => {
                const u = emp.userId ?? {};
                const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || '—';
                return (
                  <label
                    key={emp._id}
                    className="flex items-start gap-2 p-2 rounded-lg
                      hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    <Checkbox value={String(emp._id)} className="mt-0.5" />
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xs text-gray-500">
                        {[emp.employeeId, u.email].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Checkbox.Group>
        )}
      </Drawer>
    </div>
  );
}
