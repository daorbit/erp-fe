import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Switch, App, Button, Typography, Space, Modal } from 'antd';
import { ArrowLeft, Link2, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import companyService from '@/services/companyService';
import { useCreateInvitation } from '@/hooks/queries/useInvitations';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const baseRoleOptions = [
  { value: 'viewer', label: 'Viewer (Read-only)' },
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_manager', label: 'HR Manager' },
];

const InviteUserForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createInviteMutation = useCreateInvitation();
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

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

  const handleSubmit = async (values: any) => {
    try {
      const result = await createInviteMutation.mutateAsync(values);
      const link = result?.data?.invitationLink;
      form.resetFields();
      if (link) setInvitationLink(link);
      else {
        message.success('Invitation created');
        navigate('/admin/users');
      }
    } catch (err: any) {
      message.error(err?.message || 'Failed to create invitation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/admin/users')} />
        <Title level={4} className="!mb-0">Invite User</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
            A unique invitation link will be generated. Share it with the user — they'll set up their own name and password. Link expires in 3 days.
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="user@company.com" />
            </Form.Item>
            <Form.Item name="role" label={t('role')} rules={[{ required: true }]} initialValue="employee">
              <Select placeholder="Select role" options={roleOptions} />
            </Form.Item>
            {isSuperAdmin && (
              <Form.Item noStyle shouldUpdate={(prev: any, cur: any) => prev.role !== cur.role}>
                {({ getFieldValue }: any) => getFieldValue('role') !== 'super_admin' ? (
                  <Form.Item name="company" label={t('company')} rules={[{ required: true, message: 'Please select a company' }]}>
                    <Select placeholder="Select company" allowClear showSearch optionFilterProp="label"
                      options={companies.map((c: any) => ({ value: c._id || c.id, label: `${c.name} (${c.code})` }))} />
                  </Form.Item>
                ) : null}
              </Form.Item>
            )}
            <Form.Item name="onboardingRequired" label="Require Onboarding (KYC)" valuePropName="checked" initialValue={false}>
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate('/admin/users')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={createInviteMutation.isPending}>Send Invite</Button>
            </Space>
          </Form>
        </Card>
      </div>

      <Modal
        title={<span className="flex items-center gap-2"><Link2 size={18} /> Invitation Link Created</span>}
        open={!!invitationLink}
        onCancel={() => { setInvitationLink(null); navigate('/admin/users'); }}
        footer={<Button onClick={() => { setInvitationLink(null); navigate('/admin/users'); }}>Done</Button>}
        width={560}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">Share this link with the user. It expires in <strong>3 days</strong> and can only be used once.</p>
          <div className="flex gap-2">
            <Input value={invitationLink || ''} readOnly className="font-mono text-xs" />
            <Button type="primary" icon={<Copy size={14} />} onClick={() => { navigator.clipboard.writeText(invitationLink!); message.success('Link copied'); }}>Copy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InviteUserForm;
