import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useHolidayList, useCreateHoliday, useDeleteHoliday } from '@/hooks/queries/useHolidays';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Globe,
  Star,
  PartyPopper,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatsGrid from '@/components/shared/StatsGrid';
import DataTable from '@/components/shared/DataTable/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FormDialog from '@/components/shared/FormDialog';
import DatePicker from '@/components/shared/DatePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HolidayType } from '@/types/enums';

interface Holiday {
  key: string;
  name: string;
  date: string;
  day: string;
  type: 'Public' | 'Religious' | 'CompanySpecific' | 'Optional';
  description: string;
  isOptional: boolean;
}

const holidays2026: Holiday[] = [
  { key: '1', name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'Public', description: 'National holiday celebrating the Constitution', isOptional: false },
  { key: '2', name: 'Maha Shivaratri', date: '2026-02-15', day: 'Sunday', type: 'Religious', description: 'Hindu festival dedicated to Lord Shiva', isOptional: true },
  { key: '3', name: 'Holi', date: '2026-03-17', day: 'Tuesday', type: 'Religious', description: 'Festival of colours', isOptional: false },
  { key: '4', name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'Religious', description: 'Christian observance of crucifixion of Jesus', isOptional: false },
  { key: '5', name: 'Eid ul-Fitr', date: '2026-04-21', day: 'Tuesday', type: 'Religious', description: 'End of Ramadan', isOptional: false },
  { key: '6', name: 'May Day', date: '2026-05-01', day: 'Friday', type: 'Public', description: 'International Workers Day', isOptional: false },
  { key: '7', name: 'Company Foundation Day', date: '2026-06-15', day: 'Monday', type: 'CompanySpecific', description: 'Annual celebration of company founding', isOptional: false },
  { key: '8', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'Public', description: 'National independence day', isOptional: false },
  { key: '9', name: 'Janmashtami', date: '2026-08-25', day: 'Tuesday', type: 'Religious', description: 'Birth of Lord Krishna', isOptional: true },
  { key: '10', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'Public', description: 'Birthday of Mahatma Gandhi', isOptional: false },
  { key: '11', name: 'Dussehra', date: '2026-10-19', day: 'Monday', type: 'Religious', description: 'Victory of good over evil', isOptional: false },
  { key: '12', name: 'Diwali', date: '2026-11-08', day: 'Sunday', type: 'Religious', description: 'Festival of lights', isOptional: false },
  { key: '13', name: 'Guru Nanak Jayanti', date: '2026-11-18', day: 'Wednesday', type: 'Religious', description: 'Birth anniversary of Guru Nanak Dev Ji', isOptional: true },
  { key: '14', name: 'Christmas', date: '2026-12-25', day: 'Friday', type: 'Public', description: 'Christian celebration of birth of Jesus', isOptional: false },
  { key: '15', name: 'Year End Holiday', date: '2026-12-31', day: 'Thursday', type: 'CompanySpecific', description: 'Company holiday for year-end celebrations', isOptional: false },
];

const typeBadgeMap: Record<string, string> = {
  Public: 'bg-blue-100 text-blue-700 border-blue-200',
  Religious: 'bg-purple-100 text-purple-700 border-purple-200',
  CompanySpecific: 'bg-green-100 text-green-700 border-green-200',
  Optional: 'bg-orange-100 text-orange-700 border-orange-200',
};

const typeDotColors: Record<string, string> = {
  Public: 'bg-blue-500',
  Religious: 'bg-purple-500',
  CompanySpecific: 'bg-green-500',
  Optional: 'bg-orange-500',
};

