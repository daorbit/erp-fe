import React, { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Form, Input, Radio, Select, Button, Space, Typography, Checkbox, App,
} from 'antd';
import { USER_TYPE_OPTIONS, UserCategory } from '@/types/enums';
import { useBranchList } from '@/hooks/queries/useBranches';
import employeeService from '@/services/employeeService';
import api from '@/services/api';

const { Title, Text } = Typography;

// Admin module → Master → User → Add (User Profile)
// Compact two-column layout. Unlike the HR variant, this one has no
// department/branch/module pickers — only an "Is ERP Development Company User"
// flag and a role legend.
const UserAddAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  const { data: branches } = useBranchList();
  const branchList: any[] = branches?.data ?? [];
  const branchOptions = branchList.map((b: any) => ({ value: b._id || b.id, label: b.name }));

  const { data: locationsData } = useQuery({
    queryKey: ['site-locations-for-user-assignment'],
    queryFn: () => api.get('/locations', { limit: '500' }),
  });
  const locationList: any[] = ((locationsData as any)?.data ?? []) as any[];
  const locationBySiteId = locationList.reduce<Record<string, any>>((acc, loc) => {
    const siteId = typeof loc.site === 'object' ? loc.site?._id || loc.site?.id : loc.site;
    if (siteId && (loc.latitude != null || !acc[siteId])) acc[siteId] = loc;
    return acc;
  }, {});

  const toSiteId = (site: any) => (typeof site === 'string' ? site : site?._id || site?.id);

  const [empOptions, setEmpOptions] = useState<{ value: string; label: string; emp: any }[]>([]);
  const [empSearching, setEmpSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEmpSearch = useCallback((searchText: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchText || searchText.length < 3) {
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

  React.useEffect(() => {
    if (!isEdit || !id) return;
    api.get<any>('/auth/users').then((res) => {
      const u = (res?.data ?? []).find((x: any) => (x._id || x.id) === id);
      if (!u) return;
      const allowedSiteIds = (u.allowedBranches ?? []).map(toSiteId).filter(Boolean);
      form.setFieldsValue({
        firstName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        email: u.email,
        phone: u.phone,
        username: u.username,
        userCategory: u.userCategory,
        userType: u.userType,
        remark: u.remark,
        isErpDevCoUser: !!u.isErpDevCoUser,
        allowedBranches: allowedSiteIds,
      });
      setSelectedSiteIds(allowedSiteIds);
    }).catch(() => {});
  }, [id, isEdit, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const fullName = (values.firstName || '').trim();
      const [first, ...rest] = fullName.split(/\s+/);
      const last = rest.join(' ') || '-';
      // Build the base payload without isActive — this form has no Active toggle,
      // so editing a deactivated user must NOT silently re-enable them.
      const payload: Record<string, unknown> = {
        firstName: first || fullName || '-',
        lastName: last,
        email: values.email,
        phone: values.phone,
        username: values.username,
        userCategory: values.userCategory,
        userType: values.userType,
        remark: values.remark,
        allowedBranches: values.allowedBranches ?? [],
        isErpDevCoUser: !!values.isErpDevCoUser,
      };
      if (values.password) payload.password = values.password;

      if (isEdit && id) {
        await api.put(`/auth/users/${id}`, payload);
        message.success('User updated');
      } else {
        // On create, default to active.
        await api.post('/auth/register', { ...payload, isActive: true });
        message.success('User created');
      }
      navigate('/admin-module/master/user/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">User Profile</Title>
        <Button type="link" onClick={() => navigate('/admin-module/master/user/list')}>List</Button>
      </div>
      <Card bordered={false}>
        <div className="text-center mb-4">
          <Text strong type="danger">{isEdit ? 'Edit Mode' : 'New Mode'}</Text>
        </div>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ userCategory: UserCategory.INTERNAL, isErpDevCoUser: false }}
        >
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
              label="Employee"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Select
                showSearch
                placeholder="Type here atleast 3 character to search data"
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
              name="isErpDevCoUser"
              label="Is ERP Development Company User"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 10 }}
              valuePropName="checked"
            >
              <Checkbox />
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
              name="email"
              label="Email Id"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Mobile No.(10 Digit)"
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
              name="retypePassword"
              label="Retype Password"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              dependencies={['password']}
              rules={[
                { required: !isEdit, message: 'Retype password is required' },
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
              name="remark"
              label="Remark"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="userType"
              label="User type"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'User type is required' }]}
            >
              <Select placeholder="Please Select" options={USER_TYPE_OPTIONS} />
            </Form.Item>
          </div>

          {/* Site assignment */}
          <Form.Item
            name="allowedBranches"
            label="Assign Sites"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Select
              mode="multiple"
              placeholder="Select sites to assign"
              options={branchOptions}
              showSearch
              optionFilterProp="label"
              allowClear
              onChange={(vals: string[]) => setSelectedSiteIds(vals)}
            />
          </Form.Item>

          {/* Site coordinate preview */}
          {selectedSiteIds.length > 0 && (() => {
            const sites = selectedSiteIds
              .map((sid) => branchList.find((b: any) => (b._id || b.id) === sid))
              .filter(Boolean);
            return (
              <div className="mb-4 space-y-1">
                <div className="text-xs font-semibold text-gray-500 mb-1">Assigned Site Coordinates</div>
                {sites.map((site: any) => {
                  const siteId = site._id || site.id;
                  const loc = locationBySiteId[siteId];
                  const coordSource = loc?.latitude != null && loc?.longitude != null ? loc : site;
                  const hasCoords = coordSource.latitude != null && coordSource.longitude != null;
                  return (
                    <div key={site._id || site.id} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5 border border-dashed border-gray-200 dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{site.name}</span>
                      {site.siteType && <span className="text-gray-400">{site.siteType}</span>}
                      {(loc?.name || loc?.city || site.city || site.stateName) && (
                        <span className="text-gray-400 truncate">
                          {[loc?.name, loc?.city || site.city, site.stateName].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {hasCoords ? (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{(coordSource.latitude as number).toFixed(5)}, {(coordSource.longitude as number).toFixed(5)}</span>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${coordSource.latitude}&mlon=${coordSource.longitude}&zoom=15`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-auto shrink-0"
                          >
                            Map ↗
                          </a>
                        </>
                      ) : (
                        <span className="text-amber-500 ml-auto shrink-0">No coordinates set</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
              <Button onClick={() => navigate('/admin-module/master/user/list')}>Close</Button>
            </Space>
          </div>
        </Form>

        {/* Role legend */}
        <div className="mt-6 text-xs leading-5 border-t pt-4 space-y-3">
          <div>
            <div><b>1. SUPER ADMIN</b></div>
            <div>Person who have rights of complete ERP software from A to Z.</div>
            <div>(All Sites/Branches of all Company / All Module / All Form)</div>
          </div>
          <div>
            <div><b>2. ADMIN</b></div>
            <div>If user type is admin for any particular module, he/she have complete rights on that particular module only.</div>
            <div>(All Sites/Branches of assigned Company / assigned Module / All Form)</div>
          </div>
          <div>
            <div><b>3. HO-USER</b></div>
            <div>Ho-user can see data of all site module wise, need to assign page wise rights for assigned module.</div>
            <div>(All Sites/Branches of assigned Company / assigned Module / assigned Form)</div>
          </div>
          <div>
            <div><b>4. SITE-ADMIN</b></div>
            <div>Can see all related data for particular site only, act as admin of all module for assigned site.</div>
            <div>(Assigned Sites/Branches of assigned Company / assigned Module / All Form)</div>
          </div>
          <div>
            <div><b>5. USER</b></div>
            <div>In this type, user can access assign module and its respective functionality.</div>
            <div>(Assigned Sites/Branches of assigned Company / assigned Module / assigned Form)</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserAddAdmin;
