import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Form, Input, Radio, Select, Button, Space, Typography, Checkbox, Tree, App,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import { USER_TYPE_OPTIONS, UserCategory } from '@/types/enums';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';
import { useMyCompany } from '@/hooks/queries/useCompanies';
import employeeService from '@/services/employeeService';
import api from '@/services/api';

const { Title } = Typography;

// HR module → Master → User → Add. Layout matches the NwayERP HR User screen:
// two-column header form, then a wide Department checkbox grid and a Branch
// tree grouped by `division`.
const UserAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const { data: depts } = useDepartmentList();
  const { data: branches } = useBranchList();
  const { data: myCompany } = useMyCompany();

  // ─── Employee search (Emp Name field) ─────────────────────────────────────
  const [empOptions, setEmpOptions] = useState<{ value: string; label: string; emp: any }[]>([]);
  const [empSearching, setEmpSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEmpSearch = useCallback((searchText: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchText || searchText.length < 1) {
      setEmpOptions([]);
      return;
    }
    setEmpSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await employeeService.getAll({ search: searchText, limit: '20' });
        const list = res?.data ?? [];
        setEmpOptions(
          list.map((e: any) => {
            const u = e.userId ?? e;
            const first = u.firstName ?? e.firstName ?? '';
            const last = u.lastName ?? e.lastName ?? '';
            return {
              value: e._id || e.id,
              label: `${first} ${last} (${e.employeeId ?? ''})`.trim(),
              emp: e,
            };
          }),
        );
      } catch {
        setEmpOptions([]);
      } finally {
        setEmpSearching(false);
      }
    }, 400);
  }, []);

  const handleEmpSelect = (_: string, option: any) => {
    const emp = option?.emp;
    if (!emp) return;
    const u = emp.userId ?? emp;
    const fullName = `${u.firstName ?? emp.firstName ?? ''} ${u.lastName ?? emp.lastName ?? ''}`.trim();
    form.setFieldsValue({
      firstName: fullName,
      phone: u.phone ?? emp.phone ?? '',
      email: u.email ?? emp.email ?? '',
    });
  };

  // ─── Department checkbox group ────────────────────────────────────────────
  const deptList: any[] = depts?.data ?? [];
  const allDeptIds = useMemo(() => deptList.map((d) => d._id || d.id), [deptList]);

  // ─── Branch tree: ALL → Company → Division/Site Type → Branches ───────────
  const branchList: any[] = branches?.data ?? [];
  const [branchSearch, setBranchSearch] = useState('');

  // Group key for a branch — division if set, else uppercased siteType, else "SITE".
  const branchGroupKey = (b: any): string => {
    const div = (b.division || '').toString().trim();
    if (div) return div.toUpperCase();
    const st = (b.siteType || 'site').toString().trim();
    return st.toUpperCase();
  };

  // Group key for a branch's company — the populated name if available, else
  // the user's own company, else a generic placeholder.
  const branchCompanyKey = (b: any): { id: string; name: string } => {
    if (b.company && typeof b.company === 'object') {
      return { id: b.company._id || b.company.id || 'co', name: b.company.name || 'COMPANY' };
    }
    const my = myCompany?.data;
    if (my) return { id: my._id || my.id || 'co', name: (my.name || 'COMPANY').toUpperCase() };
    return { id: 'co', name: 'COMPANY' };
  };

  const branchTree: DataNode[] = useMemo(() => {
    const q = branchSearch.trim().toLowerCase();
    const filtered = q
      ? branchList.filter((b) => (b.name || '').toLowerCase().includes(q))
      : branchList;

    // companies → divisions → branches
    const byCompany = new Map<string, { name: string; divisions: Map<string, DataNode[]> }>();
    for (const b of filtered) {
      const co = branchCompanyKey(b);
      if (!byCompany.has(co.id)) byCompany.set(co.id, { name: co.name, divisions: new Map() });
      const coEntry = byCompany.get(co.id)!;
      const grp = branchGroupKey(b);
      if (!coEntry.divisions.has(grp)) coEntry.divisions.set(grp, []);
      coEntry.divisions.get(grp)!.push({
        key: b._id || b.id,
        title: b.name,
      });
    }

    const companyNodes: DataNode[] = [...byCompany.entries()].map(([coId, co]) => ({
      key: `co::${coId}`,
      title: co.name,
      children: [...co.divisions.entries()].map(([div, kids]) => ({
        key: `div::${coId}::${div}`,
        title: div,
        children: kids,
      })),
    }));

    if (companyNodes.length === 0) return [];
    return [{
      key: 'all',
      title: 'ALL',
      children: companyNodes,
    }];
  }, [branchList, branchSearch, myCompany]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load existing user on edit ───────────────────────────────────────────
  React.useEffect(() => {
    if (!isEdit || !id) return;
    api.get<any>('/auth/users').then((res) => {
      const u = (res?.data ?? []).find((x: any) => (x._id || x.id) === id);
      if (!u) return;
      form.setFieldsValue({
        firstName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        email: u.email,
        phone: u.phone,
        username: u.username,
        userCategory: u.userCategory,
        userType: u.userType,
        isActive: u.isActive,
        remark: u.remark,
        allowedDepartments: u.allowedDepartments ?? [],
        allowedBranches: u.allowedBranches ?? [],
      });
    }).catch(() => {});
  }, [id, isEdit, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Split "Employee Full Name" into firstName/lastName since the backend
      // model requires both. Single-word names get "-" as a lastName placeholder.
      const fullName = (values.firstName || '').trim();
      const [first, ...rest] = fullName.split(/\s+/);
      const last = rest.join(' ') || '-';
      const payload: any = {
        firstName: first || fullName || '-',
        lastName: last,
        email: values.email,
        phone: values.phone,
        username: values.username,
        userCategory: values.userCategory,
        userType: values.userType,
        isActive: !!values.isActive,
        remark: values.remark,
        allowedDepartments: values.allowedDepartments ?? [],
        // Branch tree returns mixed keys (ALL/company/division headers + branch ids);
        // keep only the branch ids before sending to the API.
        allowedBranches: (values.allowedBranches ?? []).filter((k: string) =>
          k !== 'all' && !k.startsWith('co::') && !k.startsWith('div::'),
        ),
      };
      if (values.password) payload.password = values.password;

      if (isEdit && id) {
        await api.put(`/auth/users/${id}`, payload);
        message.success('User updated');
      } else {
        await api.post('/auth/register', payload);
        message.success('User created');
      }
      navigate('/master/user/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">User</Title>
        <Button type="link" onClick={() => navigate('/master/user/list')}>List</Button>
      </div>
      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ userCategory: UserCategory.INTERNAL, isActive: true }}
        >
          {/* Top two-column section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item
              name="userCategory"
              label="User Category"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Radio.Group>
                <Radio value={UserCategory.INTERNAL}>Internal</Radio>
                <Radio value={UserCategory.EXTERNAL}>External</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="employee"
              label="Emp Name"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Select
                showSearch
                placeholder="Type here atleast 1 character to search data"
                filterOption={false}
                onSearch={handleEmpSearch}
                onSelect={handleEmpSelect}
                loading={empSearching}
                options={empOptions}
                allowClear
                onClear={() => setEmpOptions([])}
              />
            </Form.Item>
            <Form.Item
              name="username"
              label="User Name"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'User Name is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm-Password"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              dependencies={['password']}
              rules={[
                { required: !isEdit, message: 'Confirm password is required' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const pwd = getFieldValue('password');
                    if (!pwd && !value) return Promise.resolve();
                    if (pwd === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: !isEdit, message: 'Password is required' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Mobile No. (10 Digit)"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[
                { required: true, message: 'Mobile is required' },
                { pattern: /^\d{10}$/, message: 'Enter exactly 10 digits' },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
            <Form.Item
              name="firstName"
              label="Employee Full Name"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'Employee Full Name is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="remark"
              label="Remark"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email ID"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
            >
              <Input />
            </Form.Item>
            <div /> {/* spacer to keep User Type aligned with left column */}
            <Form.Item
              name="userType"
              label="User Type"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'User Type is required' }]}
            >
              <Select placeholder="Please Select" options={USER_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="isActive"
              label="Active"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </div>

          {/* Department + Branch wide section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 mt-2">
            <Form.Item
              name="allowedDepartments"
              label="Department"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <DepartmentCheckGrid all={allDeptIds} options={deptList} />
            </Form.Item>
            <Form.Item
              label="Branch"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              required
            >
              <div className="border rounded">
                <div className="p-2 border-b">
                  <Input
                    placeholder="Please Select atleast one Branch"
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    allowClear
                  />
                </div>
                <Form.Item
                  name="allowedBranches"
                  noStyle
                  valuePropName="checkedKeys"
                  trigger="onCheck"
                  rules={[{
                    validator: (_, val) => {
                      const ids = (val ?? []).filter((k: string) =>
                        k !== 'all' && !k.startsWith('co::') && !k.startsWith('div::'),
                      );
                      if (ids.length === 0) return Promise.reject(new Error('Please Select atleast one Branch'));
                      return Promise.resolve();
                    },
                  }]}
                >
                  <Tree
                    checkable
                    selectable={false}
                    treeData={branchTree}
                    defaultExpandAll
                    height={320}
                  />
                </Form.Item>
              </div>
            </Form.Item>
          </div>

          <div className="flex justify-center mt-4">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
              <Button onClick={() => navigate('/master/user/list')}>Close</Button>
            </Space>
          </div>
        </Form>

        {/* Role legend */}
        <div className="mt-6 text-xs leading-5 border-t pt-4">
          <div><b>1. SUPERADMIN</b> — Full rights across the entire platform. (All Sites/Branches of all Companies / All Modules / All Forms)</div>
          <div><b>2. ADMIN</b> — Full rights on their assigned module only. (All Sites/Branches of assigned Company / assigned Module / All Forms)</div>
          <div><b>3. HO-USER</b> — Can see all site data module-wise, with per-page rights. (All Sites/Branches of assigned Company / assigned Module / assigned Form)</div>
          <div><b>4. SITE-ADMIN</b> — Full rights for their assigned site only. (Assigned Sites/Branches of assigned Company / assigned Module / All Form)</div>
          <div><b>5. USER</b> — Access to assigned modules and their assigned functionality. (Assigned Sites/Branches of assigned Company / assigned Module / assigned Form)</div>
        </div>
      </Card>
    </div>
  );
};

// Renders the Department block as a scrollable checklist with an ALL master toggle.
interface DepartmentCheckGridProps {
  options: any[];
  all: string[];
  value?: string[];
  onChange?: (val: string[]) => void;
}
const DepartmentCheckGrid: React.FC<DepartmentCheckGridProps> = ({ options, all, value = [], onChange }) => {
  const allChecked = all.length > 0 && value.length === all.length;
  const indeterminate = value.length > 0 && value.length < all.length;

  return (
    <div className="border rounded p-3 max-h-80 overflow-auto">
      <div className="mb-2 pb-2 border-b">
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={(e) => onChange?.(e.target.checked ? all : [])}
        >
          ALL
        </Checkbox>
      </div>
      <Checkbox.Group
        value={value}
        onChange={(vals) => onChange?.(vals as string[])}
        className="!flex !flex-col gap-2"
      >
        {options.map((d) => (
          <Checkbox key={d._id || d.id} value={d._id || d.id}>
            {d.name}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};

export default UserAdd;
