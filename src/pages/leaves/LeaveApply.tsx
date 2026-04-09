import React, { useState } from 'react';
import { Send, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/shared/PageHeader';
import DatePicker from '@/components/shared/DatePicker';
import FileUploadZone from '@/components/shared/FileUploadZone';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useApplyLeave, useLeaveBalance } from '@/hooks/queries/useLeaves';

const leaveBalances: Record<string, { allocated: number; used: number; remaining: number }> = {
  'Casual Leave': { allocated: 12, used: 3, remaining: 9 },
  'Sick Leave': { allocated: 8, used: 1, remaining: 7 },
  'Earned Leave': { allocated: 15, used: 5, remaining: 10 },
  'Comp Off': { allocated: 2, used: 0, remaining: 2 },
  'Loss of Pay': { allocated: 0, used: 0, remaining: 0 },
};

const LeaveApply: React.FC = () => {
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState('first');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');

  // API hooks
  const applyLeaveMutation = useApplyLeave();
  const { data: balanceData } = useLeaveBalance('me');
  const apiBalances = balanceData?.data;

  const balance = selectedLeaveType
    ? (apiBalances?.[selectedLeaveType] ?? leaveBalances[selectedLeaveType] ?? null)
    : null;

  const calculatedDays = (() => {
    if (!startDate || !endDate) return 0;
    if (isHalfDay) return 0.5;
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  })();

  const handleSubmit = () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }
    applyLeaveMutation.mutate(
      {
        leaveType: selectedLeaveType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason,
        isHalfDay,
        halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Leave application submitted successfully!');
          setSelectedLeaveType('');
          setStartDate(undefined);
          setEndDate(undefined);
          setReason('');
          setIsHalfDay(false);
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to submit leave application'),
      }
    );
  };

  const handleReset = () => {
    setSelectedLeaveType('');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setIsHalfDay(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave application"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Form */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                  <SelectItem value="Comp Off">Comp Off</SelectItem>
                  <SelectItem value="Loss of Pay">Loss of Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date *</Label>
                <DatePicker value={startDate} onChange={setStartDate} placeholder="Start date" />
              </div>
              <div className="space-y-2">
                <Label>To Date *</Label>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="End date" />
              </div>
            </div>

            {/* Half Day */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch checked={isHalfDay} onCheckedChange={setIsHalfDay} id="halfDay" />
                <Label htmlFor="halfDay">Half Day Leave</Label>
              </div>
              {isHalfDay && (
                <RadioGroup value={halfDayPeriod} onValueChange={setHalfDayPeriod} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="first" id="first" />
                    <Label htmlFor="first">First Half</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="second" id="second" />
                    <Label htmlFor="second">Second Half</Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* Calculated Days */}
            {calculatedDays > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-3">
                <Calendar size={18} className="text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Number of days: <span className="font-semibold">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</span>
                </p>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                rows={4}
                placeholder="Enter the reason for your leave..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{reason.length}/500</p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Attachment (Optional)</Label>
              <FileUploadZone
                accept=".pdf,.jpg,.png"
                maxSize={5 * 1024 * 1024}
                onFilesSelected={() => {}}
                label="Click or drag file to upload"
                description="Support PDF, JPG, PNG (Max 5MB)"
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="lg" onClick={handleReset}>Cancel</Button>
              <Button size="lg" onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" /> Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Leave Balance Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info size={16} /> Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {Object.entries(apiBalances ?? leaveBalances).map(([type, bal]) => (
                  <div key={type} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{type}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {bal.allocated} allocated, {bal.used} used
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-sm font-semibold px-3 ${
                        bal.remaining > 5 ? 'bg-green-100 text-green-700' :
                        bal.remaining > 0 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {bal.remaining}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Leave Info */}
          {selectedLeaveType && balance && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Leave Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leave Type</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">{selectedLeaveType}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium">{balance.allocated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium text-red-600">{balance.used}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Available Balance</span>
                  <span className="text-lg font-bold text-green-600">{balance.remaining}</span>
                </div>
                {calculatedDays > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Applying for</span>
                      <span className="font-medium">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance after</span>
                      <span className={`font-medium ${balance.remaining - calculatedDays >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance.remaining - calculatedDays}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApply;
