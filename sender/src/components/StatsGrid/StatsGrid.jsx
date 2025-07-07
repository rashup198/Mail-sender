// src/components/StatsGrid/StatsGrid.jsx
import React from 'react';
import './StatsGrid.css';

const StatsGrid = ({ data, sentStats }) => {
  if (!data || data.length === 0) return null;
  
  const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row['Revenue'] || 0), 0);
  const avgAOV = data.reduce((sum, row) => sum + parseFloat(row['AOV'] || 0), 0) / data.length;
  const totalMerchants = data.length;
  
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number">{totalMerchants}</div>
        <div className="stat-label">Total Merchants</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">${totalRevenue.toLocaleString()}</div>
        <div className="stat-label">Total Revenue</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">${avgAOV.toFixed(2)}</div>
        <div className="stat-label">Average AOV</div>
      </div>
      
      {/* Sent stats */}
      {sentStats.sent > 0 && (
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#047857' }}>{sentStats.sent}</div>
          <div className="stat-label">Emails Sent</div>
        </div>
      )}
      
      {sentStats.failed > 0 && (
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#dc2626' }}>{sentStats.failed}</div>
          <div className="stat-label">Failed to Send</div>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;