import React, { useEffect, useState } from 'react';
import StatsGrid from '../StatsGrid/StatsGrid';
import PreviewTable from '../PreviewTable/PreviewTable';
import EmailPreview from '../EmailPreview/EmailPreview';
import EmailLog from '../EmailLog/EmailLog';
import './PreviewSection.css';

const PreviewSection = ({ csvData, isSending, onSendEmails, emailLogs }) => {
  const [sentStats, setSentStats] = useState({ sent: 0, failed: 0 });
  const firstMerchant = csvData.length > 0 ? csvData[0] : null;
  
  useEffect(() => {
    // Update stats when emailLogs change
    const sent = emailLogs.filter(log => log.status === 'sent').length;
    const failed = emailLogs.filter(log => log.status === 'failed').length;
    setSentStats({ sent, failed });
  }, [emailLogs]);

  return (
    <div className="preview-section">
      <h3>📊 Data Preview</h3>
      <StatsGrid data={csvData} sentStats={sentStats} />
      <PreviewTable data={csvData} />
      
      <h3>✉️ Email Preview</h3>
      <EmailPreview merchantData={firstMerchant} />
      
      <button 
        className="btn" 
        onClick={onSendEmails}
        disabled={isSending}
      >
        {isSending ? (
          <>
            <span className="loading-spinner"></span>
            Sending Emails...
          </>
        ) : 'Send All Emails'}
      </button>
      
      <h3>📋 Email Log</h3>
      <EmailLog logs={emailLogs} />
    </div>
  );
};

export default PreviewSection;