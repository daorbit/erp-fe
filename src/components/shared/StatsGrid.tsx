import React from 'react';
import StatsCard, { type StatsCardProps } from './StatsCard';

interface StatsGridProps {
  stats: StatsCardProps[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
