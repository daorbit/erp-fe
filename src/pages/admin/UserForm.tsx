import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Switch, App, Button, Typography, Space, Upload as AntUpload, Avatar } from 'antd';
import { ArrowLeft, Camera } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import authService from '@/services/authService';
import companyService from '@/services/companyService';
import { useUploadImage } from '@/hooks/queries/useUpload';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';
import { useTranslation } from '@/hooks/useTranslation';

const { Title } = Typography;

const baseRoleOptions = [
  { value: 'viewer', label: 'Viewer (Read-only)' },
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_manager', label: 'HR Manager' },
];

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadImage();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isCompanyAdmin = currentUser?.role === UserRole.ADMIN;

  const roleOptions = [
    ...baseRoleOptions,
    ...((isSuperAdmin || isCompanyAdmin) ? [{ value: 'admin', label: 'Company Admin' }] : []),
    ...(isSuperAdmin ? [{ value: 'super_admin', label: 'Platform Admin' }] : []),
  ];

  const { data: companyData } = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: () => companyService.getAll(),
    enabled: isSuperAdmin,
  });
  const companies: any[] = companyData?.data ?? [];

  const createUserMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: 'avatars' });
      const url = result.data?.url;
      if (url) {
        setAvatarPreview(url);
        form.setFieldsValue({ avatar: url });
      }
    } catch {
      message.error('Failed to upload photo');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      await createUserMutation.mutateAsync(values);
      message.success('User created successfully');
      navigate('/admin/users');
    } catch (err: any) {
      message.error(err?.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/admin/users')} />
        <Title level={4} className="!mb-0">{t('add_user')}</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form Fields */}
        <div className="lg:col-span-2">
          <Card bordered={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="avatar" hidden><Input /></Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter first name" />
                </Form.Item>
                <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="Enter email" />
                </Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
                  <Input.Password placeholder="Min 8 characters" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="phone" label={t('phone')}>
                  <Input placeholder="+91 9999999999" />
                </Form.Item>
                <Form.Item name="role" label={t('role')} rules={[{ required: true }]} initialValue="employee">
                  <Select placeholder="Select role" options={roleOptions} />
                </Form.Item>
              </div>
              {isSuperAdmin && (
                <Form.Item noStyle shouldUpdate={(prev: any, cur: any) => prev.role !== cur.role}>
                  {({ getFieldValue }: any) => getFieldValue('role') !== 'super_admin' ? (
                    <Form.Item name="company" label={t('company')} rules={[{ required: true, message: 'Please select a company' }]}>
                      <Select placeholder="Select company" allowClear showSearch optionFilterProp="label" disabled={!companies.length}
                        options={companies.map((c: any) => ({ value: c._id || c.id, label: `${c.name} (${c.code})` }))} />
                    </Form.Item>
                  ) : null}
                </Form.Item>
              )}
              <Form.Item name="onboardingRequired" label="Require Onboarding (KYC)" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
              <Space className="mt-2">
                <Button onClick={() => navigate('/admin/users')}>{t('cancel')}</Button>
                <Button type="primary" htmlType="submit" loading={createUserMutation.isPending}>{t('save')}</Button>
              </Space>
            </Form>
          </Card>
        </div>

        {/* Right: Avatar Upload */}
        <div>
          <Card bordered={false}>
            <div className="flex flex-col items-center gap-3">
              <AntUpload showUploadList={false} accept="image/*" beforeUpload={(file) => { handleAvatarUpload(file); return false; }}>
                {avatarPreview ? (
                  <div className="relative group cursor-pointer">
                    <Avatar size={100} src={avatarPreview} />
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                    {uploadMutation.isPending
                      ? <span className="text-xs text-gray-400">Uploading...</span>
                      : <><Camera size={28} className="text-gray-400" /><span className="text-[10px] text-gray-400 mt-1">Upload Photo</span></>
                    }
                  </div>
                )}
              </AntUpload>
              <span className="text-xs text-gray-400 text-center">Click to upload avatar<br />JPEG, PNG (max 5MB)</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
