import React, { useState, useMemo, useCallback } from 'react';
import { Input, Table, Calendar, Select, Empty, Tooltip } from 'antd';
import {
  Users, ClipboardList, Clock, Palmtree, CalendarCheck, Banknote,
  CircleDollarSign, IndianRupee, Search,
  Cake, PartyPopper, RefreshCw, Minus, Plus,
  ChevronLeft, ChevronRight, UserPlus, CarFront, Award,
  AlertTriangle, Megaphone, FileText, ShieldCheck, BriefcaseBusiness,
  LayoutGrid, TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useDashboardStats, useBirthdays, useAnniversaries } from '@/hooks/queries/useDashboard';
import { useTranslation } from '@/hooks/useTranslation';
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
        className="group flex flex-col items-center gap-2 cursor-pointer flex-1 min-w-0"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center
          ${color}
          shadow-sm group-hover:shadow-md
          group-hover:scale-110 transition-all duration-200`}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-[var(--text-secondary)]
          group-hover:text-[var(--text-primary)] transition-colors
          text-center leading-tight truncate w-full">
          {label}
        </span>
      </button>
    </Tooltip>
  );
}

// ─── Dashboard Widget Card ───────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═════════════════════════════════════════════════════════════════════════════
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: statsData } = useDashboardStats();
  const { data: birthdayData } = useBirthdays();
  const { data: anniversaryData } = useAnniversaries();

  const birthdays: any[] = birthdayData?.data ?? [];
  const anniversaries: any[] = anniversaryData?.data ?? [];

  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [todoFilter, setTodoFilter] = useState('all');
  const today = dayjs();

  const fmtDate = (d: string | undefined) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const quickSearchCols = useMemo(() => [
    { title: today.format('DD-MMM-YYYY'), dataIndex: 'name', key: 'name', width: 200 },
    { title: 'CheckIn', dataIndex: 'checkIn', key: 'checkIn', width: 120 },
    { title: 'CheckOut', dataIndex: 'checkOut', key: 'checkOut', width: 120 },
    { title: 'O.D. / Leave/Over Time', dataIndex: 'odLeaveOt', key: 'odLeaveOt' },
  ], [today]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
 
      <AnimateIn variant="fadeUp">
        <div className="flex items-start justify-between gap-4 flex-wrap py-2 mt-5">
          <QuickAction icon={<Users size={22} />} label="Employees" color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" onClick={() => navigate('/master/employee/list')} />
          <QuickAction icon={<Palmtree size={22} />} label="Leaves" color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" onClick={() => navigate('/transaction/leave/application-list')} />
          <QuickAction icon={<ClipboardList size={22} />} label="On Duty" color="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" onClick={() => navigate('/transaction/on-duty/list')} />
          <QuickAction icon={<Clock size={22} />} label="Overtime" color="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" onClick={() => navigate('/transaction/overtime/list')} />
          <QuickAction icon={<CalendarCheck size={22} />} label="Attendance" color="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" onClick={() => navigate('/transaction/attendance/month-wise')} />
          <QuickAction icon={<Banknote size={22} />} label="Loans" color="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" onClick={() => navigate('/transaction/loan-advance/list')} />
          <QuickAction icon={<CircleDollarSign size={22} />} label="Add/Deduct" color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" onClick={() => navigate('/transaction/other-add-ded/addition')} />
          <QuickAction icon={<IndianRupee size={22} />} label="Salary" color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" onClick={() => navigate('/transaction/salary/list')} />
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
        {/* Employee Quick Search */}
        <AnimateIn variant="fadeUp" delay={0.1}>
          <WidgetCard title="Employee Quick Search" accentColor="from-cyan-500 to-blue-500" icon={<Search size={16} />}>
            <Table
              size="small"
              columns={quickSearchCols}
              dataSource={[]}
              pagination={false}
              locale={{ emptyText: (
                <div className="py-6 flex flex-col items-center gap-3">
                  <Input
                    placeholder="Enter Employee Name OR Employee Code"
                    prefix={<Search size={14} className="text-[var(--text-secondary)]" />}
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    className="!max-w-[340px]"
                  />
                </div>
              )}}
              scroll={{ x: 500 }}
            />
          </WidgetCard>
        </AnimateIn>

        {/* Today's Birthday */}
        <AnimateIn variant="fadeUp" delay={0.12}>
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

        {/* Todo List */}
        <AnimateIn variant="fadeUp" delay={0.14}>
          <WidgetCard title="Todo List" accentColor="from-green-500 to-emerald-500" icon={<ClipboardList size={16} />}>
            <div className="flex items-center gap-2 mb-3">
              <Select
                size="small"
                value={todoFilter}
                onChange={setTodoFilter}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                ]}
                className="!w-36"
              />
              <button className="h-[24px] px-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600
                hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-medium transition shadow-sm">
                <Search size={12} />
              </button>
            </div>
            <WidgetEmpty text="No todo items" />
          </WidgetCard>
        </AnimateIn>

        {/* Resignation Approval */}
        <AnimateIn variant="fadeUp" delay={0.16}>
          <WidgetCard title="Resignation Approval" accentColor="from-red-400 to-rose-500" icon={<BriefcaseBusiness size={16} />}>
            <WidgetEmpty text="No pending resignations" />
          </WidgetCard>
        </AnimateIn>

        {/* Calendar */}
        <AnimateIn variant="fadeUp" delay={0.18}>
          <WidgetCard title="Calendar" accentColor="from-slate-400 to-gray-500" icon={<CalendarCheck size={16} />}>
            <Calendar
              fullscreen={false}
              defaultValue={today}
              headerRender={({ value, onChange }) => (
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => onChange(value.subtract(1, 'month'))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">
                    {value.format('MMMM YYYY')}
                  </span>
                  <button
                    onClick={() => onChange(value.add(1, 'month'))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            />
          </WidgetCard>
        </AnimateIn>

        {/* Image Gallery */}
        <AnimateIn variant="fadeUp" delay={0.2}>
          <WidgetCard title="Image Gallery" accentColor="from-yellow-400 to-orange-500" icon={<LayoutGrid size={16} />}>
            <div className="flex items-center justify-center h-[180px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-1">
                  PAYROLL
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Company image gallery</div>
              </div>
            </div>
          </WidgetCard>
        </AnimateIn>

        {/* Public Holidays */}
        <AnimateIn variant="fadeUp" delay={0.22}>
          <WidgetCard title="Public / Optional Holidays" accentColor="from-yellow-500 to-amber-500" icon={<Palmtree size={16} />}>
            <WidgetEmpty text="No Record Found!" />
          </WidgetCard>
        </AnimateIn>

        {/* Confirmation Due */}
        <AnimateIn variant="fadeUp" delay={0.24}>
          <WidgetCard title="Confirmation Due" accentColor="from-purple-500 to-violet-500" icon={<ShieldCheck size={16} />}>
            <WidgetEmpty text="No confirmations due" />
          </WidgetCard>
        </AnimateIn>

        {/* Employee's Leave */}
        <AnimateIn variant="fadeUp" delay={0.26}>
          <WidgetCard title="Employee's Leave" accentColor="from-green-400 to-teal-500" icon={<Palmtree size={16} />}>
            <WidgetEmpty text="No employees on leave" />
          </WidgetCard>
        </AnimateIn>

        {/* Top 10 Working Hours */}
        <AnimateIn variant="fadeUp" delay={0.28}>
          <WidgetCard title="Top 10 Employee (Working Hrs)" accentColor="from-teal-500 to-cyan-500" icon={<TrendingUp size={16} />}>
            <WidgetEmpty text="No data available" />
          </WidgetCard>
        </AnimateIn>

        {/* Notice Board */}
        <AnimateIn variant="fadeUp" delay={0.3}>
          <WidgetCard title="Notice Board" accentColor="from-red-400 to-pink-500" icon={<Megaphone size={16} />}>
            <WidgetEmpty text="No notices" />
          </WidgetCard>
        </AnimateIn>

        {/* Anniversary */}
        <AnimateIn variant="fadeUp" delay={0.32}>
          <WidgetCard title="Anniversary" accentColor="from-green-500 to-emerald-600" icon={<PartyPopper size={16} />}>
            {anniversaries.length > 0 ? (
              <div className="space-y-2.5">
                {anniversaries.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-green-50/50 dark:bg-green-900/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      {(a.firstName || a.name || 'E')[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {a.firstName || a.name || 'Employee'} {a.lastName || ''}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">
                        {a.years ? `${a.years} years` : a.joinDate ? fmtDate(a.joinDate) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <WidgetEmpty text="No anniversaries today" />
            )}
          </WidgetCard>
        </AnimateIn>

        {/* Important Form */}
        <AnimateIn variant="fadeUp" delay={0.34}>
          <WidgetCard title="Important Forms" accentColor="from-amber-500 to-orange-500" icon={<FileText size={16} />}>
            <WidgetEmpty text="No forms configured" />
          </WidgetCard>
        </AnimateIn>

        {/* Newly Joined */}
        <AnimateIn variant="fadeUp" delay={0.36}>
          <WidgetCard title="Newly Joined Employee" accentColor="from-green-500 to-lime-500" icon={<UserPlus size={16} />}>
            <WidgetEmpty text="No new joiners" />
          </WidgetCard>
        </AnimateIn>

        {/* DL Expired */}
        <AnimateIn variant="fadeUp" delay={0.38}>
          <WidgetCard title="Driving Licence Expired" accentColor="from-red-500 to-orange-500" icon={<CarFront size={16} />}>
            <WidgetEmpty text="No expired licences" />
          </WidgetCard>
        </AnimateIn>

        {/* Five Year Completed */}
        <AnimateIn variant="fadeUp" delay={0.4}>
          <WidgetCard title="Five Year Completed" accentColor="from-indigo-500 to-purple-500" icon={<Award size={16} />}>
            <WidgetEmpty text="No records" />
          </WidgetCard>
        </AnimateIn>

        {/* Age Over 60 */}
        <AnimateIn variant="fadeUp" delay={0.42}>
          <WidgetCard title="Employee Age Over 60" accentColor="from-yellow-500 to-red-500" icon={<AlertTriangle size={16} />}>
            <WidgetEmpty text="No records" />
          </WidgetCard>
        </AnimateIn>
      </div>
    </div>
  );
};

export default Dashboard;
