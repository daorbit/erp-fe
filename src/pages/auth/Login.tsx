import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Checkbox, Typography } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useLogin } from '@/hooks/queries/useAuth';
import { App } from 'antd';
import {
  Shield, Users, BarChart3, Clock, ArrowRight,
} from 'lucide-react';

const { Title, Text } = Typography;

const features = [
  { icon: <Users size={20} />, title: '18 HR Modules', desc: 'End-to-end workforce management' },
  { icon: <BarChart3 size={20} />, title: 'Real-time Analytics', desc: 'Data-driven HR decisions' },
  { icon: <Shield size={20} />, title: 'Enterprise Security', desc: 'Role-based access & encryption' },
  { icon: <Clock size={20} />, title: '99.9% Uptime', desc: 'Always available when you need it' },
];

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0c0e14]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-48 -left-24 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-20 py-12">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/[0.08]">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <span className="block text-white text-[15px] font-semibold leading-tight">Sheeraj Codeworks</span>
              <span className="block text-white/40 text-[11px] font-medium tracking-wide uppercase">HR Platform</span>
            </div>
          </div>

          {/* Center: Hero */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 text-xs font-medium">Trusted by 500+ organizations</span>
            </div>

            <h1 className="text-[2.75rem] xl:text-5xl font-bold leading-[1.15] text-white mb-5 tracking-tight">
              Simplify your
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">HR operations</span>
            </h1>
            <p className="text-[17px] text-white/50 leading-relaxed max-w-md">
              From onboarding to payroll, manage your entire workforce lifecycle in one powerful platform.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 mt-10">
              {features.map((f) => (
                <div key={f.title} className="group flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500/10 transition-colors">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold">{f.title}</div>
                    <div className="text-white/35 text-xs mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Footer */}
          <div className="flex items-center justify-between text-white/25 text-xs">
            <span>&copy; {new Date().getFullYear()} Sheeraj Codeworks</span>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <span className="block text-[15px] font-semibold leading-tight">Sheeraj Codeworks</span>
              <span className="block text-gray-400 text-[11px] font-medium">HR Platform</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Title level={2} className="!mb-2 !text-2xl !font-bold">Welcome back</Title>
            <Text className="text-gray-500 dark:text-gray-400 text-[15px]">
              Enter your credentials to access your account
            </Text>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <Input
                prefix={<MailOutlined className="text-gray-300 dark:text-gray-500" />}
                size="large"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!h-12 !rounded-xl !bg-white dark:!bg-white/[0.04] !text-[15px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                prefix={<LockOutlined className="text-gray-300 dark:text-gray-500" />}
                size="large"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!h-12 !rounded-xl !bg-white dark:!bg-white/[0.04] !text-[15px]"
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                <span className="text-sm text-gray-500">Remember me</span>
              </Checkbox>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loginMutation.isPending}
              className="!h-12 !rounded-xl !text-[15px] !font-semibold !shadow-lg !shadow-blue-500/20"
            >
              {loginMutation.isPending ? 'Signing in...' : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {/* Demo credentials */}
          <button
            type="button"
            onClick={() => { setEmail('admin@sheeraj.com'); setPassword('Admin@123'); }}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
          >
            <Shield size={16} />
            Use demo credentials
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
              Contact HR Admin
            </Link>
          </p>

          <p className="lg:hidden text-center text-xs text-gray-300 dark:text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Sheeraj Codeworks. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
