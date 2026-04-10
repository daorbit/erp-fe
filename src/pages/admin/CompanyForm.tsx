import React, { useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Select, Switch, App, Button, Space } from 'antd';
import { useCreateCompany, useUpdateCompany } from '@/hooks/queries/useCompanies';
import { useTranslation } from '@/hooks/useTranslation';

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

const subscriptionOptions = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
];

const CompanyForm: React.FC<CompanyFormProps> = ({ open, onClose, editData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const isEdit = !!editData;

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        code: editData.code,
        email: editData.email,
        phone: editData.phone,
        website: editData.website,
        industry: editData.industry,
        logo: editData.logo,
        contactPerson: editData.contactPerson,
        gstNumber: editData.gstNumber,
        panNumber: editData.panNumber,
        maxEmployees: editData.maxEmployees,
        subscription: editData.subscription,
        isActive: editData.isActive ?? true,
        street: editData.address?.street,
        city: editData.address?.city,
        state: editData.address?.state,
        country: editData.address?.country,
        zipCode: editData.address?.zipCode,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        name: values.name,
        code: values.code,
        email: values.email,
        phone: values.phone,
        website: values.website,
        industry: values.industry,
        logo: values.logo,
        contactPerson: values.contactPerson,
        gstNumber: values.gstNumber,
        panNumber: values.panNumber,
        maxEmployees: values.maxEmployees,
        subscription: values.subscription,
        isActive: values.isActive,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          zipCode: values.zipCode,
        },
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData._id || editData.id, data: payload });
        message.success('Company updated');
      } else {
        delete payload.isActive;
        await createMutation.mutateAsync(payload);
        message.success('Company created');
      }
      onClose();
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} company`);
    }
  };

  return (
    <Drawer
      title={isEdit ? `${t('edit')} ${t('company')}` : `${t('add')} ${t('company')}`}
      open={open}
      onClose={onClose}
      width={600}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            type="primary"
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={() => form.submit()}
          >
            {t('save')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true, country: 'India', subscription: 'free' }}>
        {/* Basic Info */}
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{t('basic_info')}</div>
        <Form.Item name="name" label={t('company_name')} rules={[{ required: true, message: 'Company name is required' }]}>
          <Input placeholder="e.g. Acme Corp" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="code" label={t('company_code')} rules={[{ required: true, message: 'Company code is required' }]}>
            <Input placeholder="e.g. ACME" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="industry" label={t('industry')}>
            <Input placeholder="e.g. Technology" />
          </Form.Item>
        </div>
        <Form.Item name="logo" label={t('logo_url')}>
          <Input placeholder="https://acme.com/logo.png" />
        </Form.Item>

        {/* Contact */}
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-5">{t('contact_info')}</div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="email" label={t('email')} rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="info@acme.com" />
          </Form.Item>
          <Form.Item name="phone" label={t('phone')}>
            <Input placeholder="+91 9999999999" />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="contactPerson" label={t('contact_person')}>
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="website" label={t('website')}>
            <Input placeholder="https://acme.com" />
          </Form.Item>
        </div>

        {/* Tax & Legal */}
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-5">{t('tax_legal')}</div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="gstNumber" label={t('gst_number')}>
            <Input placeholder="22AAAAA0000A1Z5" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="panNumber" label={t('pan_number')}>
            <Input placeholder="AAAAA0000A" maxLength={10} style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </div>

        {/* Subscription */}
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-5">{t('subscription')}</div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="subscription" label={t('plan')}>
            <Select options={subscriptionOptions} />
          </Form.Item>
          <Form.Item name="maxEmployees" label={t('max_employees')}>
            <InputNumber placeholder="e.g. 100" min={1} className="!w-full" />
          </Form.Item>
        </div>

        {/* Address */}
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 mt-5">{t('address')}</div>
        <Form.Item name="street" label={t('street')}>
          <Input placeholder="123 Main St" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="city" label={t('city')}>
            <Input placeholder="Mumbai" />
          </Form.Item>
          <Form.Item name="state" label={t('state')}>
            <Input placeholder="Maharashtra" />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="country" label={t('country')}>
            <Input placeholder="India" />
          </Form.Item>
          <Form.Item name="zipCode" label={t('zip_code')}>
            <Input placeholder="400001" />
          </Form.Item>
        </div>

        {isEdit && (
          <Form.Item name="isActive" label={t('active')} valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CompanyForm;
