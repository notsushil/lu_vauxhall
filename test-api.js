// Test script to debug the email API
const fetch = require('node-fetch');

async function testEmailAPI() {
  try {
    console.log('Testing email API...');
    
    // Create a simple test file
    const testContent = 'This is a test report content.';
    const base64Content = Buffer.from(testContent).toString('base64');
    
    const response = await fetch('http://localhost:3000/api/send-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64: base64Content,
        filename: 'test-report.txt',
        to: 'levelupplegion@gmail.com', // Replace with your verified Resend email
        subject: 'Test LevelUP Report',
        html: '<h1>Test Report</h1><p>This is a test email.</p>'
      }),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailAPI();
