import React, { useState } from 'react';
import {
  Card, Form, Input, InputNumber, Select, Checkbox, Button, Space, Typography, Table, Modal, App, Popconfirm,
} from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import { tdsExemptionHooks, tdsGroupHooks } from '@/hooks/queries/usePhase2';
import { useSalaryHeadList } from '@/hooks/queries/useSalaryHeads';
import { DEDUCTION_TYPE_OPTIONS } from '@/types/enums';

const { Title } = Typography;

const ExemptionPage: React.FC = () => {
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const { message } = App.useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const { data: exemptions, isLoading, refetch } = tdsExemptionHooks.useList();
  const { data: groups } = tdsGroupHooks.useList();
  const { data: heads } = useSalaryHeadList();
  const create = tdsExemptionHooks.useCreate();
  const update = tdsExemptionHooks.useUpdate();
  const del = tdsExemptionHooks.useDelete();
  const createGroup = tdsGroupHooks.useCreate();
  const delGroup = tdsGroupHooks.useDelete();

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) await update.mutateAsync({ id: editingId, data: values });
      else await create.mutateAsync(values);
      message.success(editingId ? 'Updated' : 'Saved');
      form.resetFields();
      setEditingId(null);
      refetch();
    } catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  const handleGroupSave = async (values: any) => {
    try {
      await createGroup.mutateAsync(values);
      message.success('Group saved');
      groupForm.resetFields();
    } catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  const opts = (list: any[], labelField = 'name') =>
    (list ?? []).map((x: any) => ({ value: x._id || x.id, label: x[labelField] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Exemption</Title>
        <Button type="primary" danger onClick={() => setShowGroupModal(true)}>Add Group Exemption</Button>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{ deductionType: 'deduction_under_chapter_vi_a', maxLimit: 0,
            autoExemptedAmountDefineInCurrentYear: false, isAutoExempted: false,
            hraCalculation: false, hideInCurrentYear: false }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item name="name" label="Exemption Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="deductionType" label="Deduction Type" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Select options={DEDUCTION_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="group" label="Exemption Group" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="Please Select" options={opts(groups?.data ?? [])} />
            </Form.Item>
            <Form.Item name="salaryHeadMap" label="Salary Head Map" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select allowClear placeholder="Please Select" options={opts(heads?.data ?? [])} />
            </Form.Item>
            <Form.Item name="autoExemptedAmountDefineInCurrentYear" valuePropName="checked" label="Auto Exempted Amount Define in Current Year" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}><Checkbox /></Form.Item>
            <Form.Item name="isAutoExempted" valuePropName="checked" label="Is Auto Exempted (Salary)" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}><Checkbox /></Form.Item>
            <Form.Item name="hraCalculation" valuePropName="checked" label="HRA Calculation" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}><Checkbox /></Form.Item>
            <Form.Item name="maxLimit" label="Max. Limit in Curr year" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="hideInCurrentYear" valuePropName="checked" label="Hide in Current Year" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}><Checkbox /></Form.Item>
          </div>
          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Clear</Button>
              <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
          size="small" bordered
          columns={[
            { title: 'S. No.', render: (_, __, i) => i + 1, width: 70 },
            { title: 'Exemption Name', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'deductionType', width: 200, render: (v: string) => DEDUCTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v },
            { title: 'Max. Limit', dataIndex: 'maxLimit', width: 120 },
            { title: 'Group', render: (_: any, r: any) => r.group?.name ?? '' },
            { title: 'Hide In Current Year', dataIndex: 'hideInCurrentYear', width: 160, render: (v: boolean) => v ? 'YES' : 'NO' },
            { title: 'Salary Head', render: (_: any, r: any) => r.salaryHeadMap?.name ?? '' },
            {
              title: 'Edit', width: 70, align: 'center' as const,
              render: (_: any, r: any) => (
                <Button type="text" icon={<Edit2 size={14} />} onClick={() => {
                  form.setFieldsValue({
                    name: r.name, deductionType: r.deductionType, maxLimit: r.maxLimit,
                    group: r.group?._id || r.group,
                    salaryHeadMap: r.salaryHeadMap?._id || r.salaryHeadMap,
                    autoExemptedAmountDefineInCurrentYear: r.autoExemptedAmountDefineInCurrentYear,
                    isAutoExempted: r.isAutoExempted, hraCalculation: r.hraCalculation,
                    hideInCurrentYear: r.hideInCurrentYear,
                  });
                  setEditingId(r._id || r.id);
                }} />
              ),
            },
          ]}
          dataSource={exemptions?.data ?? []}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Group Master modal */}
      <Modal open={showGroupModal} onCancel={() => setShowGroupModal(false)} footer={null} width={1100} title="Group Master">
        <Form form={groupForm} layout="horizontal" onFinish={handleGroupSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Form.Item name="name" label="Group Name" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="sectionHead" label="Section Head" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              <Select options={DEDUCTION_TYPE_OPTIONS} defaultActiveFirstOption />
            </Form.Item>
            <Form.Item name="maxLimit" label="Maximum Limit" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><InputNumber min={0} className="w-full" /></Form.Item>
            <Form.Item name="displayOrder" label="Order" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><InputNumber min={0} className="w-full" /></Form.Item>
            <Form.Item name="applyOnNewRegime" valuePropName="checked" label="Apply On New Regime" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}><Checkbox /></Form.Item>
          </div>
          <div className="flex justify-center mb-4">
            <Space>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button onClick={() => setShowGroupModal(false)}>Close</Button>
            </Space>
          </div>
        </Form>

        <Table
          size="small" bordered
          columns={[
            { title: 'SNo.', render: (_, __, i) => i + 1, width: 60 },
            { title: 'Exe Name', dataIndex: 'name' },
            { title: 'Section Head', dataIndex: 'sectionHead', render: (v: string) => DEDUCTION_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v },
            { title: 'Max Limit', dataIndex: 'maxLimit', width: 100 },
            { title: 'Apply On New Regime', dataIndex: 'applyOnNewRegime', width: 170, render: (v: boolean) => v ? 'Yes' : 'No' },
            {
              title: 'Del', width: 70,
              render: (_: any, r: any) => (
                <Popconfirm title="Delete?" onConfirm={async () => { try { await delGroup.mutateAsync(r._id || r.id); message.success('Deleted'); } catch (e: any) { message.error(e?.message || 'Failed'); } }}>
                  <Button type="text" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              ),
            },
          ]}
          dataSource={groups?.data ?? []}
          rowKey={(r: any) => r._id || r.id}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  );
};

export default ExemptionPage;
