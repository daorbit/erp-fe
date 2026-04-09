import React, { useState, useCallback } from 'react';
import {
  User,
  IdCard,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Landmark,
  FileCheck,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FileUploadZone from '@/components/shared/FileUploadZone';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ============================== */
/*  Steps config                  */
/* ============================== */

const steps = [
  { title: 'Personal Info', icon: User },
  { title: 'ID Verification', icon: IdCard },
  { title: 'Bank Details', icon: Landmark },
  { title: 'Documents', icon: ShieldCheck },
  { title: 'Review', icon: FileCheck },
];

/* ============================== */
/*  Form data type                */
/* ============================== */

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  emergencyContact: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaarNo: string;
  panNo: string;
  passportNo: string;
  dlNo: string;
  bankName: string;
  accountHolder: string;
  accountNo: string;
  confirmAccountNo: string;
  ifsc: string;
  accountType: string;
  confirmed: boolean;
}

const initialFormData: FormData = {
  firstName: '', middleName: '', lastName: '',
  dob: '', gender: '', maritalStatus: '',
  email: '', phone: '', emergencyContact: '',
  address: '', city: '', state: '', pincode: '',
  aadhaarNo: '', panNo: '', passportNo: '', dlNo: '',
  bankName: '', accountHolder: '', accountNo: '', confirmAccountNo: '',
  ifsc: '', accountType: 'savings',
  confirmed: false,
};

