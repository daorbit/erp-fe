import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Edit2, MoreHorizontal, Mail, Phone, MapPin, Calendar,
  Briefcase, Shield, FileText, Clock, Monitor, ArrowLeft,
  UserX, Download, CreditCard, Activity,
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { getInitials, formatDate } from '@/lib/formatters';
import { useEmployee } from '@/hooks/queries/useEmployees';

const mockEmployee = {
  key: '1', employeeId: 'EMP001', firstName: 'Rahul', lastName: 'Sharma',
  email: 'rahul.sharma@company.com', phone: '+91 9876543210',
  dateOfBirth: '1994-06-15', gender: 'male', maritalStatus: 'married',
  bloodGroup: 'B+', address: '42, MG Road, Indiranagar', city: 'Bangalore',
  state: 'Karnataka', pincode: '560038', department: 'Engineering',
  designation: 'Senior Developer', reportingManager: 'Ananya Reddy',
  joinDate: '2023-01-15', employmentType: 'full_time', status: 'active',
  workShift: 'General (9 AM - 6 PM)', bankName: 'HDFC Bank',
  bankAccountNo: '****4567', ifscCode: 'HDFC0001234', panNumber: 'ABCPS1234K',
  aadharNumber: '****-****-5678', emergencyContactName: 'Sunita Sharma',
  emergencyContactPhone: '+91 9876549999', emergencyContactRelation: 'Spouse',
};

const mockLeaves = [
  { key: '1', type: 'Casual Leave', from: '2025-12-20', to: '2025-12-22', days: 3, status: 'approved', reason: 'Family function' },
  { key: '2', type: 'Sick Leave', from: '2025-11-05', to: '2025-11-05', days: 1, status: 'approved', reason: 'Fever' },
  { key: '3', type: 'Earned Leave', from: '2026-01-10', to: '2026-01-15', days: 6, status: 'pending', reason: 'Vacation' },
  { key: '4', type: 'Casual Leave', from: '2026-03-25', to: '2026-03-26', days: 2, status: 'rejected', reason: 'Personal work' },
];

const mockPayslips = [
  { key: '1', month: 'March 2026', grossSalary: 85000, deductions: 12400, netSalary: 72600, status: 'paid' },
  { key: '2', month: 'February 2026', grossSalary: 85000, deductions: 12400, netSalary: 72600, status: 'paid' },
  { key: '3', month: 'January 2026', grossSalary: 85000, deductions: 12400, netSalary: 72600, status: 'paid' },
  { key: '4', month: 'December 2025', grossSalary: 85000, deductions: 12400, netSalary: 72600, status: 'paid' },
];

const mockAssets = [
  { key: '1', asset: 'MacBook Pro 14"', assetId: 'AST-001', category: 'Laptop', assignedDate: '2023-01-20', condition: 'good' },
  { key: '2', asset: 'Dell Monitor 27"', assetId: 'AST-045', category: 'Monitor', assignedDate: '2023-01-20', condition: 'good' },
  { key: '3', asset: 'iPhone 15', assetId: 'AST-112', category: 'Mobile', assignedDate: '2024-06-10', condition: 'good' },
  { key: '4', asset: 'Access Card', assetId: 'AST-500', category: 'ID Card', assignedDate: '2023-01-15', condition: 'active' },
];

const mockDocuments = [
  { key: '1', name: 'Aadhaar Card', type: 'ID Proof', uploadedOn: '2023-01-16', status: 'Verified' },
  { key: '2', name: 'PAN Card', type: 'Tax Document', uploadedOn: '2023-01-16', status: 'Verified' },
  { key: '3', name: 'Degree Certificate', type: 'Education', uploadedOn: '2023-01-17', status: 'Verified' },
  { key: '4', name: 'Offer Letter', type: 'Employment', uploadedOn: '2023-01-15', status: 'Verified' },
  { key: '5', name: 'Passport', type: 'ID Proof', uploadedOn: '2023-02-10', status: 'pending' },
];

const mockAttendance = [
  { key: '1', date: '2026-03-01', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'present' },
  { key: '2', date: '2026-03-02', checkIn: '08:55 AM', checkOut: '06:30 PM', hours: '9h 35m', status: 'present' },
  { key: '3', date: '2026-03-03', checkIn: '09:10 AM', checkOut: '06:05 PM', hours: '8h 55m', status: 'present' },
  { key: '4', date: '2026-03-04', checkIn: '-', checkOut: '-', hours: '-', status: 'absent' },
  { key: '5', date: '2026-03-05', checkIn: '09:00 AM', checkOut: '06:20 PM', hours: '9h 20m', status: 'present' },
  { key: '6', date: '2026-03-06', checkIn: '-', checkOut: '-', hours: '-', status: 'week_off' },
  { key: '7', date: '2026-03-07', checkIn: '-', checkOut: '-', hours: '-', status: 'week_off' },
];

