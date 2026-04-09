import React, { useState } from 'react';
import { Card, Steps, Button, Input, Select, Radio, Upload, Checkbox, Divider, Typography, Space, Result } from 'antd';
import {
  UserOutlined, IdcardOutlined, BankOutlined, SafetyCertificateOutlined,
  FileProtectOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  UploadOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { App } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const steps = [
  { title: 'Personal Info', icon: <UserOutlined /> },
  { title: 'ID Verification', icon: <IdcardOutlined /> },
  { title: 'Bank Details', icon: <BankOutlined /> },
  { title: 'Documents', icon: <SafetyCertificateOutlined /> },
  { title: 'Review', icon: <FileProtectOutlined /> },
];

const KYCOnboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const { message } = App.useApp();

  const next = () => setCurrent(Math.min(current + 1, steps.length - 1));
  const prev = () => setCurrent(Math.max(current - 1, 0));

  const renderStep = () => {
    switch (current) {
      case 0: return (
        <div className="space-y-6">
          <div><Title level={5}>Personal Information</Title><Text type="secondary">Please fill in the employee's basic details</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">First Name *</label><Input placeholder="Enter first name" /></div>
            <div><label className="block text-sm font-medium mb-1">Middle Name</label><Input placeholder="Enter middle name" /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name *</label><Input placeholder="Enter last name" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Date of Birth *</label><Input type="date" /></div>
            <div><label className="block text-sm font-medium mb-1">Gender *</label>
              <Select className="w-full" placeholder="Select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            </div>
            <div><label className="block text-sm font-medium mb-1">Marital Status</label>
              <Select className="w-full" placeholder="Select" options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }]} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Email *</label><Input type="email" placeholder="email@example.com" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone *</label><Input placeholder="+91 XXXXXXXXXX" /></div>
            <div><label className="block text-sm font-medium mb-1">Emergency Contact</label><Input placeholder="Emergency number" /></div>
          </div>
          <Divider />
          <Title level={5}>Address</Title>
          <div><label className="block text-sm font-medium mb-1">Street Address *</label><Input placeholder="Enter street address" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">City *</label><Input placeholder="City" /></div>
            <div><label className="block text-sm font-medium mb-1">State *</label><Input placeholder="State" /></div>
            <div><label className="block text-sm font-medium mb-1">PIN Code *</label><Input placeholder="PIN Code" /></div>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-6">
          <div><Title level={5}>Identity Verification</Title><Text type="secondary">Upload government-issued ID documents</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Aadhaar Number *</label><Input placeholder="XXXX XXXX XXXX" /></div>
            <div><label className="block text-sm font-medium mb-1">PAN Number *</label><Input placeholder="ABCDE1234F" className="uppercase" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dragger><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 24 }} /></p><p className="ant-upload-text">Upload Aadhaar Card</p><p className="ant-upload-hint">PDF, JPG, PNG (max 5MB)</p></Dragger>
            <Dragger><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 24 }} /></p><p className="ant-upload-text">Upload PAN Card</p><p className="ant-upload-hint">PDF, JPG, PNG (max 5MB)</p></Dragger>
          </div>
          <Divider />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Passport Number (Optional)</label><Input placeholder="Passport number" /></div>
            <div><label className="block text-sm font-medium mb-1">Driving License (Optional)</label><Input placeholder="DL number" /></div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
          <div><Title level={5}>Bank Account Details</Title><Text type="secondary">Provide bank details for salary disbursement</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Bank Name *</label>
              <Select className="w-full" placeholder="Select bank" options={['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map(b => ({ value: b, label: b }))} />
            </div>
            <div><label className="block text-sm font-medium mb-1">Account Holder Name *</label><Input placeholder="As per bank records" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Account Number *</label><Input placeholder="Enter account number" /></div>
            <div><label className="block text-sm font-medium mb-1">Confirm Account Number *</label><Input placeholder="Re-enter account number" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">IFSC Code *</label><Input placeholder="e.g. SBIN0001234" className="uppercase" /></div>
            <div><label className="block text-sm font-medium mb-1">Account Type *</label>
              <Radio.Group defaultValue="savings"><Radio value="savings">Savings</Radio><Radio value="current">Current</Radio><Radio value="salary">Salary</Radio></Radio.Group>
            </div>
          </div>
          <Divider />
          <Dragger><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 24 }} /></p><p className="ant-upload-text">Upload Cancelled Cheque / Passbook</p><p className="ant-upload-hint">PDF, JPG, PNG (max 5MB)</p></Dragger>
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <div><Title level={5}>Additional Documents</Title><Text type="secondary">Upload supporting documents</Text></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Passport Size Photo', 'Education Certificate', 'Experience Letter', 'Relieving Letter', 'Signed Offer Letter', 'Address Proof'].map(doc => (
              <Dragger key={doc}><p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 20 }} /></p><p className="ant-upload-text text-sm">{doc}</p></Dragger>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <Result
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Review & Submit"
          subTitle="Please review all the information before submitting."
          extra={
            <div className="max-w-lg mx-auto text-left">
              {['Personal Information', 'ID Verification', 'Bank Details', 'Documents Upload'].map((section, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <span className="text-sm font-medium">{section}</span>
                  <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircleOutlined /> Completed</span>
                </div>
              ))}
              <div className="mt-6">
                <Checkbox>I confirm that all information provided is accurate</Checkbox>
              </div>
            </div>
          }
        />
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Employee KYC Onboarding</Title>
        <Text type="secondary">Complete the KYC verification process for new employees</Text>
      </div>

      <Card bordered={false}>
        <Steps current={current} items={steps} className="mb-8" />
        {renderStep()}
        <Divider />
        <div className="flex justify-between">
          <Button icon={<ArrowLeftOutlined />} onClick={prev} disabled={current === 0}>Previous</Button>
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={next}>Next <ArrowRightOutlined /></Button>
          ) : (
            <Button type="primary" onClick={() => message.success('KYC submitted successfully!')}>Submit Application</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default KYCOnboarding;
