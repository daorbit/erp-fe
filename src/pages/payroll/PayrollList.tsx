import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const PayrollList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Payroll</Title>
        <Text type="secondary">Manage employee payroll</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default PayrollList;
