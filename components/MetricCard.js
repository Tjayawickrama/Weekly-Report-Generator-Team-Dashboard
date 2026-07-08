'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ icon: Icon, label, value, trend, trendValue, color = 'purple' }) {
  const colorMap = {
    purple: { bg: 'rgba(124, 58, 237, 0.1)', color: '#8B5CF6' },
    green: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
    amber: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
    cyan: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' },
  };

  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="metric-card" style={{ '--metric-color': c.color, '--metric-bg': c.bg }}>
      {Icon && (
        <div className="metric-icon">
          <Icon size={20} />
        </div>
      )}
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {(trend || trendValue) && (
        <div className={`metric-trend ${trend === 'up' ? 'up' : 'down'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
