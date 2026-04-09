import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const ExpenseList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Expenses</Title>
        <Text type="secondary">Track and manage expenses</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default ExpenseList;
