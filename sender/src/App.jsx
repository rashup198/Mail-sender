import React, { useState } from 'react';
import Papa from 'papaparse';
import Header from './components/Header/Header';
import UploadSection from './components/UploadSection/UploadSection';
import ProgressSection from './components/ProgressSection/ProgressSection';
import PreviewSection from './components/PreviewSection/PreviewSection';
import './index.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);

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

  const sendEmails = () => {
    setIsSending(true);
    setEmailLogs([]);
    
    let processedCount = 0;
    const totalEmails = csvData.length;
    
    const processNextEmail = () => {
      if (processedCount >= totalEmails) {
        setIsSending(false);
        setStatus({ type: 'success', message: `All emails sent successfully to ${totalEmails} merchants!` });
        return;
      }
      
      const merchant = csvData[processedCount];
      const success = Math.random() < 0.95;
      
      setTimeout(() => {
        setEmailLogs(prev => [
          ...prev,
          {
            brandName: merchant['Brand Name'],
            email: merchant['Email'],
            status: success ? 'sent' : 'failed'
          }
        ]);
        
        processedCount++;
        setProgress((processedCount / totalEmails) * 100);
        processNextEmail();
      }, Math.random() * 1000 + 500);
    };
    
    processNextEmail();
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
          />
        )}
      </div>
    </div>
  );
}

export default App;