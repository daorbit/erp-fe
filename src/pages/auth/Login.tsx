import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Checkbox, Typography } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useLogin } from '@/hooks/queries/useAuth';
import { App } from 'antd';
import { ArrowRight, Shield } from 'lucide-react';

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
      {/* ──────── Left Panel ──────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0F1117] relative overflow-hidden select-none">
        {/* Ambient glow */}
        <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/[0.05] blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between w-full px-14 xl:px-20 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="text-white/90 text-[15px] font-semibold tracking-tight">Sheeraj Codeworks</span>
          </div>

          {/* Hero content */}
          <div className="max-w-md -mt-6">
            <h1 className="text-[2.5rem] xl:text-[2.85rem] font-extrabold leading-[1.12] tracking-tight text-white mb-4">
              Your workforce,{' '}
              <span className="text-blue-400">managed.</span>
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed mb-12">
              Onboarding, attendance, payroll, performance — everything your HR team needs, in one place.
            </p>

            {/* Stats row */}
            <div className="flex gap-10">
              {[
                { val: '500+', label: 'Companies' },
                { val: '50k+', label: 'Employees' },
                { val: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-xs text-white/30 mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial card */}
          <div className="max-w-md">
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6">
              <p className="text-[14px] text-white/50 leading-relaxed italic">
                "Sheeraj HRM cut our onboarding time by 60% and gave us full visibility into attendance and payroll. It's become indispensable."
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  RS
                </div>
                <div>
                  <div className="text-white/80 text-[13px] font-semibold">Rajesh Sharma</div>
                  <div className="text-white/30 text-[11px]">VP of People, TechNova Inc.</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 text-[11px] text-white/20">
              <span>&copy; {new Date().getFullYear()} Sheeraj Codeworks</span>
              <div className="flex gap-4">
                <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-white/40 cursor-pointer transition-colors">Terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── Right Panel — Form ──────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-[#111318]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="text-[15px] font-semibold">Sheeraj Codeworks</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Title level={2} className="!mb-1.5 !text-[22px] !font-bold">Sign in to your account</Title>
            <Text className="!text-gray-400 text-sm">Enter your credentials below to continue</Text>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium mb-1.5 text-gray-600 dark:text-gray-400">Email address</label>
              <Input
                prefix={<MailOutlined className="!text-gray-300 dark:!text-gray-600" />}
                size="large"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!h-11 !rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-gray-600 dark:text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-[12px] text-blue-500 hover:text-blue-600 font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                prefix={<LockOutlined className="!text-gray-300 dark:!text-gray-600" />}
                size="large"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!h-11 !rounded-lg"
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors">
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
              />
            </div>

            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
              <span className="text-[13px] text-gray-500">Remember me for 30 days</span>
            </Checkbox>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loginMutation.isPending}
              className="!h-11 !rounded-lg !font-semibold"
            >
              {loginMutation.isPending ? 'Signing in...' : (
                <span className="flex items-center justify-center gap-2">Sign In <ArrowRight size={15} /></span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-[11px] text-gray-300 dark:text-gray-600 uppercase tracking-widest font-medium">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Demo login shortcut */}
          <button
            type="button"
            onClick={() => { setEmail('admin@sheeraj.com'); setPassword('Admin@123'); }}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 bg-transparent transition-all"
          >
            <Shield size={14} />
            Fill demo credentials
          </button>

          {/* Bottom link */}
          <p className="text-center text-[13px] text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-semibold hover:text-blue-600">Contact HR Admin</Link>
          </p>

          <p className="lg:hidden text-center text-[11px] text-gray-300 dark:text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Sheeraj Codeworks. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
