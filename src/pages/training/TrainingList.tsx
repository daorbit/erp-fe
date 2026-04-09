import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrainingList, useCreateTraining } from '@/hooks/queries/useTraining';
import {
  Plus, BookOpen, Users, CheckCircle2, Calendar,
  MoreHorizontal, Eye, Edit2, UserPlus, MapPin, Clock,
  Monitor, Building2, Laptop,
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import DatePicker from '@/components/shared/DatePicker';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getInitials } from '@/lib/formatters';

type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
type TrainingMode = 'online' | 'offline' | 'hybrid';
type TrainingCategory = 'technical' | 'soft_skills' | 'compliance' | 'leadership' | 'safety' | 'other';

interface TrainingProgram {
  key: string;
  title: string;
  description: string;
  category: TrainingCategory;
  trainer: string;
  trainerType: string;
  duration: string;
  mode: TrainingMode;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: TrainingStatus;
  location: string;
  cost: number;
}

const categoryBadgeClass: Record<TrainingCategory, string> = {
  technical: 'bg-blue-100 text-blue-700',
  soft_skills: 'bg-purple-100 text-purple-700',
  compliance: 'bg-red-100 text-red-700',
  leadership: 'bg-yellow-100 text-yellow-700',
  safety: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

const modeBadgeClass: Record<TrainingMode, string> = {
  online: 'bg-cyan-100 text-cyan-700',
  offline: 'bg-purple-100 text-purple-700',
  hybrid: 'bg-yellow-100 text-yellow-700',
};

const modeIcons: Record<TrainingMode, React.ReactNode> = {
  online: <Monitor size={12} />,
  offline: <Building2 size={12} />,
  hybrid: <Laptop size={12} />,
};

const programs: TrainingProgram[] = [
  { key: '1', title: 'React Advanced Workshop', description: 'Deep dive into advanced React patterns, performance optimization, and state management strategies including server components and concurrent features.', category: 'technical', trainer: 'Rajesh Krishnan', trainerType: 'External', duration: '3 days', mode: 'offline', startDate: '2026-04-15', endDate: '2026-04-17', maxParticipants: 30, currentParticipants: 24, status: 'planned', location: 'Bangalore - Training Hall A', cost: 150000 },
  { key: '2', title: 'Leadership Skills for Managers', description: 'Comprehensive program on people management, strategic thinking, conflict resolution, and building high-performing teams.', category: 'leadership', trainer: 'Dr. Meenakshi Iyer', trainerType: 'External', duration: '5 days', mode: 'hybrid', startDate: '2026-04-10', endDate: '2026-04-14', maxParticipants: 25, currentParticipants: 25, status: 'in_progress', location: 'Mumbai - Conference Center', cost: 250000 },
  { key: '3', title: 'Workplace Safety & Compliance', description: 'Mandatory safety training covering fire safety, emergency procedures, first aid basics, and workplace hazard identification.', category: 'safety', trainer: 'Sunil Patil', trainerType: 'Internal', duration: '1 day', mode: 'offline', startDate: '2026-03-20', endDate: '2026-03-20', maxParticipants: 100, currentParticipants: 88, status: 'completed', location: 'All Offices - Auditorium', cost: 25000 },
  { key: '4', title: 'AWS Cloud Practitioner Training', description: 'Prepare for AWS Cloud Practitioner certification with hands-on labs covering core AWS services, security, pricing, and architecture.', category: 'technical', trainer: 'Deepak Bhatt', trainerType: 'External', duration: '4 days', mode: 'online', startDate: '2026-05-01', endDate: '2026-05-04', maxParticipants: 50, currentParticipants: 32, status: 'planned', location: 'Virtual - Zoom', cost: 200000 },
  { key: '5', title: 'Effective Communication Workshop', description: 'Enhance verbal and written communication, presentation skills, and cross-cultural communication in professional settings.', category: 'soft_skills', trainer: 'Anjali Desai', trainerType: 'Internal', duration: '2 days', mode: 'offline', startDate: '2026-03-10', endDate: '2026-03-11', maxParticipants: 40, currentParticipants: 38, status: 'completed', location: 'Hyderabad - Training Room B', cost: 45000 },
  { key: '6', title: 'POSH Awareness Training', description: 'Prevention of Sexual Harassment at workplace. Mandatory compliance training covering legal framework, identification, and reporting mechanisms.', category: 'compliance', trainer: 'Adv. Kavita Sharma', trainerType: 'External', duration: '1 day', mode: 'online', startDate: '2026-04-22', endDate: '2026-04-22', maxParticipants: 200, currentParticipants: 145, status: 'planned', location: 'Virtual - Microsoft Teams', cost: 75000 },
  { key: '7', title: 'Agile & Scrum Masterclass', description: 'Hands-on training on Agile methodologies, Scrum framework, sprint planning, and backlog management for development teams.', category: 'other', trainer: 'Vikas Malhotra', trainerType: 'External', duration: '2 days', mode: 'hybrid', startDate: '2026-04-08', endDate: '2026-04-09', maxParticipants: 35, currentParticipants: 30, status: 'in_progress', location: 'Pune - Innovation Lab', cost: 120000 },
];

const TrainingList: React.FC = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');

  // API integration
  const { data: trainingData, isLoading } = useTrainingList();
  const createMutation = useCreateTraining();
  const allPrograms: TrainingProgram[] = trainingData?.data ?? programs;

  const filteredPrograms = allPrograms.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.trainer.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesMode = modeFilter === 'All' || p.mode === modeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMode;
  });

  const stats = [
    { title: 'Active Programs', value: allPrograms.filter(p => p.status === 'InProgress').length, icon: <BookOpen size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
    { title: 'Completed', value: allPrograms.filter(p => p.status === 'Completed').length, icon: <CheckCircle2 size={20} />, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950' },
    { title: 'Total Participants', value: allPrograms.reduce((s, p) => s + p.currentParticipants, 0), icon: <Users size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
    { title: 'Upcoming', value: allPrograms.filter(p => p.status === 'Planned').length, icon: <Calendar size={20} />, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-950' },
  ];

  const handleCreate = (formData?: any) => {
    createMutation.mutate(formData ?? {}, {
      onSuccess: () => {
        toast.success('Training program created successfully');
        setDrawerOpen(false);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to create training program'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Development"
        description="Manage training programs and employee development"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Program
          </Button>
        }
      />

      <StatsGrid stats={stats} />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search programs..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-64"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {Object.keys(categoryBadgeClass).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map(program => {
          const enrollPercent = Math.round(program.currentParticipants / program.maxParticipants * 100);
          return (
            <Card key={program.key} className="flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className={categoryBadgeClass[program.category]}>{program.category}</Badge>
                  <StatusBadge status={program.status} />
                  <Badge variant="outline" className={`gap-1 ${modeBadgeClass[program.mode]}`}>
                    {modeIcons[program.mode]} {program.mode}
                  </Badge>
                </div>

                {/* Title & Description */}
                <h3 className="font-semibold mb-1">{program.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{program.description}</p>

                {/* Trainer Info */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {getInitials(program.trainer)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{program.trainer}</span>
                  <Badge variant="secondary" className="text-[10px]">{program.trainerType}</Badge>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                  <span className="inline-flex items-center gap-1"><Clock size={13} /> {program.duration}</span>
                  <span className="inline-flex items-center gap-1"><Calendar size={13} /> {program.startDate}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <MapPin size={13} /> {program.location}
                </div>

                {/* Enrollment Progress */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Enrollment</span>
                    <span>{program.currentParticipants}/{program.maxParticipants}</span>
                  </div>
                  <Progress value={enrollPercent} className="h-2" />
                </div>
              </CardContent>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t px-5 py-3">
                <Button variant="link" size="sm" className="gap-1 px-0" onClick={() => navigate(`/training/${program.key}`)}>
                  <Eye size={14} /> View
                </Button>
                <Button variant="link" size="sm" className="gap-1 px-0" onClick={() => toast.success('Enrollment request sent')}>
                  <UserPlus size={14} /> Enroll
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Program Drawer */}
      <FormSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Create Training Program"
        description="Fill in program details."
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Program Title *</Label>
            <Input placeholder="e.g. React Advanced Workshop" />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea rows={4} placeholder="Describe the training program objectives and content" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryBadgeClass).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mode *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trainer Name *</Label>
              <Input placeholder="Trainer's full name" />
            </div>
            <div className="space-y-2">
              <Label>Trainer Type *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <DatePicker onChange={() => {}} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <DatePicker onChange={() => {}} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration *</Label>
              <Input placeholder="e.g. 3 days, 8 hours" />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input placeholder="e.g. Bangalore - Training Hall A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Participants *</Label>
              <Input type="number" min={1} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>Total Cost (INR)</Label>
              <Input type="number" min={0} placeholder="e.g. 150000" />
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

export default TrainingList;
