import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Plus, Briefcase, Users, CalendarCheck, UserCheck,
  MoreHorizontal, Edit2, Eye, XCircle, MapPin, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useJobList,
  useCreateJob,
  useUpdateJob,
} from '@/hooks/queries/useRecruitment';

import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import DatePicker from '@/components/shared/DatePicker';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type JobStatus = 'draft' | 'open' | 'on_hold' | 'closed' | 'filled';

interface JobPosting {
  key: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  applications: number;
  vacancies: number;
  status: JobStatus;
  deadline: string;
  skills: string[];
  postedDate: string;
}

const jobPostings: JobPosting[] = [
  { key: '1', title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', employmentType: 'full_time', experienceMin: 4, experienceMax: 8, salaryMin: 1500000, salaryMax: 2500000, applications: 42, vacancies: 3, status: 'open', deadline: '2026-05-15', skills: ['React', 'TypeScript', 'Node.js'], postedDate: '2026-03-20' },
  { key: '2', title: 'DevOps Engineer', department: 'Engineering', location: 'Hyderabad', employmentType: 'full_time', experienceMin: 3, experienceMax: 6, salaryMin: 1200000, salaryMax: 2000000, applications: 28, vacancies: 2, status: 'open', deadline: '2026-05-10', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], postedDate: '2026-03-18' },
  { key: '3', title: 'Marketing Manager', department: 'Marketing', location: 'Mumbai', employmentType: 'full_time', experienceMin: 5, experienceMax: 10, salaryMin: 1800000, salaryMax: 3000000, applications: 15, vacancies: 1, status: 'open', deadline: '2026-04-30', skills: ['Digital Marketing', 'SEO', 'Content Strategy'], postedDate: '2026-03-15' },
  { key: '4', title: 'Data Analyst Intern', department: 'Analytics', location: 'Pune', employmentType: 'intern', experienceMin: 0, experienceMax: 1, salaryMin: 300000, salaryMax: 500000, applications: 65, vacancies: 5, status: 'open', deadline: '2026-04-25', skills: ['Python', 'SQL', 'Excel', 'Power BI'], postedDate: '2026-03-10' },
  { key: '5', title: 'HR Business Partner', department: 'HR', location: 'Delhi NCR', employmentType: 'full_time', experienceMin: 6, experienceMax: 12, salaryMin: 2000000, salaryMax: 3500000, applications: 8, vacancies: 1, status: 'on_hold', deadline: '2026-05-20', skills: ['HRBP', 'Employee Relations', 'Talent Management'], postedDate: '2026-03-05' },
  { key: '6', title: 'UI/UX Designer', department: 'Design', location: 'Bangalore', employmentType: 'contract', experienceMin: 2, experienceMax: 5, salaryMin: 900000, salaryMax: 1600000, applications: 34, vacancies: 2, status: 'closed', deadline: '2026-03-30', skills: ['Figma', 'Adobe XD', 'Prototyping'], postedDate: '2026-02-20' },
  { key: '7', title: 'Finance Controller', department: 'Finance', location: 'Mumbai', employmentType: 'full_time', experienceMin: 8, experienceMax: 15, salaryMin: 3000000, salaryMax: 5000000, applications: 5, vacancies: 1, status: 'filled', deadline: '2026-03-15', skills: ['CA', 'Financial Planning', 'Compliance'], postedDate: '2026-01-25' },
  { key: '8', title: 'Sales Executive', department: 'Sales', location: 'Chennai', employmentType: 'full_time', experienceMin: 1, experienceMax: 4, salaryMin: 600000, salaryMax: 1000000, applications: 0, vacancies: 4, status: 'draft', deadline: '2026-05-30', skills: ['B2B Sales', 'CRM', 'Negotiation'], postedDate: '2026-04-05' },
];

const typeBadgeClass: Record<string, string> = {
  full_time: 'bg-blue-100 text-blue-700',
  part_time: 'bg-cyan-100 text-cyan-700',
  contract: 'bg-purple-100 text-purple-700',
  intern: 'bg-yellow-100 text-yellow-700',
  freelancer: 'bg-green-100 text-green-700',
};

const formatSalary = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  return `${(val / 1000).toFixed(0)}K`;
};

