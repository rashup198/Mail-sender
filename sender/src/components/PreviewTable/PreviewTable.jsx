import React from 'react';
import './PreviewTable.css';

const PreviewTable = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const headers = ['Brand Name', 'Email', 'Revenue', 'AOV', '% Contribution'];
  
  return (
    <table className="preview-table">
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((row, index) => (
          <tr key={index}>
            {headers.map(header => {
              let value = row[header];
              if (header === 'Revenue') value = '$' + parseFloat(value).toLocaleString();
              if (header === 'AOV') value = '$' + parseFloat(value).toFixed(2);
              if (header === '% Contribution') value = parseFloat(value).toFixed(2) + '%';
              return <td key={header}>{value}</td>;
            })}
          </tr>
        ))}
        {data.length > 5 && (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
              ... and {data.length - 5} more rows
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PreviewTable;