/* ============================== */
/*  Step Indicator                */
/* ============================== */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center w-full overflow-x-auto py-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < current;
        const isCurrent = index === current;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-primary/10',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
            </div>
            {index < total - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-10 sm:w-16 shrink-0 rounded-full mt-[-16px]',
                  index < current ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================== */
/*  Main Component                */
/* ============================== */

const KYCOnboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const update = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const next = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  /* ---------- Step 0: Personal Info ---------- */
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Please fill in the employee's basic details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" placeholder="Enter first name" value={formData.firstName} onChange={(e) => update('firstName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" placeholder="Enter middle name" value={formData.middleName} onChange={(e) => update('middleName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" placeholder="Enter last name" value={formData.lastName} onChange={(e) => update('lastName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input id="dob" type="date" value={formData.dob} onChange={(e) => update('dob', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(v) => update('gender', v)}>
            <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select value={formData.maritalStatus} onValueChange={(v) => update('maritalStatus', v)}>
            <SelectTrigger id="maritalStatus"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Personal Email *</Label>
          <Input id="email" type="email" placeholder="email@example.com" value={formData.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" placeholder="+91 XXXXXXXXXX" value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input id="emergencyContact" placeholder="Emergency number" value={formData.emergencyContact} onChange={(e) => update('emergencyContact', e.target.value)} />
        </div>
      </div>

      <Separator />

      <h3 className="text-lg font-semibold">Address</h3>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input id="address" placeholder="Enter street address" value={formData.address} onChange={(e) => update('address', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input id="city" placeholder="City" value={formData.city} onChange={(e) => update('city', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input id="state" placeholder="State" value={formData.state} onChange={(e) => update('state', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code *</Label>
          <Input id="pincode" placeholder="PIN Code" value={formData.pincode} onChange={(e) => update('pincode', e.target.value)} />
        </div>
      </div>
    </div>
  );

  /* ---------- Step 1: ID Verification ---------- */
  const renderIdVerification = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Identity Verification</h3>
        <p className="text-sm text-muted-foreground">Upload government-issued ID documents for verification</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aadhaarNo">Aadhaar Number *</Label>
          <Input id="aadhaarNo" placeholder="XXXX XXXX XXXX" maxLength={14} value={formData.aadhaarNo} onChange={(e) => update('aadhaarNo', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="panNo">PAN Number *</Label>
          <Input id="panNo" placeholder="ABCDE1234F" maxLength={10} className="uppercase" value={formData.panNo} onChange={(e) => update('panNo', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Upload Aadhaar Card *</Label>
          <FileUploadZone
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            onFilesSelected={() => {}}
            label="Upload Aadhaar Card"
            description="PDF, JPG, PNG (max 5MB)"
          />
        </div>
        <div className="space-y-2">
          <Label>Upload PAN Card *</Label>
          <FileUploadZone
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            onFilesSelected={() => {}}
            label="Upload PAN Card"
            description="PDF, JPG, PNG (max 5MB)"
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passportNo">Passport Number (Optional)</Label>
          <Input id="passportNo" placeholder="Passport number" value={formData.passportNo} onChange={(e) => update('passportNo', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dlNo">Driving License (Optional)</Label>
          <Input id="dlNo" placeholder="DL number" value={formData.dlNo} onChange={(e) => update('dlNo', e.target.value)} />
        </div>
      </div>
    </div>
  );

  /* ---------- Step 2: Bank Details ---------- */
  const renderBankDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Bank Account Details</h3>
        <p className="text-sm text-muted-foreground">Provide bank details for salary disbursement</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Select value={formData.bankName} onValueChange={(v) => update('bankName', v)}>
            <SelectTrigger id="bankName"><SelectValue placeholder="Select bank" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sbi">State Bank of India</SelectItem>
              <SelectItem value="hdfc">HDFC Bank</SelectItem>
              <SelectItem value="icici">ICICI Bank</SelectItem>
              <SelectItem value="axis">Axis Bank</SelectItem>
              <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountHolder">Account Holder Name *</Label>
          <Input id="accountHolder" placeholder="As per bank records" value={formData.accountHolder} onChange={(e) => update('accountHolder', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountNo">Account Number *</Label>
          <Input id="accountNo" placeholder="Enter account number" value={formData.accountNo} onChange={(e) => update('accountNo', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmAccountNo">Confirm Account Number *</Label>
          <Input id="confirmAccountNo" placeholder="Re-enter account number" value={formData.confirmAccountNo} onChange={(e) => update('confirmAccountNo', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ifsc">IFSC Code *</Label>
          <Input id="ifsc" placeholder="e.g. SBIN0001234" className="uppercase" value={formData.ifsc} onChange={(e) => update('ifsc', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Account Type *</Label>
          <RadioGroup value={formData.accountType} onValueChange={(v) => update('accountType', v)} className="flex gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="savings" id="savings" />
              <Label htmlFor="savings" className="cursor-pointer">Savings</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="current" />
              <Label htmlFor="current" className="cursor-pointer">Current</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="salary" id="salary" />
              <Label htmlFor="salary" className="cursor-pointer">Salary</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Upload Cancelled Cheque / Passbook</Label>
        <FileUploadZone
          accept=".pdf,.jpg,.jpeg,.png"
          maxSize={5 * 1024 * 1024}
          onFilesSelected={() => {}}
          label="Upload Cancelled Cheque / Passbook"
          description="PDF, JPG, PNG (max 5MB)"
        />
      </div>
    </div>
  );

  /* ---------- Step 3: Documents ---------- */
  const documentTypes = [
    { name: 'photo', label: 'Passport Size Photo', desc: 'Recent photo with white background' },
    { name: 'educationCert', label: 'Education Certificate', desc: 'Highest qualification certificate' },
    { name: 'experienceLetter', label: 'Experience Letter', desc: 'Previous employer experience letter' },
    { name: 'relievingLetter', label: 'Relieving Letter', desc: 'From previous organization' },
    { name: 'offerLetter', label: 'Signed Offer Letter', desc: 'Company offer letter signed copy' },
    { name: 'addressProof', label: 'Address Proof', desc: 'Utility bill or rental agreement' },
  ];

  const renderDocuments = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Additional Documents</h3>
        <p className="text-sm text-muted-foreground">Upload supporting documents for your employee record</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((doc) => (
          <div key={doc.name} className="space-y-2">
            <Label>{doc.label}</Label>
            <FileUploadZone
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={5 * 1024 * 1024}
              onFilesSelected={() => {}}
              label={doc.label}
              description={doc.desc}
            />
          </div>
        ))}
      </div>
    </div>
  );

  /* ---------- Step 4: Review ---------- */
  const reviewSections = [
    { label: 'Personal Information', status: 'Completed' },
    { label: 'ID Verification', status: 'Completed' },
    { label: 'Bank Details', status: 'Completed' },
    { label: 'Documents Upload', status: 'Completed' },
  ];

  const renderReview = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please review all the information before submitting the KYC application.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="divide-y rounded-lg border">
          {reviewSections.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">{item.label}</span>
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> {item.status}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex items-start space-x-2">
          <Checkbox
            id="confirm"
            checked={formData.confirmed}
            onCheckedChange={(checked) => update('confirmed', checked === true)}
          />
          <Label htmlFor="confirm" className="text-sm cursor-pointer leading-snug">
            I confirm that all information provided is accurate and complete.
          </Label>
        </div>

        <Button
          className="w-full mt-6"
          size="lg"
          disabled={!formData.confirmed}
          onClick={() => toast.success('KYC submitted successfully!')}
        >
          Submit KYC Application
        </Button>
      </div>
    </div>
  );

  /* ---------- Render current step ---------- */
  const renderStep = () => {
    switch (current) {
      case 0: return renderPersonalInfo();
      case 1: return renderIdVerification();
      case 2: return renderBankDetails();
      case 3: return renderDocuments();
      case 4: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee KYC Onboarding"
        description="Complete the KYC process for new employee registration"
      />

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-6">
          <StepIndicator current={current} total={steps.length} />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStep()}

          {/* Navigation */}
          {current < 4 && (
            <>
              <Separator className="my-6" />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={current === 0}
                  onClick={prev}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={next}>
                  {current === 3 ? 'Review' : 'Next Step'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCOnboarding;
