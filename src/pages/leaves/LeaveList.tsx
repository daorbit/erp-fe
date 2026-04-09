import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const LeaveList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Leave Management</Title>
        <Text type="secondary">View and manage leave requests</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default LeaveList;
