import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const LeaveApply: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Apply Leave</Title>
        <Text type="secondary">Submit a new leave request</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default LeaveApply;
