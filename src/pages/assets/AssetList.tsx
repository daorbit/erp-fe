import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useAssetList, useCreateAsset, useAssignAsset, useReturnAsset } from '@/hooks/queries/useAssets';
import {
  Plus, Eye, Edit2, MoreHorizontal,
  Laptop, Monitor, Smartphone, Package, Key, UserPlus, RotateCcw,
  HardDrive, Armchair, CheckCircle2, Wrench, Archive,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormSheet from '@/components/shared/FormSheet';
import FormDialog from '@/components/shared/FormDialog';
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
import { toast } from 'sonner';
import { formatDate, formatINR, getInitials } from '@/lib/formatters';
import DatePicker from '@/components/shared/DatePicker';
import SearchableSelect from '@/components/shared/SearchableSelect';

// ---------- types ----------
interface Asset {
  key: string;
  name: string;
  assetTag: string;
  category: string;
  brand: string;
  model: string;
  serialNo: string;
  assignedTo: string | null;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  status: 'Assigned' | 'Available' | 'In Repair' | 'Retired';
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  location: string;
}

// ---------- mock data ----------
const assets: Asset[] = [
  { key: '1', name: 'MacBook Pro 16"', assetTag: 'AST-2026-001', category: 'Laptop', brand: 'Apple', model: 'MacBook Pro M3 Max', serialNo: 'C02ZN1ABCD01', assignedTo: 'Rahul Sharma', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-11-15', purchasePrice: 289900, warrantyExpiry: '2027-11-15', location: 'Bangalore Office' },
  { key: '2', name: 'Dell UltraSharp 27" Monitor', assetTag: 'AST-2026-002', category: 'Monitor', brand: 'Dell', model: 'U2723QE', serialNo: 'DL27U2723Q001', assignedTo: 'Rahul Sharma', condition: 'Good', status: 'Assigned', purchaseDate: '2025-12-01', purchasePrice: 42500, warrantyExpiry: '2028-12-01', location: 'Bangalore Office' },
  { key: '3', name: 'iPhone 15 Pro', assetTag: 'AST-2026-003', category: 'Mobile', brand: 'Apple', model: 'iPhone 15 Pro 256GB', serialNo: 'IP15P256A001', assignedTo: 'Priya Singh', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-10-20', purchasePrice: 134900, warrantyExpiry: '2026-10-20', location: 'Mumbai Office' },
  { key: '4', name: 'ThinkPad X1 Carbon Gen 11', assetTag: 'AST-2026-004', category: 'Laptop', brand: 'Lenovo', model: 'X1 Carbon Gen 11', serialNo: 'LNV-X1C11-004', assignedTo: 'Amit Patel', condition: 'Good', status: 'Assigned', purchaseDate: '2025-08-10', purchasePrice: 156000, warrantyExpiry: '2028-08-10', location: 'Bangalore Office' },
  { key: '5', name: 'Standing Desk - Electric', assetTag: 'AST-2026-005', category: 'Furniture', brand: 'FlexiSpot', model: 'E7 Pro', serialNo: 'FS-E7P-005', assignedTo: 'Sneha Gupta', condition: 'Good', status: 'Assigned', purchaseDate: '2025-09-05', purchasePrice: 32000, warrantyExpiry: '2030-09-05', location: 'Bangalore Office' },
  { key: '6', name: 'Dell Latitude 5540', assetTag: 'AST-2026-006', category: 'Laptop', brand: 'Dell', model: 'Latitude 5540', serialNo: 'DL-5540-006', assignedTo: null, condition: 'Good', status: 'Available', purchaseDate: '2025-07-15', purchasePrice: 98500, warrantyExpiry: '2028-07-15', location: 'Bangalore Office' },
  { key: '7', name: 'Adobe Creative Cloud License', assetTag: 'AST-2026-007', category: 'Software', brand: 'Adobe', model: 'Creative Cloud All Apps', serialNo: 'ADO-CC-2026-007', assignedTo: 'Vikram Joshi', condition: 'Excellent', status: 'Assigned', purchaseDate: '2026-01-01', purchasePrice: 54000, warrantyExpiry: '2026-12-31', location: 'Cloud' },
  { key: '8', name: 'HP LaserJet Pro MFP', assetTag: 'AST-2026-008', category: 'Peripheral', brand: 'HP', model: 'M428fdw', serialNo: 'HP-M428-008', assignedTo: null, condition: 'Fair', status: 'In Repair', purchaseDate: '2024-03-20', purchasePrice: 35000, warrantyExpiry: '2025-03-20', location: 'Bangalore Office' },
  { key: '9', name: 'Ergonomic Office Chair', assetTag: 'AST-2026-009', category: 'Furniture', brand: 'Herman Miller', model: 'Aeron Remastered', serialNo: 'HM-AERON-009', assignedTo: 'Ananya Reddy', condition: 'Excellent', status: 'Assigned', purchaseDate: '2025-06-12', purchasePrice: 125000, warrantyExpiry: '2037-06-12', location: 'Bangalore Office' },
  { key: '10', name: 'Samsung Galaxy Tab S9', assetTag: 'AST-2026-010', category: 'Mobile', brand: 'Samsung', model: 'Galaxy Tab S9 FE', serialNo: 'SM-S9FE-010', assignedTo: null, condition: 'Good', status: 'Available', purchaseDate: '2025-11-01', purchasePrice: 44999, warrantyExpiry: '2026-11-01', location: 'Mumbai Office' },
  { key: '11', name: 'Logitech MX Keys + MX Master 3S', assetTag: 'AST-2026-011', category: 'Peripheral', brand: 'Logitech', model: 'MX Combo', serialNo: 'LGT-MX-011', assignedTo: 'Amit Patel', condition: 'Good', status: 'Assigned', purchaseDate: '2025-08-10', purchasePrice: 18500, warrantyExpiry: '2027-08-10', location: 'Bangalore Office' },
  { key: '12', name: 'Microsoft 365 Business License', assetTag: 'AST-2026-012', category: 'Software', brand: 'Microsoft', model: 'M365 Business Premium', serialNo: 'MS-365-012', assignedTo: null, condition: 'Excellent', status: 'Available', purchaseDate: '2026-01-01', purchasePrice: 16200, warrantyExpiry: '2026-12-31', location: 'Cloud' },
  { key: '13', name: 'Canon EOS R50', assetTag: 'AST-2026-013', category: 'Peripheral', brand: 'Canon', model: 'EOS R50', serialNo: 'CN-R50-013', assignedTo: null, condition: 'Poor', status: 'Retired', purchaseDate: '2022-06-15', purchasePrice: 65000, warrantyExpiry: '2024-06-15', location: 'Storage' },
];

// ---------- helpers ----------
const categoryIcons: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="h-4 w-4" />,
  Monitor: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Furniture: <Armchair className="h-4 w-4" />,
  Software: <Key className="h-4 w-4" />,
  Peripheral: <HardDrive className="h-4 w-4" />,
};

const CATEGORIES = ['Laptop', 'Monitor', 'Mobile', 'Furniture', 'Software', 'Peripheral'];
const STATUSES = ['Assigned', 'Available', 'In Repair', 'Retired'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const LOCATIONS = ['Bangalore Office', 'Mumbai Office', 'Delhi Office', 'Cloud', 'Storage'];
const EMPLOYEES = [
  { value: 'Rahul Sharma', label: 'Rahul Sharma' },
  { value: 'Priya Singh', label: 'Priya Singh' },
  { value: 'Amit Patel', label: 'Amit Patel' },
  { value: 'Sneha Gupta', label: 'Sneha Gupta' },
  { value: 'Vikram Joshi', label: 'Vikram Joshi' },
  { value: 'Ananya Reddy', label: 'Ananya Reddy' },
];

// ---------- component ----------
const AssetList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  // API integration
  const { data: assetData, isLoading } = useAssetList();
  const createMutation = useCreateAsset();
  const assignMutation = useAssignAsset();
  const returnMutation = useReturnAsset();
  const allAssets: Asset[] = assetData?.data ?? assets;

  // form state
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', model: '', serialNo: '',
    purchaseDate: undefined as Date | undefined,
    purchasePrice: '',
    warrantyExpiry: undefined as Date | undefined,
    condition: '', location: '', notes: '',
  });
  const [assignData, setAssignData] = useState({ employee: '', notes: '' });

  // computed
  const totalAssets = allAssets.length;
  const assignedCount = allAssets.filter(a => a.status === 'Assigned').length;
  const availableCount = allAssets.filter(a => a.status === 'Available').length;
  const repairCount = allAssets.filter(a => a.status === 'In Repair').length;

  const filteredAssets = useMemo(() => {
    return allAssets.filter(a => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.assetTag.toLowerCase().includes(q) &&
          !(a.assignedTo && a.assignedTo.toLowerCase().includes(q))
        ) return false;
      }
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (conditionFilter !== 'all' && a.condition !== conditionFilter) return false;
      return true;
    });
  }, [allAssets, searchText, categoryFilter, statusFilter, conditionFilter]);

  const stats = [
    { title: 'Total Assets', value: totalAssets, icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
    { title: 'Assigned', value: assignedCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950' },
    { title: 'Available', value: availableCount, icon: <Archive className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
    { title: 'In Repair', value: repairCount, icon: <Wrench className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  ];

  // columns
  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Asset',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-blue-600 dark:bg-slate-800">
              {categoryIcons[asset.category] || <Package className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{asset.name}</p>
              <p className="text-xs text-muted-foreground truncate">{asset.brand} {asset.model}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'assetTag',
      header: 'Asset Tag',
      cell: ({ getValue }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{getValue<string>()}</code>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
    },
    {
      accessorKey: 'serialNo',
      header: 'Serial No',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ getValue }) => {
        const emp = getValue<string | null>();
        if (!emp) return <Badge variant="outline" className="text-muted-foreground">Unassigned</Badge>;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-blue-600 text-white">{getInitials(emp)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{emp}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ getValue }) => {
        const condition = getValue<string>();
        const map: Record<string, string> = {
          Excellent: 'active',
          Good: 'assigned',
          Fair: 'pending',
          Poor: 'rejected',
        };
        return <StatusBadge status={map[condition] || condition} />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const map: Record<string, string> = {
          Assigned: 'assigned',
          Available: 'active',
          'In Repair': 'in progress',
          Retired: 'closed',
        };
        return <StatusBadge status={map[status] || status} />;
      },
    },
    {
      accessorKey: 'purchaseDate',
      header: 'Purchase Date',
      cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue<string>())}</span>,
    },
    {
      accessorKey: 'warrantyExpiry',
      header: 'Warranty',
      cell: ({ getValue }) => {
        const date = getValue<string>();
        const expired = new Date(date) < new Date('2026-04-08');
        return (
          <span className={expired ? 'text-sm text-red-600 font-medium' : 'text-sm text-muted-foreground'}>
            {formatDate(date)}{expired ? ' (Expired)' : ''}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {asset.status === 'Available' && (
                <DropdownMenuItem onClick={() => { setSelectedAssetKey(asset.key); setIsAssignDialogOpen(true); }}>
                  <UserPlus className="mr-2 h-4 w-4" /> Assign
                </DropdownMenuItem>
              )}
              {asset.status === 'Assigned' && (
                <DropdownMenuItem onClick={() => {
                  returnMutation.mutate({ id: asset.key }, {
                    onSuccess: () => toast.success('Asset returned successfully'),
                    onError: (err: any) => toast.error(err?.message || 'Failed to return asset'),
                  });
                }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Return
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleAddAsset = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Asset added successfully');
        setIsDrawerOpen(false);
        setFormData({
          name: '', category: '', brand: '', model: '', serialNo: '',
          purchaseDate: undefined, purchasePrice: '', warrantyExpiry: undefined,
          condition: '', location: '', notes: '',
        });
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to add asset'),
    });
  };

  const handleAssign = () => {
    assignMutation.mutate({ id: selectedAssetKey || '', data: assignData }, {
      onSuccess: () => {
        toast.success('Asset assigned successfully');
        setIsAssignDialogOpen(false);
        setAssignData({ employee: '', notes: '' });
        setSelectedAssetKey(null);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to assign asset'),
    });
  };

  // filter content for DataTable
  const filterContent = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={conditionFilter} onValueChange={setConditionFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Conditions</SelectItem>
          {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Management"
        description="Track and manage company assets and equipment"
        actions={
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        }
      />

      <StatsGrid stats={stats} />

      <DataTable
        columns={columns}
        data={filteredAssets}
        searchPlaceholder="Search assets..."
        onSearchChange={setSearchText}
        filterContent={filterContent}
        pagination={{
          page: 1,
          limit: 10,
          total: filteredAssets.length,
          totalPages: Math.ceil(filteredAssets.length / 10),
        }}
        onPaginationChange={() => {}}
      />

      {/* Add Asset Drawer */}
      <FormSheet
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setFormData({
            name: '', category: '', brand: '', model: '', serialNo: '',
            purchaseDate: undefined, purchasePrice: '', warrantyExpiry: undefined,
            condition: '', location: '', notes: '',
          });
        }}
        title="Add New Asset"
        description="Enter the details for the new asset"
        className="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asset Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., MacBook Pro 16 inch"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Asset Tag</Label>
              <Input placeholder="AST-2026-014" disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Brand <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Apple"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Model <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., MacBook Pro M3 Max"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Serial Number <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter serial number"
                value={formData.serialNo}
                onChange={e => setFormData({ ...formData, serialNo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Date <span className="text-red-500">*</span></Label>
              <DatePicker
                value={formData.purchaseDate}
                onChange={d => setFormData({ ...formData, purchaseDate: d })}
                placeholder="Select purchase date"
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Price (INR) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                value={formData.purchasePrice}
                onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Warranty Expiry</Label>
              <DatePicker
                value={formData.warrantyExpiry}
                onChange={d => setFormData({ ...formData, warrantyExpiry: d })}
                placeholder="Select expiry date"
              />
            </div>
            <div className="space-y-2">
              <Label>Condition <span className="text-red-500">*</span></Label>
              <Select value={formData.condition} onValueChange={v => setFormData({ ...formData, condition: v })}>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={formData.location} onValueChange={v => setFormData({ ...formData, location: v })}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              placeholder="Additional notes or specifications"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAsset}>Add Asset</Button>
          </div>
        </div>
      </FormSheet>

      {/* Assign Asset Dialog */}
      <FormDialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) setAssignData({ employee: '', notes: '' });
        }}
        title="Assign Asset"
        description="Select an employee to assign this asset to"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assign To <span className="text-red-500">*</span></Label>
            <SearchableSelect
              options={EMPLOYEES}
              value={assignData.employee}
              onChange={v => setAssignData({ ...assignData, employee: v })}
              placeholder="Select employee"
              searchPlaceholder="Search employees..."
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              placeholder="Assignment notes (optional)"
              value={assignData.notes}
              onChange={e => setAssignData({ ...assignData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default AssetList;
