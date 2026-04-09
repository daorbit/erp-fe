import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  IndianRupee,
  Users,
  Clock3,
  CheckCircle2,
  Eye,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import type { StatsCardProps } from '@/components/shared/StatsCard';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';
import DatePicker from '@/components/shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatINR, getInitials } from '@/lib/formatters';
import {
  usePayslipList,
  useSalaryStructureList,
  useCreateSalaryStructure,
  useApprovePayslip,
  useMarkPayslipPaid,
  usePayrollSummary,
} from '@/hooks/queries/usePayroll';

// ----- Types -----

interface Payslip {
  key: string;
  name: string;
  empId: string;
  department: string;
  gross: number;
  deductions: number;
  net: number;
  status: string;
  paymentDate: string;
}

interface SalaryStructure {
  key: string;
  name: string;
  basic: number;
  hra: number;
  da: number;
  specialAllowance: number;
  gross: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  net: number;
  ctc: number;
  effectiveFrom: string;
}

// ----- Mock Data -----

const payslips: Payslip[] = [
  { key: '1', name: 'Rahul Sharma', empId: 'EMP001', department: 'Engineering', gross: 125000, deductions: 27500, net: 97500, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '2', name: 'Priya Singh', empId: 'EMP002', department: 'Marketing', gross: 95000, deductions: 20900, net: 74100, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '3', name: 'Amit Patel', empId: 'EMP003', department: 'Finance', gross: 110000, deductions: 24200, net: 85800, status: 'approved', paymentDate: '-' },
  { key: '4', name: 'Sneha Gupta', empId: 'EMP004', department: 'HR', gross: 85000, deductions: 18700, net: 66300, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '5', name: 'Vikram Joshi', empId: 'EMP005', department: 'Sales', gross: 75000, deductions: 16500, net: 58500, status: 'generated', paymentDate: '-' },
  { key: '6', name: 'Ananya Reddy', empId: 'EMP006', department: 'Engineering', gross: 150000, deductions: 33000, net: 117000, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '7', name: 'Karan Mehta', empId: 'EMP007', department: 'Sales', gross: 65000, deductions: 14300, net: 50700, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '8', name: 'Deepika Nair', empId: 'EMP008', department: 'Engineering', gross: 130000, deductions: 28600, net: 101400, status: 'draft', paymentDate: '-' },
  { key: '9', name: 'Rajesh Kumar', empId: 'EMP009', department: 'Finance', gross: 90000, deductions: 19800, net: 70200, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '10', name: 'Meera Iyer', empId: 'EMP010', department: 'Marketing', gross: 80000, deductions: 17600, net: 62400, status: 'generated', paymentDate: '-' },
  { key: '11', name: 'Suresh Pillai', empId: 'EMP011', department: 'HR', gross: 70000, deductions: 15400, net: 54600, status: 'approved', paymentDate: '-' },
  { key: '12', name: 'Neha Deshmukh', empId: 'EMP012', department: 'Engineering', gross: 140000, deductions: 30800, net: 109200, status: 'paid', paymentDate: '01 Apr 2026' },
  { key: '13', name: 'Arjun Malhotra', empId: 'EMP013', department: 'Sales', gross: 55000, deductions: 12100, net: 42900, status: 'generated', paymentDate: '-' },
  { key: '14', name: 'Pooja Verma', empId: 'EMP014', department: 'Finance', gross: 25000, deductions: 5500, net: 19500, status: 'draft', paymentDate: '-' },
];

const salaryStructures: SalaryStructure[] = [
  { key: '1', name: 'Rahul Sharma', basic: 50000, hra: 25000, da: 12500, specialAllowance: 25000, gross: 125000, pf: 6000, esi: 0, pt: 200, tds: 21300, net: 97500, ctc: 1800000, effectiveFrom: '01 Jan 2026' },
  { key: '2', name: 'Priya Singh', basic: 38000, hra: 19000, da: 9500, specialAllowance: 19000, gross: 95000, pf: 4560, esi: 0, pt: 200, tds: 16140, net: 74100, ctc: 1368000, effectiveFrom: '01 Jan 2026' },
  { key: '3', name: 'Amit Patel', basic: 44000, hra: 22000, da: 11000, specialAllowance: 22000, gross: 110000, pf: 5280, esi: 0, pt: 200, tds: 18720, net: 85800, ctc: 1584000, effectiveFrom: '01 Jan 2026' },
  { key: '4', name: 'Sneha Gupta', basic: 34000, hra: 17000, da: 8500, specialAllowance: 17000, gross: 85000, pf: 4080, esi: 0, pt: 200, tds: 14420, net: 66300, ctc: 1224000, effectiveFrom: '01 Apr 2026' },
  { key: '5', name: 'Vikram Joshi', basic: 30000, hra: 15000, da: 7500, specialAllowance: 15000, gross: 75000, pf: 3600, esi: 0, pt: 200, tds: 12700, net: 58500, ctc: 1080000, effectiveFrom: '01 Jan 2026' },
  { key: '6', name: 'Ananya Reddy', basic: 60000, hra: 30000, da: 15000, specialAllowance: 30000, gross: 150000, pf: 7200, esi: 0, pt: 200, tds: 25600, net: 117000, ctc: 2160000, effectiveFrom: '01 Jan 2026' },
  { key: '7', name: 'Karan Mehta', basic: 26000, hra: 13000, da: 6500, specialAllowance: 13000, gross: 65000, pf: 3120, esi: 0, pt: 200, tds: 10980, net: 50700, ctc: 936000, effectiveFrom: '01 Jan 2026' },
  { key: '8', name: 'Deepika Nair', basic: 52000, hra: 26000, da: 13000, specialAllowance: 26000, gross: 130000, pf: 6240, esi: 0, pt: 200, tds: 22160, net: 101400, ctc: 1872000, effectiveFrom: '01 Jan 2026' },
];

