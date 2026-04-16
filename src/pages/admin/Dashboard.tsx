import React, { useState, useMemo, useCallback } from 'react';
import { Card, Typography, Row, Col, Input, Table, Calendar, Tag, Empty, Select, Tooltip } from 'antd';
import {
  Users, ClipboardList, Clock, Palmtree, CalendarCheck, Banknote,
  CircleDollarSign, IndianRupee, UserCheck, UserX, Search,
  Cake, PartyPopper, FileCheck, UserPlus, CarFront, Award, AlertTriangle,
  Megaphone, ChevronRight, RefreshCw, Minus, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useDashboardStats, useBirthdays, useAnniversaries } from '@/hooks/queries/useDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import AnimateIn from '@/components/AnimateIn';

const { Title, Text } = Typography;

// ─── Quick Action Button ─────────────────────────────────────────────────────
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  count?: number | string;
  variant?: 'action' | 'stat';
  statColor?: string;
}

function QuickAction({ icon, label, onClick, count, variant = 'action', statColor }: QuickActionProps) {
  if (variant === 'stat') {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 px-2 group cursor-pointer">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${statColor || 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'}`}>
          <span className="text-lg font-bold">{count ?? '?'}</span>
        </div>
        <span className="text-[10px] text-center leading-tight text-gray-600 dark:text-gray-400 max-w-[80px]">{label}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-2 group cursor-pointer">
      <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500 flex items-center justify-center text-red-500 dark:text-red-400 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[10px] text-center leading-tight text-gray-600 dark:text-gray-400 max-w-[80px]">{label}</span>
    </button>
  );
}

// ─── Dashboard Widget Card ───────────────────────────────────────────────────
interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  borderColor?: string;
  className?: string;
  minHeight?: number;
  onRefresh?: () => void;
}

