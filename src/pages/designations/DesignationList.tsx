import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Modal, Form, Select, Typography, Space, Dropdown, App } from 'antd';
import { Plus, Search, Edit2, Trash2, MoreVertical, Briefcase } from 'lucide-react';
import { useDesignationList, useCreateDesignation, useUpdateDesignation, useDeleteDesignation } from '@/hooks/queries/useDesignations';
import { useDepartmentList } from '@/hooks/queries/useDepartments';

const { Title, Text } = Typography;

const DesignationList: React.FC = () => {
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
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editRecord._id || editRecord.id, data: values });
        message.success('Designation updated');
      } else {
        await createMutation.mutateAsync(values);
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
    { title: 'Department', dataIndex: 'department', key: 'department', render: (d: any) => <Tag color="blue">{typeof d === 'object' ? d?.name : (d || '-')}</Tag> },
    { title: 'Level', dataIndex: 'level', key: 'level', render: (l: any) => l ?? '-' },
    { title: 'Band', dataIndex: 'band', key: 'band', render: (b: string) => b ? <Tag color="purple">{b}</Tag> : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: any, r: any) => (
        <Dropdown menu={{ items: [
          { key: 'edit', icon: <Edit2 size={14} />, label: 'Edit', onClick: () => { setEditRecord(r); setModalOpen(true); } },
          { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true, onClick: () => handleDelete(r._id || r.id) },
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
          <Title level={4} className="!mb-1">Designations</Title>
          <Text type="secondary">Manage employee designations and job titles</Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setEditRecord(null); setModalOpen(true); }}>Add Designation</Button>
      </div>

      <Card bordered={false}>
        <div className="mb-4">
          <Input prefix={<Search size={16} />} placeholder="Search designations..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" allowClear />
        </div>
        <Table columns={columns} dataSource={filtered} loading={isLoading} rowKey={(r: any) => r._id || r.id || r.key} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={isEdit ? 'Edit Designation' : 'Add Designation'} open={modalOpen} onCancel={() => { setModalOpen(false); setEditRecord(null); }} onOk={() => form.submit()} confirmLoading={createMutation.isPending || updateMutation.isPending} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g. Senior Engineer" /></Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input placeholder="e.g. SE" /></Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="department" label="Department">
              <Select placeholder="Select department" allowClear options={departments.map((d: any) => ({ value: d._id || d.id, label: d.name }))} />
            </Form.Item>
            <Form.Item name="level" label="Level"><Input type="number" placeholder="e.g. 5" /></Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="band" label="Band"><Input placeholder="e.g. L5" /></Form.Item>
            <Form.Item name="status" label="Status" initialValue="active">
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DesignationList;
