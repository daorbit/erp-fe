import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Reports</Title>
        <Text type="secondary">Generate and view HR reports</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default Reports;
