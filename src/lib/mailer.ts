import nodemailer from 'nodemailer';

// Create transporter once and reuse it
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Validate environment variables
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error('Missing SMTP configuration in environment variables');
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection configuration as if it were deployed
  transporter.verify(function (error, success) {
    if (error) {
      console.error('SMTP Connection Error:', error);
    } else {
      console.log('SMTP Connection verified successfully');
    }
  });

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Nodemailer
 * @param options Email options (to, subject, html, text)
 * @returns Promise with send result
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: `SRMAP MESS PASS <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    console.log('Attempting to send email to:', options.to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Parse admin emails from environment variable
 * Supports comma-separated emails: "email1@gmail.com,email2@gmail.com"
 * @returns Array of admin email addresses
 */
function getAdminEmails(): string[] {
  const adminEmailStr = process.env.ADMIN_EMAIL;

  if (!adminEmailStr) {
    throw new Error('ADMIN_EMAIL is not configured');
  }

  return adminEmailStr
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

/**
 * Send admin notification for new pass request
 * Sends notification to all configured admin emails
 * @param studentName Student full name
 * @param registrationNumber Student registration number
 * @returns Promise with send results
 */
export async function sendAdminNotification(
  studentName: string,
  registrationNumber: string
) {
  const adminEmails = getAdminEmails();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Hi Admin,</p>
    
    <p>A new International Mess Pass request has been submitted and requires your review.</p>
    
    <p style="margin-bottom: 15px;"><strong style="font-size: 16px;">Request Details:</strong></p>
    
    <table style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; margin: 15px 0;">
      <tr>
        <td style="padding: 12px 15px; font-weight: bold; border-left: 4px solid #007bff; background-color: #f0f8ff; width: 40%;">Student Name:</td>
        <td style="padding: 12px 15px; border-right: 1px solid #e0e0e0;">${studentName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 15px; font-weight: bold; border-left: 4px solid #007bff;">Registration Number:</td>
        <td style="padding: 12px 15px;">${registrationNumber}</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px;">Please login to the admin dashboard to review and process this request.</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px;">
      This is an automated notification from SRMAP International Mess Pass Portal.<br>
      Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `;

  const textContent = `Hi Admin,

A new International Mess Pass request has been submitted and requires your review.

Request Details:
===============================================

Student Name:          ${studentName}

Registration Number:   ${registrationNumber}

===============================================

Please login to the admin dashboard to review and process this request.

---
This is an automated notification from SRMAP International Mess Pass Portal.
Please do not reply to this email.`;

  // Send email to all admin addresses in parallel
  const emailPromises = adminEmails.map((email) =>
    sendEmail({
      to: email,
      subject: 'New International Mess Pass Request',
      html: htmlContent,
      text: textContent,
    }).catch((error) => {
      console.error(`Failed to send email to ${email}:`, error);
      return { success: false, email, error: error.message };
    })
  );

  const results = await Promise.all(emailPromises);
  const allSuccessful = results.every((r) => r.success !== false);
  const successCount = results.filter((r) => r.success).length;

  console.log(
    `Admin notifications: ${successCount}/${adminEmails.length} emails sent successfully`
  );

  // Return overall result
  return {
    success: allSuccessful,
    totalEmails: adminEmails.length,
    successCount,
    results,
  };
}
