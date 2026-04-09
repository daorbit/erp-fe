import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useExpenseList, useCreateExpense, useApproveExpense, useRejectExpense } from '@/hooks/queries/useExpenses';
import {
  Plus,
  Eye,
  Edit2,
  Send,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Receipt,
  Clock,
  TrendingUp,
  Paperclip,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import type { StatsCardProps } from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import DatePicker from '@/components/shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatINR, getInitials } from '@/lib/formatters';

// ----- Types -----

interface Expense {
  key: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'reimbursed';
  submittedOn: string | null;
  approvedBy: string | null;
  employee: string;
  description: string;
  receipts: number;
}

// ----- Mock Data -----

const expenses: Expense[] = [
  { key: '1', title: 'Client Meeting Lunch - Infosys', category: 'Meals', amount: 2500, date: '2026-04-02', status: 'approved', submittedOn: '2026-04-03', approvedBy: 'Priya Singh', employee: 'Rahul Sharma', description: 'Lunch with Infosys team for project discussion', receipts: 1 },
  { key: '2', title: 'Travel to Pune - Client Visit', category: 'Travel', amount: 8500, date: '2026-03-28', status: 'reimbursed', submittedOn: '2026-03-29', approvedBy: 'Ananya Reddy', employee: 'Vikram Joshi', description: 'Round trip Pune travel for client meeting', receipts: 3 },
  { key: '3', title: 'Office Supplies - Stationery', category: 'Office Supplies', amount: 1200, date: '2026-04-05', status: 'submitted', submittedOn: '2026-04-05', approvedBy: null, employee: 'Sneha Gupta', description: 'Notepads, pens, and whiteboard markers for team', receipts: 1 },
  { key: '4', title: 'AWS Certification Training', category: 'Training', amount: 15000, date: '2026-03-15', status: 'approved', submittedOn: '2026-03-16', approvedBy: 'Ananya Reddy', employee: 'Amit Patel', description: 'AWS Solutions Architect Professional certification course', receipts: 1 },
  { key: '5', title: 'Team Dinner - Sprint Completion', category: 'Meals', amount: 6800, date: '2026-04-01', status: 'under_review', submittedOn: '2026-04-02', approvedBy: null, employee: 'Ananya Reddy', description: 'Team celebration dinner after successful sprint delivery', receipts: 1 },
  { key: '6', title: 'Cab Fare - Airport Pickup', category: 'Travel', amount: 1800, date: '2026-04-04', status: 'draft', submittedOn: null, approvedBy: null, employee: 'Rahul Sharma', description: 'Airport pickup for client from Chennai', receipts: 1 },
  { key: '7', title: 'Conference Registration - JSConf India', category: 'Training', amount: 12000, date: '2026-03-20', status: 'reimbursed', submittedOn: '2026-03-21', approvedBy: 'Priya Singh', employee: 'Rahul Sharma', description: 'Registration fee for JSConf India 2026', receipts: 1 },
  { key: '8', title: 'Internet Reimbursement - March', category: 'Other', amount: 1500, date: '2026-03-31', status: 'approved', submittedOn: '2026-04-01', approvedBy: 'Priya Singh', employee: 'Amit Patel', description: 'Monthly internet reimbursement for WFH', receipts: 1 },
  { key: '9', title: 'Laptop Bag Purchase', category: 'Office Supplies', amount: 3200, date: '2026-04-06', status: 'submitted', submittedOn: '2026-04-06', approvedBy: null, employee: 'Vikram Joshi', description: 'Laptop bag for new Dell laptop', receipts: 1 },
  { key: '10', title: 'Client Gift - Diwali Hamper', category: 'Meals', amount: 4500, date: '2026-03-10', status: 'rejected', submittedOn: '2026-03-11', approvedBy: 'Priya Singh', employee: 'Sneha Gupta', description: 'Diwali gift hamper for key client stakeholders', receipts: 2 },
  { key: '11', title: 'Parking Charges - Office', category: 'Travel', amount: 500, date: '2026-04-07', status: 'draft', submittedOn: null, approvedBy: null, employee: 'Amit Patel', description: 'Monthly parking charges at office building', receipts: 0 },
  { key: '12', title: 'Books - System Design Interview', category: 'Training', amount: 850, date: '2026-03-25', status: 'reimbursed', submittedOn: '2026-03-26', approvedBy: 'Ananya Reddy', employee: 'Rahul Sharma', description: 'Technical book purchase for upskilling', receipts: 1 },
];

const categoryColorMap: Record<string, string> = {
  Travel: 'bg-blue-50 text-blue-700 border-blue-200',
  Meals: 'bg-orange-50 text-orange-700 border-orange-200',
  Accommodation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Transportation: 'bg-teal-50 text-teal-700 border-teal-200',
  'Office Supplies': 'bg-green-50 text-green-700 border-green-200',
  Training: 'bg-purple-50 text-purple-700 border-purple-200',
  Medical: 'bg-red-50 text-red-700 border-red-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

// ----- Component -----

const ExpenseList: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('my');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formDescription, setFormDescription] = useState('');

  // API integration
  const { data: expenseData, isLoading } = useExpenseList();
  const createMutation = useCreateExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const allExpenses: Expense[] = expenseData?.data ?? expenses;

  const totalClaims = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = allExpenses.filter(e => ['submitted', 'under_review'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = allExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const reimbursedAmount = allExpenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0);

  const statsCards: StatsCardProps[] = [
    { title: 'Total Claims', value: formatINR(totalClaims), icon: <Receipt className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Pending Approval', value: formatINR(pendingAmount), icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Approved', value: formatINR(approvedAmount), icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Reimbursed', value: formatINR(reimbursedAmount), icon: <TrendingUp className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  const filteredExpenses = useMemo(() => {
    let filtered = allExpenses;
    if (activeTab === 'my') filtered = filtered.filter(e => e.employee === 'Rahul Sharma');
    if (activeTab === 'pending') filtered = filtered.filter(e => ['submitted', 'under_review'].includes(e.status));
    if (searchText) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchText.toLowerCase()) ||
        e.category.toLowerCase().includes(searchText.toLowerCase()) ||
        e.employee.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [allExpenses, activeTab, searchText]);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground truncate">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className={categoryColorMap[row.original.category] || ''}>
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-blue-700">
          {formatINR(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-600 text-white text-[10px]">
              {getInitials(row.original.employee)}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.employee}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'submittedOn',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.submittedOn || '--'}
        </span>
      ),
    },
    {
      accessorKey: 'approvedBy',
      header: 'Approved By',
      cell: ({ row }) => (
        <span className={row.original.approvedBy ? '' : 'text-muted-foreground'}>
          {row.original.approvedBy || '--'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {record.status === 'draft' && (
                <>
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    createMutation.mutate({ ...record, status: 'submitted' }, {
                      onSuccess: () => toast.success('Expense submitted'),
                      onError: (err: any) => toast.error(err?.message || 'Failed to submit'),
                    });
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </DropdownMenuItem>
                </>
              )}
              {['submitted', 'under_review'].includes(record.status) && activeTab === 'pending' && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      approveMutation.mutate({ id: record.key }, {
                        onSuccess: () => toast.success('Expense approved'),
                        onError: (err: any) => toast.error(err?.message || 'Failed to approve'),
                      });
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      rejectMutation.mutate({ id: record.key }, {
                        onSuccess: () => toast.success('Expense rejected'),
                        onError: (err: any) => toast.error(err?.message || 'Failed to reject'),
                      });
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('');
    setFormAmount('');
    setFormDate(undefined);
    setFormDescription('');
  };

  const handleSaveDraft = () => {
    if (!formTitle || !formCategory || !formAmount) {
      toast.error('Please fill in required fields');
      return;
    }
    createMutation.mutate(
      { title: formTitle, category: formCategory, amount: Number(formAmount), date: formDate, description: formDescription, status: 'draft' },
      {
        onSuccess: () => {
          toast.success('Expense saved as draft');
          setIsSheetOpen(false);
          resetForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to save draft'),
      },
    );
  };

  const handleSubmit = () => {
    if (!formTitle || !formCategory || !formAmount) {
      toast.error('Please fill in required fields');
      return;
    }
    createMutation.mutate(
      { title: formTitle, category: formCategory, amount: Number(formAmount), date: formDate, description: formDescription, status: 'submitted' },
      {
        onSuccess: () => {
          toast.success('Expense submitted for approval');
          setIsSheetOpen(false);
          resetForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to submit expense'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Track and manage employee expense claims"
        actions={
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Expense Claim
          </Button>
        }
      />

      <StatsGrid stats={statsCards} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my">My Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            columns={columns}
            data={filteredExpenses}
            searchKey="title"
            searchPlaceholder="Search expenses..."
            onSearchChange={setSearchText}
          />
        </TabsContent>
      </Tabs>

      {/* New Expense Sheet */}
      <FormSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) resetForm();
        }}
        title="New Expense Claim"
        description="Submit a new expense for reimbursement"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Expense Title *</Label>
            <Input
              placeholder="e.g., Client meeting lunch at Taj"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="meals">Meals</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="office_supplies">Office Supplies</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (INR) *</Label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expense Date *</Label>
            <DatePicker
              value={formDate}
              onChange={setFormDate}
              placeholder="Select date"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe the expense purpose and details"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipts</Label>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
              <Paperclip className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-sm">Upload receipts</p>
              <p className="text-xs text-muted-foreground">Drag or click to upload (PDF, JPG, PNG - Max 5 files)</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsSheetOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
      </FormSheet>
    </div>
  );
};

export default ExpenseList;
