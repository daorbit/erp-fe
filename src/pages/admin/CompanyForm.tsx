import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, App, Button, Avatar, Upload as AntUpload } from 'antd';
import { Upload, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateCompany, useUpdateCompany, useCompanyList } from '@/hooks/queries/useCompanies';
import { useUploadImage } from '@/hooks/queries/useUpload';
import { useTranslation } from '@/hooks/useTranslation';

const subscriptionOptions = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
];

const CompanyForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const uploadMutation = useUploadImage();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { data: companyData } = useCompanyList();

  const isEdit = !!id;
  const editData = isEdit ? (companyData?.data ?? []).find((c: any) => (c._id || c.id) === id) : null;

  useEffect(() => {
    if (editData?.logo) setLogoPreview(editData.logo);
    else setLogoPreview(null);
  }, [editData]);

  const handleLogoUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({ file, folder: 'logos' });
      const url = result.data?.url;
      if (url) {
        setLogoPreview(url);
        form.setFieldsValue({ logo: url });
      }
    } catch {
      message.error('Failed to upload logo');
    }
  };

  useEffect(() => {
    if (editData) {
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
    }
  }, [editData, form]);

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
      navigate('/admin/companies');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'create'} company`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/admin/companies')} />
        <h2 className="text-xl font-semibold m-0">{isEdit ? `${t('edit')} ${t('company')}` : `${t('add')} ${t('company')}`}</h2>
      </div>
      <Card bordered={false} className="max-w-3xl">
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
        <Form.Item name="logo" hidden><Input /></Form.Item>
        <Form.Item label={t('logo_url')}>
          <div className="flex items-center gap-4">
            <AntUpload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => { handleLogoUpload(file); return false; }}
            >
              {logoPreview ? (
                <div className="relative group cursor-pointer">
                  <Avatar shape="square" size={64} src={logoPreview} className="border" />
                  <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={18} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  {uploadMutation.isPending
                    ? <span className="text-[10px] text-gray-400">Uploading...</span>
                    : <Upload size={20} className="text-gray-400" />
                  }
                </div>
              )}
            </AntUpload>
            <div className="text-xs text-gray-400">Click to upload company logo<br />JPEG, PNG, WebP (max 5MB)</div>
          </div>
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

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => navigate('/admin/companies')}>{t('cancel')}</Button>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? t('save') : t('add')} {t('company')}
          </Button>
        </div>
      </Form>
      </Card>
    </div>
  );
};

export default CompanyForm;
