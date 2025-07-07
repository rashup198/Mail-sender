// src/components/EmailLog/EmailLog.jsx
import React from 'react';
import './EmailLog.css';

const EmailLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <div className="email-log">No emails sent yet. Send emails to see logs here.</div>;
  }
  
  return (
    <div className="email-log">
      {logs.map((log, index) => (
        <div className="email-log-item" key={index}>
          <div>
            <strong>{log.brandName || 'Unknown Brand'}</strong><br />
            <small>{log.email || 'No email'}</small>
          </div>
          <div className={`email-status ${log.status === 'sent' ? 'email-sent' : 
                          log.status === 'failed' ? 'email-failed' : 'email-processing'}`}>
            {log.status === 'sent' ? '✅ Sent' : 
             log.status === 'failed' ? '❌ Failed' : '⏳ Processing'}
            {log.error && <div className="error-detail">{log.error}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailLog;