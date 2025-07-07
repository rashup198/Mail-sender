import React, { useRef } from 'react';
import './UploadSection.css';

const UploadSection = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => fileInputRef.current.click();
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };
  
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="upload-section">
      <div 
        className="upload-zone"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <div className="upload-text">Drop your CSV file here or click to browse</div>
        <div className="upload-subtext">Required columns: Brand Name, Email, Revenue, AOV, % Contribution</div>
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>
    </div>
  );
};

export default UploadSection;