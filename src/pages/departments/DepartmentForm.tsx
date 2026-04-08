import React from 'react';
import { Modal, Form, Input, Select, Row, Col } from 'antd';

interface DepartmentFormProps {
  open: boolean;
  editingDepartment: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ open, editingDepartment, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const isEditing = !!editingDepartment;

  React.useEffect(() => {
    if (open && editingDepartment) {
      form.setFieldsValue(editingDepartment);
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingDepartment, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={isEditing ? 'Edit Department' : 'Add New Department'}
      open={open}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      width={640}
      okText={isEditing ? 'Update' : 'Create'}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="Department Name" rules={[{ required: true, message: 'Please enter department name' }]}>
              <Input placeholder="e.g. Engineering" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="code" label="Department Code" rules={[{ required: true, message: 'Please enter department code' }]}>
              <Input placeholder="e.g. ENG" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter department description" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="headOfDepartment" label="Head of Department">
              <Select placeholder="Select department head" options={[
                { value: 'Ananya Reddy', label: 'Ananya Reddy' },
                { value: 'Meera Nair', label: 'Meera Nair' },
                { value: 'Suresh Iyer', label: 'Suresh Iyer' },
                { value: 'Sneha Gupta', label: 'Sneha Gupta' },
                { value: 'Deepak Verma', label: 'Deepak Verma' },
                { value: 'Vikram Joshi', label: 'Vikram Joshi' },
                { value: 'Neha Bhatt', label: 'Neha Bhatt' },
                { value: 'Pooja Deshmukh', label: 'Pooja Deshmukh' },
              ]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="parentDepartment" label="Parent Department">
              <Select placeholder="Select parent department" allowClear options={[
                { value: 'Operations', label: 'Operations' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Finance', label: 'Finance' },
              ]} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="status" label="Status" initialValue="Active">
          <Select options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm;
