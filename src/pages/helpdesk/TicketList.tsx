import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useTicketList, useCreateTicket, useAddTicketComment, useUpdateTicketStatus } from '@/hooks/queries/useHelpdesk';
import {
  Plus, Eye, MoreHorizontal,
  MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Paperclip,
  Timer, Star,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import FileUploadZone from '@/components/shared/FileUploadZone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDate, getInitials } from '@/lib/formatters';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  isStaff: boolean;
}

interface Ticket {
  key: string;
  ticketNo: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  employee: string;
  assignedTo: string | null;
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'reopened';
  created: string;
  lastUpdated: string;
  resolution: string | null;
  satisfaction: number | null;
  comments: Comment[];
}

const tickets: Ticket[] = [
  { key: '1', ticketNo: 'TKT-2026-001', subject: 'Laptop not working - Screen flickering', description: 'My MacBook Pro screen has been flickering intermittently since yesterday. It happens especially when connected to the external monitor.', category: 'it', priority: 'high', employee: 'Rahul Sharma', assignedTo: 'Vikram Joshi', status: 'in_progress', created: '2026-04-07', lastUpdated: '2026-04-08', resolution: null, satisfaction: null, comments: [
    { id: '1', author: 'Rahul Sharma', content: 'Screen started flickering since yesterday morning. Attached a video of the issue.', date: '2026-04-07 09:30', isStaff: false },
    { id: '2', author: 'Vikram Joshi', content: 'Thanks Rahul. It seems like a display driver issue. Can you try updating to the latest macOS version?', date: '2026-04-07 11:15', isStaff: true },
    { id: '3', author: 'Rahul Sharma', content: 'Updated the macOS but issue still persists with external monitor.', date: '2026-04-08 10:00', isStaff: false },
  ]},
  { key: '2', ticketNo: 'TKT-2026-002', subject: 'VPN access required for WFH', description: 'I need VPN access configured for work from home.', category: 'it', priority: 'medium', employee: 'Amit Patel', assignedTo: 'Vikram Joshi', status: 'resolved', created: '2026-04-05', lastUpdated: '2026-04-06', resolution: 'VPN client installed and configured. Credentials shared via secure channel.', satisfaction: 5, comments: [
    { id: '1', author: 'Amit Patel', content: 'Need VPN access for WFH starting next week.', date: '2026-04-05 14:00', isStaff: false },
    { id: '2', author: 'Vikram Joshi', content: 'VPN access has been configured. Please check your email for setup instructions.', date: '2026-04-06 10:30', isStaff: true },
  ]},
  { key: '3', ticketNo: 'TKT-2026-003', subject: 'Leave balance discrepancy - Casual Leave', description: 'My casual leave balance shows 5 days but I believe it should be 7 days.', category: 'hr', priority: 'medium', employee: 'Priya Singh', assignedTo: 'Sneha Gupta', status: 'on_hold', created: '2026-04-04', lastUpdated: '2026-04-07', resolution: null, satisfaction: null, comments: [
    { id: '1', author: 'Priya Singh', content: 'Please check my CL balance. It shows 5 remaining but should be 7.', date: '2026-04-04 11:00', isStaff: false },
    { id: '2', author: 'Sneha Gupta', content: 'Hi Priya, I checked the records. Can you confirm if you applied for leave on March 12-13?', date: '2026-04-05 09:00', isStaff: true },
  ]},
  { key: '4', ticketNo: 'TKT-2026-004', subject: 'AC not working in 3rd floor conference room', description: 'The air conditioning in Room 301 has not been working since Monday.', category: 'facilities', priority: 'high', employee: 'Ananya Reddy', assignedTo: null, status: 'open', created: '2026-04-07', lastUpdated: '2026-04-07', resolution: null, satisfaction: null, comments: [
    { id: '1', author: 'Ananya Reddy', content: 'AC has been down since Monday morning.', date: '2026-04-07 08:45', isStaff: false },
  ]},
  { key: '5', ticketNo: 'TKT-2026-005', subject: 'Salary slip download not working', description: 'Getting a 404 error when clicking the download button.', category: 'hr', priority: 'medium', employee: 'Vikram Joshi', assignedTo: 'Sneha Gupta', status: 'resolved', created: '2026-04-03', lastUpdated: '2026-04-04', resolution: 'The payroll module had a temporary issue. Fixed and salary slips are now downloadable.', satisfaction: 4, comments: [
    { id: '1', author: 'Vikram Joshi', content: 'Getting 404 error when trying to download March salary slip.', date: '2026-04-03 16:00', isStaff: false },
    { id: '2', author: 'Sneha Gupta', content: 'This was a known issue with the payroll system update. It has been fixed now.', date: '2026-04-04 10:00', isStaff: true },
  ]},
  { key: '6', ticketNo: 'TKT-2026-006', subject: 'Request for standing desk', description: 'I would like to request a standing desk. Doctor recommendation attached.', category: 'facilities', priority: 'low', employee: 'Amit Patel', assignedTo: null, status: 'open', created: '2026-04-06', lastUpdated: '2026-04-06', resolution: null, satisfaction: null, comments: [
    { id: '1', author: 'Amit Patel', content: 'Requesting a standing desk due to back pain. Doctor recommendation attached.', date: '2026-04-06 12:00', isStaff: false },
  ]},
  { key: '7', ticketNo: 'TKT-2026-007', subject: 'Email not syncing on mobile', description: 'Company email stopped syncing after password change.', category: 'it', priority: 'medium', employee: 'Sneha Gupta', assignedTo: 'Vikram Joshi', status: 'in_progress', created: '2026-04-08', lastUpdated: '2026-04-08', resolution: null, satisfaction: null, comments: [
    { id: '1', author: 'Sneha Gupta', content: 'Email stopped working on phone after password reset yesterday.', date: '2026-04-08 08:00', isStaff: false },
    { id: '2', author: 'Vikram Joshi', content: 'I will send you the steps to generate a new app-specific password.', date: '2026-04-08 09:30', isStaff: true },
  ]},
  { key: '8', ticketNo: 'TKT-2026-008', subject: 'Reimbursement for online course - Coursera', description: 'Requesting reimbursement for Coursera subscription. Rs 4,999 paid.', category: 'hr', priority: 'low', employee: 'Rahul Sharma', assignedTo: 'Sneha Gupta', status: 'closed', created: '2026-03-25', lastUpdated: '2026-03-30', resolution: 'Reimbursement approved. Amount will be credited in April payroll.', satisfaction: 5, comments: [
    { id: '1', author: 'Rahul Sharma', content: 'Requesting reimbursement for Coursera subscription. Invoice attached.', date: '2026-03-25 10:00', isStaff: false },
    { id: '2', author: 'Sneha Gupta', content: 'Approved. Rs 4,999 will be included in your April salary.', date: '2026-03-30 14:00', isStaff: true },
  ]},
];

