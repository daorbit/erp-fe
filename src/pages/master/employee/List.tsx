import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Input, Typography, Radio, Select, DatePicker, Space, App, Popconfirm,
} from 'antd';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import employeeService from '@/services/employeeService';
import { useEmployeeList, useDeleteEmployee } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useEmployeeGroupList } from '@/hooks/queries/useEmployeeGroups';
import { tagHooks, levelHooks, gradeHooks } from '@/hooks/queries/useMasterOther';
import dayjs from 'dayjs';

const { Title } = Typography;

// Big filter panel → results table matching the NwayERP screenshot.
const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [filters, setFilters] = useState({
    employeeName: '', employeeCode: '', workId: '',
    department: undefined as any, designation: undefined as any,
    levelName: undefined as any, gradeName: undefined as any,
    tagName: undefined as any, employeeGroup: undefined as any,
    aadhaarNo: '', remark: '',
    status: 'active' as 'active' | 'in_active' | 'all',
    documentUpload: 'both' as 'have' | 'not_attach' | 'both',
    vaccineStatus: 'all' as 'partially' | 'fully' | 'not_vaccinated' | 'all',
    employeeSignature: 'both' as 'have' | 'not_attach' | 'both',
    employeePhoto: 'both' as 'have' | 'not_attach' | 'both',
    dojDate: null as dayjs.Dayjs | null,
    dojCheck: false,
    rejoin: false,
  });

  const query: Record<string, string> = {};
  if (filters.department) query.department = filters.department;
  if (filters.designation) query.designation = filters.designation;
  if (filters.employeeGroup) query.employeeGroup = filters.employeeGroup;
  if (filters.status === 'active') query.isActive = 'true';
  else if (filters.status === 'in_active') query.isActive = 'false';

  const { data, isLoading, refetch } = useEmployeeList(query);
  const del = useDeleteEmployee();
  const { data: depts } = useDepartmentList();
  const { data: desigs } = useDesignationList();
  const { data: groups } = useEmployeeGroupList();
  const { data: tags } = tagHooks.useList();
  const { data: levels } = levelHooks.useList();
  const { data: grades } = gradeHooks.useList();

  const setF = <K extends keyof typeof filters>(k: K, v: (typeof filters)[K]) =>
    setFilters((p) => ({ ...p, [k]: v }));

  const items = useMemo(() => {
    const list = data?.data ?? [];
    return list.filter((e: any) => {
      if (filters.employeeName) {
        const name = `${e.userId?.firstName ?? e.firstName ?? ''} ${e.userId?.lastName ?? e.lastName ?? ''}`.toLowerCase();
        if (!name.includes(filters.employeeName.toLowerCase())) return false;
      }
      if (filters.employeeCode && !(e.employeeId ?? '').includes(filters.employeeCode)) return false;
      if (filters.workId && !(e.workId ?? '').includes(filters.workId)) return false;
      if (filters.aadhaarNo && !(e.identityDocs?.aadhaarNumber ?? '').includes(filters.aadhaarNo)) return false;
      if (filters.remark && !(e.empRemark ?? '').toLowerCase().includes(filters.remark.toLowerCase())) return false;
      return true;
    });
  }, [data, filters]);

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));

  const columns = [
    { title: 'Sr.No.', render: (_: any, __: any, i: number) => i + 1, width: 70, fixed: 'left' as const },
    { title: 'Code', dataIndex: 'employeeId', width: 120, fixed: 'left' as const },
    {
      title: 'Employee Name', width: 180, fixed: 'left' as const,
      render: (_: any, r: any) => `${r.userId?.firstName ?? r.firstName ?? ''} ${r.userId?.lastName ?? r.lastName ?? ''}`.trim(),
    },
    {
      title: 'Joining Date', width: 120,
      render: (_: any, r: any) => r.joinDate ? dayjs(r.joinDate).format('DD/MM/YYYY') : '—',
    },
    {
      title: 'Company', width: 150,
      render: (_: any, r: any) => (typeof r.company === 'object' ? r.company?.name : null) || '—',
    },
    {
      title: 'Branch', width: 150,
      render: (_: any, r: any) => (typeof r.branch === 'object' ? r.branch?.name : null) || '—',
    },
    {
      title: 'Department', width: 150,
      render: (_: any, r: any) => (typeof r.department === 'object' ? r.department?.name : null) || '—',
    },
    {
      title: 'Designation', width: 150,
      render: (_: any, r: any) => (typeof r.designation === 'object' ? r.designation?.name : null) || '—',
    },
    {
      title: 'Level', width: 120,
      render: (_: any, r: any) => (typeof r.level === 'object' ? r.level?.name : null) || '—',
    },
    {
      title: 'Grade', width: 120,
      render: (_: any, r: any) => (typeof r.grade === 'object' ? r.grade?.name : null) || '—',
    },
    {
      title: 'Employee Group', width: 150,
      render: (_: any, r: any) => (typeof r.employeeGroup === 'object' ? r.employeeGroup?.name : null) || '—',
    },
    { title: 'Shift', width: 100, render: (_: any, r: any) => (typeof r.shift === 'object' ? r.shift?.name : r.workShift) || '—' },
    { title: 'Father/Husband', dataIndex: 'fatherName', width: 150, render: (v: any) => v || '—' },
    {
      title: 'Date of Birth', width: 120,
      render: (_: any, r: any) => r.dateOfBirth ? dayjs(r.dateOfBirth).format('DD/MM/YYYY') : '—',
    },
    { title: 'Mobile No.', dataIndex: 'mobileNo', width: 130, render: (v: any) => v || '—' },
    { title: 'Email', width: 180, render: (_: any, r: any) => r.userId?.email || r.email || '—' },
    {
      title: 'Aadhaar No.', width: 140,
      render: (_: any, r: any) => r.identityDocs?.aadhaarNumber || '—',
    },
    {
      title: 'Present Address', width: 200, ellipsis: true,
      render: (_: any, r: any) => r.currentAddress?.street || '—',
    },
    { title: 'Bank Name', dataIndex: 'employeeBankName', width: 150, render: (v: any) => v || '—' },
    { title: 'Bank Acc No.', dataIndex: 'employeeBankAccNo', width: 150, render: (v: any) => v || '—' },
    { title: 'IFSC Code', dataIndex: 'ifscCode', width: 120, render: (v: any) => v || '—' },
    {
      title: 'View', width: 60, align: 'center' as const, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Eye size={16} />} onClick={() => navigate(`/master/employee/view/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Edit', width: 60, align: 'center' as const, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Button type="text" icon={<Edit2 size={16} />} onClick={() => navigate(`/master/employee/edit/${r._id || r.id}`)} />
      ),
    },
    {
      title: 'Del', width: 60, align: 'center' as const, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Delete this employee?" okText="Delete" okButtonProps={{ danger: true }}
          onConfirm={async () => {
            try { await del.mutateAsync(r._id || r.id); message.success('Deleted'); }
            catch (e: any) { message.error(e?.message || 'Failed'); }
          }}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">Employee List</Title>
        <Button type="link" icon={<Plus size={14} />} onClick={() => navigate('/master/employee/add')}>Add</Button>
      </div>

      <Card bordered={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1">Employee Name</div>
            <Input placeholder="Name" value={filters.employeeName} onChange={(e) => setF('employeeName', e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Employee Code</div>
            <Input value={filters.employeeCode} onChange={(e) => setF('employeeCode', e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Work ID</div>
            <Input value={filters.workId} onChange={(e) => setF('workId', e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Aadhaar No.</div>
            <Input value={filters.aadhaarNo} onChange={(e) => setF('aadhaarNo', e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Department</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.department} onChange={(v) => setF('department', v)} options={opts(depts?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Designation</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.designation} onChange={(v) => setF('designation', v)} options={opts(desigs?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Level Name</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.levelName} onChange={(v) => setF('levelName', v)} options={opts(levels?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Grade Name</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.gradeName} onChange={(v) => setF('gradeName', v)} options={opts(grades?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Tag Name</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.tagName} onChange={(v) => setF('tagName', v)} options={opts(tags?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Employee Group</div>
            <Select allowClear className="w-full" placeholder="ALL" value={filters.employeeGroup} onChange={(v) => setF('employeeGroup', v)} options={opts(groups?.data ?? [])} />
          </div>
          <div>
            <div className="text-xs mb-1">Remark</div>
            <Input value={filters.remark} onChange={(e) => setF('remark', e.target.value)} allowClear />
          </div>
          <div>
            <div className="text-xs mb-1">Status</div>
            <Radio.Group value={filters.status} onChange={(e) => setF('status', e.target.value)}>
              <Radio value="active">Active</Radio><Radio value="in_active">In-Active</Radio><Radio value="all">ALL</Radio>
            </Radio.Group>
          </div>
          <div>
            <div className="text-xs mb-1">Document Upload</div>
            <Radio.Group value={filters.documentUpload} onChange={(e) => setF('documentUpload', e.target.value)}>
              <Radio value="have">Have</Radio><Radio value="not_attach">Not-Attach</Radio><Radio value="both">Both</Radio>
            </Radio.Group>
          </div>
          <div>
            <div className="text-xs mb-1">Vaccine Status</div>
            <Radio.Group value={filters.vaccineStatus} onChange={(e) => setF('vaccineStatus', e.target.value)}>
              <Radio value="partially">Partial</Radio><Radio value="fully">Full</Radio>
              <Radio value="not_vaccinated">None</Radio><Radio value="all">All</Radio>
            </Radio.Group>
          </div>
        </div>

        <Space className="mb-4">
          <Button type="primary" onClick={() => refetch()}>Search</Button>
          <Button onClick={() => navigate('/master/employee/add')}>Close</Button>
        </Space>

        <div className="text-sm mb-2">Total Employee : {items.length} Found</div>
        <Table
          columns={columns as any}
          dataSource={items}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small"
          bordered
          pagination={{ pageSize: 25, showSizeChanger: true }}
          scroll={{ x: 3200 }}
        />
      </Card>
    </div>
  );
};

export default EmployeeList;
