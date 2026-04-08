/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Card, Button, Typography, Row, Col, Table, Tag, Divider, Space,
} from 'antd';
import {
  Printer,
  Download,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const formatINR = (amount: number) => {
  return '₹' + amount.toLocaleString('en-IN');
};

// Mock payslip data keyed by ID
const payslipData: Record<string, any> = {
  '1': {
    employee: { name: 'Rahul Sharma', empId: 'EMP001', department: 'Engineering', designation: 'Senior Software Engineer', bankAccount: 'XXXX XXXX 4521', bankName: 'HDFC Bank', pan: 'ABCPS1234K', uan: '1001234567' },
    payPeriod: 'April 2026',
    earnings: [
      { key: '1', component: 'Basic Salary', amount: 50000 },
      { key: '2', component: 'House Rent Allowance (HRA)', amount: 25000 },
      { key: '3', component: 'Dearness Allowance (DA)', amount: 12500 },
      { key: '4', component: 'Special Allowance', amount: 25000 },
      { key: '5', component: 'Medical Allowance', amount: 1250 },
      { key: '6', component: 'Travel Allowance', amount: 3200 },
      { key: '7', component: 'Overtime', amount: 5000 },
      { key: '8', component: 'Bonus', amount: 3050 },
    ],
    deductions: [
      { key: '1', component: 'Provident Fund (PF)', amount: 6000 },
      { key: '2', component: 'ESI', amount: 0 },
      { key: '3', component: 'Professional Tax (PT)', amount: 200 },
      { key: '4', component: 'Tax Deducted at Source (TDS)', amount: 21300 },
      { key: '5', component: 'Loss of Pay (LOP)', amount: 0 },
      { key: '6', component: 'Other Deductions', amount: 0 },
    ],
    payment: { mode: 'Bank Transfer (NEFT)', transactionId: 'NEFT2026040100123', date: '01 Apr 2026' },
  },
};

// Default fallback payslip
const defaultPayslip = {
  employee: { name: 'Priya Singh', empId: 'EMP002', department: 'Marketing', designation: 'Marketing Manager', bankAccount: 'XXXX XXXX 7832', bankName: 'ICICI Bank', pan: 'DEFPS5678L', uan: '1001234568' },
  payPeriod: 'April 2026',
  earnings: [
    { key: '1', component: 'Basic Salary', amount: 38000 },
    { key: '2', component: 'House Rent Allowance (HRA)', amount: 19000 },
    { key: '3', component: 'Dearness Allowance (DA)', amount: 9500 },
    { key: '4', component: 'Special Allowance', amount: 19000 },
    { key: '5', component: 'Medical Allowance', amount: 1250 },
    { key: '6', component: 'Travel Allowance', amount: 3200 },
    { key: '7', component: 'Overtime', amount: 0 },
    { key: '8', component: 'Bonus', amount: 5050 },
  ],
  deductions: [
    { key: '1', component: 'Provident Fund (PF)', amount: 4560 },
    { key: '2', component: 'ESI', amount: 0 },
    { key: '3', component: 'Professional Tax (PT)', amount: 200 },
    { key: '4', component: 'Tax Deducted at Source (TDS)', amount: 16140 },
    { key: '5', component: 'Loss of Pay (LOP)', amount: 0 },
    { key: '6', component: 'Other Deductions', amount: 0 },
  ],
  payment: { mode: 'Bank Transfer (NEFT)', transactionId: 'NEFT2026040100124', date: '01 Apr 2026' },
};

const PayslipView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const data = (id && payslipData[id]) || defaultPayslip;

  const totalEarnings = data.earnings.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalDeductions = data.deductions.reduce((sum: number, d: any) => sum + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const earningColumns = [
    { title: 'Earnings', dataIndex: 'component', key: 'component', render: (t: string) => <Text>{t}</Text> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' as const, render: (v: number) => <Text>{formatINR(v)}</Text> },
  ];

  const deductionColumns = [
    { title: 'Deductions', dataIndex: 'component', key: 'component', render: (t: string) => <Text>{t}</Text> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' as const, render: (v: number) => <Text>{formatINR(v)}</Text> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Space style={{ marginBottom: 4 }}>
            <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/payroll')} />
            <Title level={3} style={{ margin: 0 }}>Payslip</Title>
          </Space>
          <br />
          <Text type="secondary">Pay period: {data.payPeriod}</Text>
        </div>
        <Space>
          <Button icon={<Printer size={16} />} onClick={() => window.print()}>Print</Button>
          <Button type="primary" icon={<Download size={16} />}>Download PDF</Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 900, margin: '0 auto' }}>
        {/* Company Header */}
        <div style={{
          textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #1a56db',
          marginBottom: 24,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12, background: '#1a56db15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', color: '#1a56db',
          }}>
            <Building2 size={28} />
          </div>
          <Title level={4} style={{ margin: 0, color: '#1a56db' }}>Sheeraj Codeworks Pvt. Ltd.</Title>
          <Text type="secondary">123, Bandra Kurla Complex, Mumbai, Maharashtra - 400051</Text>
          <br />
          <Tag color="blue" style={{ marginTop: 8, fontSize: 13, padding: '2px 16px' }}>
            Payslip for {data.payPeriod}
          </Tag>
        </div>

        {/* Employee Details */}
        <Card
          size="small"
          style={{ borderRadius: 8, marginBottom: 24, background: '#f9fafb' }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Employee Name</Text>
              <br />
              <Text strong>{data.employee.name}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Employee ID</Text>
              <br />
              <Text strong>{data.employee.empId}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Department</Text>
              <br />
              <Text strong>{data.employee.department}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Designation</Text>
              <br />
              <Text strong>{data.employee.designation}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Bank Account</Text>
              <br />
              <Text strong>{data.employee.bankAccount}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>Bank Name</Text>
              <br />
              <Text strong>{data.employee.bankName}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>PAN</Text>
              <br />
              <Text strong>{data.employee.pan}</Text>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>UAN</Text>
              <br />
              <Text strong>{data.employee.uan}</Text>
            </Col>
          </Row>
        </Card>

        {/* Earnings & Deductions */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Table
              dataSource={data.earnings}
              columns={earningColumns}
              pagination={false}
              size="small"
              bordered
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Total Earnings</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong style={{ color: '#059669' }}>{formatINR(totalEarnings)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            <Table
              dataSource={data.deductions}
              columns={deductionColumns}
              pagination={false}
              size="small"
              bordered
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Total Deductions</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong style={{ color: '#dc2626' }}>{formatINR(totalDeductions)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Col>
        </Row>

        {/* Net Pay */}
        <div style={{
          background: 'linear-gradient(135deg, #1a56db08, #059669 08)',
          border: '2px solid #059669',
          borderRadius: 12,
          padding: '24px 32px',
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <Text type="secondary" style={{ fontSize: 14 }}>Net Pay</Text>
            <br />
            <Text style={{ fontSize: 11, color: '#6b7280' }}>Total Earnings - Total Deductions</Text>
          </div>
          <Title level={2} style={{ margin: 0, color: '#059669' }}>
            {formatINR(netPay)}
          </Title>
        </div>

        <Divider />

        {/* Payment Details */}
        <Card size="small" style={{ borderRadius: 8, background: '#f9fafb' }}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Payment Mode</Text>
              <br />
              <Text strong>{data.payment.mode}</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Transaction ID</Text>
              <br />
              <Text strong copyable>{data.payment.transactionId}</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary" style={{ fontSize: 12 }}>Payment Date</Text>
              <br />
              <Text strong>{data.payment.date}</Text>
            </Col>
          </Row>
        </Card>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            This is a computer-generated payslip and does not require a signature. For any discrepancies, please contact the HR department.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PayslipView;