const timelineItems = [
  { color: 'bg-blue-500', title: 'Leave Request Submitted', desc: 'Earned Leave: Jan 10 - Jan 15, 2026', time: '2 days ago' },
  { color: 'bg-green-500', title: 'Payslip Generated', desc: 'March 2026 salary processed', time: '5 days ago' },
  { color: 'bg-orange-500', title: 'Asset Assigned', desc: 'iPhone 15 (AST-112) assigned', time: 'Jun 10, 2024' },
  { color: 'bg-green-500', title: 'Promotion', desc: 'Promoted to Senior Developer', time: 'Apr 1, 2024' },
  { color: 'bg-blue-500', title: 'KYC Completed', desc: 'All documents verified', time: 'Jan 20, 2023' },
  { color: 'bg-green-500', title: 'Joined Company', desc: 'Onboarding completed for Engineering department', time: 'Jan 15, 2023' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="col-span-2 text-sm font-medium">{value}</span>
    </div>
  );
}

const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: employeeData, isLoading } = useEmployee(id || '');
  const emp = employeeData?.data ?? mockEmployee;
  const fullName = `${emp.firstName} ${emp.lastName}`;

  const leaveColumns: ColumnDef<typeof mockLeaves[0]>[] = [
    { accessorKey: 'type', header: 'Leave Type' },
    { accessorKey: 'from', header: 'From', cell: ({ row }) => formatDate(row.original.from) },
    { accessorKey: 'to', header: 'To', cell: ({ row }) => formatDate(row.original.to) },
    { accessorKey: 'days', header: 'Days' },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const attendanceColumns: ColumnDef<typeof mockAttendance[0]>[] = [
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: 'checkIn', header: 'Check In' },
    { accessorKey: 'checkOut', header: 'Check Out' },
    { accessorKey: 'hours', header: 'Working Hours' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const payslipColumns: ColumnDef<typeof mockPayslips[0]>[] = [
    { accessorKey: 'month', header: 'Month' },
    { accessorKey: 'grossSalary', header: 'Gross Salary', cell: ({ row }) => `₹${row.original.grossSalary.toLocaleString('en-IN')}` },
    { accessorKey: 'deductions', header: 'Deductions', cell: ({ row }) => `₹${row.original.deductions.toLocaleString('en-IN')}` },
    { accessorKey: 'netSalary', header: 'Net Salary', cell: ({ row }) => <span className="font-semibold">₹{row.original.netSalary.toLocaleString('en-IN')}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'action', header: '', cell: () => (
      <Button variant="link" size="sm" className="gap-1">
        <Download size={14} /> Download
      </Button>
    )},
  ];

  const assetColumns: ColumnDef<typeof mockAssets[0]>[] = [
    { accessorKey: 'asset', header: 'Asset', cell: ({ row }) => <span className="font-medium">{row.original.asset}</span> },
    { accessorKey: 'assetId', header: 'Asset ID', cell: ({ row }) => <span className="text-muted-foreground">{row.original.assetId}</span> },
    { accessorKey: 'category', header: 'Category', cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
    { accessorKey: 'assignedDate', header: 'Assigned Date', cell: ({ row }) => formatDate(row.original.assignedDate) },
    { accessorKey: 'condition', header: 'Condition', cell: ({ row }) => <StatusBadge status={row.original.condition} /> },
  ];

  const docColumns: ColumnDef<typeof mockDocuments[0]>[] = [
    { accessorKey: 'name', header: 'Document' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'action', header: '', cell: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Download size={14} />
      </Button>
    )},
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading employee profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate('/employees')} className="hover:text-foreground transition-colors">Employees</button>
        <span>/</span>
        <span className="text-foreground">{fullName}</span>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <StatusBadge status={emp.status} />
                </div>
                <p className="text-muted-foreground mt-1">{emp.designation} - {emp.department}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail size={13} />{emp.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone size={13} />{emp.phone}</span>
                  <span className="inline-flex items-center gap-1"><Shield size={13} />{emp.employeeId}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" onClick={() => navigate('/employees')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => toast.info('Deactivate action (mock)')}
                  >
                    <UserX className="mr-2 h-4 w-4" /> Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="gap-1.5"><FileText size={14} /> Overview</TabsTrigger>
              <TabsTrigger value="employment" className="gap-1.5"><Briefcase size={14} /> Employment</TabsTrigger>
              <TabsTrigger value="bank-docs" className="gap-1.5"><CreditCard size={14} /> Bank & Documents</TabsTrigger>
              <TabsTrigger value="attendance" className="gap-1.5"><Clock size={14} /> Attendance</TabsTrigger>
              <TabsTrigger value="leaves" className="gap-1.5"><Calendar size={14} /> Leaves</TabsTrigger>
              <TabsTrigger value="payslips" className="gap-1.5"><CreditCard size={14} /> Payslips</TabsTrigger>
              <TabsTrigger value="assets" className="gap-1.5"><Monitor size={14} /> Assets</TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5"><Activity size={14} /> Timeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                  <CardContent className="divide-y">
                    <InfoRow label="Date of Birth" value={formatDate(emp.dateOfBirth)} />
                    <InfoRow label="Gender" value={emp.gender} />
                    <InfoRow label="Marital Status" value={emp.maritalStatus} />
                    <InfoRow label="Blood Group" value={emp.bloodGroup} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
                  <CardContent className="divide-y">
                    <InfoRow label="Email" value={emp.email} />
                    <InfoRow label="Phone" value={emp.phone} />
                    <InfoRow label="Address" value={emp.address} />
                    <InfoRow label="City" value={`${emp.city}, ${emp.state} - ${emp.pincode}`} />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">{emp.emergencyContactName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{emp.emergencyContactPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Relation</p>
                        <p className="text-sm font-medium">{emp.emergencyContactRelation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2 divide-y sm:divide-y-0">
                    <div className="divide-y">
                      <InfoRow label="Employee ID" value={emp.employeeId} />
                      <InfoRow label="Join Date" value={formatDate(emp.joinDate)} />
                      <InfoRow label="Department" value={<Badge variant="outline" className="bg-blue-100 text-blue-700">{emp.department}</Badge>} />
                      <InfoRow label="Designation" value={emp.designation} />
                    </div>
                    <div className="divide-y">
                      <InfoRow label="Reporting Manager" value={emp.reportingManager} />
                      <InfoRow label="Employment Type" value={<Badge variant="outline" className="bg-indigo-100 text-indigo-700">{emp.employmentType}</Badge>} />
                      <InfoRow label="Work Shift" value={emp.workShift} />
                      <InfoRow label="Status" value={<StatusBadge status={emp.status} />} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank & Documents Tab */}
            <TabsContent value="bank-docs" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
                  <CardContent className="divide-y">
                    <InfoRow label="Bank Name" value={emp.bankName} />
                    <InfoRow label="Account No" value={emp.bankAccountNo} />
                    <InfoRow label="IFSC Code" value={emp.ifscCode} />
                    <InfoRow label="PAN Number" value={emp.panNumber} />
                    <InfoRow label="Aadhaar" value={emp.aadharNumber} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
                  <CardContent>
                    <DataTable columns={docColumns} data={mockDocuments} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Present Days', value: '22 / 23', color: 'text-green-600' },
                  { label: 'Absent Days', value: '1', color: 'text-red-600' },
                  { label: 'Attendance %', value: '95.7%', color: 'text-blue-600' },
                ].map(s => (
                  <Card key={s.label}>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">March 2026 - Attendance Log</CardTitle></CardHeader>
                <CardContent>
                  <DataTable columns={attendanceColumns} data={mockAttendance} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaves Tab */}
            <TabsContent value="leaves" className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { label: 'Casual Leave', value: '4 / 12' },
                  { label: 'Sick Leave', value: '2 / 8' },
                  { label: 'Earned Leave', value: '6 / 15' },
                  { label: 'Total Available', value: '23', color: 'text-green-600' },
                ].map(s => (
                  <Card key={s.label}>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Leave Requests</CardTitle></CardHeader>
                <CardContent>
                  <DataTable columns={leaveColumns} data={mockLeaves} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payslips Tab */}
            <TabsContent value="payslips" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <DataTable columns={payslipColumns} data={mockPayslips} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <DataTable columns={assetColumns} data={mockAssets} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="relative space-y-0">
                    {timelineItems.map((item, idx) => (
                      <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
                        {/* Vertical line */}
                        {idx < timelineItems.length - 1 && (
                          <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-border" />
                        )}
                        {/* Dot */}
                        <div className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ${item.color}`} />
                        {/* Content */}
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