function WidgetCard({ title, children, borderColor = 'border-t-cyan-500', className = '', minHeight = 220, onRefresh }: WidgetCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    onRefresh?.();
    setTimeout(() => setSpinning(false), 600);
  }, [onRefresh]);

  return (
    <Card
      bordered={false}
      className={`!rounded-lg !shadow-sm overflow-hidden ${className}`}
      styles={{ body: { padding: 0 } }}
    >
      <div className={`border-t-[3px] ${borderColor}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
          <div className="flex items-center gap-1">
            <Tooltip title="Refresh">
              <button
                onClick={handleRefresh}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <RefreshCw size={13} className={spinning ? 'animate-spin' : ''} />
              </button>
            </Tooltip>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {collapsed ? <Plus size={13} /> : <Minus size={13} />}
              </button>
            </Tooltip>
          </div>
        </div>
        {!collapsed && (
          <div className="px-4 py-3" style={{ minHeight }}>
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Empty Widget Placeholder ────────────────────────────────────────────────
function WidgetEmpty({ text = 'No records found' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />
    </div>
  );
}

// ─── Dated Entry (for Notice Board, DL Expired, etc.) ────────────────────────
function DatedEntry({ date, children }: { date: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="shrink-0 w-14 text-center rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-1 py-0.5">
        <div className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-tight">{date}</div>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-snug flex-1">{children}</div>
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

  const apiStats = statsData?.data;
  const birthdays: any[] = birthdayData?.data ?? [];
  const anniversaries: any[] = anniversaryData?.data ?? [];

  const presentToday = apiStats?.todayAttendance?.present ?? 0;
  const absentToday = apiStats?.todayAttendance?.absent ?? 0;
  const onLeaveToday = apiStats?.todayAttendance?.onLeave ?? apiStats?.pendingLeaves ?? 0;
  const totalEmp = apiStats?.totalEmployees ?? 0;

  // ─── Employee Quick Search (local) ───────────────────────────────────────
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // ─── Todo filter ─────────────────────────────────────────────────────────
  const [todoFilter, setTodoFilter] = useState('all');

  // ─── Calendar ────────────────────────────────────────────────────────────
  const today = dayjs();

  // Format helper
  const fmtDate = (d: string | undefined) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Quick-search table columns (employee attendance for today)
  const quickSearchCols = useMemo(() => [
    { title: today.format('DD-MMM-YYYY'), dataIndex: 'name', key: 'name', width: 200 },
    { title: 'CheckIn', dataIndex: 'checkIn', key: 'checkIn', width: 120 },
    { title: 'CheckOut', dataIndex: 'checkOut', key: 'checkOut', width: 120 },
    { title: 'O.D. / Leave/Over Time', dataIndex: 'odLeaveOt', key: 'odLeaveOt' },
  ], [today]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <AnimateIn variant="fadeIn">
        <Title level={4} className="!mb-0 text-center tracking-widest uppercase text-gray-600 dark:text-gray-300">
          Dashboard Human-Resource
        </Title>
      </AnimateIn>

      {/* ─── Quick Actions Row ───────────────────────────────────────────── */}
      <AnimateIn variant="fadeUp">
        <Card bordered={false} className="!rounded-xl !shadow-sm" styles={{ body: { padding: '16px 12px' } }}>
          <div className="flex items-center justify-center flex-wrap gap-3">
            <QuickAction icon={<Users size={22} />} label="Employee Master List" onClick={() => navigate('/master/employee/list')} />
            <QuickAction icon={<Palmtree size={22} />} label="Leave List" onClick={() => navigate('/transaction/leave/application-list')} />
            <QuickAction icon={<ClipboardList size={22} />} label="On Duty List" onClick={() => navigate('/transaction/on-duty/list')} />
            <QuickAction icon={<Clock size={22} />} label="Over Time List" onClick={() => navigate('/transaction/overtime/list')} />
            <QuickAction icon={<CalendarCheck size={22} />} label="Attendance List" onClick={() => navigate('/transaction/attendance/month-wise')} />
            <QuickAction icon={<Banknote size={22} />} label="Loan & Advance List" onClick={() => navigate('/transaction/loan-advance/list')} />
            <QuickAction icon={<CircleDollarSign size={22} />} label="Addition Deduction" onClick={() => navigate('/transaction/other-add-ded/addition')} />
            <QuickAction icon={<IndianRupee size={22} />} label="Salary Calculat... List" onClick={() => navigate('/transaction/salary/list')} />

            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 mx-1" />

            <QuickAction variant="stat" label="Present" count={presentToday} onClick={() => navigate('/transaction/attendance/day-wise')} statColor="border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600" />
            <QuickAction variant="stat" label="Absent" count={absentToday} onClick={() => navigate('/transaction/attendance/day-wise')} statColor="border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600" />
            <QuickAction variant="stat" label="Leave" count={onLeaveToday} onClick={() => navigate('/transaction/leave/application-list')} statColor="border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600" />
            <QuickAction variant="stat" label="Total" count={totalEmp} onClick={() => navigate('/master/employee/list')} statColor="border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" />
          </div>
        </Card>
      </AnimateIn>

      {/* ─── Row 1: Employee Quick Search + Today's Birthday ─────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.1}>
            <WidgetCard title="Employee Quick Search" borderColor="border-t-cyan-500" minHeight={200}>
              <Table
                size="small"
                columns={quickSearchCols}
                dataSource={[]}
                pagination={false}
                locale={{ emptyText: (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <Input
                      placeholder="Enter Employee Name OR Employee Code"
                      prefix={<Search size={14} className="text-gray-400" />}
                      value={quickSearchQuery}
                      onChange={(e) => setQuickSearchQuery(e.target.value)}
                      style={{ width: 340 }}
                    />
                  </div>
                )}}
                scroll={{ x: 500 }}
              />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.15}>
            <WidgetCard title="Today's Birthday" borderColor="border-t-orange-400" minHeight={200}>
              {birthdays.length > 0 ? (
                <div className="space-y-2">
                  {birthdays.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <Cake size={16} className="text-orange-400 shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{b.firstName || b.name || 'Employee'} {b.lastName || ''}</div>
                        <div className="text-xs text-gray-400">{b.department || b.designation || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <WidgetEmpty text="No birthdays today" />
              )}
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>

      {/* ─── Row 2: Todo List + Resignation Approval ─────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.2}>
            <WidgetCard title="Todo List" borderColor="border-t-green-500" minHeight={180}>
              <div className="flex items-center gap-3 mb-3">
                <Select
                  size="small"
                  value={todoFilter}
                  onChange={setTodoFilter}
                  options={[
                    { value: 'all', label: 'ALL' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                  style={{ width: 200 }}
                />
                <button className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition">
                  <Search size={14} />
                </button>
              </div>
              <WidgetEmpty text="No todo items" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.25}>
            <WidgetCard title="Resignation Approval" borderColor="border-t-red-400" minHeight={180}>
              <WidgetEmpty text="No pending resignations" />
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>

      {/* ─── Row 3: Image Gallery + Confirmation Due + Top 10 Working Hrs ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <AnimateIn variant="fadeUp" delay={0.3}>
            <WidgetCard title="Image Gallery" borderColor="border-t-yellow-400" minHeight={240}>
              <div className="flex items-center justify-center h-[200px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-300 dark:text-blue-700 mb-2">PAYROLL</div>
                  <Text type="secondary" className="text-xs">Company image gallery</Text>
                </div>
              </div>
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <div className="space-y-4">
            <AnimateIn variant="fadeUp" delay={0.35}>
              <WidgetCard title="Confirmation Due" borderColor="border-t-purple-400" minHeight={90}>
                <WidgetEmpty text="No confirmations due" />
              </WidgetCard>
            </AnimateIn>
            <AnimateIn variant="fadeUp" delay={0.38}>
              <WidgetCard title="Top 10 Employee (Working Hrs)" borderColor="border-t-teal-400" minHeight={90}>
                <WidgetEmpty text="No data available" />
              </WidgetCard>
            </AnimateIn>
          </div>
        </Col>
      </Row>

      {/* ─── Row 4: Calendar + Public Holidays + Employee's Leave ─────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.4}>
            <WidgetCard title="Calendar" borderColor="border-t-gray-400" minHeight={300}>
              <Calendar
                fullscreen={false}
                defaultValue={today}
                headerRender={({ value, onChange }) => (
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => onChange(value.subtract(1, 'month'))}
                      className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      &lt;
                    </button>
                    <span className="font-semibold text-sm">{value.format('MMMM-YYYY')}</span>
                    <button
                      onClick={() => onChange(value.add(1, 'month'))}
                      className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.45}>
            <WidgetCard title="Public/Optional Holidays" borderColor="border-t-yellow-500" minHeight={300}>
              <WidgetEmpty text="No Record Found!" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.5}>
            <WidgetCard title="Employee's Leave" borderColor="border-t-green-400" minHeight={300}>
              <WidgetEmpty text="No employees on leave" />
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>

      {/* ─── Row 5: Notice Board + Anniversary + Important Form ──────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.5}>
            <WidgetCard title="Notice Board" borderColor="border-t-red-400" minHeight={220}>
              <WidgetEmpty text="No notices" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.55}>
            <WidgetCard title="Anniversary" borderColor="border-t-green-500" minHeight={220}>
              {anniversaries.length > 0 ? (
                <div className="space-y-2">
                  {anniversaries.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1">
                      <PartyPopper size={16} className="text-green-500 shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{a.firstName || a.name || 'Employee'} {a.lastName || ''}</div>
                        <div className="text-xs text-gray-400">{a.years ? `${a.years} years` : a.joinDate ? fmtDate(a.joinDate) : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <WidgetEmpty text="No anniversaries today" />
              )}
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.6}>
            <WidgetCard title="Important Form" borderColor="border-t-amber-500" minHeight={220}>
              <WidgetEmpty text="No forms configured" />
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>

      {/* ─── Row 6: Newly Joined + DL Expired + 5 Year Completed ─────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.6}>
            <WidgetCard title="Newly Joined Employee" borderColor="border-t-green-500" minHeight={200}>
              <WidgetEmpty text="No new joiners" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.65}>
            <WidgetCard title="Driving Licence Expired" borderColor="border-t-green-500" minHeight={200}>
              <WidgetEmpty text="No expired licences" />
            </WidgetCard>
          </AnimateIn>
        </Col>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.7}>
            <WidgetCard title="Five Year Completed Employee" borderColor="border-t-green-500" minHeight={200}>
              <WidgetEmpty text="No records" />
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>

      {/* ─── Row 7: Employee Age Over 60 ─────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <AnimateIn variant="fadeUp" delay={0.7}>
            <WidgetCard title="Employee Age Over 60 Year" borderColor="border-t-yellow-500" minHeight={180}>
              <WidgetEmpty text="No records" />
            </WidgetCard>
          </AnimateIn>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
