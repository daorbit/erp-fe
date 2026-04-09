import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { formatINR } from '@/lib/formatters';
import { usePayslip } from '@/hooks/queries/usePayroll';

interface PayslipLineItem {
  key: string;
  component: string;
  amount: number;
}

interface PayslipData {
  employee: {
    name: string;
    empId: string;
    department: string;
    designation: string;
    bankAccount: string;
    bankName: string;
    pan: string;
    uan: string;
  };
  payPeriod: string;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  payment: { mode: string; transactionId: string; date: string };
}

const payslipData: Record<string, PayslipData> = {
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

const defaultPayslip: PayslipData = {
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
  const { data: apiResponse, isLoading } = usePayslip(id || '');
  const data: PayslipData = apiResponse?.data ?? ((id && payslipData[id]) || defaultPayslip);

  const totalEarnings = data.earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = data.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading payslip...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/payroll')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payslip</h1>
            <p className="text-sm text-muted-foreground">Pay period: {data.payPeriod}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip Document */}
      <Card className="max-w-[900px] mx-auto">
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="text-center pb-5 border-b-2 border-primary mb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={28} />
            </div>
            <h2 className="text-xl font-bold text-primary">Sheeraj Codeworks Pvt. Ltd.</h2>
            <p className="text-sm text-muted-foreground">123, Bandra Kurla Complex, Mumbai, Maharashtra - 400051</p>
            <Badge className="mt-2 text-sm px-4 py-1">Payslip for {data.payPeriod}</Badge>
          </div>

          {/* Employee Details */}
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
              {[
                { label: 'Employee Name', value: data.employee.name },
                { label: 'Employee ID', value: data.employee.empId },
                { label: 'Department', value: data.employee.department },
                { label: 'Designation', value: data.employee.designation },
                { label: 'Bank Account', value: data.employee.bankAccount },
                { label: 'Bank Name', value: data.employee.bankName },
                { label: 'PAN', value: data.employee.pan },
                { label: 'UAN', value: data.employee.uan },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Earnings Table */}
            <div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 font-semibold">Earnings</th>
                    <th className="text-right p-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.earnings.map(e => (
                    <tr key={e.key} className="border-b">
                      <td className="p-2">{e.component}</td>
                      <td className="p-2 text-right">{formatINR(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="p-2">Total Earnings</td>
                    <td className="p-2 text-right text-green-600">{formatINR(totalEarnings)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Deductions Table */}
            <div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2 font-semibold">Deductions</th>
                    <th className="text-right p-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.deductions.map(d => (
                    <tr key={d.key} className="border-b">
                      <td className="p-2">{d.component}</td>
                      <td className="p-2 text-right">{formatINR(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="p-2">Total Deductions</td>
                    <td className="p-2 text-right text-red-600">{formatINR(totalDeductions)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Net Pay */}
          <div className="rounded-xl border-2 border-green-600 bg-green-50 dark:bg-green-950/30 p-6 flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Net Pay</p>
              <p className="text-[11px] text-muted-foreground">Total Earnings - Total Deductions</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatINR(netPay)}</p>
          </div>

          <Separator className="my-6" />

          {/* Payment Details */}
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Payment Mode</p>
                <p className="text-sm font-semibold">{data.payment.mode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="text-sm font-semibold font-mono">{data.payment.transactionId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment Date</p>
                <p className="text-sm font-semibold">{data.payment.date}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-[11px] text-muted-foreground">
              This is a computer-generated payslip and does not require a signature. For any discrepancies, please contact the HR department.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipView;
