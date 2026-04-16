import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Form, Input, Radio, Select, Button, Space, Typography, Checkbox, App,
} from 'antd';
import { USER_TYPE_OPTIONS, UserCategory, ERP_MODULE_OPTIONS } from '@/types/enums';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useBranchList } from '@/hooks/queries/useBranches';
import api from '@/services/api';

const { Title } = Typography;

const UserAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: depts } = useDepartmentList();
  const { data: branches } = useBranchList();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        firstName: values.firstName || values.username,
        lastName: values.lastName || '',
        email: values.email,
        phone: values.phone,
        password: values.password,
        username: values.username,
        userCategory: values.userCategory,
        userType: values.userType,
        isActive: values.isActive,
        remark: values.remark,
        allowedDepartments: values.allowedDepartments ?? [],
        allowedBranches: values.allowedBranches ?? [],
        allowedModules: values.allowedModules ?? [],
      };
      if (isEdit && id) {
        await api.put(`/admin/users/${id}`, payload);
        message.success('User updated');
      } else {
        await api.post('/admin/users', payload);
        message.success('User created');
      }
      navigate('/master/user/list');
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  const opts = (list: any[]) => (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x.name }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">User</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{ userCategory: UserCategory.INTERNAL, isActive: true }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item name="userCategory" label="User Category" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Radio.Group>
                <Radio value={UserCategory.INTERNAL}>Internal</Radio>
                <Radio value={UserCategory.EXTERNAL}>External</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="empName" label="Emp Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input placeholder="Type here atleast 1 character to search" />
            </Form.Item>
            <Form.Item name="username" label="User Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: !isEdit }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Confirm Password" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: !isEdit }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="firstName" label="Employee Full Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Mobile No. (10 Digit)" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input maxLength={10} />
            </Form.Item>
            <Form.Item name="email" label="Email ID" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true, type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="remark" label="Remark" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input />
            </Form.Item>
            <Form.Item name="userType" label="User Type" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Select placeholder="Please Select" options={USER_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Checkbox />
            </Form.Item>
            <Form.Item name="allowedDepartments" label="Department" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select mode="multiple" placeholder="Select departments" options={opts(depts?.data ?? [])} />
            </Form.Item>
            <Form.Item name="allowedBranches" label="Branch" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select mode="multiple" placeholder="Select branches" options={opts(branches?.data ?? [])} />
            </Form.Item>
            <Form.Item name="allowedModules" label="ERP Modules" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select
                mode="multiple"
                placeholder="Select modules"
                options={ERP_MODULE_OPTIONS.map((m) => ({
                  value: m.value,
                  label: m.label,
                  disabled: !m.enabled,
                }))}
              />
            </Form.Item>
          </div>
          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
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

export default UserAdd;
