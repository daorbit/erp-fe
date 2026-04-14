import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, App, Button, Typography, Space, Tabs } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useCreateEmployee, useEmployeeList } from '@/hooks/queries/useEmployees';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useDesignationList } from '@/hooks/queries/useDesignations';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const EmployeeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateEmployee();

  const { data: deptData } = useDepartmentList();
  const { data: desigData } = useDesignationList();
  const { data: empData } = useEmployeeList();
  const departments: any[] = deptData?.data ?? [];
  const designations: any[] = desigData?.data ?? [];
  const employees: any[] = empData?.data ?? [];

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.format?.('YYYY-MM-DD') ?? values.dateOfBirth,
        department: values.department,
        designation: values.designation,
        employmentType: values.employmentType,
        joinDate: values.joinDate?.format?.('YYYY-MM-DD') ?? values.joinDate,
        reportingManager: values.reportingManager,
      };
      if (values.bankName || values.accountNumber || values.ifscCode) {
        payload.bankDetails = {
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          ifscCode: values.ifscCode,
        };
      }
      if (values.panNumber) {
        payload.identityDocs = { panNumber: values.panNumber };
      }
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await createMutation.mutateAsync(payload);
      message.success('Employee created successfully');
      navigate('/employees');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/employees')} />
        <Title level={4} className="!mb-0">{t('add_employee')}</Title>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Tabs items={[
            { key: 'personal', label: 'Personal Info', children: (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item>
                </div>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="phone" label="Phone"><Input /></Form.Item>
                  <Form.Item name="dateOfBirth" label="Date of Birth"><DatePicker className="w-full" /></Form.Item>
                </div>
                <Form.Item name="gender" label="Gender"><Select options={['male', 'female', 'other'].map(g => ({ value: g, label: g }))} /></Form.Item>
              </>
            )},
            { key: 'employment', label: 'Employment', children: (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                    <Select options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
                  </Form.Item>
                  <Form.Item name="designation" label="Designation">
                    <Select placeholder="Select designation" allowClear showSearch optionFilterProp="label" options={designations.map((d: any) => ({ value: d._id || d.id, label: d.title }))} />
                  </Form.Item>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item name="employmentType" label="Employment Type">
                    <Select options={['full_time', 'part_time', 'contract', 'intern'].map(t => ({ value: t, label: t }))} />
                  </Form.Item>
                  <Form.Item name="joinDate" label="Join Date"><DatePicker className="w-full" /></Form.Item>
                </div>
                <Form.Item name="reportingManager" label="Reporting Manager">
                  <Select placeholder="Select manager" allowClear showSearch optionFilterProp="label" options={employees.map((e: any) => ({ value: e._id || e.userId?._id || e.id, label: `${e.userId?.firstName || e.firstName || ''} ${e.userId?.lastName || e.lastName || ''}`.trim() }))} />
                </Form.Item>
              </>
            )},
            { key: 'bank', label: 'Bank Details', children: (
              <>
                <Form.Item name="bankName" label="Bank Name"><Input /></Form.Item>
                <Form.Item name="accountNumber" label="Account Number"><Input /></Form.Item>
                <Form.Item name="ifscCode" label="IFSC Code"><Input /></Form.Item>
                <Form.Item name="panNumber" label="PAN Number"><Input /></Form.Item>
              </>
            )},
          ]} />
          <Space className="mt-4">
            <Button onClick={() => navigate('/employees')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>{t('add_employee')}</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EmployeeForm;
