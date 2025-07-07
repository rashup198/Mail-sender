import React from 'react';
import './EmailLog.css';

const EmailLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <div className="email-log">No emails sent yet</div>;
  }
  
  return (
    <div className="email-log">
      {logs.map((log, index) => (
        <div className="email-log-item" key={index}>
          <div>
            <strong>{log.brandName}</strong><br />
            <small>{log.email}</small>
          </div>
          <div className={`email-status ${log.status === 'sent' ? 'email-sent' : 'email-failed'}`}>
            {log.status === 'sent' ? '✅ Sent' : '❌ Failed'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailLog;