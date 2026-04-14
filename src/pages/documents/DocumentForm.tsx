import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Upload, App, Button, Typography } from 'antd';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { useUploadDocument } from '@/hooks/queries/useDocuments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DocumentForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const uploadMutation = useUploadDocument();

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]: any) => {
        if (key === 'file' && val?.fileList?.[0]) {
          formData.append('file', val.fileList[0].originFileObj);
        } else if (val) {
          formData.append(key, val);
        }
      });
      await uploadMutation.mutateAsync(formData);
      message.success('Document uploaded');
      navigate('/documents');
    } catch (err: any) {
      message.error(err?.message || 'Failed to upload document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/documents')} />
        <Title level={4} className="!mb-0">{t('upload_document')}</Title>
      </div>
      <Card bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="max-w-2xl">
          <Form.Item name="title" label="Document Title" rules={[{ required: true }]}>
            <Input placeholder="Enter document title" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category" options={[
              { value: 'policy', label: 'Policy' },
              { value: 'template', label: 'Template' },
              { value: 'letter', label: 'Letter' },
              { value: 'certificate', label: 'Certificate' },
              { value: 'id_proof', label: 'ID Proof' },
              { value: 'address_proof', label: 'Address Proof' },
              { value: 'educational', label: 'Educational' },
              { value: 'experience', label: 'Experience' },
              { value: 'other', label: 'Other' },
            ]} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description" />
          </Form.Item>
          <Form.Item name="file" label="File" rules={[{ required: true }]} valuePropName="file">
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <div className="flex flex-col items-center gap-2 py-4">
                <UploadIcon size={24} className="text-gray-400" />
                <Text>Click or drag file to upload</Text>
              </div>
            </Upload.Dragger>
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/documents')}>{t('cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={uploadMutation.isPending}>{t('upload_document')}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DocumentForm;
