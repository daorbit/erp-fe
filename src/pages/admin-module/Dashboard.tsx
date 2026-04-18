import React, { useState, useCallback } from 'react';
import { Empty, Tooltip } from 'antd';
import {
  Building, MapPinned, Users, LogIn, Receipt, MessageSquare,
  BellRing, MapPin, KeyRound, FileCheck, UsersRound,
  RefreshCw, Minus, Plus, Lock, ShieldAlert, LogOut, Search, Cake,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBirthdays } from '@/hooks/queries/useDashboard';
import AnimateIn from '@/components/AnimateIn';

// ─── Quick Action Button ─────────────────────────────────────────────────────
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

function QuickAction({ icon, label, color, onClick }: QuickActionProps) {
  return (
    <Tooltip title={label}>
      <button
        onClick={onClick}
        className="group flex flex-col items-center gap-2 cursor-pointer w-20 shrink-0"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center
          ${color}
          shadow-sm group-hover:shadow-md
          group-hover:scale-110 transition-all duration-200`}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-[var(--text-secondary)]
          group-hover:text-[var(--text-primary)] transition-colors
          text-center leading-tight w-full break-words">
          {label}
        </span>
      </button>
    </Tooltip>
  );
}

// ─── Widget Card ─────────────────────────────────────────────────────────────
interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
  icon?: React.ReactNode;
  onRefresh?: () => void;
  className?: string;
}

function WidgetCard({ title, children, accentColor = 'from-cyan-500 to-blue-500', icon, onRefresh, className = '' }: WidgetCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    onRefresh?.();
    setTimeout(() => setSpinning(false), 600);
  }, [onRefresh]);

  return (
    <div className={`bg-[var(--bg-card)] rounded-2xl shadow-sm
      border border-[var(--border-color)] overflow-hidden
      break-inside-avoid mb-5 ${className}`}>
      <div className={`h-0.5 bg-gradient-to-r ${accentColor}`} />
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
          <h3 className="font-semibold text-sm text-[var(--text-primary)] m-0">{title}</h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleRefresh}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              transition"
          >
            <RefreshCw size={13} className={spinning ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
              transition"
          >
            {collapsed ? <Plus size={13} /> : <Minus size={13} />}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="px-5 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Empty Widget ────────────────────────────────────────────────────────────
function WidgetEmpty({ text = 'No records found' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-[var(--text-secondary)]">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />
    </div>
  );
}

// ─── Password Protection Tips ────────────────────────────────────────────────
const PASSWORD_TIPS = [
  { icon: <Lock size={20} />, title: 'Do Not Share Your Password', desc: "Don't share your ERP password with anyone. Your Company's data is your responsibility." },
  { icon: <ShieldAlert size={20} />, title: 'Investigate Suspicious Login Activity', desc: "Audit regularly to check who has access to your company's data, deactivate ex-employee ERP login." },
  { icon: <LogOut size={20} />, title: 'Always Logout From Your Devices', desc: 'Make sure you log out from ERP after your work is completed. Do not close browser directly.' },
  { icon: <KeyRound size={20} />, title: 'Change Your Password Every 3 Months', desc: 'It is advisable to keep changing your password at least once in every 3 months.' },
  { icon: <Search size={20} />, title: 'Create Strong Passwords', desc: 'Use passwords that are hard to guess. Passwords should have at least 8 characters, include uppercase and lowercase letters, numbers and symbols.' },
];

// ═════════════════════════════════════════════════════════════════════════════
const AdminModuleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: birthdayData } = useBirthdays();
  const birthdays: any[] = birthdayData?.data ?? [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ─── Quick Actions (carousel on small screens) ──────────────────── */}
      <AnimateIn variant="fadeUp">
        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1 mt-5">
          <div className="flex items-start gap-5 py-2 w-max md:w-auto md:flex-wrap md:justify-start">
            <QuickAction icon={<Building size={22} />} label="Site/Plant List" color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" onClick={() => navigate('/admin-module/master/site/list')} />
            <QuickAction icon={<MapPinned size={22} />} label="Location List" color="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" onClick={() => navigate('/admin-module/master/site-location/list')} />
            <QuickAction icon={<Users size={22} />} label="User List" color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" onClick={() => navigate('/admin-module/master/user/list')} />
            <QuickAction icon={<LogIn size={22} />} label="Login Log" color="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" onClick={() => navigate('/admin-module/reports/login-log')} />
            <QuickAction icon={<Receipt size={22} />} label="GST Master" color="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" onClick={() => navigate('/admin-module/master/gst/master')} />
            <QuickAction icon={<MessageSquare size={22} />} label="Msg From Mng" color="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" onClick={() => navigate('/admin-module/master/message-from-mng')} />
            <QuickAction icon={<BellRing size={22} />} label="SMS Alerts" color="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" onClick={() => navigate('/admin-module/master/sms-alert-voucher/list')} />
            <QuickAction icon={<MapPin size={22} />} label="City List" color="bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400" onClick={() => navigate('/admin-module/master/city/list')} />
            <QuickAction icon={<MapPin size={22} />} label="State List" color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" onClick={() => navigate('/admin-module/master/state/list')} />
            <QuickAction icon={<KeyRound size={22} />} label="Reset Password" color="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" onClick={() => navigate('/admin-module/master/user/reset-password')} />
            <QuickAction icon={<FileCheck size={22} />} label="Voucher Status" color="bg-lime-100 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400" onClick={() => navigate('/admin-module/reports/voucher-status')} />
            <QuickAction icon={<UsersRound size={22} />} label="User Work Report" color="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400" onClick={() => navigate('/admin-module/reports/user-work')} />
          </div>
        </div>
      </AnimateIn>

      {/* ─── Dashboard heading ───────────────────────────────────────────── */}
      <AnimateIn variant="fadeIn">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mt-10">
          Dashboard
        </h2>
      </AnimateIn>

      {/* ─── Masonry Grid ────────────────────────────────────────────────── */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-5">

        {/* Today's Birthday */}
        <AnimateIn variant="fadeUp" delay={0.1}>
          <WidgetCard title="Today's Birthday" accentColor="from-orange-400 to-pink-500" icon={<Cake size={16} />}>
            {birthdays.length > 0 ? (
              <div className="space-y-2.5">
                {birthdays.map((b: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-900/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {(b.firstName || b.name || 'E')[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {b.firstName || b.name || 'Employee'} {b.lastName || ''}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">{b.department || b.designation || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WidgetEmpty text="No birthdays today" />
            )}
          </WidgetCard>
        </AnimateIn>

        {/* Notice Board */}
        <AnimateIn variant="fadeUp" delay={0.12}>
          <WidgetCard title="Notice Board" accentColor="from-green-500 to-emerald-500" icon={<MessageSquare size={16} />}>
            <WidgetEmpty text="No notices" />
          </WidgetCard>
        </AnimateIn>

        {/* Password Protection Tips */}
        <AnimateIn variant="fadeUp" delay={0.16}>
          <WidgetCard title="Password Protection Tips" accentColor="from-slate-400 to-gray-500" icon={<Lock size={16} />}>
            <div className="space-y-4">
              {PASSWORD_TIPS.map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                    {tip.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{tip.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </WidgetCard>
        </AnimateIn>

      </div>
    </div>
  );
};

export default AdminModuleDashboard;
