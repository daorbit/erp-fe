import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useEmployeeList, useCreateEmployee } from '@/hooks/queries/useEmployees';
import {
  Plus, Upload, Edit2, Trash2, MoreHorizontal, User, Mail, Phone,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getInitials } from '@/lib/formatters';

interface UserRecord {
  key: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
}

const users: UserRecord[] = [
  { key: '1', name: 'Rahul Sharma', email: 'rahul@company.com', phone: '+91 9876543210', role: 'Employee', department: 'Engineering', status: 'Active', joinDate: '2024-01-15' },
  { key: '2', name: 'Priya Singh', email: 'priya@company.com', phone: '+91 9876543211', role: 'Manager', department: 'Marketing', status: 'Active', joinDate: '2023-06-20' },
  { key: '3', name: 'Amit Patel', email: 'amit@company.com', phone: '+91 9876543212', role: 'Employee', department: 'Finance', status: 'Inactive', joinDate: '2024-03-10' },
  { key: '4', name: 'Sneha Gupta', email: 'sneha@company.com', phone: '+91 9876543213', role: 'HR Admin', department: 'HR', status: 'Active', joinDate: '2022-11-05' },
  { key: '5', name: 'Vikram Joshi', email: 'vikram@company.com', phone: '+91 9876543214', role: 'Employee', department: 'Sales', status: 'Active', joinDate: '2024-02-28' },
  { key: '6', name: 'Ananya Reddy', email: 'ananya@company.com', phone: '+91 9876543215', role: 'Manager', department: 'Engineering', status: 'Active', joinDate: '2023-09-12' },
];

const roleBadgeClass: Record<string, string> = {
  'HR Admin': 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Employee: 'bg-gray-100 text-gray-700',
};

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // API integration
  const { data: employeeData, isLoading } = useEmployeeList();
  const createMutation = useCreateEmployee();
  const allUsers: UserRecord[] = employeeData?.data ?? users;

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnDef<UserRecord>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className={roleBadgeClass[row.original.role] || ''}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <Badge variant="secondary">{row.original.department}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: 'joinDate', header: 'Join Date' },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success('User deleted (mock)')}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleCreate = (formData?: any) => {
    createMutation.mutate(formData ?? {}, {
      onSuccess: () => {
        toast.success('Employee added successfully');
        setIsModalOpen(false);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to add employee'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all employees and their access"
        actions={
          <>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <Input
              placeholder="Search employees..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination={{ page: 1, limit: 10, total: filteredUsers.length, totalPages: 1 }}
            onPaginationChange={() => {}}
          />
        </CardContent>
      </Card>

      <FormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Add New Employee"
        description="Fill in the details to add a new employee."
        className="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="Enter email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input placeholder="Enter phone" />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {['Engineering', 'Marketing', 'Finance', 'HR', 'Sales'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="HR Admin">HR Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Employee</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default UserManagement;
