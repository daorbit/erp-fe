import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Input, Table, Calendar, Select, Empty, Tooltip, Spin } from 'antd';
import {
  Users, ClipboardList, Clock, CalendarCheck, Banknote,
  CircleDollarSign, IndianRupee, Search,
  Cake, PartyPopper, RefreshCw, Minus, Plus,
  ChevronLeft, ChevronRight, UserPlus, CarFront, Award,
  AlertTriangle, Megaphone, FileText, ShieldCheck, BriefcaseBusiness,
  TrendingUp,
} from 'lucide-react';
import employeeService from '@/services/employeeService';
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

  const { data: statsData } = useDashboardStats();
  const { data: birthdayData } = useBirthdays();
  const { data: anniversaryData } = useAnniversaries();

  const birthdays: any[] = birthdayData?.data ?? [];
  const anniversaries: any[] = anniversaryData?.data ?? [];

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
