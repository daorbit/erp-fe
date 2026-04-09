import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft, Eye, Phone, Mail, Calendar, Star,
  ChevronRight, UserCheck, UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApplicationList,
  useUpdateApplicationStatus,
  useScheduleInterview,
} from '@/hooks/queries/useRecruitment';

import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import DatePicker from '@/components/shared/DatePicker';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getInitials } from '@/lib/formatters';

type AppStatus = 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'selected' | 'rejected' | 'offered' | 'hired' | 'withdrawn';

interface Application {
  key: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  currentSalary: number;
  expectedSalary: number;
  skills: string[];
  status: AppStatus;
  rating: number;
  appliedDate: string;
  currentCompany: string;
  noticePeriod: string;
  resumeUrl: string;
  position: string;
}

const statusStepMap: Record<string, number> = {
  applied: 0, screening: 1, shortlisted: 2, interview_scheduled: 3,
  interviewed: 4, selected: 5, offered: 6, hired: 7,
};

const pipelineSteps: AppStatus[] = ['applied', 'screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'offered', 'hired'];

const applications: Application[] = [
  { key: '1', name: 'Arun Kumar', email: 'arun.kumar@gmail.com', phone: '+91 9876543210', experience: 5, currentSalary: 1400000, expectedSalary: 2000000, skills: ['React', 'TypeScript', 'Node.js'], status: 'interview_scheduled', rating: 4, appliedDate: '2026-03-22', currentCompany: 'Infosys', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '2', name: 'Meera Nair', email: 'meera.nair@outlook.com', phone: '+91 9876543211', experience: 6, currentSalary: 1800000, expectedSalary: 2400000, skills: ['React', 'Next.js', 'GraphQL'], status: 'shortlisted', rating: 5, appliedDate: '2026-03-21', currentCompany: 'Wipro', noticePeriod: '90 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '3', name: 'Rajesh Verma', email: 'rajesh.v@yahoo.com', phone: '+91 9876543212', experience: 3, currentSalary: 900000, expectedSalary: 1500000, skills: ['React', 'JavaScript', 'CSS'], status: 'applied', rating: 3, appliedDate: '2026-03-25', currentCompany: 'TCS', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '4', name: 'Divya Sharma', email: 'divya.s@gmail.com', phone: '+91 9876543213', experience: 7, currentSalary: 2000000, expectedSalary: 2800000, skills: ['React', 'Redux', 'AWS', 'Docker'], status: 'selected', rating: 5, appliedDate: '2026-03-18', currentCompany: 'Flipkart', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '5', name: 'Suresh Reddy', email: 'suresh.r@gmail.com', phone: '+91 9876543214', experience: 4, currentSalary: 1200000, expectedSalary: 1800000, skills: ['React', 'Angular', 'TypeScript'], status: 'screening', rating: 3, appliedDate: '2026-03-24', currentCompany: 'HCL Technologies', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '6', name: 'Pooja Iyer', email: 'pooja.i@hotmail.com', phone: '+91 9876543215', experience: 2, currentSalary: 700000, expectedSalary: 1200000, skills: ['React', 'Vue.js', 'Tailwind'], status: 'rejected', rating: 2, appliedDate: '2026-03-20', currentCompany: 'Zoho', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '7', name: 'Karthik Menon', email: 'karthik.m@gmail.com', phone: '+91 9876543216', experience: 8, currentSalary: 2500000, expectedSalary: 3200000, skills: ['React', 'System Design', 'Microservices'], status: 'offered', rating: 5, appliedDate: '2026-03-15', currentCompany: 'Amazon', noticePeriod: '90 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '8', name: 'Anita Deshmukh', email: 'anita.d@gmail.com', phone: '+91 9876543217', experience: 5, currentSalary: 1600000, expectedSalary: 2200000, skills: ['React', 'Python', 'REST APIs'], status: 'hired', rating: 4, appliedDate: '2026-03-10', currentCompany: 'Capgemini', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '9', name: 'Vikram Singh', email: 'vikram.s@gmail.com', phone: '+91 9876543218', experience: 4, currentSalary: 1100000, expectedSalary: 1700000, skills: ['React', 'MongoDB', 'Express'], status: 'applied', rating: 3, appliedDate: '2026-03-26', currentCompany: 'Tech Mahindra', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '10', name: 'Lakshmi Prasad', email: 'lakshmi.p@gmail.com', phone: '+91 9876543219', experience: 6, currentSalary: 1900000, expectedSalary: 2500000, skills: ['React', 'Next.js', 'PostgreSQL'], status: 'interview_scheduled', rating: 4, appliedDate: '2026-03-19', currentCompany: 'Mindtree', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '11', name: 'Rohit Jain', email: 'rohit.j@gmail.com', phone: '+91 9876543220', experience: 3, currentSalary: 800000, expectedSalary: 1400000, skills: ['React', 'Firebase', 'Material UI'], status: 'screening', rating: 3, appliedDate: '2026-03-23', currentCompany: 'Freshworks', noticePeriod: '30 days', resumeUrl: '#', position: 'Senior React Developer' },
  { key: '12', name: 'Neha Kulkarni', email: 'neha.k@gmail.com', phone: '+91 9876543221', experience: 5, currentSalary: 1500000, expectedSalary: 2100000, skills: ['React', 'Storybook', 'Jest', 'Cypress'], status: 'shortlisted', rating: 4, appliedDate: '2026-03-17', currentCompany: 'Thoughtworks', noticePeriod: '60 days', resumeUrl: '#', position: 'Senior React Developer' },
];

const formatSalary = (val: number) => {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  return `${(val / 1000).toFixed(0)}K`;
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API hooks
  const appParams = {
    page: String(page),
    limit: String(limit),
    ...(searchText ? { search: searchText } : {}),
    ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
  };
  const { data: appData, isLoading } = useApplicationList(appParams);
  const updateStatusMutation = useUpdateApplicationStatus();
  const scheduleInterviewMutation = useScheduleInterview();

  const appList: Application[] = appData?.data ?? applications;
  const appPagination = appData?.pagination;

  const filteredApps = appData?.data ? appList : applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchText.toLowerCase()) ||
      app.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pipelineCounts: Record<string, number> = {
    applied: appList.filter(a => a.status === 'applied').length,
    screening: appList.filter(a => a.status === 'screening').length,
    shortlisted: appList.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: appList.filter(a => a.status === 'interview_scheduled').length,
    selected: appList.filter(a => a.status === 'selected').length,
    offered: appList.filter(a => a.status === 'offered').length,
    hired: appList.filter(a => a.status === 'hired').length,
  };

  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: 'name',
      header: 'Candidate',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.currentCompany}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs"><Mail size={12} className="text-muted-foreground" />{row.original.email}</div>
          <div className="flex items-center gap-1 text-xs"><Phone size={12} className="text-muted-foreground" />{row.original.phone}</div>
        </div>
      ),
    },
    { accessorKey: 'experience', header: 'Exp (yrs)' },
    {
      id: 'salary',
      header: 'Expected CTC',
      cell: ({ row }) => formatSalary(row.original.expectedSalary),
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skills.slice(0, 3).map(s => (
            <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
          ))}
          {row.original.skills.length > 3 && <Badge variant="secondary" className="text-[11px]">+{row.original.skills.length - 3}</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <StarRating value={row.original.rating} />,
    },
    {
      accessorKey: 'appliedDate',
      header: 'Applied',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.appliedDate}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="link" size="sm" className="gap-1" onClick={() => { setSelectedApp(row.original); setDrawerOpen(true); }}>
          <Eye size={14} /> View
        </Button>
      ),
    },
  ];

  const handleStatusChange = (newStatus: AppStatus) => {
    if (selectedApp) {
      updateStatusMutation.mutate(
        { id: selectedApp.key, data: { status: newStatus } },
        {
          onSuccess: () => {
            toast.success(`${selectedApp.name} moved to "${newStatus}"`);
            setDrawerOpen(false);
          },
          onError: (err: any) => toast.error(err?.message || 'Failed to update status'),
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/recruitment')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="text-sm text-muted-foreground ml-1">Senior React Developer - 42 Applications</p>
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(pipelineCounts).map(([status, count], index) => (
          <Card
            key={status}
            className={`cursor-pointer transition-shadow hover:shadow-md relative ${statusFilter === status ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setStatusFilter(status === statusFilter ? 'All' : status)}
          >
            <CardContent className="p-3 text-center">
              <StatusBadge status={status} />
              <div className="text-xl font-bold mt-1">{count}</div>
              {index < Object.keys(pipelineCounts).length - 1 && (
                <ChevronRight size={14} className="absolute right-[-11px] top-1/2 -translate-y-1/2 text-muted-foreground hidden lg:block" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <Input
              placeholder="Search candidates..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {pipelineSteps.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={filteredApps}
            isLoading={isLoading}
            pagination={appPagination ?? { page, limit, total: filteredApps.length, totalPages: Math.ceil(filteredApps.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <FormSheet
        open={drawerOpen}
        onOpenChange={(open) => { setDrawerOpen(open); if (!open) setSelectedApp(null); }}
        title="Application Details"
        className="sm:max-w-xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            {/* Candidate Header */}
            <div className="flex gap-4">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(selectedApp.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold">{selectedApp.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedApp.currentCompany} | {selectedApp.experience} years experience</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedApp.status} />
                  <StarRating value={selectedApp.rating} />
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {pipelineSteps.map((step, idx) => {
                const currentStep = statusStepMap[selectedApp.status];
                const isCompleted = idx <= currentStep;
                const isRejected = selectedApp.status === 'rejected';
                return (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center h-7 px-2 rounded-full text-[10px] font-medium whitespace-nowrap ${
                      isRejected ? 'bg-red-100 text-red-600' :
                      isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step === 'interview_scheduled' ? 'Interview' : step}
                    </div>
                    {idx < pipelineSteps.length - 1 && (
                      <div className={`h-0.5 w-4 shrink-0 ${isCompleted && idx < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{selectedApp.email}</p></div>
              <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{selectedApp.phone}</p></div>
              <div><span className="text-muted-foreground">Current Salary</span><p className="font-medium">{formatSalary(selectedApp.currentSalary)} / year</p></div>
              <div><span className="text-muted-foreground">Expected Salary</span><p className="font-medium">{formatSalary(selectedApp.expectedSalary)} / year</p></div>
              <div><span className="text-muted-foreground">Notice Period</span><p className="font-medium">{selectedApp.noticePeriod}</p></div>
              <div><span className="text-muted-foreground">Applied Date</span><p className="font-medium">{selectedApp.appliedDate}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">Applied For</span><p className="font-medium">{selectedApp.position}</p></div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-sm font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedApp.skills.map(s => (
                  <Badge key={s} variant="outline" className="bg-blue-100 text-blue-700">{s}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {selectedApp.status !== 'rejected' && (
                  <Button variant="destructive" size="sm" onClick={() => handleStatusChange('rejected')}>
                    <UserX className="mr-1 h-4 w-4" /> Reject
                  </Button>
                )}
                {selectedApp.status === 'Applied' && (
                  <Button size="sm" onClick={() => handleStatusChange('Screening')}>Move to Screening</Button>
                )}
                {selectedApp.status === 'Screening' && (
                  <Button size="sm" onClick={() => handleStatusChange('Shortlisted')}>Shortlist</Button>
                )}
                {selectedApp.status === 'Shortlisted' && (
                  <Button size="sm" onClick={() => handleStatusChange('interview_scheduled')}>
                    <Calendar className="mr-1 h-4 w-4" /> Schedule Interview
                  </Button>
                )}
                {selectedApp.status === 'interview_scheduled' && (
                  <Button size="sm" onClick={() => handleStatusChange('Selected')}>
                    <UserCheck className="mr-1 h-4 w-4" /> Select
                  </Button>
                )}
                {selectedApp.status === 'Selected' && (
                  <Button size="sm" onClick={() => handleStatusChange('Offered')}>Send Offer</Button>
                )}
                {selectedApp.status === 'Offered' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('Hired')}>
                    Mark as Hired
                  </Button>
                )}
              </div>
            </div>

            {/* Interview Scheduling (for Shortlisted) */}
            {selectedApp.status === 'Shortlisted' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">Schedule Interview</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <DatePicker onChange={() => {}} />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Interviewer</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ananya">Ananya Reddy - Engineering Manager</SelectItem>
                        <SelectItem value="sneha">Sneha Gupta - HR Lead</SelectItem>
                        <SelectItem value="vikram">Vikram Joshi - Tech Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Interview Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone Screening</SelectItem>
                        <SelectItem value="technical">Technical Round</SelectItem>
                        <SelectItem value="hr">HR Round</SelectItem>
                        <SelectItem value="managerial">Managerial Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => {
                    if (selectedApp) {
                      scheduleInterviewMutation.mutate(
                        { id: selectedApp.key, data: {} },
                        {
                          onSuccess: () => {
                            toast.success('Interview scheduled successfully');
                            handleStatusChange('interview_scheduled');
                          },
                          onError: (err: any) => toast.error(err?.message || 'Failed to schedule interview'),
                        }
                      );
                    }
                  }}>
                    <Calendar className="mr-2 h-4 w-4" /> Confirm Schedule
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </FormSheet>
    </div>
  );
};

export default Applications;