const typeTextColors: Record<string, string> = {
  Public: 'text-blue-600 font-bold',
  Religious: 'text-purple-600 font-bold',
  CompanySpecific: 'text-green-600 font-bold',
  Optional: 'text-orange-600 font-bold',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const HolidayCalendar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // API integration
  const { data: holidayData, isLoading } = useHolidayList({ year: selectedYear });
  const createMutation = useCreateHoliday();
  const deleteMutation = useDeleteHoliday();
  const allHolidays: Holiday[] = holidayData?.data ?? holidays2026;

  const [form, setForm] = useState({
    name: '',
    date: undefined as Date | undefined,
    type: '',
    description: '',
    isOptional: false,
    applicableFor: 'All',
  });

  const filteredHolidays = allHolidays;
  const publicCount = filteredHolidays.filter((h) => h.type === 'Public').length;
  const optionalCount = filteredHolidays.filter((h) => h.isOptional).length;
  const now = new Date('2026-04-08');
  const upcomingCount = filteredHolidays.filter((h) => new Date(h.date) >= now).length;

  const stats = [
    { title: 'Total Holidays', value: filteredHolidays.length, icon: <CalendarIcon className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Public Holidays', value: publicCount, icon: <Globe className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Optional Holidays', value: optionalCount, icon: <Star className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Upcoming', value: upcomingCount, icon: <PartyPopper className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-100' },
  ];

  const columns: ColumnDef<Holiday>[] = [
    {
      accessorKey: 'name',
      header: 'Holiday',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'day',
      header: 'Day',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.day}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className={typeBadgeMap[row.original.type] || ''}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'isOptional',
      header: 'Optional',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isOptional ? 'pending' : 'active'} />
      ),
    },
  ];

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const getHolidaysForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredHolidays.filter((h) => h.date === dateStr);
  };

  const handleAddHoliday = () => {
    if (!form.name || !form.date || !form.type) return;
    createMutation.mutate(form, {
      onSuccess: () => {
        toast.success('Holiday added successfully');
        setIsModalOpen(false);
        setForm({ name: '', date: undefined, type: '', description: '', isOptional: false, applicableFor: 'All' });
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to add holiday'),
    });
  };

  const renderCalendarView = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {monthNames.map((monthName, monthIndex) => {
        const daysInMonth = getDaysInMonth(selectedYear, monthIndex);
        const firstDay = getFirstDayOfMonth(selectedYear, monthIndex);
        const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        return (
          <Card key={monthIndex}>
            <CardContent className="p-4">
              <p className="mb-2 text-center text-sm font-semibold">
                {monthName} {selectedYear}
              </p>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {dayLabels.map((d) => (
                  <div
                    key={d}
                    className="py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayHolidays = getHolidaysForDate(selectedYear, monthIndex, day);
                  const isToday = selectedYear === 2026 && monthIndex === 3 && day === 8;
                  const hasHoliday = dayHolidays.length > 0;

                  const cell = (
                    <div
                      className={cn(
                        'relative rounded-md py-1 text-xs transition-colors',
                        isToday && 'bg-primary text-primary-foreground font-bold',
                        !isToday && hasHoliday && typeTextColors[dayHolidays[0].type],
                        !isToday && !hasHoliday && 'text-foreground',
                        hasHoliday && 'cursor-pointer',
                      )}
                    >
                      {day}
                      {hasHoliday && (
                        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {dayHolidays.map((h, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'h-1 w-1 rounded-full',
                                typeDotColors[h.type],
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );

                  if (hasHoliday) {
                    return (
                      <TooltipProvider key={day}>
                        <Tooltip>
                          <TooltipTrigger asChild>{cell}</TooltipTrigger>
                          <TooltipContent>
                            {dayHolidays.map((h) => h.name).join(', ')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return <React.Fragment key={day}>{cell}</React.Fragment>;
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Calendar"
        description="Manage public, religious and company holidays"
        actions={
          <>
            <Select value={String(selectedYear)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          </>
        }
      />

      <StatsGrid stats={stats} />

      {/* View toggle + type legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(typeBadgeMap).map(([type, className]) => (
            <Badge key={type} variant="outline" className={className}>
              {type}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredHolidays}
          searchKey="name"
          searchPlaceholder="Search holidays..."
          onSearchChange={() => {}}
          pagination={{
            page: 1,
            limit: 15,
            total: filteredHolidays.length,
            totalPages: 1,
          }}
          onPaginationChange={() => {}}
        />
      ) : (
        renderCalendarView()
      )}

      {/* Add Holiday Dialog */}
      <FormDialog
        open={isModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsModalOpen(false);
            setForm({ name: '', date: undefined, type: '', description: '', isOptional: false, applicableFor: 'All' });
          }
        }}
        title="Add Holiday"
        description="Create a new holiday entry for the calendar."
        className="sm:max-w-[560px]"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Holiday Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter holiday name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={form.date}
                onChange={(date) => setForm({ ...form, date })}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm({ ...form, type: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Religious">Religious</SelectItem>
                  <SelectItem value="CompanySpecific">Company Specific</SelectItem>
                  <SelectItem value="Optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={2}
              placeholder="Brief description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isOptional"
              checked={form.isOptional}
              onCheckedChange={(checked) =>
                setForm({ ...form, isOptional: checked === true })
              }
            />
            <Label htmlFor="isOptional" className="cursor-pointer">
              This is an optional holiday
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Applicable For</Label>
            <Select
              value={form.applicableFor}
              onValueChange={(val) => setForm({ ...form, applicableFor: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                <SelectItem value="SpecificDepartments">Specific Departments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setForm({ name: '', date: undefined, type: '', description: '', isOptional: false, applicableFor: 'All' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddHoliday}>Add Holiday</Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default HolidayCalendar;
