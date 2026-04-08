import React from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider, Typography, Row, Col, Tabs, Space } from 'antd';
import { SaveOutlined, BankOutlined, MailOutlined, BellOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const items = [
    {
      key: 'company',
      label: <span><BankOutlined /> Company</span>,
      children: (
        <Form layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item label="Company Name"><Input defaultValue="Acme Corp Pvt Ltd" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Industry"><Select defaultValue="technology" options={[
              { value: 'technology', label: 'Technology' },
              { value: 'finance', label: 'Finance' },
              { value: 'healthcare', label: 'Healthcare' },
            ]} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Company Size"><Select defaultValue="200-500" options={[
              { value: '1-50', label: '1-50' },
              { value: '50-200', label: '50-200' },
              { value: '200-500', label: '200-500' },
              { value: '500+', label: '500+' },
            ]} /></Form.Item></Col>
          </Row>
          <Form.Item label="Address"><Input.TextArea rows={3} defaultValue="123 Tech Park, Bangalore, India" /></Form.Item>
          <Button type="primary" icon={<SaveOutlined />}>Save Changes</Button>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: <span><BellOutlined /> Notifications</span>,
      children: (
        <div style={{ maxWidth: 600 }}>
          {[
            { label: 'Email notifications for new onboarding', desc: 'Receive email when a new employee starts KYC', default: true },
            { label: 'KYC completion alerts', desc: 'Get notified when KYC is fully completed', default: true },
            { label: 'Weekly summary report', desc: 'Receive weekly HR summary via email', default: false },
            { label: 'Document expiry reminders', desc: 'Alert when employee documents are about to expire', default: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div><Text strong>{item.label}</Text><br /><Text type="secondary" style={{ fontSize: 13 }}>{item.desc}</Text></div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'security',
      label: <span><LockOutlined /> Security</span>,
      children: (
        <Form layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item label="Password Policy">
            <Select defaultValue="strong" options={[
              { value: 'basic', label: 'Basic (8+ characters)' },
              { value: 'strong', label: 'Strong (8+ chars, uppercase, number, symbol)' },
            ]} />
          </Form.Item>
          <Form.Item label="Session Timeout">
            <Select defaultValue="30" options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
            ]} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div><Text strong>Two-Factor Authentication</Text><br /><Text type="secondary" style={{ fontSize: 13 }}>Require 2FA for all admin users</Text></div>
            <Switch defaultChecked />
          </div>
          <Divider />
          <Button type="primary" icon={<SaveOutlined />}>Save Security Settings</Button>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Settings</Title>
        <Text type="secondary">Manage your organization settings</Text>
      </div>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs items={items} tabPosition="left" />
      </Card>
    </div>
  );
};

export default Settings;
