import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Form, Select, InputNumber, Checkbox, Button, Space, Typography, App, Table, Popconfirm, Tag,
} from 'antd';
import { List as ListIcon, Trash2 } from 'lucide-react';
import { useSalaryStructureList, useSalaryStructureHeads, useAssignSalaryHead, useRemoveAssignedHead } from '@/hooks/queries/useSalaryStructures';
import { useSalaryHeadList } from '@/hooks/queries/useSalaryHeads';
import {
  CALCULATION_TYPE_OPTIONS, CalculationType,
  PAY_TYPE_OPTIONS, PayType,
  HeadType, labelFromOptions, HEAD_TYPE_OPTIONS,
} from '@/types/enums';

const { Title, Text } = Typography;

// "Assign Salary Head in Structure" — pick a structure, pick a salary head,
// set calc/pay type and optional PF/NPS/ESI. Once saved, the head appears in
// the list below for that structure.
const AssignHead: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data: structureData } = useSalaryStructureList();
  const { data: headData } = useSalaryHeadList();
  const structures = structureData?.data ?? [];
  const heads = headData?.data ?? [];

  const [selectedStructure, setSelectedStructure] = useState<string | undefined>(undefined);
  const [selectedHeadId, setSelectedHeadId] = useState<string | undefined>(undefined);
  const { data: assignedData, isLoading: loadingAssigned } = useSalaryStructureHeads(selectedStructure ?? '');
  const assignMutation = useAssignSalaryHead();
  const removeMutation = useRemoveAssignedHead();

  // PF/NPS/ESI checkboxes only apply to Addition heads — mirror the UI note.
  const selectedHead = heads.find((h: any) => (h._id || h.id) === selectedHeadId);
  const isAddition = selectedHead?.headType === HeadType.ADDITION;

  const handleSubmit = async (values: any) => {
    try {
      await assignMutation.mutateAsync({
        structure: values.structure,
        salaryHead: values.salaryHead,
        calculationType: values.calculationType,
        payType: values.payType,
        showOrder: values.showOrder ?? 0,
        pfEnabled: !!values.pfEnabled,
        pfPercent: values.pfPercent ?? 100,
        npsEnabled: !!values.npsEnabled,
        npsPercent: values.npsPercent ?? 100,
        esiEnabled: !!values.esiEnabled,
        esiPercent: values.esiPercent ?? 100,
      });
      message.success('Salary Head assigned');
      // Keep the structure selection but reset the head fields so the user
      // can quickly assign multiple heads in a row.
      form.setFieldsValue({
        salaryHead: undefined, calculationType: CalculationType.LUMPSUM,
        payType: PayType.PAY_DAY_WISE, showOrder: 0,
        pfEnabled: false, pfPercent: 100, npsEnabled: false, npsPercent: 100,
        esiEnabled: false, esiPercent: 100,
      });
      setSelectedHeadId(undefined);
    } catch (err: any) {
      message.error(err?.message || 'Failed to assign Salary Head');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      message.success('Assignment removed');
    } catch (err: any) {
      message.error(err?.message || 'Failed to remove assignment');
    }
  };

  const assignedColumns = [
    { title: 'Order', dataIndex: 'showOrder', key: 'order', width: 80 },
    {
      title: 'Salary Head', key: 'head', width: 260,
      render: (_: any, r: any) => (
        <div>
          <div><b>{r.salaryHead?.name}</b></div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.salaryHead?.printName}</div>
        </div>
      ),
    },
    {
      title: 'Head Type', dataIndex: ['salaryHead', 'headType'], key: 'headType', width: 130,
      render: (v: HeadType) => (
        <Tag color={v === HeadType.ADDITION ? 'green' : 'red'}>
          {labelFromOptions(HEAD_TYPE_OPTIONS, v)}
        </Tag>
      ),
    },
    {
      title: 'Calculation', dataIndex: 'calculationType', key: 'calc', width: 150,
      render: (v: CalculationType) => labelFromOptions(CALCULATION_TYPE_OPTIONS, v),
    },
    {
      title: 'Pay Type', dataIndex: 'payType', key: 'pay',
      render: (v: PayType) => labelFromOptions(PAY_TYPE_OPTIONS, v),
    },
    {
      title: 'PF / NPS / ESI', key: 'rates', width: 180,
      render: (_: any, r: any) => (
        <span style={{ fontSize: 12 }}>
          {r.pfEnabled ? `PF ${r.pfPercent}%` : '—'}{' | '}
          {r.npsEnabled ? `NPS ${r.npsPercent}%` : '—'}{' | '}
          {r.esiEnabled ? `ESI ${r.esiPercent}%` : '—'}
        </span>
      ),
    },
    {
      title: '', key: 'action', width: 60, align: 'center' as const,
      render: (_: any, r: any) => (
        <Popconfirm title="Remove?" okText="Remove" okButtonProps={{ danger: true }}
          onConfirm={() => handleRemove(r._id || r.id)}>
          <Button type="text" danger icon={<Trash2 size={16} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <Title level={4} className="!mb-0">Assign Salary Head in Structure</Title>
        <Button type="link" icon={<ListIcon size={14} />} onClick={() => navigate('/master/salary-structure/list')}>
          List
        </Button>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{
            calculationType: CalculationType.LUMPSUM,
            payType: PayType.PAY_DAY_WISE,
            showOrder: 0,
            pfEnabled: false, pfPercent: 100,
            npsEnabled: false, npsPercent: 100,
            esiEnabled: false, esiPercent: 100,
          }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <Form.Item name="structure" label="Salary Structure"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Salary Structure is required' }]}>
              <Select placeholder="Please Select" showSearch optionFilterProp="label"
                onChange={(v) => setSelectedStructure(v)}
                options={structures.map((s: any) => ({ value: s._id || s.id, label: s.name }))} />
            </Form.Item>

            <Form.Item name="salaryHead" label="Salary Head Name"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Salary Head is required' }]}>
              <Select placeholder="Please Select" showSearch optionFilterProp="label"
                onChange={(v) => setSelectedHeadId(v as string)}
                options={heads.map((h: any) => ({
                  value: h._id || h.id,
                  label: `${h.name} (${labelFromOptions(HEAD_TYPE_OPTIONS, h.headType)})`,
                }))} />
            </Form.Item>

            <Form.Item name="calculationType" label="Calculation Type"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select options={CALCULATION_TYPE_OPTIONS} />
            </Form.Item>

            <Form.Item name="payType" label="Pay Type"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Select options={PAY_TYPE_OPTIONS} />
            </Form.Item>

            <Form.Item name="showOrder" label="Show Order"
              labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <InputNumber min={0} style={{ width: 140 }} />
            </Form.Item>

            <div />

            {/* PF */}
            <Form.Item label="PF" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Space>
                <Form.Item name="pfEnabled" valuePropName="checked" noStyle>
                  <Checkbox disabled={!isAddition} />
                </Form.Item>
                <Form.Item name="pfPercent" noStyle>
                  <InputNumber min={0} max={100} style={{ width: 90 }} disabled={!isAddition} />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  % <b>Applicable only for Addition Head</b>
                </Text>
              </Space>
            </Form.Item>

            {/* ESI */}
            <Form.Item label="ESI" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Space>
                <Form.Item name="esiEnabled" valuePropName="checked" noStyle>
                  <Checkbox disabled={!isAddition} />
                </Form.Item>
                <Form.Item name="esiPercent" noStyle>
                  <InputNumber min={0} max={100} style={{ width: 90 }} disabled={!isAddition} />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  % <b>Applicable only for Addition Head</b>
                </Text>
              </Space>
            </Form.Item>

            {/* NPS */}
            <Form.Item label="NPS" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <Space>
                <Form.Item name="npsEnabled" valuePropName="checked" noStyle>
                  <Checkbox disabled={!isAddition} />
                </Form.Item>
                <Form.Item name="npsPercent" noStyle>
                  <InputNumber min={0} max={100} style={{ width: 90 }} disabled={!isAddition} />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  % <b>Applicable only for Addition Head</b>
                </Text>
              </Space>
            </Form.Item>
          </div>

          <div className="flex justify-center mt-2">
            <Space>
              <Button type="primary" htmlType="submit" loading={assignMutation.isPending}>Save</Button>
              <Button onClick={() => navigate('/master/salary-structure/list')}>Close</Button>
            </Space>
          </div>
        </Form>

        <div className="mt-4 text-xs text-gray-500 leading-5 max-w-4xl">
          <b>Pay Type Definition :</b><br />
          Pay Day wise = Total Amount Divide by Total Month Day And Multiply (Present Day + Leave Day + Holiday + Week Off)<br />
          Month wise = Full Amount Paid<br />
          Present Day wise = Total Amount Divide by Total Working Day And Multiply Present Day<br />
          (Present+Leave) Day wise = Total Amount Divide by Total Working Day And Multiply (Present+Leave) Day<br />
          (Present+Leave+Holiday) Day wise = Total Amount Divide by Total Month Day And Multiply (Present + Leave + Holiday) Day<br />
          (Present+Leave+Week Off) Day wise = Total Amount Divide by Total Month Day And Multiply (Present + Leave + Week Off) Day
        </div>
      </Card>

      {/* Existing assignments for the selected structure */}
      {selectedStructure && (
        <Card bordered={false}>
          <div className="mb-3 font-semibold">Heads currently assigned to this structure</div>
          <Table columns={assignedColumns} dataSource={assignedData?.data ?? []}
            loading={loadingAssigned} rowKey={(r: any) => r._id || r.id}
            pagination={false} size="small" bordered />
        </Card>
      )}
    </div>
  );
};

export default AssignHead;
