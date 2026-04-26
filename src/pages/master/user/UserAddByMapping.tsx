import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Typography, App,
} from 'antd';
import { USER_TYPE_OPTIONS } from '@/types/enums';
import employeeService from '@/services/employeeService';
import api from '@/services/api';

const { Title, Text } = Typography;

const UserAddByMapping: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

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
            const user = e.userId ?? e;
            const first = user.firstName ?? e.firstName ?? '';
            const last = user.lastName ?? e.lastName ?? '';
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
      username: form.getFieldValue('username') || u.username || '',
    });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const fullName = (values.firstName || '').trim();
      const [first, ...rest] = fullName.split(/\s+/);
      const last = rest.join(' ') || '-';
      const payload = {
        firstName: first || fullName || '-',
        lastName: last,
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        userType: values.userMappingAs,
        remark: values.remark,
        employeeId: values.employee,
        isActive: true,
      };
      await api.post('/auth/register', payload);
      message.success('User created');
      navigate('/admin-module/master/user/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">Add User By Mapping</Title>
        <Button type="link" onClick={() => navigate('/admin-module/master/user/list')}>List</Button>
      </div>
      <Card bordered={false}>
        <div className="text-center mb-4">
          <Text strong type="danger">New Mode</Text>
        </div>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
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
              name="employee"
              label="Employee"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'Select an employee' }]}
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
              name="password"
              label="Password"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="userMappingAs"
              label="User Mapping As"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Select
                showSearch
                placeholder="Type here atleast 3 character to search data"
                options={USER_TYPE_OPTIONS}
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="retypePassword"
              label="Retype Password"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Retype password is required' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label=" "
              colon={false}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              {/* spacer to align Remark with the right column */}
            </Form.Item>
            <Form.Item
              name="remark"
              label="Remark"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </div>
          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
              <Button onClick={() => navigate('/admin-module/master/user/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default UserAddByMapping;
