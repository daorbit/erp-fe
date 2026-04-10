import { useState, useEffect } from 'react';
import { Card, Steps, Button, Input, Select, Radio, Upload, Checkbox, Divider, Typography, Progress, App, Spin } from 'antd';
import {
  UserOutlined, IdcardOutlined, BankOutlined, SafetyCertificateOutlined,
  FileProtectOutlined, UploadOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { ArrowLeft, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser } from '@/store/authSlice';
import onboardingService from '@/services/onboardingService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const numOnly = (e: React.KeyboardEvent) => { if (!/[0-9\b]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); };
const phoneOnly = (e: React.KeyboardEvent) => { if (!/[0-9+\b ]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); };
const alnumOnly = (e: React.KeyboardEvent) => { if (!/[a-zA-Z0-9\b]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); };

const steps = [
  { title: 'Personal Info', icon: <UserOutlined /> },
  { title: 'ID Verification', icon: <IdcardOutlined /> },
  { title: 'Bank Details', icon: <BankOutlined /> },
  { title: 'Documents', icon: <SafetyCertificateOutlined /> },
  { title: 'Review', icon: <FileProtectOutlined /> },
];

const KYCOnboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const { message } = App.useApp();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Is this a self-onboarding (full screen) or admin is viewing?
  const isSelfOnboarding = user?.onboardingRequired && !user?.onboardingCompleted;

  // Load existing data
  useEffect(() => {
    onboardingService.getMe()
      .then((res: any) => {
        const d = res?.data;
        if (d) {
          setData(d);
          setCurrent(d.currentStep || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateField = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const saveCurrentStep = async () => {
    const stepMap: Record<number, string> = { 0: 'personalInfo', 1: 'idVerification', 2: 'bankDetails', 3: 'documents' };
    const section = stepMap[current];
    if (!section || !data[section]) return;
    setSaving(true);
    try {
      await onboardingService.saveStep(current, data[section]);
    } catch {
      // silent save
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    await saveCurrentStep();
    setCurrent(Math.min(current + 1, steps.length - 1));
  };
  const prev = () => setCurrent(Math.max(current - 1, 0));
  const progressPercent = Math.round(((current + 1) / steps.length) * 100);

  const handleSubmit = async () => {
    if (!confirmed) { message.warning('Please confirm the declaration first'); return; }
    setSubmitting(true);
    try {
      await onboardingService.submit();
      if (user) dispatch(setUser({ ...user, onboardingCompleted: true }));
      message.success('Onboarding completed!');
      setTimeout(() => navigate('/admin', { replace: true }), 500);
    } catch (err: any) {
      message.error(err?.message || 'Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const pi = data.personalInfo || {};
  const id = data.idVerification || {};
  const bd = data.bankDetails || {};

  const renderStep = () => {
    switch (current) {
      case 0: return (
        <div className="space-y-6">
          <div><Text strong className="text-base">Personal Information</Text><br /><Text type="secondary" className="text-sm">Please fill in your basic details</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label><Input size="large" placeholder="First name" value={pi.firstName || ''} onChange={(e) => updateField('personalInfo', 'firstName', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Middle Name</label><Input size="large" placeholder="Middle name" value={pi.middleName || ''} onChange={(e) => updateField('personalInfo', 'middleName', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label><Input size="large" placeholder="Last name" value={pi.lastName || ''} onChange={(e) => updateField('personalInfo', 'lastName', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth *</label><Input size="large" type="date" value={pi.dateOfBirth || ''} onChange={(e) => updateField('personalInfo', 'dateOfBirth', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Gender *</label><Select size="large" className="w-full" placeholder="Select" value={pi.gender || undefined} onChange={(v) => updateField('personalInfo', 'gender', v)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Marital Status</label><Select size="large" className="w-full" placeholder="Select" value={pi.maritalStatus || undefined} onChange={(v) => updateField('personalInfo', 'maritalStatus', v)} options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }]} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Email *</label><Input size="large" value={pi.email || ''} disabled /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone *</label><Input size="large" placeholder="+91 XXXXXXXXXX" value={pi.phone || ''} maxLength={15} onKeyDown={phoneOnly} onChange={(e) => updateField('personalInfo', 'phone', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Emergency Contact</label><Input size="large" placeholder="Emergency number" value={pi.emergencyContact || ''} maxLength={15} onKeyDown={phoneOnly} onChange={(e) => updateField('personalInfo', 'emergencyContact', e.target.value)} /></div>
          </div>
          <Divider className="!my-4" />
          <Text strong className="text-base">Address</Text>
          <div><label className="block text-xs font-medium text-gray-500 mb-1">Street Address *</label><Input size="large" placeholder="Street address" value={pi.address?.street || ''} onChange={(e) => updateField('personalInfo', 'address', { ...(pi.address || {}), street: e.target.value })} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">City *</label><Input size="large" placeholder="City" value={pi.address?.city || ''} onChange={(e) => updateField('personalInfo', 'address', { ...(pi.address || {}), city: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">State *</label><Input size="large" placeholder="State" value={pi.address?.state || ''} onChange={(e) => updateField('personalInfo', 'address', { ...(pi.address || {}), state: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">PIN Code *</label><Input size="large" placeholder="PIN Code" maxLength={6} onKeyDown={numOnly} value={pi.address?.pinCode || ''} onChange={(e) => updateField('personalInfo', 'address', { ...(pi.address || {}), pinCode: e.target.value })} /></div>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-6">
          <div><Text strong className="text-base">Identity Verification</Text><br /><Text type="secondary" className="text-sm">Upload government-issued ID documents</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Aadhaar Number *</label><Input size="large" placeholder="XXXX XXXX XXXX" maxLength={12} onKeyDown={numOnly} value={id.aadhaarNumber || ''} onChange={(e) => updateField('idVerification', 'aadhaarNumber', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">PAN Number *</label><Input size="large" placeholder="ABCDE1234F" maxLength={10} className="uppercase" onKeyDown={alnumOnly} value={id.panNumber || ''} onChange={(e) => updateField('idVerification', 'panNumber', e.target.value.toUpperCase())} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Dragger className="!rounded-xl" beforeUpload={() => false}><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 28, color: '#6366f1' }} /></p><p className="ant-upload-text text-sm">Upload Aadhaar Card</p><p className="ant-upload-hint text-xs">PDF, JPG, PNG (max 5MB)</p></Dragger>
            <Dragger className="!rounded-xl" beforeUpload={() => false}><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 28, color: '#6366f1' }} /></p><p className="ant-upload-text text-sm">Upload PAN Card</p><p className="ant-upload-hint text-xs">PDF, JPG, PNG (max 5MB)</p></Dragger>
          </div>
          <Divider className="!my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Passport Number (Optional)</label><Input size="large" placeholder="Passport number" value={id.passportNumber || ''} onChange={(e) => updateField('idVerification', 'passportNumber', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Driving License (Optional)</label><Input size="large" placeholder="DL number" value={id.drivingLicense || ''} onChange={(e) => updateField('idVerification', 'drivingLicense', e.target.value)} /></div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
          <div><Text strong className="text-base">Bank Account Details</Text><br /><Text type="secondary" className="text-sm">Required for salary disbursement</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Bank Name *</label><Select size="large" className="w-full" placeholder="Select bank" showSearch value={bd.bankName || undefined} onChange={(v) => updateField('bankDetails', 'bankName', v)} options={['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'].map(b => ({ value: b, label: b }))} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Account Holder Name *</label><Input size="large" placeholder="As per bank records" value={bd.accountHolderName || ''} onChange={(e) => updateField('bankDetails', 'accountHolderName', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Account Number *</label><Input size="large" placeholder="Account number" maxLength={18} onKeyDown={numOnly} value={bd.accountNumber || ''} onChange={(e) => updateField('bankDetails', 'accountNumber', e.target.value)} /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">IFSC Code *</label><Input size="large" placeholder="e.g. SBIN0001234" maxLength={11} className="uppercase" onKeyDown={alnumOnly} value={bd.ifscCode || ''} onChange={(e) => updateField('bankDetails', 'ifscCode', e.target.value.toUpperCase())} /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Account Type *</label>
            <Radio.Group size="large" value={bd.accountType || 'savings'} onChange={(e) => updateField('bankDetails', 'accountType', e.target.value)}><Radio.Button value="savings">Savings</Radio.Button><Radio.Button value="current">Current</Radio.Button><Radio.Button value="salary">Salary</Radio.Button></Radio.Group>
          </div>
          <Divider className="!my-4" />
          <Dragger className="!rounded-xl" beforeUpload={() => false}><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 28, color: '#6366f1' }} /></p><p className="ant-upload-text text-sm">Upload Cancelled Cheque / Passbook</p><p className="ant-upload-hint text-xs">PDF, JPG, PNG (max 5MB)</p></Dragger>
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <div><Text strong className="text-base">Additional Documents</Text><br /><Text type="secondary" className="text-sm">Upload required supporting documents</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {['Passport Size Photo', 'Education Certificate', 'Experience Letter', 'Relieving Letter', 'Signed Offer Letter', 'Address Proof'].map(doc => (
              <Dragger key={doc} className="!rounded-xl" beforeUpload={() => false}><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 24, color: '#6366f1' }} /></p><p className="ant-upload-text text-sm">{doc}</p><p className="ant-upload-hint text-xs">PDF, JPG, PNG</p></Dragger>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-green-500" /></div>
          <Title level={4} className="!mb-2">Review & Submit</Title>
          <Text type="secondary">Please review all information before submitting</Text>
          <div className="max-w-md mx-auto mt-8 text-left">
            {['Personal Information', 'ID Verification', 'Bank Details', 'Documents Upload'].map((section, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                <span className="text-sm font-medium">{section}</span>
                <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircleOutlined /> Saved</span>
              </div>
            ))}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>
                <span className="text-sm">I confirm that all information provided is accurate and complete</span>
              </Checkbox>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

  const content = (
    <>
      {/* Header */}
      <div className={`bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-gray-800 px-6 py-4 ${isSelfOnboarding ? '' : 'rounded-xl mb-6'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center"><Shield size={20} className="text-indigo-500" /></div>
            <div>
              <div className="font-semibold text-sm">Employee Onboarding</div>
              <div className="text-xs text-gray-400">{isSelfOnboarding ? 'Complete your KYC to get started' : `Viewing onboarding for ${pi.firstName || user?.firstName || ''} ${pi.lastName || user?.lastName || ''}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {saving && <Text type="secondary" className="text-xs">Saving...</Text>}
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-400">Step {current + 1} of {steps.length}</div>
              <div className="text-xs font-medium">{steps[current].title}</div>
            </div>
            <Progress type="circle" percent={progressPercent} size={44} strokeWidth={8} strokeColor="#6366f1" format={() => `${current + 1}/${steps.length}`} className="!text-xs" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Steps current={current} items={steps} className="mb-8" size="small" />
        <Card bordered={false} className="!rounded-2xl !shadow-sm" styles={{ body: { padding: '32px' } }}>
          {renderStep()}
        </Card>
        <div className="flex justify-between mt-6">
          <Button size="large" icon={<ArrowLeft size={16} />} onClick={prev} disabled={current === 0} className="!rounded-xl !h-11 !px-6">Previous</Button>
          {current < steps.length - 1 ? (
            <Button type="primary" size="large" onClick={next} loading={saving} className="!rounded-xl !h-11 !px-6">Continue <ArrowRight size={16} className="ml-1" /></Button>
          ) : (
            <Button type="primary" size="large" onClick={handleSubmit} loading={submitting} disabled={!confirmed} className="!rounded-xl !h-11 !px-8">Submit & Complete</Button>
          )}
        </div>
      </div>
    </>
  );

  // Full screen overlay for self-onboarding, normal layout for admin
  if (isSelfOnboarding) {
    return <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-[#111318]">{content}</div>;
  }

  return <div className="space-y-6">{content}</div>;
};

export default KYCOnboarding;
