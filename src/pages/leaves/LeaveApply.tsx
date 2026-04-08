/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, Button, Typography, Form, Select, DatePicker, Input, Upload, Radio,
  Row, Col, Space, Checkbox, Tag, Divider, message,
} from 'antd';
import {
  Send,
  Upload as UploadIcon,
  Calendar,
  FileText,
  Info,
} from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const leaveBalances: Record<string, { allocated: number; used: number; remaining: number }> = {
  'Casual Leave': { allocated: 12, used: 3, remaining: 9 },
  'Sick Leave': { allocated: 8, used: 1, remaining: 7 },
  'Earned Leave': { allocated: 15, used: 5, remaining: 10 },
  'Comp Off': { allocated: 2, used: 0, remaining: 2 },
  'Loss of Pay': { allocated: 0, used: 0, remaining: 0 },
};

const LeaveApply: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | undefined>(undefined);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const balance = selectedLeaveType ? leaveBalances[selectedLeaveType] : null;

  const handleDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0];
      const end = dates[1];
      const diff = end.diff(start, 'day') + 1;
      setCalculatedDays(isHalfDay ? 0.5 : diff);
    } else {
      setCalculatedDays(0);
    }
  };

  const handleHalfDayChange = (checked: boolean) => {
    setIsHalfDay(checked);
    const dates = form.getFieldValue('dateRange');
    if (checked && dates && dates[0] && dates[1]) {
      setCalculatedDays(0.5);
    } else if (dates && dates[0] && dates[1]) {
      const diff = dates[1].diff(dates[0], 'day') + 1;
      setCalculatedDays(diff);
    }
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      message.success('Leave application submitted successfully!');
      form.resetFields();
      setSelectedLeaveType(undefined);
      setCalculatedDays(0);
      setIsHalfDay(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Apply for Leave</Title>
          <Text type="secondary">Submit a new leave application</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="leaveType"
                label="Leave Type"
                rules={[{ required: true, message: 'Please select a leave type' }]}
              >
                <Select
                  placeholder="Select leave type"
                  size="large"
                  onChange={(val) => setSelectedLeaveType(val)}
                  options={[
                    { value: 'Casual Leave', label: 'Casual Leave' },
                    { value: 'Sick Leave', label: 'Sick Leave' },
                    { value: 'Earned Leave', label: 'Earned Leave' },
                    { value: 'Comp Off', label: 'Comp Off' },
                    { value: 'Loss of Pay', label: 'Loss of Pay' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="Date Range"
                rules={[{ required: true, message: 'Please select dates' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  size="large"
                  onChange={handleDateChange}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="halfDay" valuePropName="checked">
                    <Checkbox onChange={(e) => handleHalfDayChange(e.target.checked)}>
                      Half Day Leave
                    </Checkbox>
                  </Form.Item>
                </Col>
                {isHalfDay && (
                  <Col span={12}>
                    <Form.Item name="halfDayPeriod" rules={[{ required: isHalfDay, message: 'Select period' }]}>
                      <Radio.Group>
                        <Radio value="first">First Half</Radio>
                        <Radio value="second">Second Half</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {calculatedDays > 0 && (
                <div style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
                  padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Calendar size={18} style={{ color: '#0284c7' }} />
                  <Text style={{ color: '#0284c7' }}>
                    Number of days: <Text strong style={{ color: '#0284c7' }}>{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</Text>
                  </Text>
                </div>
              )}

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: 'Please enter a reason' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter the reason for your leave..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                name="attachment"
                label="Attachment (Optional)"
              >
                <Upload.Dragger
                  maxCount={1}
                  beforeUpload={() => false}
                  style={{ borderRadius: 8 }}
                >
                  <p style={{ marginBottom: 8 }}>
                    <UploadIcon size={32} style={{ color: '#6b7280' }} />
                  </p>
                  <p style={{ fontSize: 14, color: '#374151' }}>Click or drag file to upload</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>
                    Support PDF, JPG, PNG (Max 5MB)
                  </p>
                </Upload.Dragger>
              </Form.Item>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button size="large" onClick={() => { form.resetFields(); setSelectedLeaveType(undefined); setCalculatedDays(0); setIsHalfDay(false); }}>
                  Cancel
                </Button>
                <Button type="primary" size="large" icon={<Send size={16} />} onClick={handleSubmit}>
                  Submit Application
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Leave Balance Card */}
          <Card
            title={<Space><Info size={16} /> <span>Leave Balance</span></Space>}
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}
          >
            {Object.entries(leaveBalances).map(([type, bal]) => (
              <div
                key={type}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div>
                  <Text strong style={{ fontSize: 13 }}>{type}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {bal.allocated} allocated, {bal.used} used
                  </Text>
                </div>
                <Tag
                  color={bal.remaining > 5 ? 'green' : bal.remaining > 0 ? 'orange' : 'red'}
                  style={{ fontWeight: 600, fontSize: 14, padding: '2px 12px' }}
                >
                  {bal.remaining}
                </Tag>
              </div>
            ))}
          </Card>

          {/* Selected Leave Info */}
          {selectedLeaveType && balance && (
            <Card
              title="Selected Leave Info"
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Leave Type</Text>
                  <Tag color="blue">{selectedLeaveType}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Allocated</Text>
                  <Text strong>{balance.allocated}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Used</Text>
                  <Text strong style={{ color: '#dc2626' }}>{balance.used}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Available Balance</Text>
                  <Text strong style={{ fontSize: 18, color: '#059669' }}>{balance.remaining}</Text>
                </div>
                {calculatedDays > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Applying for</Text>
                      <Text strong>{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Balance after</Text>
                      <Text strong style={{ color: balance.remaining - calculatedDays >= 0 ? '#059669' : '#dc2626' }}>
                        {balance.remaining - calculatedDays}
                      </Text>
                    </div>
                  </>
                )}
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default LeaveApply;
