import React, { useState } from 'react';
import { Card, Table, Tag, Button, Input, Tabs, Typography, Space, Popconfirm } from 'antd';
import { App } from 'antd';
import { Plus, Search, Download, Trash2, FileText } from 'lucide-react';
import { useDocumentList, useDeleteDocument } from '@/hooks/queries/useDocuments';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';
import { UserRole } from '@/types/enums';

const { Title, Text } = Typography;

const categoryColor: Record<string, string> = {
  policy: 'blue', contract: 'purple', identity: 'green', certificate: 'gold', other: 'default',
};

const DocumentList: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { message } = App.useApp();
  const navigate = useNavigate();

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HR_MANAGER;
  const isManager = isAdmin || currentUser?.role === UserRole.MANAGER;
  const isViewer = currentUser?.role === UserRole.VIEWER;

  const { data, isLoading } = useDocumentList({ category: activeTab === 'all' ? undefined : activeTab });
  const deleteMutation = useDeleteDocument();

  const documents: any[] = data?.data ?? [];
  const filtered = documents.filter((d: any) =>
    d.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Document deleted');
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete document');
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
          {isAdmin && (
            <Popconfirm title="Delete this document?" onConfirm={() => handleDelete(r._id ?? r.id)} okText="Yes" cancelText="No">
              <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
            </Popconfirm>
          )}
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
        {isAdmin && <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/documents/upload')}>{t('upload_document')}</Button>}
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
        <Table columns={columns} dataSource={filtered} rowKey={(r: any) => r._id ?? r.id} loading={isLoading} pagination={{ pageSize: 10 }} size="middle" scroll={{ x: 700 }} />
      </Card>

    </div>
  );
};

export default DocumentList;
