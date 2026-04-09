import React, { useState } from 'react';
import {
  Save,
  Bell,
  Lock,
  Palette,
  Check,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import { setThemeMode, setThemeColor } from '@/store/uiSlice';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

const colorPalettes: Record<ThemeColor, { label: string; primary: string; colors: string[] }> = {
  blue: { label: 'Blue', primary: '#3b82f6', colors: ['#3b82f6', '#2563eb', '#1d4ed8'] },
  green: { label: 'Green', primary: '#10b981', colors: ['#10b981', '#059669', '#047857'] },
  purple: { label: 'Purple', primary: '#8b5cf6', colors: ['#8b5cf6', '#7c3aed', '#6d28d9'] },
  orange: { label: 'Orange', primary: '#f97316', colors: ['#f97316', '#ea580c', '#c2410c'] },
  red: { label: 'Red', primary: '#ef4444', colors: ['#ef4444', '#dc2626', '#b91c1c'] },
  teal: { label: 'Teal', primary: '#14b8a6', colors: ['#14b8a6', '#0d9488', '#0f766e'] },
};

/* ---------- Notification items ---------- */
const notificationItems = [
  { id: 'onboarding', label: 'Email notifications for new onboarding', desc: 'Receive email when a new employee starts KYC', defaultOn: true },
  { id: 'kyc-complete', label: 'KYC completion alerts', desc: 'Get notified when KYC is fully completed', defaultOn: true },
  { id: 'weekly-report', label: 'Weekly summary report', desc: 'Receive weekly HR summary via email', defaultOn: false },
  { id: 'doc-expiry', label: 'Document expiry reminders', desc: 'Alert when employee documents are about to expire', defaultOn: true },
];

/* ---------- Mode cards ---------- */
const modeOptions: {
  value: ThemeMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  { value: 'light', label: 'Light', desc: 'Clean bright interface', icon: <Sun className="h-5 w-5" /> },
  { value: 'dark', label: 'Dark', desc: 'Easy on the eyes', icon: <Moon className="h-5 w-5" /> },
];

/* ---------- Component ---------- */

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.ui.themeMode);
  const colorTheme = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const palettes = colorPalettes;

  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((n) => [n.id, n.defaultOn])),
  );

  const handleModeChange = (m: ThemeMode) => {
    dispatch(setThemeMode(m));
  };

  const handleColorChange = (c: ThemeColor) => {
    dispatch(setThemeColor(c));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization settings and preferences"
      />

      <Tabs defaultValue="appearance" className="flex flex-col lg:flex-row gap-6">
        {/* Tab list - sidebar on desktop, top on mobile */}
        <TabsList className="flex lg:flex-col lg:h-auto lg:w-52 lg:justify-start lg:bg-muted/50 lg:p-2 shrink-0">
          <TabsTrigger value="appearance" className="lg:w-full lg:justify-start gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="company" className="lg:w-full lg:justify-start gap-2">
            <Building2 className="h-4 w-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="lg:w-full lg:justify-start gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="lg:w-full lg:justify-start gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {/* ----- Appearance Tab ----- */}
          <TabsContent value="appearance" className="mt-0 space-y-6">
            {/* Display Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Display Mode</CardTitle>
                <CardDescription>Choose between light and dark interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modeOptions.map((item) => {
                    const isSelected = mode === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => handleModeChange(item.value)}
                        className={cn(
                          'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm',
                          isSelected
                            ? 'border-primary shadow-sm'
                            : 'border-border hover:border-muted-foreground/40',
                        )}
                      >
                        {/* Mini preview */}
                        <div
                          className={cn(
                            'rounded-lg border p-3 mb-3',
                            item.value === 'dark'
                              ? 'bg-[#1a1d23] border-[#2d3140]'
                              : 'bg-[#f8fafc] border-[#e2e8f0]',
                          )}
                        >
                          <div className="flex gap-1.5 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                          <div className="flex gap-2">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-md',
                                item.value === 'dark' ? 'bg-[#22262e]' : 'bg-slate-200',
                              )}
                            />
                            <div className="flex-1 space-y-1.5">
                              <div
                                className={cn(
                                  'h-1.5 rounded-full w-3/4',
                                  item.value === 'dark' ? 'bg-gray-700' : 'bg-slate-300',
                                )}
                              />
                              <div
                                className={cn(
                                  'h-1.5 rounded-full w-1/2',
                                  item.value === 'dark' ? 'bg-gray-700' : 'bg-slate-300',
                                )}
                              />
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-6 right-6 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="mb-1">{item.icon}</div>
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Color Theme */}
            <Card>
              <CardHeader>
                <CardTitle>Color Theme</CardTitle>
                <CardDescription>Pick a primary color for the interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(
                    Object.entries(palettes) as [ThemeColor, (typeof palettes)[ThemeColor]][]
                  ).map(([key, palette]) => {
                    const isSelected = colorTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleColorChange(key)}
                        className={cn(
                          'relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm',
                          isSelected
                            ? 'border-primary shadow-sm'
                            : 'border-border hover:border-muted-foreground/40',
                        )}
                      >
                        <div
                          className="w-full h-2 rounded-full mb-3"
                          style={{ background: palette.gradient }}
                        />
                        <div className="flex gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-md" style={{ background: palette.primary }} />
                          <div className="w-5 h-5 rounded-md opacity-70" style={{ background: palette.primaryLight }} />
                          <div className="w-5 h-5 rounded-md opacity-30" style={{ background: palette.primaryLight }} />
                        </div>
                        <p className="text-sm font-semibold">{palette.label}</p>
                        {isSelected && (
                          <div
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: palette.primary }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 rounded-xl bg-muted/50 p-5 border">
                  <Button>Primary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----- Company Tab ----- */}
          <TabsContent value="company" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Acme Corp Pvt Ltd" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Select defaultValue="200-500">
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50</SelectItem>
                        <SelectItem value="50-200">50-200</SelectItem>
                        <SelectItem value="200-500">200-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    defaultValue="123 Tech Park, Bangalore, India"
                  />
                </div>

                <Button
                  onClick={() => toast.success('Company settings saved')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----- Notifications Tab ----- */}
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive alerts and updates</CardDescription>
              </CardHeader>
              <CardContent className="max-w-2xl">
                <div className="divide-y">
                  {notificationItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-0.5 pr-4">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.id]}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, [item.id]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----- Security Tab ----- */}
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage authentication and access policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger id="password-policy">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="strong">Strong (8+ chars, uppercase, number, symbol)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="session-timeout">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all admin users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <Button
                  onClick={() => toast.success('Security settings saved')}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
