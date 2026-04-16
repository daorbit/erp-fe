import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Select, Button, Space, Typography, Checkbox, App, Alert } from 'antd';
import { ArrowLeft } from 'lucide-react';
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
  const [deptSearch, setDeptSearch] = useState('');

  const filteredDepts = useMemo(
    () =>
      departments.filter((d: any) =>
        d.name.toLowerCase().includes(deptSearch.toLowerCase()),
      ),
    [departments, deptSearch],
  );

  useEffect(() => {
    if (editData) {
      const editDepts = (editData.departments ?? []).map((d: any) =>
        typeof d === 'string' ? d : d._id || d.id,
      );
      form.setFieldsValue({
        name: editData.name,
        shortName: editData.shortName,
        displayOrder: editData.displayOrder ?? 0,
        status: editData.status ?? 'Active',
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
      <div className="flex items-center gap-3 pb-2">
        <ArrowLeft
          size={20}
          className="cursor-pointer"
          onClick={() => navigate('/master/designation/list')}
        />
        <Title level={4} className="!mb-0">
          {isEdit ? 'Edit Designation' : 'Add Designation'}
        </Title>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <Card bordered={false}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
            initialValues={{ displayOrder: 0, status: 'Active', departments: [] }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="name"
                label={<><Text type="danger">* </Text>Designation Name</>}
                rules={[{ required: true, message: 'Designation Name is required' }]}
              >
                <Input placeholder="e.g. Manager" maxLength={100} autoFocus />
              </Form.Item>

              <Form.Item
                name="shortName"
                label={<><Text type="danger">* </Text>Short Name</>}
                rules={[{ required: true, message: 'Short Name is required' }]}
              >
                <Input placeholder="e.g. MGR" maxLength={20} />
              </Form.Item>

              <Form.Item name="displayOrder" label="Display Order">
                <InputNumber placeholder="e.g. 1" min={0} className="!w-full" />
              </Form.Item>

              <Form.Item name="status" label="Status">
                <Select
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="employeeBand" label="Employee Band">
                <Select placeholder="Please Select" allowClear options={EMPLOYEE_BAND_OPTIONS} />
              </Form.Item>
            </div>

            <Form.Item name="rolesAndResponsibility" label="Roles and Responsibility">
              <TextArea rows={4} maxLength={1000} showCount placeholder="Roles and responsibility description" />
            </Form.Item>

            <Space className="mt-2">
              <Button onClick={() => navigate('/master/designation/list')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form>
        </Card>

        {/* Right Card — Department List */}
        <Card
          bordered={false}
          title={<><Text type="danger">* </Text>Department List</>}
        >
          <Input.Search
            placeholder="Search..."
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            className="mb-3"
            allowClear
          />
          <div className="max-h-[280px] overflow-y-auto space-y-2">
            {departments.length === 0 ? (
              <Alert type="warning" message="No departments available. Create a department first." showIcon />
            ) : (
              <>
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  onChange={(e) => handleAllToggle(e.target.checked)}
                  style={{ fontWeight: 600, marginBottom: 4 }}
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
                  {filteredDepts.map((d: any) => (
                    <Checkbox key={d._id || d.id} value={d._id || d.id}>
                      {d.name}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignationAdd;
