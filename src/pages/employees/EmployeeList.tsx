import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Plus, Upload, Users, UserCheck, UserMinus, UserPlus,
  Eye, Edit2, Trash2, MoreHorizontal, SlidersHorizontal,
  User, Mail, Phone, MapPin, Briefcase, CreditCard, Building2,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getInitials, formatDate } from '@/lib/formatters';
import { useEmployeeList, useCreateEmployee, useDeleteEmployee } from '@/hooks/queries/useEmployees';

interface Employee {
  key: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joinDate: string;
  status: string;
  employmentType: string;
  reportingManager: string;
}

const mockEmployees: Employee[] = [
  { key: '1', employeeId: 'EMP001', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma@company.com', phone: '+91 9876543210', department: 'Engineering', designation: 'Senior Developer', joinDate: '2023-01-15', status: 'active', employmentType: 'full_time', reportingManager: 'Ananya Reddy' },
  { key: '2', employeeId: 'EMP002', firstName: 'Priya', lastName: 'Singh', email: 'priya.singh@company.com', phone: '+91 9876543211', department: 'Marketing', designation: 'Marketing Executive', joinDate: '2023-06-20', status: 'active', employmentType: 'full_time', reportingManager: 'Meera Nair' },
  { key: '3', employeeId: 'EMP003', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@company.com', phone: '+91 9876543212', department: 'Finance', designation: 'Financial Analyst', joinDate: '2024-03-10', status: 'on_leave', employmentType: 'full_time', reportingManager: 'Suresh Iyer' },
  { key: '4', employeeId: 'EMP004', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.gupta@company.com', phone: '+91 9876543213', department: 'HR', designation: 'HR Manager', joinDate: '2022-11-05', status: 'active', employmentType: 'full_time', reportingManager: 'Deepak Verma' },
  { key: '5', employeeId: 'EMP005', firstName: 'Vikram', lastName: 'Joshi', email: 'vikram.joshi@company.com', phone: '+91 9876543214', department: 'Sales', designation: 'Sales Lead', joinDate: '2024-02-28', status: 'active', employmentType: 'full_time', reportingManager: 'Meera Nair' },
  { key: '6', employeeId: 'EMP006', firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@company.com', phone: '+91 9876543215', department: 'Engineering', designation: 'Engineering Manager', joinDate: '2022-09-12', status: 'active', employmentType: 'full_time', reportingManager: 'Deepak Verma' },
  { key: '7', employeeId: 'EMP007', firstName: 'Karthik', lastName: 'Nair', email: 'karthik.nair@company.com', phone: '+91 9876543216', department: 'Engineering', designation: 'Software Engineer', joinDate: '2024-06-01', status: 'active', employmentType: 'full_time', reportingManager: 'Rahul Sharma' },
  { key: '8', employeeId: 'EMP008', firstName: 'Meera', lastName: 'Nair', email: 'meera.nair@company.com', phone: '+91 9876543217', department: 'Marketing', designation: 'Marketing Manager', joinDate: '2022-04-18', status: 'active', employmentType: 'full_time', reportingManager: 'Deepak Verma' },
  { key: '9', employeeId: 'EMP009', firstName: 'Suresh', lastName: 'Iyer', email: 'suresh.iyer@company.com', phone: '+91 9876543218', department: 'Finance', designation: 'Finance Manager', joinDate: '2021-08-22', status: 'active', employmentType: 'full_time', reportingManager: 'Deepak Verma' },
  { key: '10', employeeId: 'EMP010', firstName: 'Pooja', lastName: 'Deshmukh', email: 'pooja.deshmukh@company.com', phone: '+91 9876543219', department: 'IT', designation: 'System Administrator', joinDate: '2024-01-08', status: 'active', employmentType: 'contract', reportingManager: 'Ananya Reddy' },
  { key: '11', employeeId: 'EMP011', firstName: 'Arjun', lastName: 'Menon', email: 'arjun.menon@company.com', phone: '+91 9876543220', department: 'Engineering', designation: 'Team Lead', joinDate: '2023-03-15', status: 'inactive', employmentType: 'full_time', reportingManager: 'Ananya Reddy' },
  { key: '12', employeeId: 'EMP012', firstName: 'Divya', lastName: 'Krishnan', email: 'divya.krishnan@company.com', phone: '+91 9876543221', department: 'HR', designation: 'HR Executive', joinDate: '2024-07-20', status: 'active', employmentType: 'intern', reportingManager: 'Sneha Gupta' },
  { key: '13', employeeId: 'EMP013', firstName: 'Deepak', lastName: 'Verma', email: 'deepak.verma@company.com', phone: '+91 9876543222', department: 'Operations', designation: 'VP Operations', joinDate: '2020-05-10', status: 'active', employmentType: 'full_time', reportingManager: '' },
  { key: '14', employeeId: 'EMP014', firstName: 'Neha', lastName: 'Bhatt', email: 'neha.bhatt@company.com', phone: '+91 9876543223', department: 'Legal', designation: 'Legal Counsel', joinDate: '2023-11-01', status: 'on_leave', employmentType: 'part_time', reportingManager: 'Deepak Verma' },
];

const departmentBadgeClass: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
  Finance: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  HR: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  Sales: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  IT: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  Operations: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  Legal: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
};

const typeBadgeClass: Record<string, string> = {
  full_time: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  part_time: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  contract: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  intern: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
};

const EmployeeList: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const queryParams = {
    page,
    limit,
    search: searchText || undefined,
    department: filterDepartment !== 'all' ? filterDepartment : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    employmentType: filterType !== 'all' ? filterType : undefined,
  };

  const { data, isLoading } = useEmployeeList(queryParams);
  const createMutation = useCreateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees: Employee[] = data?.data ?? mockEmployees;
  const paginationData = data?.pagination;

  const filteredEmployees = data?.data ? employees : mockEmployees.filter(emp => {
    const matchesSearch = !searchText ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchText.toLowerCase());
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    const matchesType = filterType === 'all' || emp.employmentType === filterType;
    return matchesSearch && matchesDept && matchesStatus && matchesType;
  });

  const stats = [
    { title: 'Total Employees', value: paginationData?.total ?? mockEmployees.length, icon: <Users size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950', change: 'Updated today' },
    { title: 'Active', value: data?.data ? data.data.filter((e: any) => e.status === 'active').length : mockEmployees.filter(e => e.status === 'active').length, icon: <UserCheck size={20} />, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950', change: 'Updated today' },
    { title: 'On Leave', value: data?.data ? data.data.filter((e: any) => e.status === 'on_leave').length : mockEmployees.filter(e => e.status === 'on_leave').length, icon: <UserMinus size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950', change: 'Updated today' },
    { title: 'New Joiners (This Month)', value: 2, icon: <UserPlus size={20} />, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-950', change: 'Updated today' },
  ];

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'firstName',
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original;
        const fullName = `${emp.firstName} ${emp.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
              <p className="text-[11px] text-muted-foreground">{emp.employeeId}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <Badge variant="outline" className={departmentBadgeClass[row.original.department] || ''}>
          {row.original.department}
        </Badge>
      ),
    },
    { accessorKey: 'designation', header: 'Designation' },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      cell: ({ row }) => formatDate(row.original.joinDate),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
            <DropdownMenuItem onClick={() => navigate(`/employees/${row.original.key}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                deleteMutation.mutate(row.original.key, {
                  onSuccess: () => toast.success('Employee deleted successfully'),
                  onError: (err: any) => toast.error(err?.message || 'Failed to delete employee'),
                });
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleDrawerSubmit = (formData?: any) => {
    createMutation.mutate(formData ?? {}, {
      onSuccess: () => {
        toast.success('Employee added successfully');
        setDrawerOpen(false);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to add employee'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage and view all employee information"
        actions={
          <>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setDrawerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search employees..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="pl-9"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User size={16} />
                </span>
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'IT', 'Operations', 'Legal'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> More Filters
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredEmployees}
            isLoading={isLoading}
            pagination={paginationData ?? { page, limit, total: filteredEmployees.length, totalPages: Math.ceil(filteredEmployees.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
          />
        </CardContent>
      </Card>

      {/* Add Employee Drawer */}
      <FormSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Add New Employee"
        description="Fill in all required information to add a new employee."
        className="sm:max-w-2xl"
      >
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="personal" className="gap-1.5">
              <User size={14} /> Personal Info
            </TabsTrigger>
            <TabsTrigger value="employment" className="gap-1.5">
              <Briefcase size={14} /> Employment
            </TabsTrigger>
            <TabsTrigger value="bank" className="gap-1.5">
              <CreditCard size={14} /> Bank Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input placeholder="Enter last name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="Enter email" />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input placeholder="Enter phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <DatePicker onChange={() => {}} placeholder="Select date" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea rows={2} placeholder="Enter address" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="State" />
              </div>
              <div className="space-y-2">
                <Label>PIN Code</Label>
                <Input placeholder="PIN Code" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID *</Label>
                <Input placeholder="e.g. EMP015" />
              </div>
              <div className="space-y-2">
                <Label>Join Date *</Label>
                <DatePicker onChange={() => {}} placeholder="Select date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'IT', 'Operations', 'Legal'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>
                    {['Software Engineer', 'Senior Developer', 'Team Lead', 'Engineering Manager', 'Marketing Executive', 'Financial Analyst', 'HR Executive', 'Sales Lead'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reporting Manager</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>
                    {['Ananya Reddy', 'Deepak Verma', 'Sneha Gupta', 'Meera Nair', 'Suresh Iyer'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Shift</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General (9 AM - 6 PM)</SelectItem>
                    <SelectItem value="Morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="Evening">Evening (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="Night">Night (10 PM - 6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input placeholder="Enter account number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input placeholder="Enter IFSC code" />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input placeholder="Enter PAN number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Aadhaar Number</Label>
              <Input placeholder="Enter Aadhaar number" />
            </div>

            <Separator className="my-4" />
            <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Contact name" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="Contact phone" />
              </div>
              <div className="space-y-2">
                <Label>Relation</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Relation" /></SelectTrigger>
                  <SelectContent>
                    {['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          <Button onClick={handleDrawerSubmit}>Submit</Button>
        </div>
      </FormSheet>
    </div>
  );
};

export default EmployeeList;
