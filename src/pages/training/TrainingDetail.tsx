import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTraining, useEnrollTraining, useDropTraining } from '@/hooks/queries/useTraining';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft, UserPlus, User, Users, Calendar, Clock, MapPin,
  DollarSign, BookOpen, Award, Download, FileText, Monitor,
} from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getInitials } from '@/lib/formatters';

type ParticipantStatus = 'Enrolled' | 'Completed' | 'Dropped';

interface Participant {
  key: string;
  name: string;
  email: string;
  department: string;
  status: ParticipantStatus;
  enrolledDate: string;
  score: number | null;
  certificate: boolean;
  attendance: number;
}

const participants: Participant[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 92, certificate: true, attendance: 100 },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', department: 'Marketing', status: 'Completed', enrolledDate: '2026-03-18', score: 88, certificate: true, attendance: 95 },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', department: 'Finance', status: 'Enrolled', enrolledDate: '2026-03-20', score: null, certificate: false, attendance: 80 },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'HR', status: 'Enrolled', enrolledDate: '2026-03-19', score: null, certificate: false, attendance: 90 },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', department: 'Sales', status: 'Dropped', enrolledDate: '2026-03-18', score: null, certificate: false, attendance: 30 },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 95, certificate: true, attendance: 100 },
  { key: '7', name: 'Deepak Joshi', email: 'deepak@company.com', department: 'Engineering', status: 'Enrolled', enrolledDate: '2026-03-21', score: null, certificate: false, attendance: 85 },
  { key: '8', name: 'Kavita Mishra', email: 'kavita@company.com', department: 'Marketing', status: 'Completed', enrolledDate: '2026-03-18', score: 78, certificate: true, attendance: 90 },
  { key: '9', name: 'Suresh Reddy', email: 'suresh@company.com', department: 'Engineering', status: 'Enrolled', enrolledDate: '2026-03-22', score: null, certificate: false, attendance: 75 },
  { key: '10', name: 'Lakshmi Prasad', email: 'lakshmi@company.com', department: 'Engineering', status: 'Completed', enrolledDate: '2026-03-18', score: 85, certificate: true, attendance: 95 },
];

const materials = [
  { title: 'React Advanced Patterns - Slide Deck', type: 'PDF', size: '4.2 MB' },
  { title: 'State Management Comparison Guide', type: 'PDF', size: '1.8 MB' },
  { title: 'Performance Optimization Checklist', type: 'DOCX', size: '856 KB' },
  { title: 'Hands-on Lab Instructions', type: 'PDF', size: '2.1 MB' },
  { title: 'Code Repository Access Link', type: 'LINK', size: '-' },
  { title: 'Recording - Day 1 Session', type: 'MP4', size: '1.2 GB' },
  { title: 'Recording - Day 2 Session', type: 'MP4', size: '980 MB' },
];

const typeIconColor: Record<string, { bg: string; text: string }> = {
  PDF: { bg: 'bg-red-100', text: 'text-red-600' },
  DOCX: { bg: 'bg-blue-100', text: 'text-blue-600' },
  MP4: { bg: 'bg-violet-100', text: 'text-violet-600' },
  LINK: { bg: 'bg-green-100', text: 'text-green-600' },
};

const TrainingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // API integration
  const { data: trainingData, isLoading } = useTraining(id || '');
  const enrollMutation = useEnrollTraining();
  const dropMutation = useDropTraining();
  const trainingDetail = trainingData?.data;
  const participantsList: Participant[] = trainingDetail?.participants ?? participants;
  const materialsList = trainingDetail?.materials ?? materials;

  const infoCards = [
    { label: 'Trainer', value: 'Rajesh Krishnan', sub: 'External Trainer', icon: <User size={18} />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Duration', value: '3 Days', sub: 'Apr 15 - Apr 17, 2026', icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Location', value: 'Bangalore', sub: 'Training Hall A', icon: <MapPin size={18} />, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Participants', value: '24 / 30', sub: '80% enrolled', icon: <Users size={18} />, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Cost', value: '1,50,000', sub: 'Total budget', icon: <DollarSign size={18} />, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Avg. Score', value: '87.6%', sub: 'Completed only', icon: <Award size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  ];

  const participantColumns: ColumnDef<Participant>[] = [
    {
      accessorKey: 'name',
      header: 'Participant',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <Badge variant="outline" className="bg-blue-100 text-blue-700">{row.original.department}</Badge>,
    },
    {
      accessorKey: 'enrolledDate',
      header: 'Enrolled',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.enrolledDate}</span>,
    },
    {
      accessorKey: 'attendance',
      header: 'Attendance',
      cell: ({ row }) => {
        const val = row.original.attendance;
        return (
          <div className="w-24">
            <Progress value={val} className="h-2" />
            <span className="text-xs text-muted-foreground">{val}%</span>
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
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const val = row.original.score;
        if (val === null) return <span className="text-muted-foreground">-</span>;
        const colorClass = val >= 90 ? 'bg-green-100 text-green-700' : val >= 75 ? 'bg-blue-100 text-blue-700' : val >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
        return <Badge variant="outline" className={colorClass}>{val}%</Badge>;
      },
    },
    {
      accessorKey: 'certificate',
      header: 'Certificate',
      cell: ({ row }) => row.original.certificate ? (
        <Button variant="link" size="sm" className="gap-1 px-0"><Download size={14} /> Download</Button>
      ) : <span className="text-muted-foreground">-</span>,
    },
  ];

  const handleEnroll = () => {
    enrollMutation.mutate({ id: id || '', data: {} }, {
      onSuccess: () => {
        toast.success('Employee enrolled successfully');
        setEnrollModalOpen(false);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to enroll employee'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/training')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">React Advanced Workshop</h1>
              <Badge variant="outline" className="bg-blue-100 text-blue-700">Technical</Badge>
              <StatusBadge status="Planned" />
              <Badge variant="outline" className="bg-purple-100 text-purple-700">Offline</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">3-day intensive hands-on workshop</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Award className="mr-2 h-4 w-4" /> Issue Certificates</Button>
          <Button onClick={() => setEnrollModalOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Enroll Employee</Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {infoCards.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex gap-3 items-start">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                  <div className={item.color}>{item.icon}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="font-bold leading-tight">{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5"><BookOpen size={16} /> Overview</TabsTrigger>
              <TabsTrigger value="participants" className="gap-1.5"><Users size={16} /> Participants ({participants.length})</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Program Description</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    Deep dive into advanced React patterns, performance optimization, and state management strategies
                    including server components and concurrent features. This workshop covers:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Advanced component patterns (Compound, Render Props, HOC)</li>
                    <li>React Server Components and Streaming SSR</li>
                    <li>State management with Zustand, Jotai, and React Query</li>
                    <li>Performance profiling and optimization techniques</li>
                    <li>Testing strategies for complex React applications</li>
                    <li>Micro-frontend architecture patterns</li>
                  </ul>
                  <p className="text-sm">
                    <span className="font-semibold">Prerequisites: </span>
                    Minimum 2 years experience with React, familiarity with TypeScript, understanding of REST APIs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> Training Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {materials.map((item, idx) => {
                      const colors = typeIconColor[item.type] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                      return (
                        <div key={idx} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                              <FileText size={18} className={colors.text} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                                {item.size !== '-' && <span className="text-xs text-muted-foreground">{item.size}</span>}
                              </div>
                            </div>
                          </div>
                          <Button variant="link" size="sm" className="gap-1">
                            {item.type !== 'LINK' ? <><Download size={14} /> Download</> : <><Monitor size={14} /> Open</>}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="mt-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">Enrolled</Badge>
                    <Badge>{participants.filter(p => p.status === 'Enrolled').length}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>
                    <Badge>{participants.filter(p => p.status === 'Completed').length}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-red-100 text-red-700">Dropped</Badge>
                    <Badge>{participants.filter(p => p.status === 'Dropped').length}</Badge>
                  </div>
                </div>
                <Button onClick={() => setEnrollModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Enroll Employee
                </Button>
              </div>
              <DataTable
                columns={participantColumns}
                data={participantsList}
                pagination={{ page: 1, limit: 10, total: participants.length, totalPages: 1 }}
                onPaginationChange={() => {}}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enroll Modal */}
      <FormDialog
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
        title="Enroll Employee"
        description="Select employees to enroll in this training program."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Employees *</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Search and select employees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rohit">Rohit Jain - Engineering</SelectItem>
                <SelectItem value="neha">Neha Kulkarni - Engineering</SelectItem>
                <SelectItem value="arun">Arun Kumar - Engineering</SelectItem>
                <SelectItem value="meera">Meera Nair - Marketing</SelectItem>
                <SelectItem value="karthik">Karthik Menon - Sales</SelectItem>
                <SelectItem value="divya">Divya Sharma - Finance</SelectItem>
                <SelectItem value="pooja">Pooja Iyer - Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea rows={2} placeholder="Any special requirements or notes" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEnrollModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll}>Enroll</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default TrainingDetail;
