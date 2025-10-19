import { SendEmailCommand } from '@aws-sdk/client-ses';
import { getSESClient, FROM_EMAIL } from '../config/ses.js';
import { sesLogger } from './logger.js';

export const sendEmail = async (to, subject, htmlBody, textBody, type = null) => {
  const startTime = Date.now();
  let emailId = null;
  try {
    emailId = sesLogger.sendStart(to, subject, type);
    
    // Get SES client dynamically (checks current env vars)
    const sesClient = getSESClient();
    
    // Check if SES client is available
    if (!sesClient) {
      const error = new Error('AWS SES client not initialized. Please set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY in your .env file.');
      error.name = 'SESConfigurationError';
      error.code = 'MISSING_CREDENTIALS';
      throw error;
    }
    
    // Additional validation: check if credentials look like placeholders
    const accessKey = process.env.AWS_SES_ACCESS_KEY_ID?.trim();
    const secretKey = process.env.AWS_SES_SECRET_ACCESS_KEY?.trim();
    
    if (accessKey && (accessKey.includes('your-') || accessKey.includes('example')) || 
        secretKey && (secretKey.includes('your-') || secretKey.includes('example'))) {
      const error = new Error('AWS SES credentials appear to be placeholders. Please set actual AWS credentials in your .env file.');
      error.name = 'SESConfigurationError';
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }
    
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody || htmlBody.replace(/<[^>]*>/g, ''),
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    const duration = Date.now() - startTime;
    sesLogger.sendSuccess(to, response.MessageId, duration, emailId);
    return response;
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      name: error.name || 'UnknownError',
      code: error.code || error.$metadata?.httpStatusCode || 'UNKNOWN',
      message: error.message || 'Unknown error occurred',
      stack: error.stack,
    };
    
    // Add AWS-specific error details if available
    if (error.$metadata) {
      errorDetails.requestId = error.$metadata.requestId;
      errorDetails.httpStatusCode = error.$metadata.httpStatusCode;
      errorDetails.retryAttempts = error.$metadata.attempts;
    }
    
    sesLogger.sendError(to, error, emailId);
    
    // Log additional context for common errors
    if (error.code === 'MISSING_CREDENTIALS' || error.name === 'SESConfigurationError') {
      const accessKey = process.env.AWS_SES_ACCESS_KEY_ID;
      const secretKey = process.env.AWS_SES_SECRET_ACCESS_KEY;
      const accessKeyValid = accessKey?.trim() || false;
      const secretKeyValid = secretKey?.trim() || false;
      
      console.error('❌ AWS SES Configuration Error:', {
        message: 'AWS SES credentials are not configured or are empty',
        required: ['AWS_SES_ACCESS_KEY_ID', 'AWS_SES_SECRET_ACCESS_KEY', 'AWS_REGION', 'FROM_EMAIL'],
        current: {
          hasAccessKey: !!accessKey,
          accessKeyValid: accessKeyValid,
          accessKeyLength: accessKey?.length || 0,
          hasSecretKey: !!secretKey,
          secretKeyValid: secretKeyValid,
          secretKeyLength: secretKey?.length || 0,
          region: process.env.AWS_REGION || 'us-east-1',
          fromEmail: FROM_EMAIL,
        },
        help: 'Please set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY in your .env file with actual AWS credentials (not empty strings)'
      });
    } else if (error.name === 'InvalidParameterValue' || error.code === 'InvalidParameterValue') {
      console.error('❌ AWS SES Invalid Parameter:', {
        message: 'Invalid email address or configuration',
        to,
        from: FROM_EMAIL,
        error: error.message,
      });
    } else if (error.name === 'MessageRejected' || error.code === 'MessageRejected') {
      const isVerificationError = error.message?.includes('not verified') || error.message?.includes('failed the check');
      console.error('❌ AWS SES Message Rejected:', {
        message: 'Email was rejected by AWS SES',
        to,
        from: FROM_EMAIL,
        reason: error.message,
        ...(isVerificationError && {
          help: `The sender email "${FROM_EMAIL}" is not verified in AWS SES. Please verify it in AWS SES Console → Verified identities → Create identity. If you're in SES sandbox mode, you can only send to verified email addresses.`
        })
      });
    }
    
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Docitup!';
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Docitup</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0;">Welcome to Docitup!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Hi ${name}! 👋</h2>
          <p>We're thrilled to have you join Docitup - your private canvas for life.</p>
          <p>Here's what you can do:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">
              📝 <strong>Journal Your Thoughts</strong> - Document your journey with rich media support
            </li>
            <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">
              🎯 <strong>Track Your Goals</strong> - Set and achieve your aspirations
            </li>
            <li style="padding: 10px 0; border-bottom: 1px solid #ddd;">
              🤖 <strong>AI-Powered Insights</strong> - Get personalized prompts and analysis
            </li>
            <li style="padding: 10px 0;">
              🌍 <strong>Connect with Community</strong> - Share public goals and inspire others
            </li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Start Journaling
            </a>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Your privacy is our priority. Your data is encrypted and secure.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Docitup. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, subject, htmlBody, null, 'Welcome');
};

export const sendOTPEmail = async (email, otpCode, name) => {
  const subject = 'Verify Your Docitup Account';
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Verify Your Account</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Hi ${name}! 👋</h2>
          <p>Thank you for signing up for Docitup. Please verify your email address by entering the code below:</p>
          <div style="background: #ffffff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Your verification code:</p>
            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otpCode}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in <strong>10 minutes</strong>. If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            For security reasons, never share this code with anyone.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Docitup. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, subject, htmlBody, null, 'OTP');
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'Reset Your Docitup Password';
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>We received a request to reset your password.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, subject, htmlBody, null, 'Password Reset');
};

