import React from 'react';
import { Typography, Card } from 'antd';
import HolidayCalendar from '@/pages/holidays/HolidayCalendar';

const { Title } = Typography;

// "Branch Wise Holiday → Holiday" — reuses the existing HolidayCalendar page
// which already renders the month-grid view shown in the NwayERP screenshot.
const HolidayPage: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between  pb-3">
      <Title level={4} className="!mb-0">Holiday Calendar</Title>
    </div>
    <Card bordered={false}>
      <HolidayCalendar />
    </Card>
  </div>
);

export default HolidayPage;