const priorityVariant: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const categoryVariant: Record<string, string> = {
  it: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  hr: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  finance: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  facilities: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

export default function TicketList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newComment, setNewComment] = useState('');

  // API integration
  const { data: ticketData, isLoading } = useTicketList();
  const createMutation = useCreateTicket();
  const addCommentMutation = useAddTicketComment();
  const updateStatusMutation = useUpdateTicketStatus();
  const allTickets: Ticket[] = ticketData?.data ?? tickets;

  const openCount = allTickets.filter(t => t.status === 'open').length;
  const inProgressCount = allTickets.filter(t => t.status === 'in_progress').length;
  const resolvedTodayCount = allTickets.filter(t => ['resolved', 'closed'].includes(t.status) && t.lastUpdated >= '2026-04-08').length;

  const filteredTickets = useMemo(() => allTickets.filter(t => {
    if (searchText && !t.subject.toLowerCase().includes(searchText.toLowerCase()) && !t.ticketNo.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  }), [allTickets, searchText, categoryFilter, priorityFilter, statusFilter]);

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'ticketNo',
      header: 'Ticket #',
      cell: ({ row }) => <span className="font-semibold text-primary">{row.getValue('ticketNo')}</span>,
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => <span className="font-medium truncate max-w-[200px] block">{row.getValue('subject')}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.getValue('category') as string;
        return <Badge variant="outline" className={categoryVariant[cat]}>{cat}</Badge>;
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.getValue('priority') as string;
        return <Badge variant="outline" className={priorityVariant[p]}>{p}</Badge>;
      },
    },
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }) => {
        const name = row.getValue('employee') as string;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(name)}</AvatarFallback></Avatar>
            <span className="text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const name = row.getValue('assignedTo') as string | null;
        if (!name) return <Badge variant="outline" className="text-muted-foreground">Unassigned</Badge>;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7"><AvatarFallback className="bg-green-600 text-white text-xs">{getInitials(name)}</AvatarFallback></Avatar>
            <span className="text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'created',
      header: 'Created',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.getValue('created'))}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailTicket(row.original)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
            <DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4" /> Add Comment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Helpdesk"
        description="Manage employee support tickets and requests"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Ticket</Button>}
      />

      <StatsGrid stats={[
        { title: 'Open Tickets', value: openCount, icon: <AlertCircle className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-50' },
        { title: 'In Progress', value: inProgressCount, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
        { title: 'Resolved Today', value: resolvedTodayCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: 'Avg Resolution', value: '1.8 days', icon: <Timer className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      ]} />

      <DataTable
        columns={columns}
        data={filteredTickets}
        searchKey="subject"
        searchPlaceholder="Search tickets..."
        onSearchChange={setSearchText}
        filterContent={
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="reopened">Reopened</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Create Ticket Sheet */}
      <FormSheet open={createOpen} onOpenChange={setCreateOpen} title="Create New Ticket" description="Submit a support request">
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input placeholder="Brief summary of the issue" className="mt-1.5" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={5} placeholder="Describe your issue in detail..." className="mt-1.5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Attachments</Label>
            <div className="mt-1.5">
              <FileUploadZone label="Attach files" description="Screenshots, logs, or relevant files (Max 3)" multiple onFilesSelected={() => {}} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              createMutation.mutate({}, {
                onSuccess: () => { setCreateOpen(false); toast.success('Ticket created'); },
                onError: (err: any) => toast.error(err?.message || 'Failed to create ticket'),
              });
            }}>Submit Ticket</Button>
          </div>
        </div>
      </FormSheet>

      {/* Ticket Detail Sheet */}
      <Sheet open={!!detailTicket} onOpenChange={(open) => { if (!open) { setDetailTicket(null); setNewComment(''); } }}>
        <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
          {detailTicket && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle>{detailTicket.ticketNo}</SheetTitle>
                  <StatusBadge status={detailTicket.status} />
                  <Badge variant="outline" className={priorityVariant[detailTicket.priority]}>{detailTicket.priority}</Badge>
                </div>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold">{detailTicket.subject}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5"><AvatarFallback className="bg-primary text-primary-foreground text-[10px]">{getInitials(detailTicket.employee)}</AvatarFallback></Avatar>
                    {detailTicket.employee}
                  </div>
                  <span>{detailTicket.category}</span>
                  <span>Created {formatDate(detailTicket.created)}</span>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-sm">{detailTicket.description}</CardContent>
                </Card>

                {detailTicket.assignedTo && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <Avatar className="h-5 w-5"><AvatarFallback className="bg-green-600 text-white text-[10px]">{getInitials(detailTicket.assignedTo)}</AvatarFallback></Avatar>
                    <span className="font-medium">{detailTicket.assignedTo}</span>
                  </div>
                )}

                {detailTicket.resolution && (
                  <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <CardContent className="pt-4">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">Resolution</p>
                      <p className="text-sm mt-1">{detailTicket.resolution}</p>
                    </CardContent>
                  </Card>
                )}

                {detailTicket.satisfaction !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Satisfaction:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`h-4 w-4 ${i <= detailTicket.satisfaction! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                )}

                <Separator />
                <h4 className="font-semibold text-sm">Comments</h4>

                <div className="space-y-3">
                  {detailTicket.comments.map(comment => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg border-l-[3px] ${comment.isStaff ? 'bg-blue-50 border-l-blue-600 dark:bg-blue-950 dark:border-l-blue-400' : 'bg-muted/50 border-l-gray-300 dark:border-l-gray-600'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={`text-[10px] ${comment.isStaff ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}>
                            {getInitials(comment.author)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{comment.author}</span>
                        {comment.isStaff && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700">Staff</Badge>}
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-sm ml-8">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {!['closed', 'resolved'].includes(detailTicket.status) && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button className="self-end" onClick={() => {
                      if (!newComment.trim()) return;
                      addCommentMutation.mutate({ id: detailTicket.key, data: { content: newComment } }, {
                        onSuccess: () => { toast.success('Comment sent'); setNewComment(''); },
                        onError: (err: any) => toast.error(err?.message || 'Failed to add comment'),
                      });
                    }}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {!['closed', 'resolved'].includes(detailTicket.status) && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      <Select>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Change Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="reopened">Reopened</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Assign To" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vikram Joshi">Vikram Joshi</SelectItem>
                          <SelectItem value="Sneha Gupta">Sneha Gupta</SelectItem>
                          <SelectItem value="Priya Singh">Priya Singh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
