import React from 'react';
import { Card, Avatar, Tag, Tabs, Typography, Row, Col, Descriptions, Table, Spin, Space, Badge } from 'antd';
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployee, useEmployeeAttendance, useEmployeeLeaves, useEmployeePayslips } from '@/hooks/queries/useEmployees';
import { Button } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = { active: 'green', inactive: 'red', on_leave: 'orange', probation: 'blue', terminated: 'red' };

const EmployeeProfile: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: empData, isLoading } = useEmployee(id!);
  const { data: attendanceData, isLoading: attLoading } = useEmployeeAttendance(id!);
  const { data: leavesData, isLoading: leavesLoading } = useEmployeeLeaves(id!);
  const { data: payslipsData, isLoading: payslipsLoading } = useEmployeePayslips(id!);

  const emp: any = empData?.data ?? {};
  const attendance: any[] = attendanceData?.data ?? [];
  const leaves: any[] = leavesData?.data ?? [];
  const payslips: any[] = payslipsData?.data ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;
  }

  const name = emp.name || `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || 'Employee';
  const deptName = typeof emp.department === 'object' ? emp.department?.name : emp.department;
  const desigName = typeof emp.designation === 'object' ? emp.designation?.title : emp.designation;

  const attendanceColumns = [
    { title: t('date'), dataIndex: 'date', key: 'date', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: t('check_in'), dataIndex: 'checkIn', key: 'checkIn' },
    { title: t('check_out'), dataIndex: 'checkOut', key: 'checkOut' },
    { title: t('work_hours'), dataIndex: 'workHours', key: 'workHours', render: (h: number) => h ? `${h}h` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'present' ? 'green' : s === 'absent' ? 'red' : 'orange'}>{s}</Tag> },
  ];

  const leaveColumns = [
    { title: t('type'), dataIndex: 'leaveType', key: 'leaveType', render: (t: string) => <Tag>{t}</Tag> },
    { title: t('from_date'), dataIndex: 'fromDate', key: 'fromDate', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: t('to_date'), dataIndex: 'toDate', key: 'toDate', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    { title: t('total_days'), dataIndex: 'days', key: 'days' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>{s}</Tag> },
    { title: t('reason'), dataIndex: 'reason', key: 'reason' },
  ];

  const payslipColumns = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Basic', dataIndex: 'basic', key: 'basic', render: (v: number) => v ? `₹${v.toLocaleString()}` : '-' },
    { title: 'Allowances', dataIndex: 'allowances', key: 'allowances', render: (v: number) => v ? `₹${v.toLocaleString()}` : '-' },
    { title: t('deductions'), dataIndex: 'deductions', key: 'deductions', render: (v: number) => v ? `₹${v.toLocaleString()}` : '-' },
    { title: t('net_pay'), dataIndex: 'netPay', key: 'netPay', render: (v: number) => v ? `₹${v.toLocaleString()}` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag> },
  ];

  return (
    <div className="space-y-6">
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/employees')}>Back to Employees</Button>

      {/* Profile Header */}
      <Card bordered={false}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar size={80} className="bg-blue-600 text-2xl" src={emp.avatar}>
            {name.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Title level={4} className="!mb-0">{name}</Title>
              <Tag color={statusColor[emp.status] || 'default'}>{emp.status}</Tag>
            </div>
            <Text type="secondary" className="text-base">{desigName || 'No designation'}</Text>
            <div className="flex flex-wrap gap-4 mt-3">
              {emp.email && <Space><Mail size={14} className="text-gray-400" /><Text type="secondary">{emp.email}</Text></Space>}
              {emp.phone && <Space><Phone size={14} className="text-gray-400" /><Text type="secondary">{emp.phone}</Text></Space>}
              {deptName && <Space><Building2 size={14} className="text-gray-400" /><Text type="secondary">{deptName}</Text></Space>}
              {emp.joinDate && <Space><Calendar size={14} className="text-gray-400" /><Text type="secondary">Joined {new Date(emp.joinDate).toLocaleDateString()}</Text></Space>}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card bordered={false}>
        <Tabs items={[
          { key: 'overview', label: 'Overview', children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions title="Personal Information" column={1} bordered size="small">
                  <Descriptions.Item label="Full Name">{name}</Descriptions.Item>
                  <Descriptions.Item label="Email">{emp.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{emp.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">{emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{emp.gender || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Address">{emp.address || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions title="Emergency Contact" column={1} bordered size="small">
                  <Descriptions.Item label="Name">{emp.emergencyContact?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{emp.emergencyContact?.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Relation">{emp.emergencyContact?.relation || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          )},
          { key: 'employment', label: 'Employment', children: (
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Employee ID">{emp.employeeId || emp._id || '-'}</Descriptions.Item>
              <Descriptions.Item label="Department">{deptName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Designation">{desigName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Employment Type">{emp.employmentType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Join Date">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '-'}</Descriptions.Item>
              <Descriptions.Item label="Reporting Manager">{emp.reportingManager?.name || emp.reportingManager || '-'}</Descriptions.Item>
              <Descriptions.Item label="Work Location">{emp.workLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Shift">{emp.shift || '-'}</Descriptions.Item>
            </Descriptions>
          )},
          { key: 'bank', label: 'Bank & Documents', children: (
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Bank Name">{emp.bankName || emp.bankDetails?.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Account Number">{emp.accountNumber || emp.bankDetails?.accountNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="IFSC Code">{emp.ifscCode || emp.bankDetails?.ifscCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="PAN Number">{emp.panNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Aadhaar Number">{emp.aadhaarNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="UAN">{emp.uanNumber || '-'}</Descriptions.Item>
            </Descriptions>
          )},
          { key: 'attendance', label: 'Attendance', children: (
            <Table columns={attendanceColumns} dataSource={attendance} loading={attLoading} rowKey={(r: any) => r._id || r.id || r.date} pagination={{ pageSize: 10 }} />
          )},
          { key: 'leaves', label: 'Leaves', children: (
            <Table columns={leaveColumns} dataSource={leaves} loading={leavesLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
          )},
          { key: 'payslips', label: 'Payslips', children: (
            <Table columns={payslipColumns} dataSource={payslips} loading={payslipsLoading} rowKey={(r: any) => r._id || r.id || r.month} pagination={{ pageSize: 10 }} />
          )},
        ]} />
      </Card>
    </div>
  );
};

export default EmployeeProfile;
