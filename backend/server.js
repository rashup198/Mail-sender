require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
// Import from node-appwrite for server-side usage
const { Client, Databases } = require('node-appwrite');

const app = express();
const port = process.env.PORT || 5001;

// Enhanced CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

app.use(express.json());

// Initialize Appwrite Client for server-side
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
    
    // Log the incoming request
    console.log(`Received request to send ${csvData.length} emails`);
    
    // Save to Appwrite database
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_COLLECTION_ID;
    
    const emailPromises = csvData.map(merchant => {
      const { 'Brand Name': brandName, Email, Revenue, AOV, '% Contribution': contribution } = merchant;
      
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
      
      return transporter.sendMail(mailOptions)
        .then(() => {
          console.log(`Email sent to ${brandName} at ${Email}`);
          // Save to Appwrite
          return databases.createDocument(
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
        })
        .catch(error => {
          console.error(`Failed to send email to ${brandName} at ${Email}:`, error);
          // Save failed attempt
          return databases.createDocument(
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
        });
    });
    
    // Execute all promises
    const results = await Promise.allSettled(emailPromises);
    
    // Count successes and failures
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Email sending completed: ${successCount} succeeded, ${failedCount} failed`);
    
    res.json({
      success: true,
      message: `Emails sent: ${successCount} succeeded, ${failedCount} failed`
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