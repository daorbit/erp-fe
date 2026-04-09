import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { useDocumentList, useUploadDocument, useDeleteDocument } from '@/hooks/queries/useDocuments';
import {
  Plus, Download, Eye, Trash2, MoreHorizontal, FileText, File,
  FileSpreadsheet, FileImage, Grid3X3, List,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable/DataTable';
import FormDialog from '@/components/shared/FormDialog';
import FileUploadZone from '@/components/shared/FileUploadZone';
import DatePicker from '@/components/shared/DatePicker';
import SearchableSelect from '@/components/shared/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { formatDate, getInitials } from '@/lib/formatters';

// ---------- types ----------
interface DocumentItem {
  key: string;
  title: string;
  description: string;
  category: string;
  employee: string | null;
  uploadedBy: string;
  date: string;
  fileType: string;
  fileSize: string;
  expiryDate: string | null;
  isPublic: boolean;
  tags: string[];
}

// ---------- mock data ----------
const documents: DocumentItem[] = [
  { key: '1', title: 'Employee Handbook 2026', description: 'Company-wide employee handbook', category: 'Policy', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-01-10', fileType: 'PDF', fileSize: '2.4 MB', expiryDate: null, isPublic: true, tags: ['handbook', 'policy'] },
  { key: '2', title: 'Leave Policy', description: 'Updated leave and attendance policy', category: 'Policy', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-01-15', fileType: 'PDF', fileSize: '1.1 MB', expiryDate: null, isPublic: true, tags: ['leave', 'attendance'] },
  { key: '3', title: 'NDA Template', description: 'Non-disclosure agreement template', category: 'Template', employee: null, uploadedBy: 'Ananya Reddy', date: '2026-02-01', fileType: 'DOCX', fileSize: '245 KB', expiryDate: null, isPublic: true, tags: ['nda', 'legal'] },
  { key: '4', title: 'Offer Letter - Rahul Sharma', description: 'Offer letter for Software Engineer position', category: 'Letter', employee: 'Rahul Sharma', uploadedBy: 'Priya Singh', date: '2025-12-20', fileType: 'PDF', fileSize: '380 KB', expiryDate: null, isPublic: false, tags: ['offer', 'hiring'] },
  { key: '5', title: 'Aadhaar Card - Amit Patel', description: 'Identity proof document', category: 'Certificate', employee: 'Amit Patel', uploadedBy: 'Amit Patel', date: '2026-03-05', fileType: 'PDF', fileSize: '1.8 MB', expiryDate: '2030-06-15', isPublic: false, tags: ['id-proof', 'aadhaar'] },
  { key: '6', title: 'PAN Card - Vikram Joshi', description: 'Tax identification document', category: 'Certificate', employee: 'Vikram Joshi', uploadedBy: 'Vikram Joshi', date: '2026-03-10', fileType: 'JPG', fileSize: '520 KB', expiryDate: null, isPublic: false, tags: ['id-proof', 'pan'] },
  { key: '7', title: 'Travel Reimbursement Form', description: 'Standard travel expense claim template', category: 'Template', employee: null, uploadedBy: 'Sneha Gupta', date: '2026-02-18', fileType: 'XLSX', fileSize: '78 KB', expiryDate: null, isPublic: true, tags: ['expense', 'travel'] },
  { key: '8', title: 'Remote Work Policy', description: 'Work from home guidelines and eligibility', category: 'Policy', employee: null, uploadedBy: 'Priya Singh', date: '2026-03-20', fileType: 'PDF', fileSize: '890 KB', expiryDate: null, isPublic: true, tags: ['wfh', 'remote'] },
  { key: '9', title: 'Experience Certificate - Sneha Gupta', description: 'Employment experience certificate', category: 'Certificate', employee: 'Sneha Gupta', uploadedBy: 'Ananya Reddy', date: '2026-01-30', fileType: 'PDF', fileSize: '210 KB', expiryDate: null, isPublic: false, tags: ['certificate', 'experience'] },
  { key: '10', title: 'IT Security Guidelines', description: 'Information security policy for all employees', category: 'Policy', employee: null, uploadedBy: 'Vikram Joshi', date: '2026-02-25', fileType: 'PDF', fileSize: '1.5 MB', expiryDate: null, isPublic: true, tags: ['security', 'it'] },
];

// ---------- helpers ----------
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'PDF': return <FileText className="h-4 w-4 text-red-600" />;
    case 'DOCX': return <File className="h-4 w-4 text-blue-600" />;
    case 'XLSX': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case 'JPG':
    case 'PNG': return <FileImage className="h-4 w-4 text-amber-600" />;
    default: return <File className="h-4 w-4 text-gray-500" />;
  }
};

const getLargeFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'PDF': return <FileText className="h-7 w-7 text-red-600" />;
    case 'DOCX': return <File className="h-7 w-7 text-blue-600" />;
    case 'XLSX': return <FileSpreadsheet className="h-7 w-7 text-green-600" />;
    case 'JPG':
    case 'PNG': return <FileImage className="h-7 w-7 text-amber-600" />;
    default: return <File className="h-7 w-7 text-gray-500" />;
  }
};

const categoryColorMap: Record<string, string> = {
  Policy: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
  Template: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400',
  Letter: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400',
  Certificate: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  Form: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400',
};

