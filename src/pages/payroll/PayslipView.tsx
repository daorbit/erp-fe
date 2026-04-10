import React from 'react';
import { Card, Table, Tag, Button, Typography, Row, Col, Divider, Spin, Descriptions } from 'antd';
import { Printer, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayslip } from '@/hooks/queries/usePayroll';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const PayslipView: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payslipData, isLoading } = usePayslip(id || '');

  const payslip: any = payslipData?.data ?? {};

  const earnings: any[] = payslip.earnings ?? [];
  const deductions: any[] = payslip.deductions ?? [];

  const earningColumns = [
    { title: 'Component', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' as const, render: (v: number) => formatINR(v || 0) },
  ];

  const deductionColumns = [
    { title: 'Component', dataIndex: 'name', key: 'name' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' as const, render: (v: number) => formatINR(v || 0) },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} />
          <div>
            <Title level={4} className="!mb-1">{t('payroll')}</Title>
            <Text type="secondary">{payslip.month} - {payslip.employeeName}</Text>
          </div>
        </div>
        <Button icon={<Printer size={16} />} onClick={() => window.print()}>{t('print')}</Button>
      </div>

      <Card bordered={false} className="print:shadow-none">
        {/* Company Header */}
        <div className="text-center mb-6">
          <Title level={3} className="!mb-1">{payslip.companyName || 'Company Name'}</Title>
          <Text type="secondary">Payslip for {payslip.month}</Text>
        </div>

        <Divider />

        {/* Employee Details */}
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} className="mb-6">
          <Descriptions.Item label="Employee Name">{payslip.employeeName}</Descriptions.Item>
          <Descriptions.Item label="Employee ID">{payslip.employeeId}</Descriptions.Item>
          <Descriptions.Item label="Department">{payslip.department}</Descriptions.Item>
          <Descriptions.Item label="Designation">{payslip.designation}</Descriptions.Item>
          <Descriptions.Item label="Pay Period">{payslip.month}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={payslip.status === 'paid' ? 'green' : 'orange'}>{payslip.status}</Tag></Descriptions.Item>
        </Descriptions>

        {/* Earnings & Deductions */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Earnings" bordered size="small" className="h-full">
              <Table columns={earningColumns} dataSource={earnings} pagination={false} size="small" rowKey="name" />
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Total Earnings</span>
                <span>{formatINR(payslip.grossPay || 0)}</span>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={t('deductions')} bordered size="small" className="h-full">
              <Table columns={deductionColumns} dataSource={deductions} pagination={false} size="small" rowKey="name" />
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Total Deductions</span>
                <span>{formatINR(payslip.totalDeductions || 0)}</span>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Net Pay */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
          <Title level={4} className="!mb-0">{t('net_pay')}</Title>
          <Title level={3} className="!mb-0 !text-blue-600">{formatINR(payslip.netPay || 0)}</Title>
        </div>
      </Card>
    </div>
  );
};

export default PayslipView;
