import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Drawer, Form, Select, Upload, Tabs, Typography, Space, Popconfirm } from 'antd';
import { App } from 'antd';
import { Plus, Search, Download, Trash2, Upload as UploadIcon, FileText } from 'lucide-react';
import { useDocumentList, useUploadDocument, useDeleteDocument } from '@/hooks/queries/useDocuments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const categoryColor: Record<string, string> = {
  policy: 'blue', contract: 'purple', identity: 'green', certificate: 'gold', other: 'default',
};

const DocumentList: React.FC = () => {
  const { t } = useTranslation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data, isLoading } = useDocumentList({ category: activeTab === 'all' ? undefined : activeTab });
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const documents: any[] = data?.data ?? [];
  const filtered = documents.filter((d: any) =>
    d.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleUpload = async (values: any) => {
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
      form.resetFields();
      setUploadOpen(false);
    } catch {
      message.error('Failed to upload document');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Document deleted');
    } catch {
      message.error('Failed to delete document');
    }
  };

  const columns = [
    {
      title: 'Title', dataIndex: 'title', key: 'title',
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <FileText size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{r.title}</div>
            {r.fileName && <div className="text-xs text-gray-400">{r.fileName}</div>}
          </div>
        </div>
      ),
    },
    { title: t('category'), dataIndex: 'category', key: 'category', render: (c: string) => <Tag color={categoryColor[c] ?? 'default'}>{c}</Tag> },
    { title: 'Uploaded By', dataIndex: 'uploadedBy', key: 'uploadedBy', render: (u: any) => typeof u === 'string' ? u : u?.name ?? '-' },
    { title: t('date'), dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
    {
      title: t('actions'), key: 'actions', width: 120,
      render: (_: any, r: any) => (
        <Space>
          {r.fileUrl && <Button type="text" size="small" icon={<Download size={16} />} href={r.fileUrl} target="_blank" />}
          <Popconfirm title="Delete this document?" onConfirm={() => handleDelete(r._id ?? r.id)} okText="Yes" cancelText="No">
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('documents')}</Title>
          <Text type="secondary">{t('manage_documents')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setUploadOpen(true)}>{t('upload_document')}</Button>
      </div>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: 'All Documents' },
          { key: 'policy', label: 'Policies' },
          { key: 'certificate', label: 'Certificates' },
          { key: 'id_proof', label: 'ID Proofs' },
        ]} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input prefix={<Search size={16} />} placeholder={`${t('search')}...`} value={searchText} onChange={e => setSearchText(e.target.value)} className="max-w-xs" />
        </div>
        <Table columns={columns} dataSource={filtered} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Drawer title="Upload Document" open={uploadOpen} onClose={() => setUploadOpen(false)} width={520} destroyOnClose extra={<Space><Button onClick={() => setUploadOpen(false)}>{t('cancel')}</Button><Button type="primary" loading={uploadMutation.isPending} onClick={() => form.submit()}>{t('upload_document')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleUpload}>
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
        </Form>
      </Drawer>
    </div>
  );
};

export default DocumentList;
