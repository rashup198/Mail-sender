// src/App.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import Header from './components/Header/Header';
import UploadSection from './components/UploadSection/UploadSection';
import ProgressSection from './components/ProgressSection/ProgressSection';
import PreviewSection from './components/PreviewSection/PreviewSection';
import './index.css';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 30000, // Increase timeout to 30 seconds
});

function App() {
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [sentStats, setSentStats] = useState({ sent: 0, failed: 0 });

  const handleFileSelect = (file) => {
    if (!file.name.endsWith('.csv')) {
      setStatus({ type: 'error', message: 'Please select a CSV file' });
      return;
    }

    setStatus({ type: 'processing', message: 'Processing CSV file...' });
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setStatus({ type: 'error', message: 'Error parsing CSV: ' + results.errors[0].message });
          return;
        }
        validateAndSetData(results.data);
      },
      error: (error) => {
        setStatus({ type: 'error', message: 'Error reading file: ' + error.message });
      }
    });
  };

  const validateAndSetData = (data) => {
    const requiredColumns = ['Brand Name', 'Email', 'Revenue', 'AOV', '% Contribution'];
    
    if (data.length === 0) {
      setStatus({ type: 'error', message: 'CSV file is empty' });
      return;
    }
    
    const columns = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      setStatus({ type: 'error', message: `Missing required columns: ${missingColumns.join(', ')}` });
      return;
    }
    
    const validData = data.filter(row => 
      row['Brand Name'] && 
      row['Email'] && 
      row['Revenue'] && 
      row['AOV'] && 
      row['% Contribution']
    );
    
    if (validData.length === 0) {
      setStatus({ type: 'error', message: 'No valid data rows found' });
      return;
    }
    
    setCsvData(validData);
    setStatus({ type: 'success', message: `Successfully loaded ${validData.length} merchant records` });
    setProgress(100);
  };

  const sendEmails = async () => {
    setIsSending(true);
    setEmailLogs([]);
    setSentStats({ sent: 0, failed: 0 });
    
    try {
      const response = await api.post('/send-emails', {
        csvData
      });
      
      if (response.data.success) {
        setStatus({ 
          type: 'success', 
          message: response.data.message 
        });
        
        // Update email logs from response
        setEmailLogs(response.data.emailLogs || []);
        
        // Update stats
        setSentStats({
          sent: response.data.stats?.sent || 0,
          failed: response.data.stats?.failed || 0
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: response.data.message 
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      let errorMessage = 'Failed to send emails';
      
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        errorMessage = error.response.data.message || errorMessage;
        
        // Try to get logs from error response
        if (error.response.data.emailLogs) {
          setEmailLogs(error.response.data.emailLogs);
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Is the backend running?';
      }
      
      setStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setIsSending(false);
      setProgress(100);
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="main-content">
        <UploadSection onFileSelect={handleFileSelect} />
        <ProgressSection 
          progress={progress} 
          statusType={status.type} 
          message={status.message} 
        />
        {csvData.length > 0 && (
          <PreviewSection 
            csvData={csvData}
            isSending={isSending}
            emailLogs={emailLogs}
            onSendEmails={sendEmails}
            sentStats={sentStats}
          />
        )}
      </div>
    </div>
  );
}

export default App;