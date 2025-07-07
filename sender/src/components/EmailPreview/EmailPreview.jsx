import React from 'react';
import './EmailPreview.css';

const EmailPreview = ({ merchantData }) => {
  if (!merchantData) return null;
  
  const brandName = merchantData['Brand Name'];
  const revenue = parseFloat(merchantData['Revenue']).toLocaleString();
  const aov = parseFloat(merchantData['AOV']).toFixed(2);
  const contribution = parseFloat(merchantData['% Contribution']).toFixed(2);
  
  return (
    <div className="email-preview">
      <h3>📊 Performance Report for {brandName}</h3>
      <p>Dear {brandName} Team,</p>
      
      <p>We hope this email finds you well. We're excited to share your latest performance metrics with you:</p>
      
      <div className="metrics-box">
        <h4>📈 Key Metrics</h4>
        <p><strong>Total Revenue:</strong> ${revenue}</p>
        <p><strong>Average Order Value:</strong> ${aov}</p>
        <p><strong>Platform Contribution:</strong> {contribution}%</p>
      </div>
      
      <p>These metrics reflect your performance over the reporting period. We're proud to have you as a partner and look forward to continued growth together.</p>
      
      <p>If you have any questions about these metrics or would like to discuss strategies for improvement, please don't hesitate to reach out to our team.</p>
      
      <p>Best regards,<br />
      The Performance Team</p>
    </div>
  );
};

export default EmailPreview;