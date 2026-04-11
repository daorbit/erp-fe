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
    <div
      className="min-h-screen w-full flex items-center justify-end relative"
      style={{
        backgroundImage: 'url(/images/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center left',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Logo - top left */}
      <div className="absolute top-8 left-10 z-20 flex items-center gap-2.5">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-8 h-8 rounded"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="text-gray-700 font-bold text-lg tracking-tight">Sheeraj Codeworks</span>
      </div>

      {/* Sign-in card — floating on the right */}
      <div className="relative z-10 w-full max-w-[500px] mr-8 lg:mr-16 xl:mr-24 my-8">
        <div
          className="rounded-3xl p-10 md:p-12"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <Text className="!text-gray-500 !text-[15px]">
                Welcome to <span className="!text-blue-500 !font-semibold">Sheeraj</span>
              </Text>
              <Title level={1} className="!mb-0 !mt-1 !text-[36px] !font-extrabold !leading-tight !text-gray-900">
                Sign in
              </Title>
            </div>
            <div className="text-right pt-1">
              <Text className="!text-gray-400 !text-xs">No Account?</Text>
              <br />
              <Link to="/register" className="text-blue-500 text-sm font-semibold hover:text-blue-600">
                Sign up
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Enter your username or email address
              </label>
              <Input
                size="large"
                type="email"
                placeholder="Username or email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!h-[50px] !rounded-xl !border-gray-200 !bg-white/60 !text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Enter your Password
              </label>
              <Input.Password
                size="large"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!h-[50px] !rounded-xl !border-gray-200 !bg-white/60 !text-[15px]"
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
              className="!h-[52px] !rounded-xl !font-semibold !text-[15px] !border-none !shadow-none !bg-[#8B9A46] hover:!bg-[#7a8940] !text-white !mt-4"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile fallback — on small screens, center the card */}
      <style>{`
        @media (max-width: 768px) {
          .min-h-screen { justify-content: center !important; }
          .max-w-\\[500px\\] { margin-right: auto !important; margin-left: auto !important; }
        }
      `}</style>
    </div>
  );
}
