import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, App, Button, Typography, Space, Modal } from 'antd';
import { ArrowLeft, Link2, Copy } from 'lucide-react';
import { useCreateInvitation } from '@/hooks/queries/useInvitations';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const InviteUserForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createInviteMutation = useCreateInvitation();
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      const result = await createInviteMutation.mutateAsync(values);
      const link = result?.data?.invitationLink;
      form.resetFields();
      if (link) setInvitationLink(link);
      else {
        message.success('Invitation created');
        navigate('/employees');
      }
    } catch (err: any) {
      message.error(err?.message || 'Failed to create invitation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/employees')} />
        <Title level={4} className="!mb-0">Invite User</Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card bordered={false}>
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
            A unique invitation link will be generated. Share it with the user — they'll set up their own name and password.
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input placeholder="user@company.com" />
            </Form.Item>
            <Form.Item name="role" label={t('role')} rules={[{ required: true }]} initialValue="employee">
              <Select placeholder="Select role" options={[
                { value: 'viewer', label: 'Viewer (Read-only)' },
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
                { value: 'hr_manager', label: 'HR Manager' },
                { value: 'admin', label: 'Company Admin' },
              ]} />
            </Form.Item>
            <Space>
              <Button onClick={() => navigate('/employees')}>{t('cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={createInviteMutation.isPending}>Send Invite</Button>
            </Space>
          </Form>
        </Card>
      </div>

      <Modal
        title={<span className="flex items-center gap-2"><Link2 size={18} /> Invitation Link Created</span>}
        open={!!invitationLink}
        onCancel={() => { setInvitationLink(null); navigate('/employees'); }}
        footer={<Button onClick={() => { setInvitationLink(null); navigate('/employees'); }}>Done</Button>}
        width={560}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">Share this link with the user. It expires in <strong>48 hours</strong>.</p>
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
