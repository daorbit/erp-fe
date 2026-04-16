import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, Checkbox, App, Alert } from 'antd';
import { List as ListIcon } from 'lucide-react';
import {
  useCreateDesignation,
  useUpdateDesignation,
  useDesignationList,
} from '@/hooks/queries/useDesignations';
import { useDepartmentList } from '@/hooks/queries/useDepartments';
import { EMPLOYEE_BAND_OPTIONS } from '@/types/enums';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DesignationAdd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const { data: listData } = useDesignationList();
  const { data: deptListData } = useDepartmentList();

  const isEdit = !!id;
  const editData = isEdit
    ? (listData?.data ?? []).find((d: any) => (d._id || d.id) === id)
    : null;

  const departments = deptListData?.data ?? [];
  const allDeptIds = useMemo(() => departments.map((d: any) => d._id || d.id), [departments]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  useEffect(() => {
    if (editData) {
      const editDepts = (editData.departments ?? []).map((d: any) =>
        typeof d === 'string' ? d : d._id || d.id,
      );
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder ?? 0,
        employeeBand: editData.employeeBand,
        rolesAndResponsibility: editData.rolesAndResponsibility,
        departments: editDepts,
      });
      setSelectedDepts(editDepts);
    }
  }, [editData, form]);

  const allChecked = allDeptIds.length > 0 && selectedDepts.length === allDeptIds.length;
  const indeterminate = selectedDepts.length > 0 && selectedDepts.length < allDeptIds.length;

  const handleAllToggle = (checked: boolean) => {
    const next = checked ? [...allDeptIds] : [];
    setSelectedDepts(next);
    form.setFieldValue('departments', next);
  };

  const handleSubmit = async (values: any) => {
    const payload = { ...values, departments: selectedDepts };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        message.success('Designation updated');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Designation created');
      }
      navigate('/master/designation/list');
    } catch (err: any) {
      message.error(err?.message || `Failed to ${isEdit ? 'update' : 'save'} designation`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">{isEdit ? 'Edit Designation' : 'Designation'}</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/designation/list')}>
          List
        </Button>
      </div>

      <Card bordered={false}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSubmit}
          initialValues={{ displayOrder: 0, departments: [] }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — scalar fields */}
            <div>
              <Form.Item
                name="name"
                label="Designation Name"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: 'Designation Name is required' }]}
              >
                <Input maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item
                name="shortName"
                label="Short Name"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                rules={[{ required: true, message: 'Short Name is required' }]}
              >
                <Input maxLength={20} style={{ width: 140 }} />
              </Form.Item>

              <Form.Item
                name="displayOrder"
                label="Display Order"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <InputNumber min={0} style={{ width: 140 }} />
              </Form.Item>

              <Form.Item
                name="employeeBand"
                label="Employee Band"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Select
                  placeholder="Please Select"
                  allowClear
                  options={EMPLOYEE_BAND_OPTIONS}
                />
              </Form.Item>

              <Form.Item
                name="rolesAndResponsibility"
                label="Roles and Responsibility"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <TextArea rows={4} maxLength={1000} showCount />
              </Form.Item>
            </div>

            {/* Right — Department List multi-select */}
            <div>
              <Form.Item
                name="departments"
                label={<span>Department List <Text type="danger">*</Text></span>}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                rules={[{
                  validator: () =>
                    selectedDepts.length > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error('Select at least one department')),
                }]}
              >
                <div className="border rounded p-3 max-h-[360px] overflow-y-auto">
                  {departments.length === 0 ? (
                    <Alert type="warning" message="No departments available. Create a department first." showIcon />
                  ) : (
                    <>
                      <Checkbox
                        checked={allChecked}
                        indeterminate={indeterminate}
                        onChange={(e) => handleAllToggle(e.target.checked)}
                        style={{ fontWeight: 600, marginBottom: 8 }}
                      >
                        ALL
                      </Checkbox>
                      <Checkbox.Group
                        value={selectedDepts}
                        onChange={(vals) => {
                          const next = vals as string[];
                          setSelectedDepts(next);
                          form.setFieldValue('departments', next);
                        }}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      >
                        {departments.map((d: any) => (
                          <Checkbox key={d._id || d.id} value={d._id || d.id}>
                            {d.name}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    </>
                  )}
                </div>
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                Save
              </Button>
              <Button onClick={() => navigate('/master/designation/list')}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DesignationAdd;
