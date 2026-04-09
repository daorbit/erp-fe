import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Checkbox, Typography } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, MailOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useLogin } from '@/hooks/queries/useAuth';
import { App } from 'antd';

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginMutation = useLogin();
  const { message } = App.useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { message.error('Please enter email and password'); return; }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (response: any) => {
          const data = response?.data ?? response;
          const token = data.tokens?.accessToken ?? data.token ?? data.accessToken;
          const user = data.user;
          if (!token) { message.error('Login failed: no token received'); return; }
          dispatch(setCredentials({ token, user }));
          if (data.tokens?.refreshToken) localStorage.setItem('refreshToken', data.tokens.refreshToken);
          message.success('Welcome back!');
          navigate('/admin');
        },
        onError: (error: any) => message.error(error?.message || 'Invalid email or password'),
      },
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjJIMjR2Mkg2VjBoMzB2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sheeraj Codeworks</h2>
              <p className="text-sm text-white/50">HR Management System</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manage your workforce<br /><span className="text-blue-400">efficiently & seamlessly</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md mb-10">
            Streamline HR operations from onboarding to payroll, attendance to performance — all in one platform.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[{ value: '500+', label: 'Employees Managed' }, { value: '18', label: 'HR Modules' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Support' }].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#111318]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="text-lg font-bold">Sheeraj Codeworks</span>
          </div>
          <div className="text-center lg:text-left">
            <Title level={3} className="!mb-1">Welcome back</Title>
            <Text type="secondary">Sign in to your account to continue</Text>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Input prefix={<MailOutlined className="text-gray-400" />} size="large" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-500 hover:underline">Forgot password?</Link>
              </div>
              <Input
                prefix={<LockOutlined className="text-gray-400" />}
                size="large"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
              />
            </div>
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>Remember me for 30 days</Checkbox>
            <Button type="primary" htmlType="submit" block size="large" loading={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-blue-500 font-medium hover:underline">Contact HR Admin</Link>
          </p>
          <div className="pt-6 border-t">
            <p className="text-center text-xs text-gray-400">© {new Date().getFullYear()} Sheeraj Codeworks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
