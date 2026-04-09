import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Star,
  Target,
  TrendingUp,
  ClipboardCheck,
  Eye,
  Edit2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import type { StatsCardProps } from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';
import DatePicker from '@/components/shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDate, getInitials } from '@/lib/formatters';
import {
  useReviewList,
  useGoalList,
  useCreateGoal,
} from '@/hooks/queries/usePerformance';

// ----- Types -----

type ReviewStatus = 'draft' | 'self_review' | 'manager_review' | 'hr_review' | 'completed';
type ReviewType = 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'probation';
type RatingLabel = 'outstanding' | 'exceeds_expectations' | 'meets_expectations' | 'needs_improvement' | 'unsatisfactory';
type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
type GoalCategory = 'performance' | 'learning' | 'project' | 'behavioral';

interface Review {
  key: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  reviewer: string;
  period: string;
  type: ReviewType;
  overallRating: number;
  ratingLabel: RatingLabel;
  status: ReviewStatus;
}

interface Goal {
  key: string;
  employeeName: string;
  employeeEmail: string;
  goalTitle: string;
  category: GoalCategory;
  priority: GoalPriority;
  startDate: string;
  dueDate: string;
  progress: number;
  status: GoalStatus;
}

// ----- Color maps -----

const reviewTypeColorMap: Record<ReviewType, string> = {
  'monthly': 'bg-green-50 text-green-700 border-green-200',
  'quarterly': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'half_yearly': 'bg-purple-50 text-purple-700 border-purple-200',
  'annual': 'bg-blue-50 text-blue-700 border-blue-200',
  'probation': 'bg-amber-50 text-amber-700 border-amber-200',
};

const ratingColorMap: Record<RatingLabel, string> = {
  'outstanding': 'bg-green-50 text-green-700 border-green-200',
  'exceeds_expectations': 'bg-blue-50 text-blue-700 border-blue-200',
  'meets_expectations': 'bg-amber-50 text-amber-700 border-amber-200',
  'needs_improvement': 'bg-orange-50 text-orange-700 border-orange-200',
  'unsatisfactory': 'bg-red-50 text-red-700 border-red-200',
};

const goalPriorityColorMap: Record<GoalPriority, string> = {
  'low': 'bg-gray-50 text-gray-600 border-gray-200',
  'medium': 'bg-orange-50 text-orange-700 border-orange-200',
  'high': 'bg-red-50 text-red-700 border-red-200',
  'critical': 'bg-red-100 text-red-800 border-red-300',
};

const goalCategoryColorMap: Record<GoalCategory, string> = {
  'performance': 'bg-blue-50 text-blue-700 border-blue-200',
  'learning': 'bg-purple-50 text-purple-700 border-purple-200',
  'project': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'behavioral': 'bg-amber-50 text-amber-700 border-amber-200',
};

// ----- Mock Data -----

