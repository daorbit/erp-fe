import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Input, Table, Calendar, Select, Empty, Tooltip, Spin, Tag } from 'antd';
import {
  Users, ClipboardList, Clock, CalendarCheck, Banknote,
  CircleDollarSign, IndianRupee, Search,
  Cake, PartyPopper, RefreshCw, Minus, Plus,
  ChevronLeft, ChevronRight, UserPlus, CarFront, Award,
  AlertTriangle, Megaphone, FileText, ShieldCheck, BriefcaseBusiness,
  TrendingUp, Timer, ArrowRight,
} from 'lucide-react';
import employeeService from '@/services/employeeService';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useDashboardStats, useBirthdays, useAnniversaries } from '@/hooks/queries/useDashboard';
import { useShiftSessions, useMyShiftSessions } from '@/hooks/queries/useShiftSessions';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
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
        className="group flex flex-col items-center gap-2 cursor-pointer shrink-0 w-[72px] md:w-auto md:flex-1 md:min-w-0"
      >
        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
          ${color}
          shadow-sm group-hover:shadow-md
          group-hover:scale-110 transition-all duration-200`}>
          {icon}
        </div>
        <span className="text-[11px] font-medium text-[var(--text-secondary)]
          group-hover:text-[var(--text-primary)] transition-colors
          text-center leading-tight w-full whitespace-normal break-words">
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
  const currentUser = useAppSelector((state) => state.auth.user);
  const role = currentUser?.role;
  const isEmployee = role === 'employee';
  const canSeeAllShifts = role === 'admin' || role === 'hr_manager' || role === 'super_admin';

  const { data: statsData } = useDashboardStats();
  const { data: birthdayData } = useBirthdays();
  const { data: anniversaryData } = useAnniversaries();

  const birthdays: any[] = birthdayData?.data ?? [];
  const anniversaries: any[] = anniversaryData?.data ?? [];

  // Today's shifts — feed the dashboard widget. Employees see their own;
  // admin/HR see the company-wide list. Other roles skip the widget.
  // Use a high limit so stats reflect the full day, not the first 5 rows.
  const todayShiftParams = useMemo(() => ({
    limit: 200,
    dateFrom: dayjs().startOf('day').toISOString(),
    dateTo: dayjs().endOf('day').toISOString(),
  }), []);
  const adminShiftsQuery = useShiftSessions(todayShiftParams, {
    enabled: canSeeAllShifts,
    staleTime: 0,
  });
  const myShiftsQuery = useMyShiftSessions(todayShiftParams, { enabled: isEmployee, staleTime: 0 });
  const shiftsQuery = isEmployee ? myShiftsQuery : adminShiftsQuery;
  const todayShifts: any[] = shiftsQuery.data?.data ?? [];
  const shiftsTotal = shiftsQuery.data?.pagination?.total ?? todayShifts.length;
  const showShiftsWidget = canSeeAllShifts || isEmployee;
  const shiftsError = shiftsQuery.error as { message?: string } | null | undefined;
  const shiftStats = useMemo(() => {
    const active = todayShifts.filter((s: any) => s.status === 'active').length;
    const completed = todayShifts.filter((s: any) => s.status === 'completed').length;
    const minutes = todayShifts.reduce((sum: number, s: any) => sum + (s.durationMinutes ?? 0), 0);
    return { active, completed, total: shiftsTotal, hours: (minutes / 60).toFixed(1) };
  }, [todayShifts, shiftsTotal]);

  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchResults, setQuickSearchResults] = useState<any[]>([]);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);
  const quickSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQuickSearch = useCallback(async (value: string) => {
    setQuickSearchQuery(value);
    if (quickSearchTimer.current) clearTimeout(quickSearchTimer.current);
    if (!value.trim()) { setQuickSearchResults([]); return; }
    quickSearchTimer.current = setTimeout(async () => {
      setQuickSearchLoading(true);
      try {
        // Detect if it looks like an employee code (contains letters+digits with dash)
        const isCode = /^[A-Za-z]/.test(value.trim());
        const params: Record<string, string> = isCode
          ? { employeeId: value.trim(), limit: '20' }
          : { search: value.trim(), limit: '20' };
        const res = await employeeService.getAll(params);
        const list = res?.data?.data ?? res?.data ?? [];
        setQuickSearchResults(list.map((emp: any) => ({
          _id: emp._id,
          employeeId: emp.employeeId || '-',
          name: `${emp.userId?.firstName || emp.firstName || ''} ${emp.userId?.lastName || emp.lastName || ''}`.trim() || '-',
          branch: typeof emp.branch === 'object' ? emp.branch?.name : '',
          checkIn: '-',
          checkOut: '-',
          odLeaveOt: '-',
        })));
      } catch { setQuickSearchResults([]); }
      finally { setQuickSearchLoading(false); }
    }, 400);
  }, []);
  const today = dayjs();

  const fmtDate = (d: string | undefined) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const quickSearchCols = useMemo(() => [
    { title: 'Code', dataIndex: 'employeeId', key: 'employeeId', width: 120 },
    { title: today.format('DD-MMM-YYYY'), dataIndex: 'name', key: 'name', width: 180 },
    { title: 'CheckIn', dataIndex: 'checkIn', key: 'checkIn', width: 90 },
    { title: 'CheckOut', dataIndex: 'checkOut', key: 'checkOut', width: 90 },
    { title: 'O.D./Leave/OT', dataIndex: 'odLeaveOt', key: 'odLeaveOt' },
  ], [today]);

  const [todoFilter, setTodoFilter] = useState('all');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
 
      <AnimateIn variant="fadeUp">
        <div className="flex items-start gap-4 py-2 mt-5 overflow-x-auto md:flex-wrap md:justify-between -mx-4 px-4 md:mx-0 md:px-0 [-webkit-overflow-scrolling:touch]">
          <QuickAction icon={<Users size={22} />} label="Employees" color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" onClick={() => navigate('/master/employee/list')} />
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
            <Input
              placeholder="Enter Employee Name OR Employee Code"
              prefix={quickSearchLoading ? <Spin size="small" /> : <Search size={14} className="text-[var(--text-secondary)]" />}
              value={quickSearchQuery}
              onChange={(e) => handleQuickSearch(e.target.value)}
              className="mb-3"
              allowClear
              onClear={() => { setQuickSearchQuery(''); setQuickSearchResults([]); }}
            />
            <Table
              size="small"
              columns={quickSearchCols}
              dataSource={quickSearchResults}
              rowKey="_id"
              pagination={false}
              locale={{ emptyText: quickSearchQuery ? 'No employees found' : 'Enter name or employee code to search' }}
              scroll={{ x: 500 }}
              onRow={(record) => ({
                onClick: () => navigate(`/master/employee/view/${record._id}`),
                style: { cursor: 'pointer' },
              })}
            />
          </WidgetCard>
        </AnimateIn>

        {/* Today's Shifts — quick view + link to consolidated report */}
        {showShiftsWidget && (
          <AnimateIn variant="fadeUp" delay={0.11}>
            <WidgetCard
              title="Today's Shifts"
              accentColor="from-violet-500 to-blue-500"
              icon={<Timer size={16} />}
              onRefresh={() => shiftsQuery.refetch()}
            >
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="rounded-xl bg-violet-50/60 dark:bg-violet-900/10 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">Total</div>
                  <div className="text-lg font-semibold text-violet-600 dark:text-violet-400">{shiftStats.total}</div>
                </div>
                <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-900/10 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">Active</div>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{shiftStats.active}</div>
                </div>
                <div className="rounded-xl bg-blue-50/60 dark:bg-blue-900/10 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">Done</div>
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{shiftStats.completed}</div>
                </div>
                <div className="rounded-xl bg-amber-50/60 dark:bg-amber-900/10 p-2.5 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">Hours</div>
                  <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">{shiftStats.hours}</div>
                </div>
              </div>

              {/* Recent sessions list / loading / error / empty */}
              {shiftsQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Spin size="small" />
                </div>
              ) : shiftsError ? (
                <div className="rounded-xl bg-red-50/60 dark:bg-red-900/10 p-3 text-xs text-red-600 dark:text-red-400">
                  {shiftsError.message || 'Could not load shift data.'}
                </div>
              ) : todayShifts.length > 0 ? (
                <div className="space-y-2">
                  {todayShifts.slice(0, 5).map((s: any) => {
                    const u = s.employee?.userId;
                    const name = u
                      ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email
                      : 'Unknown';
                    const siteLabel = s.site?.name ?? '—';
                    return (
                      <button
                        key={s._id}
                        onClick={() => navigate(`/shift-sessions/${s._id}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl
                          hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500
                          flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(name?.[0] || 'E').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</div>
                          <div className="text-xs text-[var(--text-secondary)] truncate">
                            {siteLabel} · {dayjs(s.shiftStartedAt).format('h:mm A')}
                          </div>
                        </div>
                        <Tag color={s.status === 'active' ? 'green' : 'blue'} className="!m-0 shrink-0">
                          {s.status === 'active' ? 'ACTIVE' : 'DONE'}
                        </Tag>
                      </button>
                    );
                  })}
                  {shiftStats.total > 5 && (
                    <div className="text-center text-xs text-[var(--text-secondary)] pt-1">
                      +{shiftStats.total - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <WidgetEmpty text="No shifts started today" />
              )}

              <button
                onClick={() => navigate('/shift-sessions/report')}
                className="mt-3 w-full flex items-center justify-center gap-1.5
                  py-2 rounded-xl text-sm font-medium
                  bg-gradient-to-r from-violet-500 to-blue-500 text-white
                  hover:from-violet-600 hover:to-blue-600 transition shadow-sm"
              >
                View Consolidated Report <ArrowRight size={14} />
              </button>
            </WidgetCard>
          </AnimateIn>
        )}

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

        {/* Confirmation Due */}
        <AnimateIn variant="fadeUp" delay={0.24}>
          <WidgetCard title="Confirmation Due" accentColor="from-purple-500 to-violet-500" icon={<ShieldCheck size={16} />}>
            <WidgetEmpty text="No confirmations due" />
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
