import { useState } from 'react';
import { Button, Card, Form, Input, Typography, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import { useChangePassword } from '@/hooks/queries/useAuth';

const { Title, Text } = Typography;

export default function ForcePasswordChange() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const changePassword = useChangePassword();
  const { message } = App.useApp();

  const handleFinish = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    setSubmitting(true);
    try {
      const res: any = await changePassword.mutateAsync(values);
      const user = res?.data ?? res;
      if (user?._id) dispatch(setUser(user));
      message.success('Password changed successfully');
      navigate('/admin', { replace: true });
    } catch (error: any) {
      message.error(error?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-sm">
        <div className="mb-6">
          <Title level={3} className="!mb-1">Change Password</Title>
          <Text type="secondary">Your temporary password must be changed before continuing.</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="oldPassword"
            label="Temporary Password"
            rules={[{ required: true, message: 'Temporary password is required' }]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'New password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Use uppercase, lowercase, and number',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirm password is required' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
