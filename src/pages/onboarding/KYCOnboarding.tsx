import React, { useState } from 'react';
import {
  Card, Steps, Form, Input, Select, DatePicker, Upload, Button, Row, Col,
  Typography, Divider, Radio, Space, Result, message, Checkbox,
} from 'antd';
import {
  User,
  IdCard,
  CheckCircle2,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BankOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const KYCOnboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();

  const steps = [
    { title: 'Personal Info', icon: <User size={18} /> },
    { title: 'ID Verification', icon: <IdCard size={18} /> },
    { title: 'Bank Details', icon: <BankOutlined size={18} /> },
    { title: 'Documents', icon: <ShieldCheck size={18} /> },
    { title: 'Review', icon: <CheckCircle2 size={18} /> },
  ];

  const next = () => {
    form.validateFields().then(() => setCurrent(current + 1)).catch(() => {});
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
  };

  const renderStep = () => {
    switch (current) {
      case 0:
        return (
          <Form form={form} layout="vertical">
            <Title level={5}>Personal Information</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Please fill in the employee's basic details</Text>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input placeholder="Enter first name" /></Form.Item></Col>
              <Col span={8}><Form.Item name="middleName" label="Middle Name"><Input placeholder="Enter middle name" /></Form.Item></Col>
              <Col span={8}><Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input placeholder="Enter last name" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={8}><Form.Item name="gender" label="Gender" rules={[{ required: true }]}><Select placeholder="Select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item name="maritalStatus" label="Marital Status"><Select placeholder="Select" options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }]} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="email" label="Personal Email" rules={[{ required: true, type: 'email' }]}><Input placeholder="email@example.com" /></Form.Item></Col>
              <Col span={8}><Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}><Input placeholder="+91 XXXXXXXXXX" /></Form.Item></Col>
              <Col span={8}><Form.Item name="emergencyContact" label="Emergency Contact"><Input placeholder="Emergency number" /></Form.Item></Col>
            </Row>
            <Divider />
            <Title level={5}>Address</Title>
            <Row gutter={16}>
              <Col span={24}><Form.Item name="address" label="Street Address" rules={[{ required: true }]}><Input placeholder="Enter street address" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="city" label="City" rules={[{ required: true }]}><Input placeholder="City" /></Form.Item></Col>
              <Col span={8}><Form.Item name="state" label="State" rules={[{ required: true }]}><Input placeholder="State" /></Form.Item></Col>
              <Col span={8}><Form.Item name="pincode" label="PIN Code" rules={[{ required: true }]}><Input placeholder="PIN Code" /></Form.Item></Col>
            </Row>
          </Form>
        );
      case 1:
        return (
          <Form form={form} layout="vertical">
            <Title level={5}>Identity Verification</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Upload government-issued ID documents for verification</Text>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="aadhaarNo" label="Aadhaar Number" rules={[{ required: true }]}><Input placeholder="XXXX XXXX XXXX" maxLength={14} /></Form.Item></Col>
              <Col span={12}><Form.Item name="panNo" label="PAN Number" rules={[{ required: true }]}><Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="aadhaarUpload" label="Upload Aadhaar Card" rules={[{ required: true }]}>
                  <Dragger {...uploadProps}>
                    <p><UploadCloud size={24} color="#1a56db" /></p>
                    <p>Click or drag Aadhaar card here</p>
                    <p style={{ color: '#999', fontSize: 12 }}>PDF, JPG, PNG (max 5MB)</p>
                  </Dragger>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="panUpload" label="Upload PAN Card" rules={[{ required: true }]}>
                  <Dragger {...uploadProps}>
                    <p><UploadCloud size={24} color="#1a56db" /></p>
                    <p>Click or drag PAN card here</p>
                    <p style={{ color: '#999', fontSize: 12 }}>PDF, JPG, PNG (max 5MB)</p>
                  </Dragger>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}><Form.Item name="passportNo" label="Passport Number (Optional)"><Input placeholder="Passport number" /></Form.Item></Col>
              <Col span={12}><Form.Item name="dlNo" label="Driving License (Optional)"><Input placeholder="DL number" /></Form.Item></Col>
            </Row>
          </Form>
        );
      case 2:
        return (
          <Form form={form} layout="vertical">
            <Title level={5}>Bank Account Details</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Provide bank details for salary disbursement</Text>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}><Select placeholder="Select bank" options={[
                { value: 'sbi', label: 'State Bank of India' },
                { value: 'hdfc', label: 'HDFC Bank' },
                { value: 'icici', label: 'ICICI Bank' },
                { value: 'axis', label: 'Axis Bank' },
                { value: 'kotak', label: 'Kotak Mahindra Bank' },
              ]} /></Form.Item></Col>
              <Col span={12}><Form.Item name="accountHolder" label="Account Holder Name" rules={[{ required: true }]}><Input placeholder="As per bank records" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="accountNo" label="Account Number" rules={[{ required: true }]}><Input placeholder="Enter account number" /></Form.Item></Col>
              <Col span={12}><Form.Item name="confirmAccountNo" label="Confirm Account Number" rules={[{ required: true }]}><Input placeholder="Re-enter account number" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="ifsc" label="IFSC Code" rules={[{ required: true }]}><Input placeholder="e.g. SBIN0001234" style={{ textTransform: 'uppercase' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="accountType" label="Account Type" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value="savings">Savings</Radio>
                  <Radio value="current">Current</Radio>
                </Radio.Group>
              </Form.Item></Col>
            </Row>
            <Divider />
            <Form.Item name="cancelledCheque" label="Upload Cancelled Cheque / Passbook">
              <Dragger {...uploadProps}>
                <p><UploadCloud style={{ fontSize: 24, color: '#1a56db' }} /></p>
                <p>Click or drag file here</p>
                <p style={{ color: '#999', fontSize: 12 }}>PDF, JPG, PNG (max 5MB)</p>
              </Dragger>
            </Form.Item>
          </Form>
        );
      case 3:
        return (
          <Form form={form} layout="vertical">
            <Title level={5}>Additional Documents</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Upload supporting documents for your employee record</Text>
            <Row gutter={24}>
              {[
                { name: 'photo', label: 'Passport Size Photo', desc: 'Recent photo with white background' },
                { name: 'educationCert', label: 'Education Certificate', desc: 'Highest qualification certificate' },
                { name: 'experienceLetter', label: 'Experience Letter', desc: 'Previous employer experience letter' },
                { name: 'relievingLetter', label: 'Relieving Letter', desc: 'From previous organization' },
                { name: 'offerLetter', label: 'Signed Offer Letter', desc: 'Company offer letter signed copy' },
                { name: 'addressProof', label: 'Address Proof', desc: 'Utility bill or rental agreement' },
              ].map(doc => (
                <Col span={8} key={doc.name} style={{ marginBottom: 16 }}>
                  <Form.Item name={doc.name} label={doc.label}>
                    <Dragger {...uploadProps} style={{ padding: '12px' }}>
                      <p><UploadCloud size={20} color="#1a56db" /></p>
                      <p style={{ fontSize: 13 }}>{doc.desc}</p>
                      <p style={{ color: '#999', fontSize: 11 }}>Max 5MB</p>
                    </Dragger>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        );
      case 4:
        return (
          <Result
            status="info"
            icon={<CheckCircle2 style={{ color: '#1a56db' }} size={18} />}
            title="Review & Submit"
            subTitle="Please review all the information before submitting the KYC application."
            extra={
              <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'left' }}>
                {[
                  { label: 'Personal Information', status: 'Completed' },
                  { label: 'ID Verification', status: 'Completed' },
                  { label: 'Bank Details', status: 'Completed' },
                  { label: 'Documents Upload', status: 'Completed' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Text>{item.label}</Text>
                    <Text style={{ color: '#059669' }}><CheckCircle2 size={14} /> {item.status}</Text>
                  </div>
                ))}
                <Divider />
                <Checkbox>I confirm that all information provided is accurate and complete.</Checkbox>
                <div style={{ marginTop: 24 }}>
                  <Button type="primary" size="large" block onClick={() => message.success('KYC submitted successfully!')}>
                    Submit KYC Application
                  </Button>
                </div>
              </div>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Employee KYC Onboarding</Title>
        <Text type="secondary">Complete the KYC process for new employee registration</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <Steps current={current} items={steps} />
      </Card>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {renderStep()}
        {current < 4 && (
          <>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled={current === 0} onClick={() => setCurrent(current - 1)} icon={<ArrowLeft size={16} />}>
                Previous
              </Button>
              <Button type="primary" onClick={next} icon={<ArrowRight size={16} />} iconPosition="end">
                {current === 3 ? 'Review' : 'Next Step'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default KYCOnboarding;