// ----- Component -----

const PayrollList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payslips');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  // Structure form state
  const [structEmployee, setStructEmployee] = useState('');
  const [structEffectiveDate, setStructEffectiveDate] = useState<Date | undefined>(undefined);
  const [structBasic, setStructBasic] = useState('');
  const [structHra, setStructHra] = useState('');
  const [structDa, setStructDa] = useState('');
  const [structSpecialAllowance, setStructSpecialAllowance] = useState('');
  const [structPf, setStructPf] = useState('');
  const [structEsi, setStructEsi] = useState('');
  const [structPt, setStructPt] = useState('');
  const [structTds, setStructTds] = useState('');

  // API hooks
  const payslipParams = {
    page: String(page),
    limit: String(limit),
    ...(searchText ? { search: searchText } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  };
  const { data: payslipData, isLoading: isLoadingPayslips } = usePayslipList(payslipParams);
  const { data: structureData, isLoading: isLoadingStructures } = useSalaryStructureList();
  const { data: summaryData } = usePayrollSummary();
  const createStructureMutation = useCreateSalaryStructure();
  const approvePayslipMutation = useApprovePayslip();
  const markPaidMutation = useMarkPayslipPaid();

  const payslipsList: Payslip[] = payslipData?.data ?? payslips;
  const structuresList: SalaryStructure[] = structureData?.data ?? salaryStructures;
  const payslipPagination = payslipData?.pagination;

  const totalPayroll = summaryData?.data?.totalPayroll ?? payslipsList.reduce((sum, p) => sum + p.net, 0);
  const paidCount = summaryData?.data?.paidCount ?? payslipsList.filter(p => p.status === 'paid').length;
  const pendingCount = summaryData?.data?.pendingCount ?? payslipsList.filter(p => p.status === 'approved' || p.status === 'generated').length;

  const statsCards: StatsCardProps[] = [
    { title: 'Total Payroll Cost', value: formatINR(totalPayroll), icon: <IndianRupee className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Employees Processed', value: summaryData?.data?.employeeCount ?? payslipsList.length, icon: <Users className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Pending Approval', value: pendingCount, icon: <Clock3 className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Paid', value: paidCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ];

  const filteredPayslips = useMemo(() => {
    if (payslipData?.data) return payslipsList;
    return payslips.filter(p => {
      const matchesSearch = !searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.empId.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter, payslipData, payslipsList]);

  const payslipColumns: ColumnDef<Payslip>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.empId}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.original.department}
        </Badge>
      ),
    },
    {
      accessorKey: 'gross',
      header: 'Gross',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.gross)}</span>,
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions',
      cell: ({ row }) => (
        <span className="text-red-600 text-right block">{formatINR(row.original.deductions)}</span>
      ),
    },
    {
      accessorKey: 'net',
      header: 'Net Pay',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600 text-right block">
          {formatINR(row.original.net)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'paymentDate',
      header: 'Payment Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/payroll/payslip/${row.original.key}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'generated' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => approvePayslipMutation.mutate(row.original.key, {
                onSuccess: () => toast.success('Payslip approved'),
                onError: (err: any) => toast.error(err?.message || 'Failed to approve'),
              })}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          {row.original.status === 'approved' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => markPaidMutation.mutate({ id: row.original.key }, {
                onSuccess: () => toast.success('Marked as paid'),
                onError: (err: any) => toast.error(err?.message || 'Failed to mark as paid'),
              })}
            >
              <IndianRupee className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const structureColumns: ColumnDef<SalaryStructure>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'basic',
      header: 'Basic',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.basic)}</span>,
    },
    {
      accessorKey: 'hra',
      header: 'HRA',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.hra)}</span>,
    },
    {
      accessorKey: 'da',
      header: 'DA',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.da)}</span>,
    },
    {
      accessorKey: 'specialAllowance',
      header: 'Spl. Allowance',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.specialAllowance)}</span>,
    },
    {
      accessorKey: 'gross',
      header: 'Gross',
      cell: ({ row }) => <span className="font-semibold text-right block">{formatINR(row.original.gross)}</span>,
    },
    {
      accessorKey: 'pf',
      header: 'PF',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.pf)}</span>,
    },
    {
      accessorKey: 'esi',
      header: 'ESI',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.esi)}</span>,
    },
    {
      accessorKey: 'pt',
      header: 'PT',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.pt)}</span>,
    },
    {
      accessorKey: 'tds',
      header: 'TDS',
      cell: ({ row }) => <span className="text-right block">{formatINR(row.original.tds)}</span>,
    },
    {
      accessorKey: 'net',
      header: 'Net',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600 text-right block">
          {formatINR(row.original.net)}
        </span>
      ),
    },
    {
      accessorKey: 'ctc',
      header: 'CTC (Annual)',
      cell: ({ row }) => <span className="font-semibold text-right block">{formatINR(row.original.ctc)}</span>,
    },
    {
      accessorKey: 'effectiveFrom',
      header: 'Effective From',
    },
  ];

  const resetStructureForm = () => {
    setStructEmployee('');
    setStructEffectiveDate(undefined);
    setStructBasic('');
    setStructHra('');
    setStructDa('');
    setStructSpecialAllowance('');
    setStructPf('');
    setStructEsi('');
    setStructPt('');
    setStructTds('');
  };

  const handleAddStructure = () => {
    if (!structEmployee || !structBasic || !structHra) {
      toast.error('Please fill in required fields');
      return;
    }
    createStructureMutation.mutate(
      {
        employeeId: structEmployee,
        effectiveFrom: structEffectiveDate?.toISOString(),
        basic: Number(structBasic),
        hra: Number(structHra),
        da: Number(structDa) || 0,
        specialAllowance: Number(structSpecialAllowance) || 0,
        pf: Number(structPf) || 0,
        esi: Number(structEsi) || 0,
        pt: Number(structPt) || 0,
        tds: Number(structTds) || 0,
      },
      {
        onSuccess: () => {
          toast.success('Salary structure added successfully');
          setIsStructureModalOpen(false);
          resetStructureForm();
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to add salary structure'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        description="Manage employee payroll and salary structures"
        actions={
          <>
            <Input type="month" className="w-[180px]" defaultValue="2026-04" />
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Payslips
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Bulk Generate
            </Button>
          </>
        }
      />

      <StatsGrid stats={statsCards} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="structure">Salary Structure</TabsTrigger>
        </TabsList>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="mt-4">
          <DataTable
            columns={payslipColumns}
            data={filteredPayslips}
            isLoading={isLoadingPayslips}
            searchKey="name"
            searchPlaceholder="Search by name or ID..."
            onSearchChange={setSearchText}
            pagination={payslipPagination ?? { page, limit, total: filteredPayslips.length, totalPages: Math.ceil(filteredPayslips.length / limit) }}
            onPaginationChange={(newPage) => setPage(newPage)}
            filterContent={
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="generated">Generated</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </TabsContent>

        {/* Salary Structure Tab */}
        <TabsContent value="structure" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsStructureModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Structure
            </Button>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={structureColumns}
              data={structuresList}
              isLoading={isLoadingStructures}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Salary Structure Modal */}
      <FormDialog
        open={isStructureModalOpen}
        onOpenChange={(open) => {
          setIsStructureModalOpen(open);
          if (!open) resetStructureForm();
        }}
        title="Add Salary Structure"
        description="Define salary components for an employee"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={structEmployee} onValueChange={setStructEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {payslips.map(e => (
                    <SelectItem key={e.key} value={e.key}>
                      {e.name} ({e.empId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Effective From *</Label>
              <DatePicker
                value={structEffectiveDate}
                onChange={setStructEffectiveDate}
                placeholder="Select date"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Earnings</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Basic *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structBasic}
                  onChange={(e) => setStructBasic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>HRA *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structHra}
                  onChange={(e) => setStructHra(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>DA</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structDa}
                  onChange={(e) => setStructDa(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Special Allowance</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structSpecialAllowance}
                  onChange={(e) => setStructSpecialAllowance(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Deductions</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>PF</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structPf}
                  onChange={(e) => setStructPf(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>ESI</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structEsi}
                  onChange={(e) => setStructEsi(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Professional Tax</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structPt}
                  onChange={(e) => setStructPt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>TDS</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={structTds}
                  onChange={(e) => setStructTds(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsStructureModalOpen(false);
                resetStructureForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStructure}>Add Structure</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default PayrollList;
