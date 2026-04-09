import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const AssetList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Asset Management</Title>
        <Text type="secondary">Track and manage company assets</Text>
      </div>
      <Card bordered={false}>
        <Empty description="This module is coming soon" />
      </Card>
    </div>
  );
};

export default AssetList;
