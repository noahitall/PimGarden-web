// Vercel serverless function for email subscription
export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Extract email from request body
    const { email } = req.body;
    
    // Validate email format
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email required' 
      });
    }
    
    // Log the email (for debugging purposes)
    console.log(`New subscriber: ${email}`);
    
    // Send an email to yourself with this new subscriber
    const targetEmail = process.env.TARGET_EMAIL || 'contact@pimgarden.com';
    
    try {
      // Import SendGrid (using ES modules syntax for Vercel)
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: targetEmail,
        from: 'noreply@pimgarden.com',
        subject: 'New PimGarden Subscriber',
        text: `New subscriber: ${email}`,
        html: `<p>You have a new subscriber to the PimGarden newsletter:</p><p><strong>${email}</strong></p>`,
      };
      
      await sgMail.send(msg);
      console.log(`Email notification sent to ${targetEmail}`);
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Still return success even if notification fails
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription successful' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your subscription' 
    });
  }
} 