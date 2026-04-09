import React, { useEffect, useState } from 'react';
import FormDialog from '@/components/shared/FormDialog';
import { Button } from '@/components/ui/button';
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

interface DepartmentFormProps {
  open: boolean;
  editingDepartment: Record<string, string> | null;
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => void;
}

const departmentHeads = [
  'Ananya Reddy',
  'Meera Nair',
  'Suresh Iyer',
  'Sneha Gupta',
  'Deepak Verma',
  'Vikram Joshi',
  'Neha Bhatt',
  'Pooja Deshmukh',
];

const parentDepartments = ['Operations', 'Engineering', 'Marketing', 'Finance'];

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  open,
  editingDepartment,
  onCancel,
  onSubmit,
}) => {
  const isEditing = !!editingDepartment;

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    parentDepartment: '',
    status: 'Active',
  });

  useEffect(() => {
    if (open && editingDepartment) {
      setForm({
        name: editingDepartment.name || '',
        code: editingDepartment.code || '',
        description: editingDepartment.description || '',
        headOfDepartment: editingDepartment.headOfDepartment || '',
        parentDepartment: editingDepartment.parentDepartment || '',
        status: editingDepartment.status || 'Active',
      });
    } else if (open) {
      setForm({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        parentDepartment: '',
        status: 'Active',
      });
    }
  }, [open, editingDepartment]);

  const handleSubmit = () => {
    if (!form.name || !form.code) return;
    onSubmit(form);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
      title={isEditing ? 'Edit Department' : 'Add New Department'}
      description={
        isEditing
          ? 'Update department details below.'
          : 'Fill in the details to create a new department.'
      }
      className="sm:max-w-[640px]"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dept-name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dept-name"
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-code">
              Department Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dept-code"
              placeholder="e.g. ENG"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dept-desc">Description</Label>
          <Textarea
            id="dept-desc"
            rows={3}
            placeholder="Enter department description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Head of Department</Label>
            <Select
              value={form.headOfDepartment}
              onValueChange={(val) =>
                setForm({ ...form, headOfDepartment: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department head" />
              </SelectTrigger>
              <SelectContent>
                {departmentHeads.map((head) => (
                  <SelectItem key={head} value={head}>
                    {head}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Parent Department</Label>
            <Select
              value={form.parentDepartment}
              onValueChange={(val) =>
                setForm({ ...form, parentDepartment: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent department" />
              </SelectTrigger>
              <SelectContent>
                {parentDepartments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
};

export default DepartmentForm;
