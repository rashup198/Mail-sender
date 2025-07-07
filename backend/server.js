require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Client, Databases } = require('node-appwrite');

const app = express();
const port = process.env.PORT || 5001;

// Enhanced CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to send emails
app.post('/send-emails', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    console.log(`Received request to send ${csvData.length} emails`);
    
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_COLLECTION_ID;
    
    // We'll store all email results here
    const emailLogs = [];
    let successCount = 0;
    let failedCount = 0;
    
    // Process emails sequentially to avoid rate limiting
    for (const merchant of csvData) {
      const { 'Brand Name': brandName, Email, Revenue, AOV, '% Contribution': contribution } = merchant;
      
      let logEntry = {
        brandName,
        email: Email,
        status: 'processing'
      };
      
      // Add initial log entry
      emailLogs.push(logEntry);
      
      try {
        // Create email content
        const emailContent = `
          <h3>📊 Performance Report for ${brandName}</h3>
          <p>Dear ${brandName} Team,</p>
          <p>We hope this email finds you well. We're excited to share your latest performance metrics with you:</p>
          <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #4f46e5; margin-bottom: 15px;">📈 Key Metrics</h4>
            <p><strong>Total Revenue:</strong> $${parseFloat(Revenue).toLocaleString()}</p>
            <p><strong>Average Order Value:</strong> $${parseFloat(AOV).toFixed(2)}</p>
            <p><strong>Platform Contribution:</strong> ${parseFloat(contribution).toFixed(2)}%</p>
          </div>
          <p>These metrics reflect your performance over the reporting period. We're proud to have you as a partner and look forward to continued growth together.</p>
          <p>If you have any questions about these metrics or would like to discuss strategies for improvement, please don't hesitate to reach out to our team.</p>
          <p>Best regards,<br>The Performance Team</p>
        `;
        
        // Send email
        const mailOptions = {
          from: `"Performance Team" <${process.env.EMAIL_USER}>`,
          to: Email,
          subject: `📊 Performance Report for ${brandName}`,
          html: emailContent
        };
        
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${brandName} at ${Email}`, info.messageId);
        
        // Save to Appwrite
        const document = await databases.createDocument(
          databaseId,
          collectionId,
          'unique()',
          {
            brandName,
            email: Email,
            revenue: parseFloat(Revenue),
            aov: parseFloat(AOV),
            contribution: parseFloat(contribution),
            status: 'sent',
            timestamp: new Date().toISOString()
          }
        );
        
        console.log(`Saved to Appwrite: ${document.$id}`);
        
        // Update log entry
        logEntry.status = 'sent';
        logEntry.messageId = info.messageId;
        logEntry.documentId = document.$id;
        
        successCount++;
        
      } catch (error) {
        console.error(`Failed to process ${brandName} (${Email}):`, error);
        
        try {
          // Try to save failed attempt to Appwrite
          const document = await databases.createDocument(
            databaseId,
            collectionId,
            'unique()',
            {
              brandName,
              email: Email,
              revenue: parseFloat(Revenue),
              aov: parseFloat(AOV),
              contribution: parseFloat(contribution),
              status: 'failed',
              error: error.message,
              timestamp: new Date().toISOString()
            }
          );
          
          console.log(`Saved failure to Appwrite: ${document.$id}`);
          
          // Update log entry
          logEntry.status = 'failed';
          logEntry.error = error.message;
          logEntry.documentId = document.$id;
          
        } catch (dbError) {
          console.error('Failed to save to Appwrite:', dbError);
          
          // Update log entry
          logEntry.status = 'failed';
          logEntry.error = `Email failed: ${error.message}, DB failed: ${dbError.message}`;
        }
        
        failedCount++;
      }
      
      // Update the log entry in the array
      const index = emailLogs.findIndex(entry => entry.email === Email);
      if (index !== -1) {
        emailLogs[index] = logEntry;
      }
    }
    
    console.log(`Email sending completed: ${successCount} succeeded, ${failedCount} failed`);
    
    res.json({
      success: true,
      message: `Emails sent: ${successCount} succeeded, ${failedCount} failed`,
      emailLogs, // Send the complete logs array
      stats: {
        sent: successCount,
        failed: failedCount
      }
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emails',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});