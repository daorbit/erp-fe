import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Plus,
  Award,
  Layers,
  BarChart3,
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
import FormDialog from '@/components/shared/FormDialog';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDesignationList, useCreateDesignation, useUpdateDesignation, useDeleteDesignation } from '@/hooks/queries/useDesignations';

interface Designation {
  key: string;
  title: string;
  code: string;
  department: string;
  level: number;
  band: string;
  status: string;
}

const mockDesignations: Designation[] = [
  { key: '1', title: 'Software Engineer', code: 'SE', department: 'Engineering', level: 1, band: 'L1', status: 'Active' },
  { key: '2', title: 'Senior Developer', code: 'SDE', department: 'Engineering', level: 2, band: 'L2', status: 'Active' },
  { key: '3', title: 'Team Lead', code: 'TL', department: 'Engineering', level: 3, band: 'L3', status: 'Active' },
  { key: '4', title: 'Engineering Manager', code: 'EM', department: 'Engineering', level: 4, band: 'L4', status: 'Active' },
  { key: '5', title: 'VP Engineering', code: 'VPE', department: 'Engineering', level: 5, band: 'L5', status: 'Active' },
  { key: '6', title: 'Marketing Executive', code: 'ME', department: 'Marketing', level: 1, band: 'L1', status: 'Active' },
  { key: '7', title: 'Marketing Manager', code: 'MM', department: 'Marketing', level: 3, band: 'L3', status: 'Active' },
  { key: '8', title: 'Financial Analyst', code: 'FA', department: 'Finance', level: 1, band: 'L1', status: 'Active' },
  { key: '9', title: 'Finance Manager', code: 'FM', department: 'Finance', level: 3, band: 'L3', status: 'Active' },
  { key: '10', title: 'HR Executive', code: 'HRE', department: 'HR', level: 1, band: 'L1', status: 'Active' },
  { key: '11', title: 'HR Manager', code: 'HRM', department: 'HR', level: 3, band: 'L3', status: 'Active' },
  { key: '12', title: 'Sales Lead', code: 'SL', department: 'Sales', level: 2, band: 'L2', status: 'Active' },
  { key: '13', title: 'Sales Manager', code: 'SM', department: 'Sales', level: 3, band: 'L3', status: 'Active' },
  { key: '14', title: 'System Administrator', code: 'SA', department: 'IT', level: 2, band: 'L2', status: 'Active' },
  { key: '15', title: 'Legal Counsel', code: 'LC', department: 'Legal', level: 3, band: 'L3', status: 'Inactive' },
  { key: '16', title: 'VP Operations', code: 'VPO', department: 'Operations', level: 5, band: 'L5', status: 'Active' },
];

const departmentColorMap: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-700 border-blue-200',
  Marketing: 'bg-pink-100 text-pink-700 border-pink-200',
  Finance: 'bg-green-100 text-green-700 border-green-200',
  HR: 'bg-purple-100 text-purple-700 border-purple-200',
  Sales: 'bg-orange-100 text-orange-700 border-orange-200',
  IT: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Operations: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Legal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const bandColorMap: Record<string, string> = {
  L1: 'bg-gray-100 text-gray-700 border-gray-200',
  L2: 'bg-blue-100 text-blue-700 border-blue-200',
  L3: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  L4: 'bg-purple-100 text-purple-700 border-purple-200',
  L5: 'bg-amber-100 text-amber-700 border-amber-200',
};

const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales', 'IT', 'Operations', 'Legal'];

const DesignationList: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDesignation, setDeletingDesignation] = useState<Designation | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useDesignationList({ page, limit, search: search || undefined });
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();

  const designations: Designation[] = data?.data ?? mockDesignations;
  const paginationData = data?.pagination;

  const [form, setForm] = useState({
    title: '',
    code: '',
    department: '',
    level: '',
    band: '',
    description: '',
    status: 'Active',
  });

  const uniqueDepartments = [...new Set(designations.map((d) => d.department))];
  const activeCount = designations.filter((d) => d.status === 'Active').length;
  const maxLevel = designations.length ? Math.max(...designations.map((d) => d.level)) : 0;

  const stats = [
    { title: 'Total Designations', value: designations.length, icon: <Award className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Active', value: activeCount, icon: <Layers className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Departments Covered', value: uniqueDepartments.length, icon: <BarChart3 className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-100' },
    { title: 'Max Levels', value: maxLevel, icon: <Layers className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ];

  const columns: ColumnDef<Designation>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const dept = row.original.department;
        return (
          <Badge variant="outline" className={departmentColorMap[dept] || ''}>
            {dept}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.level}</span>
      ),
    },
    {
      accessorKey: 'band',
      header: 'Band',
      cell: ({ row }) => {
        const band = row.original.band;
        return (
          <Badge variant="outline" className={bandColorMap[band] || ''}>
            {band}
          </Badge>
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
                setEditingDesignation(row.original);
                setForm({
                  title: row.original.title,
                  code: row.original.code,
                  department: row.original.department,
                  level: String(row.original.level),
                  band: row.original.band,
                  description: '',
                  status: row.original.status,
                });
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
                setDeletingDesignation(row.original);
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

  const handleSubmit = () => {
    if (!form.title || !form.code) return;
    if (editingDesignation) {
      updateMutation.mutate(
        { id: editingDesignation.key, data: form },
        {
          onSuccess: () => {
            toast.success('Designation updated successfully');
            setModalOpen(false);
            setEditingDesignation(null);
            resetForm();
          },
          onError: (err: any) => toast.error(err?.message || 'Failed to update designation'),
        }
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast.success('Designation created successfully');
          setModalOpen(false);
          setEditingDesignation(null);
          resetForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create designation'),
      });
    }
  };

  const resetForm = () => {
    setForm({ title: '', code: '', department: '', level: '', band: '', description: '', status: 'Active' });
  };

  const handleDelete = () => {
    if (!deletingDesignation) return;
    deleteMutation.mutate(deletingDesignation.key, {
      onSuccess: () => {
        toast.success('Designation deleted successfully');
        setDeleteDialogOpen(false);
        setDeletingDesignation(null);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to delete designation'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Designations"
        description="Manage job titles, levels, and bands"
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingDesignation(null);
                resetForm();
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <DataTable
        columns={columns}
        data={designations}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Search designations..."
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        pagination={paginationData ?? {
          page,
          limit,
          total: designations.length,
          totalPages: Math.ceil(designations.length / limit),
        }}
        onPaginationChange={(newPage) => setPage(newPage)}
      />

      {/* Add/Edit Designation Dialog */}
      <FormDialog
        open={modalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setModalOpen(false);
            setEditingDesignation(null);
            resetForm();
          }
        }}
        title={editingDesignation ? 'Edit Designation' : 'Add New Designation'}
        description={
          editingDesignation
            ? 'Update designation details below.'
            : 'Fill in the details to create a new designation.'
        }
        className="sm:max-w-[640px]"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Designation Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Software Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. SE"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.department}
                onValueChange={(val) => setForm({ ...form, department: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.level}
                onValueChange={(val) => setForm({ ...form, level: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((l) => (
                    <SelectItem key={l} value={String(l)}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Band <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.band}
                onValueChange={(val) => setForm({ ...form, band: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Band" />
                </SelectTrigger>
                <SelectContent>
                  {['L1', 'L2', 'L3', 'L4', 'L5'].map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Enter designation description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => setForm({ ...form, status: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditingDesignation(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDesignation ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Designation"
        description={`Are you sure you want to delete "${deletingDesignation?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default DesignationList;
