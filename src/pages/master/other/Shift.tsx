import React, { useMemo, useState } from 'react';
import {
  Card, Form, Input, InputNumber, Checkbox, TimePicker, Button, Space, Typography, Table, Popconfirm, App, Select,
} from 'antd';
import { Edit2, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useShiftList, useCreateShift, useUpdateShift, useDeleteShift } from '@/hooks/queries/useShifts';

const { Title } = Typography;

// Shift master — form on top (all NwayERP attendance-rule fields), list below.
const ShiftPage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inAsDate, setInAsDate] = useState(true);
  const [outAsDate, setOutAsDate] = useState(false);

  const { data, isLoading } = useShiftList();
  const create = useCreateShift();
  const update = useUpdateShift();
  const del = useDeleteShift();

  // Convert incoming "HH:mm" → dayjs, outgoing dayjs → "HH:mm".
  const timeToDayjs = (t?: string) => (t ? dayjs(t, 'HH:mm') : undefined);
  const dayjsToTime = (d: any) => (d && dayjs.isDayjs(d) ? d.format('HH:mm') : d);

  const rows = useMemo(() => (data?.data ?? []).map((r: any) => ({
    ...r,
    _shiftBreak: r.isShiftBreak ? 'YES' : 'No',
    _inActive: r.isActive ? 'Yes' : 'No',
  })), [data]);

  const handleEdit = (row: any) => {
    setEditingId(row._id || row.id);
    setInAsDate(!!row.inTimeAsAttendanceDate);
    setOutAsDate(!!row.outTimeAsAttendanceDate);
    form.setFieldsValue({
      name: row.name,
      startTime: timeToDayjs(row.startTime),
      endTime: timeToDayjs(row.endTime),
      considerLowerLimit: timeToDayjs(row.considerLowerLimit),
      considerUpperLimit: timeToDayjs(row.considerUpperLimit),
      halfTime: timeToDayjs(row.halfTime),
      lunchTimeMinutes: row.lunchTimeMinutes ?? 0,
      halfDayMinHours: row.halfDayMinHours ?? 4,
      fullDayMinHours: row.fullDayMinHours ?? 8,
      totalShiftHours: row.totalShiftHours ?? 0,
      isShiftBreak: !!row.isShiftBreak,
      statusOnSinglePunch: row.statusOnSinglePunch ?? 'absent',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      startTime: dayjsToTime(values.startTime),
      endTime: dayjsToTime(values.endTime),
      considerLowerLimit: dayjsToTime(values.considerLowerLimit),
      considerUpperLimit: dayjsToTime(values.considerUpperLimit),
      halfTime: dayjsToTime(values.halfTime),
      lunchTimeMinutes: values.lunchTimeMinutes,
      halfDayMinHours: values.halfDayMinHours,
      fullDayMinHours: values.fullDayMinHours,
      totalShiftHours: values.totalShiftHours,
      isShiftBreak: !!values.isShiftBreak,
      statusOnSinglePunch: values.statusOnSinglePunch,
      inTimeAsAttendanceDate: inAsDate,
      outTimeAsAttendanceDate: outAsDate,
    };
    try {
      if (editingId) await update.mutateAsync({ id: editingId, data: payload });
      else await create.mutateAsync(payload);
      message.success(editingId ? 'Updated' : 'Saved');
      form.resetFields();
      setEditingId(null);
    } catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await del.mutateAsync(id); message.success('Deleted'); if (editingId === id) { form.resetFields(); setEditingId(null); } }
    catch (err: any) { message.error(err?.message || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3">
        <Title level={4} className="!mb-0">{editingId ? 'Edit Shift' : 'Shift'}</Title>
      </div>

      <Card bordered={false}>
        <Form form={form} layout="horizontal" onFinish={handleSubmit}
          initialValues={{
            lunchTimeMinutes: 0, halfDayMinHours: 4, fullDayMinHours: 8,
            totalShiftHours: 0, isShiftBreak: false, statusOnSinglePunch: 'absent',
          }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
            <Form.Item name="name" label="Shift Name" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Status on Single Punch" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Form.Item name="statusOnSinglePunch" noStyle>
                <Select options={[
                  { value: 'absent', label: 'Absent' },
                  { value: 'present', label: 'Present' },
                  { value: 'half_day', label: 'Half Day' },
                ]} />
              </Form.Item>
            </Form.Item>

            <Form.Item label="In Time" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Space.Compact>
                <Form.Item name="startTime" noStyle rules={[{ required: true }]}>
                  <TimePicker format="hh:mm A" />
                </Form.Item>
                <Checkbox checked={inAsDate} onChange={(e) => setInAsDate(e.target.checked)}>
                  This time date as attendance date
                </Checkbox>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="Out Time" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Space.Compact>
                <Form.Item name="endTime" noStyle rules={[{ required: true }]}>
                  <TimePicker format="hh:mm A" />
                </Form.Item>
                <Checkbox checked={outAsDate} onChange={(e) => setOutAsDate(e.target.checked)}>
                  This time date as attendance date
                </Checkbox>
              </Space.Compact>
            </Form.Item>

            <Form.Item name="considerLowerLimit" label="Consider Lower Limit (In Time)" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <TimePicker format="hh:mm A" className="w-full" />
            </Form.Item>
            <Form.Item name="considerUpperLimit" label="Consider Upper Limit (Out Time)" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <TimePicker format="hh:mm A" className="w-full" />
            </Form.Item>

            <Form.Item name="halfTime" label="Half Time" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <TimePicker format="hh:mm A" className="w-full" />
            </Form.Item>
            <Form.Item name="halfDayMinHours" label="Half Day Working (Min Hours)" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <InputNumber min={0} step={0.5} className="w-full" addonAfter="hrs" />
            </Form.Item>

            <Form.Item name="lunchTimeMinutes" label="Lunch Time" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} className="w-full" addonAfter="MINUTES" />
            </Form.Item>
            <Form.Item name="fullDayMinHours" label="Full Day Working (Min Hours)" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} rules={[{ required: true }]}>
              <InputNumber min={0} step={0.5} className="w-full" addonAfter="hrs" />
            </Form.Item>

            <Form.Item name="totalShiftHours" label="Total Shift Hours" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <InputNumber min={0} step={0.5} className="w-full" />
            </Form.Item>
            <Form.Item name="isShiftBreak" valuePropName="checked" label="Is Shift Break" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              <Checkbox />
            </Form.Item>
          </div>
          <div className="text-xs text-red-600 mb-2">
            Note: <b>0.50 means 30 MINUTES</b>
          </div>
          <div className="flex justify-center">
            <Space>
              <Button type="primary" htmlType="submit" loading={create.isPending || update.isPending}>Save</Button>
              <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Clear</Button>
              <Button onClick={() => { form.resetFields(); setEditingId(null); }}>Close</Button>
            </Space>
          </div>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
          columns={[
            { title: 'SrNo', render: (_, __, i) => i + 1, width: 70 },
            { title: 'Shift Name', dataIndex: 'name' },
            { title: 'In Time', dataIndex: 'startTime', width: 110 },
            { title: 'Out Time', dataIndex: 'endTime', width: 110 },
            { title: 'Half Time', dataIndex: 'halfTime', width: 110 },
            { title: 'Lunch Time', dataIndex: 'lunchTimeMinutes', width: 110 },
            { title: 'Half Day Working', dataIndex: 'halfDayMinHours', width: 140 },
            { title: 'Full Day Working', dataIndex: 'fullDayMinHours', width: 140 },
            { title: 'Shift Break', dataIndex: '_shiftBreak', width: 110 },
            { title: 'Active', dataIndex: '_inActive', width: 100 },
            {
              title: 'Edit', width: 70, align: 'center' as const,
              render: (_: any, r: any) => <Button type="text" icon={<Edit2 size={14} />} onClick={() => handleEdit(r)} />,
            },
            {
              title: 'Del', width: 70, align: 'center' as const,
              render: (_: any, r: any) => (
                <Popconfirm title="Delete shift?" onConfirm={() => handleDelete(r._id || r.id)}>
                  <Button type="text" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              ),
            },
          ]}
          dataSource={rows}
          rowKey={(r: any) => r._id || r.id}
          loading={isLoading}
          size="small" bordered pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ShiftPage;