const CATEGORIES_LIST = ['Policy', 'Template', 'Letter', 'Certificate', 'Form'];
const EMPLOYEES = [
  { value: 'Rahul Sharma', label: 'Rahul Sharma' },
  { value: 'Priya Singh', label: 'Priya Singh' },
  { value: 'Amit Patel', label: 'Amit Patel' },
  { value: 'Sneha Gupta', label: 'Sneha Gupta' },
  { value: 'Vikram Joshi', label: 'Vikram Joshi' },
  { value: 'Ananya Reddy', label: 'Ananya Reddy' },
];

// ---------- component ----------
const DocumentList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // API integration
  const { data: documentData, isLoading } = useDocumentList();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const allDocuments: DocumentItem[] = documentData?.data ?? documents;

  // upload form state
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', employee: '',
    expiryDate: undefined as Date | undefined,
    isPublic: false, tags: '',
  });
  const [, setSelectedFiles] = useState<File[]>([]);

  const filteredDocs = useMemo(() => {
    let filtered = allDocuments;
    if (activeTab === 'policies') filtered = filtered.filter(d => d.category === 'Policy');
    if (activeTab === 'my') filtered = filtered.filter(d => d.employee !== null);
    if (categoryFilter !== 'all') filtered = filtered.filter(d => d.category === categoryFilter);
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.employee && d.employee.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [allDocuments, activeTab, categoryFilter, searchText]);

  // columns
  const columns: ColumnDef<DocumentItem>[] = [
    {
      accessorKey: 'title',
      header: 'Document',
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              {getFileIcon(doc.fileType)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{doc.title}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => {
        const cat = getValue<string>();
        return (
          <Badge variant="outline" className={categoryColorMap[cat] || ''}>
            {cat}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ getValue }) => {
        const emp = getValue<string | null>();
        if (!emp) return <span className="text-sm text-muted-foreground">--</span>;
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
      accessorKey: 'uploadedBy',
      header: 'Uploaded By',
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue<string>())}</span>,
    },
    {
      accessorKey: 'fileType',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {getFileIcon(row.original.fileType)}
          <span className="text-sm text-muted-foreground">{row.original.fileType}</span>
        </div>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry',
      cell: ({ getValue }) => {
        const date = getValue<string | null>();
        return date
          ? <span className="text-sm">{formatDate(date)}</span>
          : <span className="text-sm text-muted-foreground">--</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" /> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredDocs.map(doc => (
        <Card key={doc.key} className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {getLargeFileIcon(doc.fileType)}
              </div>
              <p className="font-medium text-sm truncate">{doc.title}</p>
              <Badge variant="outline" className={`mt-1 text-xs ${categoryColorMap[doc.category] || ''}`}>
                {doc.category}
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span>{doc.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded</span>
                <span>{formatDate(doc.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">By</span>
                <span>{doc.uploadedBy}</span>
              </div>
            </div>
            <div className="flex justify-center gap-1 mt-3 pt-3 border-t">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredDocs.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No documents found.
        </div>
      )}
    </div>
  );

  const handleUpload = () => {
    uploadMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Document uploaded successfully');
        setIsModalOpen(false);
        setFormData({ title: '', description: '', category: '', employee: '', expiryDate: undefined, isPublic: false, tags: '' });
        setSelectedFiles([]);
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to upload document'),
    });
  };

  // filter + view toggle content for DataTable
  const filterContent = (
    <div className="flex items-center gap-2">
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="flex items-center rounded-md border">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="icon"
          className="h-9 w-9 rounded-r-none"
          onClick={() => setViewMode('table')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="icon"
          className="h-9 w-9 rounded-l-none"
          onClick={() => setViewMode('grid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management"
        description="Manage company and employee documents securely"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="policies">Company Policies</TabsTrigger>
          <TabsTrigger value="my">My Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {viewMode === 'table' ? (
            <DataTable
              columns={columns}
              data={filteredDocs}
              searchPlaceholder="Search documents..."
              onSearchChange={setSearchText}
              filterContent={filterContent}
              pagination={{
                page: 1,
                limit: 10,
                total: filteredDocs.length,
                totalPages: Math.ceil(filteredDocs.length / 10),
              }}
              onPaginationChange={() => {}}
            />
          ) : (
            <div className="space-y-4">
              {/* search + filters for grid view */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Input
                    placeholder="Search documents..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {filterContent}
                </div>
              </div>
              {renderGridView()}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <FormDialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setFormData({ title: '', description: '', category: '', employee: '', expiryDate: undefined, isPublic: false, tags: '' });
            setSelectedFiles([]);
          }
        }}
        title="Upload Document"
        description="Add a new document to the system"
        className="sm:max-w-2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Enter document title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Brief description of the document"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee (optional)</Label>
              <SearchableSelect
                options={EMPLOYEES}
                value={formData.employee}
                onChange={v => setFormData({ ...formData, employee: v })}
                placeholder="Select employee"
                searchPlaceholder="Search employees..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload File <span className="text-red-500">*</span></Label>
            <FileUploadZone
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
              onFilesSelected={setSelectedFiles}
              label="Click or drag file to upload"
              description="PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10 MB)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <DatePicker
                value={formData.expiryDate}
                onChange={d => setFormData({ ...formData, expiryDate: d })}
                placeholder="Select expiry date"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                placeholder="Comma-separated tags"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked === true })}
            />
            <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
              Make this document publicly accessible to all employees
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default DocumentList;
