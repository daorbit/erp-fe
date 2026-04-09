import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Plus,
  Building2,
  Users,
  GitBranch,
  Download,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/formatters';
import { useDepartmentList, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/queries/useDepartments';
import DepartmentForm from './DepartmentForm';

interface Department {
  key: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  employeeCount: number;
  parentDepartment: string;
  status: string;
}

const mockDepartments: Department[] = [
  { key: '1', name: 'Engineering', code: 'ENG', description: 'Software development and technology', headOfDepartment: 'Ananya Reddy', employeeCount: 45, parentDepartment: 'Operations', status: 'Active' },
  { key: '2', name: 'Marketing', code: 'MKT', description: 'Brand, digital marketing, and communications', headOfDepartment: 'Meera Nair', employeeCount: 18, parentDepartment: 'Operations', status: 'Active' },
  { key: '3', name: 'Finance', code: 'FIN', description: 'Financial planning, accounting, and compliance', headOfDepartment: 'Suresh Iyer', employeeCount: 12, parentDepartment: '', status: 'Active' },
  { key: '4', name: 'HR', code: 'HR', description: 'Human resources, recruitment, and employee relations', headOfDepartment: 'Sneha Gupta', employeeCount: 8, parentDepartment: '', status: 'Active' },
  { key: '5', name: 'Sales', code: 'SAL', description: 'Revenue generation and client management', headOfDepartment: 'Vikram Joshi', employeeCount: 22, parentDepartment: 'Operations', status: 'Active' },
  { key: '6', name: 'Operations', code: 'OPS', description: 'Business operations and process management', headOfDepartment: 'Deepak Verma', employeeCount: 10, parentDepartment: '', status: 'Active' },
  { key: '7', name: 'IT', code: 'IT', description: 'IT infrastructure and support', headOfDepartment: 'Pooja Deshmukh', employeeCount: 6, parentDepartment: 'Engineering', status: 'Active' },
  { key: '8', name: 'Legal', code: 'LEG', description: 'Legal affairs, compliance, and contracts', headOfDepartment: 'Neha Bhatt', employeeCount: 4, parentDepartment: '', status: 'Inactive' },
];

const DepartmentList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useDepartmentList({ page, limit, search: search || undefined });
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const departments: Department[] = data?.data ?? mockDepartments;
  const paginationData = data?.pagination;

  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const activeDepts = departments.filter((d) => d.status === 'Active').length;
  const avgTeamSize = departments.length ? Math.round(totalEmployees / departments.length) : 0;

  const stats = [
    { title: 'Total Departments', value: departments.length, icon: <Building2 className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Active Departments', value: activeDepts, icon: <GitBranch className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Total Employees', value: totalEmployees, icon: <Users className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-100' },
    { title: 'Avg Team Size', value: avgTeamSize, icon: <Users className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ];

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'name',
      header: 'Department',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {row.original.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'headOfDepartment',
      header: 'Head of Department',
      cell: ({ row }) => {
        const name = row.original.headOfDepartment;
        return name ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'employeeCount',
      header: 'Employees',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeCount}</span>
      ),
    },
    {
      accessorKey: 'parentDepartment',
      header: 'Parent Department',
      cell: ({ row }) => {
        const p = row.original.parentDepartment;
        return p ? (
          <Badge variant="outline">{p}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
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
      cell: ({ row }) => (
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
            <DropdownMenuItem
              onClick={() => {
                setEditingDepartment(row.original);
                setModalOpen(true);
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setDeletingDepartment(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleFormSubmit = (formData?: any) => {
    if (editingDepartment) {
      updateMutation.mutate(
        { id: editingDepartment.key, data: formData ?? editingDepartment },
        {
          onSuccess: () => {
            toast.success('Department updated successfully');
            setModalOpen(false);
            setEditingDepartment(null);
          },
          onError: (err: any) => toast.error(err?.message || 'Failed to update department'),
        }
      );
    } else {
      createMutation.mutate(formData ?? {}, {
        onSuccess: () => {
          toast.success('Department created successfully');
          setModalOpen(false);
          setEditingDepartment(null);
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create department'),
      });
    }
  };

  const handleDelete = () => {
    if (!deletingDepartment) return;
    deleteMutation.mutate(deletingDepartment.key, {
      onSuccess: () => {
        toast.success('Department deleted successfully');
        setDeleteDialogOpen(false);
        setDeletingDepartment(null);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to delete department'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organizational departments and teams"
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingDepartment(null);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <DataTable
        columns={columns}
        data={departments}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search departments..."
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        pagination={paginationData ?? {
          page,
          limit,
          total: departments.length,
          totalPages: Math.ceil(departments.length / limit),
        }}
        onPaginationChange={(newPage) => setPage(newPage)}
      />

      <DepartmentForm
        open={modalOpen}
        editingDepartment={editingDepartment as Record<string, string> | null}
        onCancel={() => {
          setModalOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${deletingDepartment?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default DepartmentList;