const reviews: Review[] = [
  { key: '1', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', department: 'Engineering', reviewer: 'Ananya Reddy', period: 'Apr 2025 - Mar 2026', type: 'annual', overallRating: 4.5, ratingLabel: 'outstanding', status: 'completed' },
  { key: '2', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', department: 'Marketing', reviewer: 'Ravi Mehta', period: 'Apr 2025 - Mar 2026', type: 'annual', overallRating: 4, ratingLabel: 'exceeds_expectations', status: 'completed' },
  { key: '3', employeeName: 'Amit Patel', employeeEmail: 'amit@company.com', department: 'Finance', reviewer: 'Sunita Agarwal', period: 'Jan 2026 - Mar 2026', type: 'quarterly', overallRating: 3, ratingLabel: 'meets_expectations', status: 'manager_review' },
  { key: '4', employeeName: 'Sneha Gupta', employeeEmail: 'sneha@company.com', department: 'HR', reviewer: 'Deepak Joshi', period: 'Apr 2025 - Mar 2026', type: 'annual', overallRating: 3.5, ratingLabel: 'meets_expectations', status: 'hr_review' },
  { key: '5', employeeName: 'Vikram Joshi', employeeEmail: 'vikram@company.com', department: 'Sales', reviewer: 'Meera Nair', period: 'Oct 2025 - Mar 2026', type: 'probation', overallRating: 2.5, ratingLabel: 'needs_improvement', status: 'completed' },
  { key: '6', employeeName: 'Ananya Reddy', employeeEmail: 'ananya@company.com', department: 'Engineering', reviewer: 'Deepak Joshi', period: 'Apr 2025 - Sep 2025', type: 'half_yearly', overallRating: 4, ratingLabel: 'exceeds_expectations', status: 'completed' },
  { key: '7', employeeName: 'Deepak Joshi', employeeEmail: 'deepak@company.com', department: 'Engineering', reviewer: 'VP Engineering', period: 'Apr 2025 - Mar 2026', type: 'annual', overallRating: 0, ratingLabel: 'meets_expectations', status: 'self_review' },
  { key: '8', employeeName: 'Kavita Mishra', employeeEmail: 'kavita@company.com', department: 'Marketing', reviewer: 'Ravi Mehta', period: 'Jan 2026 - Mar 2026', type: 'quarterly', overallRating: 0, ratingLabel: 'meets_expectations', status: 'draft' },
  { key: '9', employeeName: 'Suresh Reddy', employeeEmail: 'suresh@company.com', department: 'Engineering', reviewer: 'Ananya Reddy', period: 'Apr 2025 - Mar 2026', type: 'annual', overallRating: 2, ratingLabel: 'unsatisfactory', status: 'completed' },
];

const goals: Goal[] = [
  { key: '1', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', goalTitle: 'Complete AWS Solutions Architect Certification', category: 'Learning', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 70, status: 'in_progress' },
  { key: '2', employeeName: 'Rahul Sharma', employeeEmail: 'rahul@company.com', goalTitle: 'Mentor 2 junior developers', category: 'Performance', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-12-31', progress: 50, status: 'in_progress' },
  { key: '3', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', goalTitle: 'Increase organic traffic by 40%', category: 'Project', priority: 'High', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 60, status: 'in_progress' },
  { key: '4', employeeName: 'Priya Singh', employeeEmail: 'priya@company.com', goalTitle: 'Launch content marketing framework', category: 'Project', priority: 'High', startDate: '2025-10-01', dueDate: '2026-03-31', progress: 100, status: 'completed' },
  { key: '5', employeeName: 'Amit Patel', employeeEmail: 'amit@company.com', goalTitle: 'Implement automated reconciliation system', category: 'Learning', priority: 'High', startDate: '2026-01-15', dueDate: '2026-04-30', progress: 30, status: 'in_progress' },
  { key: '6', employeeName: 'Sneha Gupta', employeeEmail: 'sneha@company.com', goalTitle: 'Improve employee retention by 15%', category: 'Project', priority: 'High', startDate: '2026-01-01', dueDate: '2026-12-31', progress: 25, status: 'in_progress' },
  { key: '7', employeeName: 'Vikram Joshi', employeeEmail: 'vikram@company.com', goalTitle: 'Achieve quarterly sales target of 50L', category: 'Project', priority: 'High', startDate: '2026-01-01', dueDate: '2026-03-31', progress: 80, status: 'deferred' },
  { key: '8', employeeName: 'Ananya Reddy', employeeEmail: 'ananya@company.com', goalTitle: 'Deliver microservices migration project', category: 'Learning', priority: 'High', startDate: '2025-07-01', dueDate: '2026-06-30', progress: 85, status: 'in_progress' },
  { key: '9', employeeName: 'Deepak Joshi', employeeEmail: 'deepak@company.com', goalTitle: 'Complete public speaking course', category: 'Behavioral', priority: 'Low', startDate: '2026-02-01', dueDate: '2026-08-31', progress: 10, status: 'in_progress' },
  { key: '10', employeeName: 'Kavita Mishra', employeeEmail: 'kavita@company.com', goalTitle: 'Learn advanced analytics tools', category: 'Learning', priority: 'Medium', startDate: '2026-03-01', dueDate: '2026-09-30', progress: 0, status: 'not_started' },
  { key: '11', employeeName: 'Suresh Reddy', employeeEmail: 'suresh@company.com', goalTitle: 'Improve code review turnaround time', category: 'Learning', priority: 'Medium', startDate: '2026-01-01', dueDate: '2026-06-30', progress: 45, status: 'in_progress' },
];

// ----- Star Rating Display -----

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled
                ? 'fill-amber-400 text-amber-400'
                : half
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        );
      })}
    </div>
  );
}

