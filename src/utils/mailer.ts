import nodemailer from 'nodemailer';

import {
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_SMTP,
  MAIL_USER,
} from '../config/env.config';

// Email configuration
const emailConfig = {
  host: MAIL_SMTP,
  port: parseInt(MAIL_PORT), // 587 if you want to use TLS
  secure: true, // For SSL
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Function to send an email using Nodemailer
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param text - Email plain text content
 * @param html - Email HTML content (optional)
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const mailOptions = {
    from: MAIL_USER, // Replace with your Zoho email
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
