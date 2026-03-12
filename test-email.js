const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    process.env[key.trim()] = values.join('=').trim();
  }
});

async function testEmail() {
  try {
    console.log('📧 SMTP Configuration:');
    console.log(`  Host: ${process.env.SMTP_HOST}`);
    console.log(`  Port: ${process.env.SMTP_PORT}`);
    console.log(`  User: ${process.env.SMTP_USER}`);
    console.log(`  Pass: ${process.env.SMTP_PASS ? '***' : 'NOT SET'}\n`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔍 Verifying SMTP connection...');
    const verified = await transporter.verify();
    console.log('✅ SMTP Connection verified!\n');

    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `SRMAP MESS PASS <${process.env.SMTP_USER}>`,
      to: 'amankumar_thakur@srmap.edu.in',
      subject: 'SRMAP Super Admin - Test Email',
      html: `
        <h2>SRMAP International Mess Pass Portal</h2>
        <p>This is a test email to verify SMTP is working correctly.</p>
        <p>If you received this, email sending is functional!</p>
      `,
      text: 'Test email from SRMAP Super Admin Panel',
    });

    console.log('✅ Email sent successfully!');
    console.log(`  Message ID: ${info.messageId}\n`);

    console.log('📝 Email sending is working correctly.');
    console.log('Check your inbox for the test email.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. Invalid Gmail app password');
    console.error('  2. 2-factor authentication enabled but app password not created');
    console.error('  3. SMTP credentials incorrect');
    console.error('  4. Network connectivity issue');
    console.error('\n📝 To fix:');
    console.error('  1. Go to https://myaccount.google.com/apppasswords');
    console.error('  2. Create an app password for Gmail');
    console.error('  3. Update SMTP_PASS in .env.local with the 16-character password');
    process.exit(1);
  }
}

testEmail();
