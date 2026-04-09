import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, InputNumber, Drawer, Form, Select, Typography, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Briefcase } from 'lucide-react';
import { useDesignationList, useCreateDesignation, useUpdateDesignation, useDeleteDesignation } from '@/hooks/queries/useDesignations';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DesignationList: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: desigData, isLoading } = useDesignationList();
  const { data: deptData } = useDepartmentList();
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();

  const designations: any[] = desigData?.data ?? [];
  const departments: any[] = deptData?.data ?? [];
  const filtered = designations.filter((d: any) => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.code?.toLowerCase().includes(search.toLowerCase()));

  const isEdit = !!editRecord;

  useEffect(() => {
    if (modalOpen && editRecord) {
      form.setFieldsValue({
        title: editRecord.title,
        code: editRecord.code,
        department: typeof editRecord.department === 'object' ? editRecord.department?._id : editRecord.department,
        level: editRecord.level,
        band: editRecord.band,
        status: editRecord.status,
      });
    } else if (modalOpen) {
      form.resetFields();
    }
  }, [modalOpen, editRecord, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        level: values.level != null ? Number(values.level) : undefined,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editRecord._id || editRecord.id, data: payload });
        message.success('Designation updated');
      } else {
        // Remove 'status' - not in createDesignationSchema
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Designation created');
      }
      setModalOpen(false);
      setEditRecord(null);
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} designation`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Designation deleted');
    } catch {
      message.error('Failed to delete designation');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c || '-'}</Tag> },
    { title: t('department'), dataIndex: 'department', key: 'department', render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : (d || '-')}</Tag> },
    { title: 'Level', dataIndex: 'level', key: 'level', render: (l: any) => l ?? '-' },
    { title: 'Band', dataIndex: 'band', key: 'band', render: (b: string) => b ? <Tag color="purple">{b}</Tag> : '-' },
    { title: t('status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: t('actions'), key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: t('edit'), onClick: () => { setEditRecord(r); setModalOpen(true); } },
          { key: 'delete', icon: <Trash2 size={14} />, label: t('delete'), danger: true, onClick: () => handleDelete(r._id || r.id) },
        ]}} trigger={['click']}>
          <Button type="text" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={4} className="!mb-1">{t('designations')}</Title>
          <Text type="secondary">{t('manage_designations')}</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditRecord(null); setModalOpen(true); }}>{t('add_designation')}</Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input prefix={<Search size={16} />} placeholder={t('search') + '...'} value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
      </Card>

      <Drawer title={isEdit ? t('edit') + ' ' + t('designation') : t('add_designation')} open={modalOpen} onClose={() => { setModalOpen(false); setEditRecord(null); }} width={520} destroyOnClose extra={<Space><Button onClick={() => { setModalOpen(false); setEditRecord(null); }}>{t('cancel')}</Button><Button type="primary" loading={createMutation.isPending || updateMutation.isPending} onClick={() => form.submit()}>{t('save')}</Button></Space>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g. Senior Engineer" /></Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input placeholder="e.g. SE" /></Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="department" label="Department">
              <Select placeholder="Select department" allowClear options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
            </Form.Item>
            <Form.Item name="level" label="Level" rules={[{ required: true }]}><InputNumber min={1} max={10} className="w-full" placeholder="e.g. 5" /></Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="band" label="Band"><Input placeholder="e.g. L5" /></Form.Item>
            <Form.Item name="status" label="Status" initialValue="active">
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default DesignationList;
