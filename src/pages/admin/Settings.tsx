import React from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider, Typography, Row, Col, Tabs, Space, Radio, Tooltip } from 'antd';
import {
  SaveOutlined, BankOutlined, BellOutlined, LockOutlined, BgColorsOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useTheme, getColorPalettes, type ThemeColor, type ThemeMode } from '../../context/ThemeContext';

const { Title, Text } = Typography;

const Settings: React.FC = () => {
  const { mode, setMode, colorTheme, setColorTheme } = useTheme();
  const palettes = getColorPalettes();
  const isDark = mode === 'dark';

  const themeTab = {
    key: 'appearance',
    label: <span><BgColorsOutlined /> Appearance</span>,
    children: (
      <div style={{ maxWidth: 640 }}>
        {/* Mode Selection */}
        <div style={{ marginBottom: 32 }}>
          <Title level={5} style={{ marginBottom: 4 }}>Display Mode</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Choose between light and dark interface</Text>
          <Radio.Group
            value={mode}
            onChange={e => setMode(e.target.value as ThemeMode)}
            style={{ display: 'flex', gap: 16 }}
          >
            {([
              { value: 'light', label: 'Light', desc: 'Clean bright interface', icon: '☀️', bg: '#f8fafc', border: '#e2e8f0', fg: '#1e293b' },
              { value: 'dark', label: 'Dark', desc: 'Easy on the eyes', icon: '🌙', bg: '#1a1d23', border: '#2d3140', fg: '#e4e6eb' },
            ] as const).map(item => (
              <Radio.Button
                key={item.value}
                value={item.value}
                style={{
                  height: 'auto',
                  padding: 0,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: mode === item.value ? `2px solid ${palettes[colorTheme].primary}` : `2px solid ${isDark ? '#2d3140' : '#e2e8f0'}`,
                  flex: 1,
                  textAlign: 'left',
                  background: 'transparent',
                }}
              >
                <div style={{ padding: 16 }}>
                  {/* Mini preview */}
                  <div style={{
                    background: item.bg,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                    border: `1px solid ${item.border}`,
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: item.value === 'dark' ? '#22262e' : '#e2e8f0' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 6, borderRadius: 3, background: item.value === 'dark' ? '#374151' : '#cbd5e1', marginBottom: 6, width: '70%' }} />
                        <div style={{ height: 6, borderRadius: 3, background: item.value === 'dark' ? '#374151' : '#cbd5e1', width: '50%' }} />
                      </div>
                    </div>
                    {mode === item.value && (
                      <div style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 22, height: 22, borderRadius: '50%',
                        background: palettes[colorTheme].primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <Text strong style={{ display: 'block', fontSize: 14 }}>{item.label}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                </div>
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        {/* Color Theme Selection */}
        <div style={{ marginBottom: 32 }}>
          <Title level={5} style={{ marginBottom: 4 }}>Color Theme</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>Pick a primary color for the interface</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {(Object.entries(palettes) as [ThemeColor, typeof palettes[ThemeColor]][]).map(([key, palette]) => (
              <div
                key={key}
                onClick={() => setColorTheme(key)}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: colorTheme === key
                    ? `2px solid ${palette.primary}`
                    : `2px solid ${isDark ? '#2d3140' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  background: isDark ? '#1a1d23' : '#fff',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '100%', height: 8, borderRadius: 4,
                  background: palette.gradient, marginBottom: 12,
                }} />
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: palette.primary }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: palette.primaryLight, opacity: 0.7 }} />
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: palette.primaryLight, opacity: 0.3 }} />
                </div>
                <Text strong style={{ fontSize: 13 }}>{palette.label}</Text>
                {colorTheme === key && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 22, height: 22, borderRadius: '50%',
                    background: palette.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 8 }}>Preview</Title>
          <div style={{
            padding: 20, borderRadius: 14,
            background: isDark ? '#22262e' : '#f8fafc',
            border: `1px solid ${isDark ? '#2d3140' : '#e5e7eb'}`,
          }}>
            <Space>
              <Button type="primary">Primary Button</Button>
              <Button>Default Button</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="link">Link</Button>
            </Space>
          </div>
        </div>
      </div>
    ),
  };

  const items = [
    themeTab,
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
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 0',
              borderBottom: `1px solid ${isDark ? '#2d3140' : '#f0f0f0'}`,
            }}>
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
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0',
          }}>
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
        <Text type="secondary">Manage your organization settings and preferences</Text>
      </div>
      <Card bordered={false} style={{ borderRadius: 14, boxShadow: isDark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Tabs items={items} tabPosition="left" defaultActiveKey="appearance" />
      </Card>
    </div>
  );
};

export default Settings;
