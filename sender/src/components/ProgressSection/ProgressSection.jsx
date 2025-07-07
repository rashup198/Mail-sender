import React from 'react';
import './ProgressSection.css';

const ProgressSection = ({ progress, statusType, message }) => {
  if (!statusType) return null;
  
  return (
    <div className="progress-section">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className={`status-message status-${statusType}`}>
        {statusType === 'processing' && <span className="loading-spinner"></span>}
        {message}
      </div>
    </div>
  );
};

export default ProgressSection;