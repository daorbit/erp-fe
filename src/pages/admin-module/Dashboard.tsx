import React, { useState, useCallback } from 'react';
import { Card, Typography, Row, Col, Empty, Tooltip } from 'antd';
import {
  Building, MapPinned, Users, LogIn, Receipt, MessageSquare,
  BellRing, MapPin, KeyRound, FileCheck, UsersRound,
  RefreshCw, Minus, Plus, Lock, ShieldAlert, MonitorSmartphone, LogOut, Search as SearchIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBirthdays } from '@/hooks/queries/useDashboard';
import AnimateIn from '@/components/AnimateIn';

const { Title } = Typography;

// ─── Quick Action Button ─────────────────────────────────────────────────────
function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-2 group cursor-pointer">
      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500 flex items-center justify-center text-red-500 dark:text-red-400 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[10px] text-center leading-tight text-gray-600 dark:text-gray-400 max-w-[80px]">{label}</span>
    </button>
  );
}

// ─── Widget Card ─────────────────────────────────────────────────────────────
function WidgetCard({ title, children, borderColor = 'border-t-cyan-500', minHeight = 220, onRefresh }: {
  title: string; children: React.ReactNode; borderColor?: string; minHeight?: number; onRefresh?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const handleRefresh = useCallback(() => { setSpinning(true); onRefresh?.(); setTimeout(() => setSpinning(false), 600); }, [onRefresh]);

  return (
    <Card bordered={false} className="!rounded-lg !shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
      <div className={`border-t-[3px] ${borderColor}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
          <div className="flex items-center gap-1">
            <Tooltip title="Refresh">
              <button onClick={handleRefresh} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <RefreshCw size={13} className={spinning ? 'animate-spin' : ''} />
              </button>
            </Tooltip>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
              <button onClick={() => setCollapsed((c) => !c)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                {collapsed ? <Plus size={13} /> : <Minus size={13} />}
              </button>
            </Tooltip>
          </div>
        </div>
        {!collapsed && <div className="px-4 py-3" style={{ minHeight }}>{children}</div>}
      </div>
    </Card>
  );
}

function WidgetEmpty({ text = 'No records found' }: { text?: string }) {
  return <div className="flex flex-col items-center justify-center py-8 text-gray-400"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} /></div>;
}

// ─── Password Protection Tips ────────────────────────────────────────────────
const PASSWORD_TIPS = [
  { icon: <Lock size={20} />, title: 'Do Not Share Your Password', desc: "Don't share your ERP password with anyone. Your Company's data is your responsibility." },
  { icon: <ShieldAlert size={20} />, title: 'Investigate Suspicious Login Activity', desc: "Audit regularly to check who has access to your company's data, deactivate ex-employee ERP login." },
  { icon: <LogOut size={20} />, title: 'Always Logout From Your Devices', desc: 'Make sure your log out from ERP after your work is completed. Do not close browser directly.' },
  { icon: <KeyRound size={20} />, title: 'Change Your Password Every 3 Months', desc: 'It is advisable to keep changing your password at least once in every 3 months.' },
  { icon: <SearchIcon size={20} />, title: 'Create Strong Passwords', desc: 'Use passwords that are hard to guess. Passwords should have at least 8 characters, include uppercase and lowercase letters, numbers and symbols.' },
];

// ═════════════════════════════════════════════════════════════════════════════
const AdminModuleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: birthdayData } = useBirthdays();
  const birthdays: any[] = birthdayData?.data ?? [];

  return (
    <div className="space-y-5">
      <AnimateIn variant="fadeIn">
        <Title level={4} className="!mb-0 text-center tracking-widest uppercase text-gray-600 dark:text-gray-300">
          Dashboard Admin
        </Title>
      </AnimateIn>

      {/* Quick Actions */}
      <AnimateIn variant="fadeUp">
        <Card bordered={false} className="!rounded-xl !shadow-sm" styles={{ body: { padding: '16px 12px' } }}>
          <div className="flex items-center justify-center flex-wrap gap-3">
            <QuickAction icon={<Building size={22} />} label="Site/Plant/P... List" onClick={() => navigate('/admin-module/master/site/list')} />
            <QuickAction icon={<MapPinned size={22} />} label="Location List" onClick={() => navigate('/admin-module/master/site-location/list')} />
            <QuickAction icon={<Users size={22} />} label="User Profile List" onClick={() => navigate('/admin-module/master/user/list')} />
            <QuickAction icon={<LogIn size={22} />} label="Login Log" onClick={() => navigate('/admin-module/reports/login-log')} />
            <QuickAction icon={<Receipt size={22} />} label="GST Master" onClick={() => navigate('/admin-module/master/gst/master')} />
            <QuickAction icon={<MessageSquare size={22} />} label="Message Fro... List" onClick={() => navigate('/admin-module/master/message-from-mng')} />
            <QuickAction icon={<BellRing size={22} />} label="SMS/Email A... List" onClick={() => navigate('/admin-module/master/sms-alert-voucher/list')} />
            <QuickAction icon={<MapPin size={22} />} label="City List" onClick={() => navigate('/admin-module/master/city/list')} />
            <QuickAction icon={<MapPin size={22} />} label="State List" onClick={() => navigate('/admin-module/master/state/list')} />
            <QuickAction icon={<KeyRound size={22} />} label="Reset Password" onClick={() => navigate('/admin-module/master/user/reset-password')} />
            <QuickAction icon={<FileCheck size={22} />} label="Voucher Status" onClick={() => navigate('/admin-module/reports/voucher-status')} />
            <QuickAction icon={<UsersRound size={22} />} label="User Work Report" onClick={() => navigate('/admin-module/reports/user-work')} />
          </div>
        </Card>
      </AnimateIn>

      {/* Row 1: Today's Birthday + Notice Board + Password Protection Tips */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.1}>
            <WidgetCard title="Today's Birthday" borderColor="border-t-orange-400" minHeight={300}>
              {birthdays.length > 0 ? (
                <div className="space-y-2">
                  {birthdays.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <div className="text-sm font-medium">{b.firstName || b.name || 'Employee'} {b.lastName || ''}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <WidgetEmpty text="No birthdays today" />
              )}
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.15}>
            <WidgetCard title="Notice Board" borderColor="border-t-green-500" minHeight={300}>
              <WidgetEmpty text="No notices" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.2}>
            <WidgetCard title="Password Protection Tips" borderColor="border-t-gray-400" minHeight={300}>
              <div className="space-y-4">
                {PASSWORD_TIPS.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                      {tip.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tip.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>
    </div>
  );
};

export default AdminModuleDashboard;
