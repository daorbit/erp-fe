import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Tag, Tabs, Typography, Row, Col, Descriptions, Table, Spin, Space, Button, Drawer, Form, Input, Select, DatePicker, App } from 'antd';
import { Mail, Phone, Calendar, Building2, ArrowLeft, Edit2, Briefcase, Camera } from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEmployee, useEmployeeAttendance, useEmployeeLeaves, useEmployeePayslips, useUpdateEmployee } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useShiftList } from '@/hooks/queries/useShifts';
import { useUploadImage } from '@/hooks/queries/useUpload';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EmployeeProfile: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadImage();

  // Auto-open edit drawer if ?edit=true
  const { data: empData, isLoading } = useEmployee(id!);
  const { data: attendanceData, isLoading: attLoading } = useEmployeeAttendance(id!);
  const { data: leavesData, isLoading: leavesLoading } = useEmployeeLeaves(id!);
  const { data: payslipsData, isLoading: payslipsLoading } = useEmployeePayslips(id!);
  const { data: deptData } = useDepartmentList();
  const { data: desigData } = useDesignationList();
  const { data: shiftData } = useShiftList();
  const updateMutation = useUpdateEmployee();

  const departments: any[] = deptData?.data ?? [];
  const designations: any[] = desigData?.data ?? [];
  const shiftOptions: any[] = shiftData?.data ?? [];
  const emp: any = empData?.data ?? {};
  const attendance: any[] = attendanceData?.data ?? [];
  const leaves: any[] = leavesData?.data ?? [];
  const payslips: any[] = payslipsData?.data ?? [];

  // Extract from populated userId
  const u = emp.userId || {};
  const name = `${u.firstName || emp.firstName || ''} ${u.lastName || emp.lastName || ''}`.trim() || 'Employee';
  const email = u.email || emp.email || '';
  const phone = u.phone || emp.phone || '';
  const dept = u.department || {};
  const desig = u.designation || {};
  const deptName = typeof dept === 'object' ? dept.name : dept;
  const desigName = typeof desig === 'object' ? desig.title : desig;
  const avatar = u.avatar || emp.avatar;
  const role = u.role;

  // Auto-open edit drawer when navigated with ?edit=true
  useEffect(() => {
    if (searchParams.get('edit') === 'true' && empData?.data && !editOpen) {
      setEditOpen(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empData, searchParams]);

  // Populate form when edit drawer opens
  useEffect(() => {
    if (editOpen && emp?._id) {
      form.setFieldsValue({
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        department: dept?._id || dept,
        designation: desig?._id || desig,
        employmentType: emp.employmentType,
        workLocation: emp.workLocation,
        shift: emp.shift?._id || emp.shift,
        joinDate: emp.joinDate ? dayjs(emp.joinDate) : undefined,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen]);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>;

  const openEdit = () => {
    setEditOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: 'avatars' });
      const avatarUrl = result.data?.url;
      if (avatarUrl) {
        await api.put('/auth/profile', { avatar: avatarUrl });
        message.success('Avatar updated');
        window.location.reload();
      }
    } catch {
      message.error('Failed to upload avatar');
    }
    e.target.value = '';
  };

  const handleUpdate = async (values: any) => {
    try {
      await updateMutation.mutateAsync({
        id: id!,
        data: {
          ...values,
          joinDate: values.joinDate?.format?.('YYYY-MM-DD') ?? values.joinDate,
        },
      });
      message.success('Employee updated');
      setEditOpen(false);
    } catch { message.error('Failed to update'); }
  };

  const attendanceColumns = [
    { title: t('date'), dataIndex: 'date', key: 'date', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: t('check_in'), dataIndex: 'checkIn', key: 'checkIn', render: (v: string) => v ? dayjs(v).format('h:mm A') : '-' },
    { title: t('check_out'), dataIndex: 'checkOut', key: 'checkOut', render: (v: string) => v ? dayjs(v).format('h:mm A') : '-' },
    { title: t('work_hours'), dataIndex: 'workHours', key: 'workHours', render: (h: number) => h ? `${h.toFixed(1)}h` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'present' ? 'green' : s === 'absent' ? 'red' : 'orange'}>{s?.replace('_', ' ')}</Tag> },
  ];

  const leaveColumns = [
    { title: t('type'), dataIndex: 'leaveType', key: 'leaveType', render: (lt: any) => <Tag>{typeof lt === 'object' ? lt?.name : lt}</Tag> },
    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: (d: string) => d ? dayjs(d).format('DD MMM YYYY') : '-' },
    { title: 'Days', dataIndex: 'totalDays', key: 'totalDays' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>{s}</Tag> },
    { title: t('reason'), dataIndex: 'reason', key: 'reason', ellipsis: true },
  ];

  const payslipColumns = [
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: 'Gross', dataIndex: 'grossEarnings', key: 'gross', render: (v: number) => v ? `₹${v.toLocaleString('en-IN')}` : '-' },
    { title: t('deductions'), dataIndex: 'totalDeductions', key: 'deductions', render: (v: number) => v ? `₹${v.toLocaleString('en-IN')}` : '-' },
    { title: t('net_pay'), dataIndex: 'netPay', key: 'netPay', render: (v: number) => v ? `₹${v.toLocaleString('en-IN')}` : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'paid' ? 'green' : s === 'approved' ? 'blue' : 'orange'}>{s}</Tag> },
  ];

  return (
    <div className="space-y-6">
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/employees')}>Back to Employees</Button>

      {/* Profile Header */}
      <Card bordered={false}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <Avatar size={80} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl" src={avatar}>
              {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadMutation.isPending ? <Spin size="small" /> : <Camera size={20} className="text-white" />}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <Title level={4} className="!mb-0">{name}</Title>
              <Tag color={emp.isActive ? 'green' : 'red'}>{emp.isActive ? 'Active' : 'Inactive'}</Tag>
              {role && <Tag color="blue">{role.replace('_', ' ')}</Tag>}
            </div>
            <Text type="secondary" className="text-base">{desigName || 'No designation'}</Text>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              {email && <Space><Mail size={14} className="text-gray-400" /><Text type="secondary" className="text-sm">{email}</Text></Space>}
              {phone && <Space><Phone size={14} className="text-gray-400" /><Text type="secondary" className="text-sm">{phone}</Text></Space>}
              {deptName && <Space><Building2 size={14} className="text-gray-400" /><Text type="secondary" className="text-sm">{deptName}</Text></Space>}
              {emp.employeeId && <Space><Briefcase size={14} className="text-gray-400" /><Text type="secondary" className="text-sm">{emp.employeeId}</Text></Space>}
              {emp.joinDate && <Space><Calendar size={14} className="text-gray-400" /><Text type="secondary" className="text-sm">Joined {dayjs(emp.joinDate).format('DD MMM YYYY')}</Text></Space>}
            </div>
          </div>
          <Button icon={<Edit2 size={14} />} onClick={openEdit}>Edit</Button>
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
                  <Descriptions.Item label="Email">{email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">{emp.dateOfBirth ? dayjs(emp.dateOfBirth).format('DD MMM YYYY') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{emp.gender || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Marital Status">{emp.maritalStatus || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Blood Group">{emp.bloodGroup || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Nationality">{emp.nationality || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions title="Address" column={1} bordered size="small">
                  <Descriptions.Item label="Current Address">
                    {emp.currentAddress ? `${emp.currentAddress.street || ''}, ${emp.currentAddress.city || ''}, ${emp.currentAddress.state || ''} ${emp.currentAddress.zipCode || ''}`.replace(/^[, ]+|[, ]+$/g, '') || '-' : '-'}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Emergency Contact" column={1} bordered size="small" className="mt-4">
                  <Descriptions.Item label="Name">{emp.emergencyContact?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{emp.emergencyContact?.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Relationship">{emp.emergencyContact?.relationship || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          )},
          { key: 'employment', label: 'Employment', children: (
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Employee ID">{emp.employeeId || '-'}</Descriptions.Item>
              <Descriptions.Item label="Department">{deptName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Designation">{desigName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Employment Type">{emp.employmentType?.replace('_', ' ') || '-'}</Descriptions.Item>
              <Descriptions.Item label="Join Date">{emp.joinDate ? dayjs(emp.joinDate).format('DD MMM YYYY') : '-'}</Descriptions.Item>
              <Descriptions.Item label="Reporting Manager">
                {emp.reportingManager ? `${emp.reportingManager.firstName || ''} ${emp.reportingManager.lastName || ''}`.trim() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Work Location">{emp.workLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Shift">{typeof emp.shift === 'object' ? `${emp.shift?.name} (${emp.shift?.startTime} - ${emp.shift?.endTime})` : (emp.workShift || '-')}</Descriptions.Item>
            </Descriptions>
          )},
          { key: 'bank', label: 'Bank & ID', children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Descriptions title="Bank Details" column={1} bordered size="small">
                  <Descriptions.Item label="Bank Name">{emp.bankDetails?.bankName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Account Number">{emp.bankDetails?.accountNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="IFSC Code">{emp.bankDetails?.ifscCode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Branch">{emp.bankDetails?.branchName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Account Type">{emp.bankDetails?.accountType || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions title="Identity Documents" column={1} bordered size="small">
                  <Descriptions.Item label="Aadhaar">{emp.identityDocs?.aadhaarNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="PAN">{emp.identityDocs?.panNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Passport">{emp.identityDocs?.passportNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Driving License">{emp.identityDocs?.drivingLicense || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          )},
          { key: 'attendance', label: `Attendance (${attendance.length})`, children: (
            <Table columns={attendanceColumns} dataSource={attendance} loading={attLoading} rowKey={(r: any) => r._id || r.date} pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
          )},
          { key: 'leaves', label: `Leaves (${leaves.length})`, children: (
            <Table columns={leaveColumns} dataSource={leaves} loading={leavesLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
          )},
          { key: 'payslips', label: `Payslips (${payslips.length})`, children: (
            <Table columns={payslipColumns} dataSource={payslips} loading={payslipsLoading} rowKey={(r: any) => r._id || r.id} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
          )},
        ]} />
      </Card>

      {/* Edit Drawer */}
      <Drawer
        title={`Edit: ${name}`}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={520}
        destroyOnClose
        extra={<Space><Button onClick={() => setEditOpen(false)}>Cancel</Button><Button type="primary" loading={updateMutation.isPending} onClick={() => form.submit()}>Save</Button></Space>}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="firstName" label="First Name"><Input /></Form.Item>
            <Form.Item name="lastName" label="Last Name"><Input /></Form.Item>
          </div>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="department" label="Department">
              <Select allowClear showSearch optionFilterProp="label" options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
            </Form.Item>
            <Form.Item name="designation" label="Designation">
              <Select allowClear showSearch optionFilterProp="label" options={designations.map((d: any) => ({ value: d._id || d.id, label: d.title }))} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="employmentType" label="Employment Type">
              <Select options={['full_time', 'part_time', 'contract', 'intern'].map(t => ({ value: t, label: t.replace('_', ' ') }))} />
            </Form.Item>
            <Form.Item name="joinDate" label="Join Date"><DatePicker className="w-full" /></Form.Item>
          </div>
          <Form.Item name="workLocation" label="Work Location"><Input /></Form.Item>
          <Form.Item name="shift" label="Shift">
            <Select
              placeholder="Select shift"
              allowClear
              options={shiftOptions.map((s: any) => ({
                value: s._id || s.id,
                label: `${s.name} (${s.startTime} - ${s.endTime})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default EmployeeProfile;
