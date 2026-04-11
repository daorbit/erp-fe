import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Typography } from 'antd';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useLogin } from '@/hooks/queries/useAuth';
import { App } from 'antd';

const { Title, Text } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loginMutation = useLogin();
  const { message } = App.useApp();

  useEffect(() => {
    const deactivatedMsg = localStorage.getItem('deactivated_message');
    if (deactivatedMsg) {
      message.error(deactivatedMsg);
      localStorage.removeItem('deactivated_message');
    }
  }, [message]);

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
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* ──────── Left Panel — Decorative ──────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-end justify-center"
        style={{
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef5 50%, #dde6f0 100%)',
        }}
      >
        {/* Soft ambient shapes */}
        <div className="absolute top-10 left-10 z-20">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-gray-700 font-bold text-lg tracking-tight">Sheeraj Codeworks</span>
          </div>
        </div>

        {/* Decorative illustration area */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Abstract furniture/workspace illustration using CSS shapes */}
            <div className="w-[420px] h-[420px] relative">
              {/* Hanging lamp */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-px h-16 bg-gray-400" />
                <div className="w-28 h-14 bg-white rounded-b-full shadow-lg" />
              </div>
              {/* Chair */}
              <div className="absolute bottom-16 left-1/2 -translate-x-8">
                <div className="w-32 h-28 bg-blue-100 rounded-t-[60px] rounded-b-lg shadow-md" />
                <div className="flex justify-between px-3 mt-1">
                  <div className="w-1 h-8 bg-gray-300 rounded" />
                  <div className="w-1 h-8 bg-gray-300 rounded" />
                </div>
              </div>
              {/* Side table with plant */}
              <div className="absolute bottom-16 left-4">
                <div className="w-16 h-20 border-2 border-amber-300 rounded-sm flex items-start justify-center pt-2">
                  <div className="w-8 h-8 bg-green-400 rounded-full" />
                </div>
                <div className="flex justify-between px-1 mt-1">
                  <div className="w-px h-10 bg-amber-300" />
                  <div className="w-px h-10 bg-amber-300" />
                </div>
              </div>
              {/* Trailing plant */}
              <div className="absolute bottom-28 left-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2 mt-1" />
                <div className="w-2 h-2 bg-green-500 rounded-full ml-4 mt-1" />
                <div className="w-2 h-2 bg-green-400 rounded-full ml-3 mt-1" />
                <div className="w-2 h-2 bg-green-500 rounded-full ml-5 mt-1" />
              </div>
            </div>
            {/* Floor line */}
            <div className="absolute bottom-8 left-0 right-0 h-px bg-gray-300" />
          </div>
        </div>

        {/* Bottom footer */}
        <div className="absolute bottom-6 left-10 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Sheeraj Codeworks
        </div>
      </div>

      {/* ──────── Right Panel — Sign In Card ──────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[460px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 relative">
          {/* Header row */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <Text className="!text-gray-500 dark:!text-gray-400 !text-sm">Welcome to{' '}
                <span className="!text-blue-500 !font-semibold">Sheeraj</span>
              </Text>
              <Title level={1} className="!mb-0 !mt-1 !text-[32px] !font-extrabold !leading-tight dark:!text-white">
                Sign in
              </Title>
            </div>
            <div className="text-right pt-1">
              <Text className="!text-gray-400 dark:!text-gray-500 !text-xs">No Account?</Text>
              <br />
              <Link to="/register" className="text-blue-500 text-sm font-semibold hover:text-blue-600">
                Sign up
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Enter your username or email address
              </label>
              <Input
                size="large"
                type="email"
                placeholder="Username or email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!h-[50px] !rounded-xl !border-gray-200 dark:!border-gray-600 !text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Enter your Password
              </label>
              <Input.Password
                size="large"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!h-[50px] !rounded-xl !border-gray-200 dark:!border-gray-600 !text-[15px]"
                visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
              />
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-blue-500 text-sm font-medium hover:text-blue-600">
                  Forgot Password
                </Link>
              </div>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loginMutation.isPending}
              className="!h-[52px] !rounded-xl !font-semibold !text-[15px] !border-none !shadow-none !bg-[#8B9A46] hover:!bg-[#7a8940] !text-white"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mt-8">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-sm font-semibold text-gray-500">Sheeraj Codeworks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
