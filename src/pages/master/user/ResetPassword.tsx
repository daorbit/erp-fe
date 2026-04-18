import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Typography, Checkbox, App } from 'antd';
import api from '@/services/api';

const { Title } = Typography;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [updateUserName, setUpdateUserName] = useState(false);

  React.useEffect(() => {
    api.get<any>('/admin/users').then((res) => setUsers(res?.data ?? [])).catch(() => {});
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (values.password !== values.retypePassword) {
        message.error('Passwords do not match'); return;
      }
      await api.put(`/admin/users/${values.user}`, {
        password: values.password,
        ...(updateUserName && values.username ? { username: values.username } : {}),
      });
      message.success('Password reset successfully');
      form.resetFields(['password', 'retypePassword']);
    } catch (err: any) {
      message.error(err?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between  pb-3">
        <Title level={4} className="!mb-0">User Password Reset</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit} className="max-w-3xl mx-auto">
          <Form.Item name="user" label="User Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Input list="users" placeholder="Please Select" />
          </Form.Item>
          <datalist id="users">
            {users.map((u) => <option key={u._id || u.id} value={u._id || u.id}>{u.username || u.firstName}</option>)}
          </datalist>
          <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
            <Checkbox checked={updateUserName} onChange={(e) => setUpdateUserName(e.target.checked)} style={{ color: 'red', fontWeight: 600 }}>
              Do You Want To Update User Name
            </Checkbox>
          </Form.Item>
          {updateUserName && (
            <Form.Item name="username" label="New User Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="password" label="Password" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="retypePassword" label="Retype Password" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button onClick={() => navigate('/master/user/list')}>Close</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
