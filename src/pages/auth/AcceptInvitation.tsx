import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Input, Button, Typography, Tag, Spin, Result } from 'antd';
import { LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { useInvitationByToken, useAcceptInvitation } from '@/hooks/queries/useInvitations';
import { App } from 'antd';
import { ArrowRight, Shield } from 'lucide-react';

const { Title, Text } = Typography;

const roleLabel: Record<string, string> = {
  super_admin: 'Platform Admin',
  admin: 'Company Admin',
  hr_manager: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
};

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const acceptMutation = useAcceptInvitation();

  const { data: inviteData, isLoading, isError } = useInvitationByToken(token || '');
  const invitation = inviteData?.data;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      message.error('Please enter your full name');
      return;
    }
    if (password.length < 8) {
      message.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    acceptMutation.mutate(
      { token: token!, firstName: firstName.trim(), lastName: lastName.trim(), password, phone: phone.trim() || undefined },
      {
        onSuccess: () => {
          message.success('Account created! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        },
        onError: (err: any) => message.error(err?.message || 'Failed to create account'),
      },
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111318]">
        <Spin size="large" />
      </div>
    );
  }

  // Invalid/expired link
  if (isError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#111318] px-4">
        <Result
          status="warning"
          title="Invalid or Expired Invitation"
          subTitle="This invitation link is no longer valid. It may have expired or already been used."
          extra={<Link to="/login"><Button type="primary">Go to Login</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0F1117] relative overflow-hidden select-none">
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.05] blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between w-full px-14 xl:px-20 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <span className="text-white/90 text-[15px] font-semibold">ERP Platform</span>
          </div>

          <div className="max-w-md -mt-4">
            <h1 className="text-[2.5rem] xl:text-[2.85rem] font-extrabold leading-[1.12] tracking-tight text-white mb-4">
              You're <span className="text-emerald-400">invited.</span>
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed">
              Set up your account to get started. Your email and role have been pre-configured by your administrator.
            </p>
          </div>

          <div className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} ERP Platform
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#111318]">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <Shield size={24} className="text-emerald-500" />
            <span className="text-[15px] font-semibold">ERP Platform</span>
          </div>

          <div className="mb-8">
            <Title level={2} className="!mb-1.5 !text-[22px] !font-bold">Set up your account</Title>
            <Text className="!text-gray-400 text-sm">Complete your profile to get started</Text>
          </div>

          {/* Pre-filled info */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-sm font-medium">{invitation.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Role</span>
              <Tag color="blue">{roleLabel[invitation.role] || invitation.role}</Tag>
            </div>
            {invitation.company && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Company</span>
                <span className="text-sm font-medium">{invitation.company.name || invitation.company}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">First Name</label>
                <Input
                  prefix={<UserOutlined className="!text-gray-300 dark:!text-gray-600" />}
                  size="large"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="!h-11 !rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">Last Name</label>
                <Input
                  prefix={<UserOutlined className="!text-gray-300 dark:!text-gray-600" />}
                  size="large"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="!h-11 !rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">Password</label>
              <Input
                prefix={<LockOutlined className="!text-gray-300 dark:!text-gray-600" />}
                size="large"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters (A-z, 0-9)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!h-11 !rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">Confirm Password</label>
              <Input
                prefix={<LockOutlined className="!text-gray-300 dark:!text-gray-600" />}
                size="large"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="!h-11 !rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">Phone (Optional)</label>
              <Input
                prefix={<PhoneOutlined className="!text-gray-300 dark:!text-gray-600" />}
                size="large"
                placeholder="+91 9999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="!h-11 !rounded-lg"
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={acceptMutation.isPending}
              className="!h-[46px] !rounded-xl !font-semibold !text-[14px] !border-none !shadow-none hover:!opacity-90 transition-opacity !mt-6"
            >
              {acceptMutation.isPending ? 'Creating account...' : (
                <span className="flex items-center justify-center gap-2">Create Account <ArrowRight size={15} /></span>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-semibold hover:text-blue-600">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