const JobPostings: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API hooks
  const queryParams = {
    page: String(page),
    limit: String(limit),
    ...(searchText ? { search: searchText } : {}),
    ...(activeTab !== 'All' ? { status: activeTab } : {}),
  };
  const { data: jobData, isLoading } = useJobList(queryParams);
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  // deleteJobMutation available via useDeleteJob() when delete UI is added

  const jobList: JobPosting[] = jobData?.data ?? jobPostings;
  const jobPagination = jobData?.pagination;

  const filteredPostings = jobData?.data ? jobList : jobPostings.filter(jp => {
    const matchesSearch = jp.title.toLowerCase().includes(searchText.toLowerCase()) ||
      jp.department.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = activeTab === 'All' || jp.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabCounts: Record<string, number> = {
    All: jobList.length,
    draft: jobList.filter(j => j.status === 'draft').length,
    open: jobList.filter(j => j.status === 'open').length,
    on_hold: jobList.filter(j => j.status === 'on_hold').length,
    closed: jobList.filter(j => j.status === 'closed').length,
    filled: jobList.filter(j => j.status === 'filled').length,
  };

  const stats = [
    { title: 'Open Positions', value: jobList.filter(j => j.status === 'open').length, icon: <Briefcase size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
    { title: 'Total Applications', value: jobList.reduce((s, j) => s + j.applications, 0), icon: <Users size={20} />, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950' },
    { title: 'Interviews Scheduled', value: 18, icon: <CalendarCheck size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
    { title: 'Hired This Month', value: 6, icon: <UserCheck size={20} />, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-950' },
  ];

  const columns: ColumnDef<JobPosting>[] = [
    {
      accessorKey: 'title',
      header: 'Job Title',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <p className="font-medium">{r.title}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <MapPin size={12} /> {r.location}
              <span>|</span>
              <Clock size={12} /> {r.experienceMin}-{r.experienceMax} yrs
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <Badge variant="outline" className="bg-blue-100 text-blue-700">{row.original.department}</Badge>,
    },
    {
      accessorKey: 'employmentType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className={typeBadgeClass[row.original.employmentType] || ''}>
          {row.original.employmentType}
        </Badge>
      ),
    },
    {
      id: 'salary',
      header: 'Salary Range',
      cell: ({ row }) => (
        <span className="text-sm">{formatSalary(row.original.salaryMin)} - {formatSalary(row.original.salaryMax)}</span>
      ),
    },
    {
      accessorKey: 'applications',
      header: 'Applications',
      cell: ({ row }) => {
        const val = row.original.applications;
        return (
          <Badge variant={val > 0 ? 'default' : 'secondary'}>
            {val}
          </Badge>
        );
      },
    },
    { accessorKey: 'vacancies', header: 'Vacancies' },
    {
      accessorKey: 'deadline',
      header: 'Deadline',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.deadline}</span>,
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Applications</DropdownMenuItem>
            <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem
              className={row.original.status === 'Open' ? 'text-destructive focus:text-destructive' : ''}
              onClick={() => updateJobMutation.mutate(
                { id: row.original.key, data: { status: row.original.status === 'Open' ? 'Closed' : 'Open' } },
                {
                  onSuccess: () => toast.success(`Job posting "${row.original.title}" status updated`),
                  onError: (err: any) => toast.error(err?.message || 'Failed to update status'),
                }
              )}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {row.original.status === 'Open' ? 'Close Posting' : 'Reopen'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleCreate = (formData?: any) => {
    createJobMutation.mutate(formData ?? {}, {
      onSuccess: () => {
        toast.success('Job posting created successfully');
        setDrawerOpen(false);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to create job posting'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment"
        description="Manage job postings and track applications"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Job Posting
          </Button>
        }
      />

      <StatsGrid stats={stats} />

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {Object.entries(tabCounts).map(([key, count]) => (
                <TabsTrigger key={key} value={key} className="gap-1.5">
                  {key}
                  <Badge variant={key === activeTab ? 'default' : 'secondary'} className="ml-1 h-5 px-1.5 text-[10px]">
                    {count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mb-4">
            <Input
              placeholder="Search job postings..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredPostings}
            isLoading={isLoading}
            pagination={jobPagination ?? { page, limit, total: filteredPostings.length, totalPages: Math.ceil(filteredPostings.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      <FormSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Create Job Posting"
        description="Fill in all required details for the new job posting."
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Job Title *</Label>
            <Input placeholder="e.g. Senior React Developer" />
          </div>
          <div className="space-y-2">
            <Label>Job Description *</Label>
            <Textarea rows={4} placeholder="Describe the role, responsibilities, and requirements" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'Design', 'Analytics'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input placeholder="e.g. Senior Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {['Bangalore', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Pune', 'Chennai', 'Remote'].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Experience (years) *</Label>
              <Input type="number" min={0} max={30} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Max Experience (years) *</Label>
              <Input type="number" min={0} max={30} placeholder="5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Salary (Annual INR) *</Label>
              <Input type="number" placeholder="e.g. 1200000" />
            </div>
            <div className="space-y-2">
              <Label>Max Salary (Annual INR) *</Label>
              <Input type="number" placeholder="e.g. 2000000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Qualifications</Label>
            <Textarea rows={2} placeholder="e.g. B.Tech/B.E. in Computer Science or equivalent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Vacancies *</Label>
              <Input type="number" min={1} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label>Application Deadline *</Label>
              <DatePicker onChange={() => {}} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </FormSheet>
    </div>
  );
};

export default JobPostings;
