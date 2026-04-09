import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAnnouncementList, useCreateAnnouncement, useMarkAnnouncementRead } from '@/hooks/queries/useAnnouncements';
import {
  Plus,
  Search,
  Pin,
  Eye,
  Clock,
  Paperclip,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import FormSheet from '@/components/shared/FormSheet';
import DatePicker from '@/components/shared/DatePicker';
import FileUploadZone from '@/components/shared/FileUploadZone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AnnouncementCategory, AnnouncementPriority } from '@/types/enums';

interface Announcement {
  key: string;
  title: string;
  content: string;
  category: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  postedBy: string;
  date: string;
  readCount: number;
  isPinned: boolean;
  attachments: number;
}

const announcements: Announcement[] = [
  {
    key: '1',
    title: 'Diwali Celebration 2026 - Save the Date!',
    content: 'Dear Team,\n\nWe are excited to announce our annual Diwali celebration on November 7th, 2026 at the office premises. This year\'s theme is "Festival of Joy".\n\nHighlights include:\n- Traditional rangoli competition\n- Diya decoration workshop\n- Cultural performances by employees\n- Festive lunch with authentic Indian cuisine\n- Lucky draw with exciting prizes\n\nPlease confirm your attendance by October 25th. Family members are welcome!\n\nRegards,\nHR Team',
    category: 'Event',
    priority: 'Normal',
    postedBy: 'Sneha Gupta',
    date: '2026-04-05',
    readCount: 189,
    isPinned: true,
    attachments: 1,
  },
  {
    key: '2',
    title: 'Updated Work From Home Policy - Effective May 1st',
    content: 'Dear Employees,\n\nWe are pleased to share the revised Work From Home (WFH) policy effective from May 1st, 2026.\n\nKey changes:\n- Employees can now WFH up to 3 days per week (increased from 2)\n- Flexible WFH days - no fixed schedule required\n- Mandatory in-office days: Tuesday and Thursday for team sync\n- Internet allowance increased to Rs 1,500/month\n- Ergonomic furniture reimbursement up to Rs 15,000 (one-time)\n\nPlease read the full policy document attached and reach out to HR for any queries.\n\nBest,\nHR Department',
    category: 'Policy',
    priority: 'High',
    postedBy: 'Priya Singh',
    date: '2026-04-03',
    readCount: 234,
    isPinned: true,
    attachments: 2,
  },
  {
    key: '3',
    title: 'Q4 FY2025-26 Results - Record Revenue!',
    content: 'Dear Team,\n\nWe are thrilled to share that we have achieved record revenue in Q4 FY2025-26!\n\nKey highlights:\n- Revenue: Rs 48.5 Cr (32% YoY growth)\n- New clients onboarded: 28\n- Employee satisfaction score: 4.6/5\n- Zero attrition in engineering team\n\nThis achievement was possible because of your hard work and dedication. Special thanks to the Sales and Delivery teams for their exceptional performance.\n\nCelebration party details will be shared soon!\n\nWarm regards,\nManagement',
    category: 'Achievement',
    priority: 'Normal',
    postedBy: 'Ananya Reddy',
    date: '2026-04-01',
    readCount: 210,
    isPinned: false,
    attachments: 0,
  },
  {
    key: '4',
    title: 'Scheduled System Maintenance - April 12th',
    content: 'Dear All,\n\nPlease be informed that there will be a scheduled maintenance window for our internal systems.\n\nDate: April 12th, 2026 (Sunday)\nTime: 10:00 PM to 6:00 AM IST\nAffected systems: HRMS, Email, VPN, Internal Wiki\n\nPlease plan your work accordingly. Save all work before the maintenance window.\n\nFor urgent issues during downtime, contact IT support at +91 98765 43210.\n\nRegards,\nIT Team',
    category: 'Maintenance',
    priority: 'Critical',
    postedBy: 'Vikram Joshi',
    date: '2026-04-06',
    readCount: 156,
    isPinned: false,
    attachments: 0,
  },
  {
    key: '5',
    title: 'New Health Insurance Benefits - Enhanced Coverage',
    content: 'Dear Employees,\n\nWe are happy to announce enhanced health insurance benefits starting this quarter.\n\nNew benefits include:\n- Sum insured increased to Rs 10 Lakhs (from Rs 5 Lakhs)\n- Maternity cover included for all female employees\n- OPD cover up to Rs 15,000/year\n- Mental health counselling - 12 free sessions per year\n- Dental coverage included\n- Coverage for parents at subsidised rates\n\nEnrollment for parent coverage is open until April 30th. Visit the Benefits portal to update your details.\n\nRegards,\nHR Team',
    category: 'General',
    priority: 'High',
    postedBy: 'Sneha Gupta',
    date: '2026-03-28',
    readCount: 198,
    isPinned: false,
    attachments: 1,
  },
  {
    key: '6',
    title: 'Annual Team Outing - Goa Trip Announcement',
    content: 'Dear Team,\n\nGet ready for our annual team outing!\n\nDestination: Goa\nDates: May 15-17, 2026 (Fri-Sun)\nAccommodation: Taj Vivanta, Panaji\n\nItinerary highlights:\n- Beach activities and water sports\n- Team building exercises\n- Gala dinner on Saturday night\n- Optional heritage tour of Old Goa\n\nAll expenses covered by the company. Please fill out the registration form by April 20th.\n\nLet\'s make it memorable!\n\nCheers,\nFun Committee',
    category: 'Event',
    priority: 'Normal',
    postedBy: 'Amit Patel',
    date: '2026-03-25',
    readCount: 245,
    isPinned: false,
    attachments: 1,
  },
  {
    key: '7',
    title: 'Referral Bonus Increased to Rs 75,000',
    content: 'Dear All,\n\nGreat news! Our employee referral bonus has been increased.\n\nNew referral bonus structure:\n- Senior Engineer / Lead: Rs 75,000\n- Engineer / Analyst: Rs 50,000\n- Intern: Rs 15,000\n\nBonus is paid in two instalments: 50% on joining, 50% after 6 months.\n\nWe are currently hiring for 15+ positions across Engineering, Product, and Sales. Check the Careers page for open roles.\n\nRefer and earn!\n\nBest,\nTalent Acquisition Team',
    category: 'General',
    priority: 'Normal',
    postedBy: 'Priya Singh',
    date: '2026-03-20',
    readCount: 178,
    isPinned: false,
    attachments: 0,
  },
];

const priorityColorMap: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Normal: 'bg-blue-100 text-blue-700 border-blue-200',
  Low: 'bg-gray-100 text-gray-700 border-gray-200',
};

const categoryColorMap: Record<string, string> = {
  General: 'bg-blue-100 text-blue-700 border-blue-200',
  Policy: 'bg-purple-100 text-purple-700 border-purple-200',
  Event: 'bg-green-100 text-green-700 border-green-200',
  Achievement: 'bg-amber-100 text-amber-700 border-amber-200',
  Urgent: 'bg-red-100 text-red-700 border-red-200',
  Maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
};

const AnnouncementList: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // API integration
  const { data: announcementData, isLoading } = useAnnouncementList();
  const createMutation = useCreateAnnouncement();
  const markReadMutation = useMarkAnnouncementRead();
  const allAnnouncements: Announcement[] = announcementData?.data ?? announcements;

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    priority: '',
    targetAudience: 'all',
    publishDate: undefined as Date | undefined,
    expiryDate: undefined as Date | undefined,
    isPinned: false,
  });

  const filteredAnnouncements = allAnnouncements
    .filter((a) => {
      if (
        searchText &&
        !a.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !a.content.toLowerCase().includes(searchText.toLowerCase())
      )
        return false;
      if (categoryFilter && a.category !== categoryFilter) return false;
      if (priorityFilter && a.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handlePublish = () => {
    if (!form.title || !form.content || !form.category || !form.priority) return;
    createMutation.mutate(form, {
      onSuccess: () => {
        toast.success('Announcement published successfully');
        setIsSheetOpen(false);
        setForm({
          title: '',
          content: '',
          category: '',
          priority: '',
          targetAudience: 'all',
          publishDate: undefined,
          expiryDate: undefined,
          isPinned: false,
        });
      },
      onError: (err: any) => toast.error(err?.message || 'Failed to publish announcement'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Company news, updates and announcements"
        actions={
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Policy">Policy</SelectItem>
            <SelectItem value="Event">Event</SelectItem>
            <SelectItem value="Achievement">Achievement</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcement Cards */}
      <div className="flex flex-col gap-4">
        {filteredAnnouncements.map((announcement) => {
          const isExpanded = expandedKey === announcement.key;
          return (
            <Card
              key={announcement.key}
              className={cn(
                'cursor-pointer transition-shadow hover:shadow-md',
                announcement.isPinned && 'border-l-4 border-l-primary',
              )}
              onClick={() =>
                setExpandedKey(isExpanded ? null : announcement.key)
              }
            >
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {announcement.isPinned && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Pin className="mr-1 h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      categoryColorMap[announcement.category] || ''
                    }
                  >
                    {announcement.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      priorityColorMap[announcement.priority] || ''
                    }
                  >
                    {announcement.priority}
                  </Badge>
                </div>

                <h3 className="mb-2 text-lg font-semibold">
                  {announcement.title}
                </h3>

                {isExpanded ? (
                  <p className="mb-3 whitespace-pre-line text-sm">
                    {announcement.content}
                  </p>
                ) : (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-blue-600 text-white text-[10px]">
                        {announcement.postedBy[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{announcement.postedBy}</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{announcement.date}</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{announcement.readCount} views</span>
                  </div>
                  {announcement.attachments > 0 && (
                    <>
                      <span className="text-border">|</span>
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" />
                        <span>
                          {announcement.attachments} attachment
                          {announcement.attachments > 1 ? 's' : ''}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No announcements found.
          </div>
        )}
      </div>

      {/* Create Announcement Sheet */}
      <FormSheet
        open={isSheetOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsSheetOpen(false);
        }}
        title="New Announcement"
        description="Compose and publish a company-wide announcement."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter announcement title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={8}
              placeholder="Write your announcement here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Achievement">Achievement</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.priority}
                onValueChange={(val) => setForm({ ...form, priority: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select
              value={form.targetAudience}
              onValueChange={(val) =>
                setForm({ ...form, targetAudience: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="department">Specific Departments</SelectItem>
                <SelectItem value="specific">Specific Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Publish Date</Label>
              <DatePicker
                value={form.publishDate}
                onChange={(date) => setForm({ ...form, publishDate: date })}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <DatePicker
                value={form.expiryDate}
                onChange={(date) => setForm({ ...form, expiryDate: date })}
                placeholder="Select date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <FileUploadZone
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              maxSize={10 * 1024 * 1024}
              onFilesSelected={() => {}}
              label="Click or drag files to attach"
              description="Max 5 files, 10 MB each"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="pin-announcement"
              checked={form.isPinned}
              onCheckedChange={(checked) =>
                setForm({ ...form, isPinned: checked })
              }
            />
            <Label htmlFor="pin-announcement" className="cursor-pointer">
              Pin Announcement
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>Publish</Button>
          </div>
        </div>
      </FormSheet>
    </div>
  );
};

export default AnnouncementList;