// ----- Component -----

const PerformanceList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [reviewTypeFilter, setReviewTypeFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Goal form state
  const [goalEmployee, setGoalEmployee] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [goalPriority, setGoalPriority] = useState('');
  const [goalStartDate, setGoalStartDate] = useState<Date | undefined>(undefined);
  const [goalDueDate, setGoalDueDate] = useState<Date | undefined>(undefined);
  const [goalDescription, setGoalDescription] = useState('');

  // API hooks
  const reviewParams = {
    page: String(page),
    limit: String(limit),
    ...(searchText ? { search: searchText } : {}),
    ...(reviewTypeFilter !== 'All' ? { type: reviewTypeFilter } : {}),
    ...(reviewStatusFilter !== 'All' ? { status: reviewStatusFilter } : {}),
  };
  const { data: reviewData, isLoading: isLoadingReviews } = useReviewList(reviewParams);
  const { data: goalData, isLoading: isLoadingGoals } = useGoalList(
    searchText ? { search: searchText } : undefined
  );
  const createGoalMutation = useCreateGoal();
  // createReviewMutation available via useCreateReview() - navigates to form page
  // updateGoalProgressMutation available via useUpdateGoalProgress() when progress UI is added

  const reviewList: Review[] = reviewData?.data ?? reviews;
  const goalList: Goal[] = goalData?.data ?? goals;
  const reviewPagination = reviewData?.pagination;

  const statsCards: StatsCardProps[] = [
    { title: 'Total Reviews', value: reviewList.length, icon: <ClipboardCheck className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Pending Reviews', value: reviewList.filter(r => r.status !== 'Completed').length, icon: <Star className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Active Goals', value: goalList.filter(g => g.status === 'InProgress').length, icon: <Target className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Avg. Rating', value: '3.8', icon: <TrendingUp className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  const filteredReviews = useMemo(() => {
    if (reviewData?.data) return reviewList;
    return reviews.filter(r => {
      const matchesSearch = r.employeeName.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = reviewTypeFilter === 'All' || r.type === reviewTypeFilter;
      const matchesStatus = reviewStatusFilter === 'All' || r.status === reviewStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchText, reviewTypeFilter, reviewStatusFilter, reviewData, reviewList]);

  const filteredGoals = useMemo(() => {
    if (goalData?.data) return goalList;
    return goals.filter(g =>
      g.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
      g.goalTitle.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, goalData, goalList]);

  // ----- Review Columns -----
  const reviewColumns: ColumnDef<Review>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(row.original.employeeName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.employeeName}</div>
            <div className="text-xs text-muted-foreground">{row.original.department}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'reviewer',
      header: 'Reviewer',
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.period}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className={reviewTypeColorMap[row.original.type]}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: ({ row }) =>
        row.original.overallRating > 0 ? (
          <div className="flex items-center gap-2">
            <StarRating rating={row.original.overallRating} />
            <Badge variant="outline" className={ratingColorMap[row.original.ratingLabel]}>
              {row.original.ratingLabel}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Pending</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-blue-600"
            onClick={() => navigate('/performance/review')}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            View
          </Button>
          {row.original.status !== 'Completed' && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-blue-600"
              onClick={() => navigate('/performance/review')}
            >
              <Edit2 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ----- Goal Columns -----
  const goalColumns: ColumnDef<Goal>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-blue-600 text-white text-[10px]">
              {getInitials(row.original.employeeName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.employeeName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'goalTitle',
      header: 'Goal',
      cell: ({ row }) => (
        <span className="max-w-[280px] block truncate" title={row.original.goalTitle}>
          {row.original.goalTitle}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className={goalCategoryColorMap[row.original.category]}>
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant="outline" className={goalPriorityColorMap[row.original.priority]}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.startDate)}
        </span>
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const val = row.original.progress;
        return (
          <div className="flex items-center gap-2 w-[130px]">
            <Progress
              value={val}
              className="h-2 flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">{val}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
          <Edit2 className="mr-1 h-3.5 w-3.5" />
          Edit
        </Button>
      ),
    },
  ];

  const resetGoalForm = () => {
    setGoalEmployee('');
    setGoalTitle('');
    setGoalCategory('');
    setGoalPriority('');
    setGoalStartDate(undefined);
    setGoalDueDate(undefined);
    setGoalDescription('');
  };

  const handleAddGoal = () => {
    if (!goalEmployee || !goalTitle || !goalCategory || !goalPriority) {
      toast.error('Please fill in required fields');
      return;
    }
    createGoalMutation.mutate(
      {
        employeeId: goalEmployee,
        goalTitle,
        category: goalCategory,
        priority: goalPriority,
        startDate: goalStartDate?.toISOString(),
        dueDate: goalDueDate?.toISOString(),
        description: goalDescription,
      },
      {
        onSuccess: () => {
          toast.success('Goal added successfully');
          setGoalModalOpen(false);
          resetGoalForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to add goal'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        description="Track employee reviews, ratings, and goals"
        actions={
          <Button onClick={() => navigate('/performance/review')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Review
          </Button>
        }
      />

      <StatsGrid stats={statsCards} />

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          <DataTable
            columns={reviewColumns}
            data={filteredReviews}
            isLoading={isLoadingReviews}
            searchKey="employeeName"
            searchPlaceholder="Search employees..."
            onSearchChange={setSearchText}
            pagination={reviewPagination ?? { page, limit, total: filteredReviews.length, totalPages: Math.ceil(filteredReviews.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
            filterContent={
              <div className="flex items-center gap-2">
                <Select value={reviewTypeFilter} onValueChange={setReviewTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half_yearly">Half Yearly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="probation">Probation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="self_review">Self Review</SelectItem>
                    <SelectItem value="manager_review">Manager Review</SelectItem>
                    <SelectItem value="hr_review">HR Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setGoalModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
          <DataTable
            columns={goalColumns}
            data={filteredGoals}
            isLoading={isLoadingGoals}
            searchKey="goalTitle"
            searchPlaceholder="Search goals..."
            onSearchChange={setSearchText}
          />
        </TabsContent>
      </Tabs>

      {/* Add Goal Modal */}
      <FormDialog
        open={goalModalOpen}
        onOpenChange={(open) => {
          setGoalModalOpen(open);
          if (!open) resetGoalForm();
        }}
        title="Add New Goal"
        description="Set a new performance goal for an employee"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select value={goalEmployee} onValueChange={setGoalEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rahul">Rahul Sharma</SelectItem>
                <SelectItem value="priya">Priya Singh</SelectItem>
                <SelectItem value="amit">Amit Patel</SelectItem>
                <SelectItem value="sneha">Sneha Gupta</SelectItem>
                <SelectItem value="vikram">Vikram Joshi</SelectItem>
                <SelectItem value="ananya">Ananya Reddy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Goal Title *</Label>
            <Input
              placeholder="e.g. Complete AWS certification"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={goalCategory} onValueChange={setGoalCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select value={goalPriority} onValueChange={setGoalPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <DatePicker
                value={goalStartDate}
                onChange={setGoalStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <DatePicker
                value={goalDueDate}
                onChange={setGoalDueDate}
                placeholder="Select due date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe the goal in detail"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setGoalModalOpen(false);
                resetGoalForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default PerformanceList;
