import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, App, Button, Typography, Space, Checkbox, Divider } from 'antd';
import { ArrowLeft, Search } from 'lucide-react';
import { useDesignationList, useCreateDesignation, useUpdateDesignation } from '@/hooks/queries/useDesignations';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { useTranslation } from '@/hooks/useTranslation';

const { Title, Text } = Typography;

const DesignationForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const { data: deptData } = useDepartmentList();
  const { data: desigData } = useDesignationList();
  const departments: any[] = deptData?.data ?? [];
  const [deptSearch, setDeptSearch] = useState('');

  const isEdit = !!id;
  const editData = isEdit ? (desigData?.data ?? []).find((d: any) => (d._id || d.id) === id) : null;

  useEffect(() => {
    if (editData) {
      const depts = (editData.departments ?? []).map((d: any) =>
        typeof d === 'object' ? d._id : d
      );
      form.setFieldsValue({
        title: editData.title,
        code: editData.code,
        departments: depts,
        level: editData.level,
        band: editData.band,
        status: editData.status,
      });
    }
  }, [editData, form]);

  const filteredDepts = useMemo(() => {
    if (!deptSearch) return departments;
    return departments.filter((d: any) =>
      d.name?.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [departments, deptSearch]);

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        ...values,
        level: values.level != null ? Number(values.level) : undefined,
      };
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Designation updated');
      } else {
        delete payload.status;
        await createMutation.mutateAsync(payload);
        message.success('Designation created');
      }
      navigate('/designations');
    } catch {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} designation`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/designations')} />
        <Title level={4} className="!mb-0">{isEdit ? t('edit') + ' ' + t('designation') : t('add_designation')}</Title>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Fields */}
          <div className="lg:col-span-2">
            <Card bordered={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Senior Engineer" />
                </Form.Item>
                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                  <Input placeholder="e.g. SE" />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="level" label="Level" rules={[{ required: true }]}>
                  <InputNumber min={1} max={10} className="w-full" placeholder="e.g. 5" />
                </Form.Item>
                <Form.Item name="band" label="Band">
                  <Input placeholder="e.g. L5" />
                </Form.Item>
              </div>
              <Form.Item name="status" label="Status" initialValue="active" className="max-w-xs">
                <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
              </Form.Item>
              <Space className="mt-2">
                <Button onClick={() => navigate('/designations')}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Card>
          </div>

          {/* Right: Department Checkbox List */}
          <div>
            <Card bordered={false}>
              <Form.Item
                name="departments"
                label={<Text strong>Department List</Text>}
              >
                <Checkbox.Group className="w-full">
                  <div className="mb-3">
                    <Input
                      prefix={<Search size={14} />}
                      placeholder="Search..."
                      value={deptSearch}
                      onChange={e => setDeptSearch(e.target.value)}
                      allowClear
                      size="small"
                    />
                  </div>
                  <Divider className="!my-2" />
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                    {filteredDepts.map((d: any) => (
                      <div key={d._id || d.id}>
                        <Checkbox value={d._id || d.id}>{d.name}</Checkbox>
                      </div>
                    ))}
                    {filteredDepts.length === 0 && (
                      <Text type="secondary" className="text-sm">No departments found</Text>
                    )}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default DesignationForm;
