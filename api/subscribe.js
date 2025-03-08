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
    
    // Log the email (for demo purposes)
    console.log(`New subscriber: ${email}`);
    
    // In a real implementation, you would use one of the following approaches:
    // 1. Send an email to yourself with this new subscriber
    // 2. Store the email in a database
    // 3. Use a newsletter service API
    
    // Example code for sending an email (requires configuration)
    // This uses the free SendGrid service
    // You would need to set up environment variables in Vercel
    const targetEmail = process.env.TARGET_EMAIL || 'contact@pimgarden.app';
    
    // Here you can use any email sending library
    // For example with nodemailer or using a direct API call
    // This is just a placeholder
    try {
      // Simulate email sending with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Log where the email would be sent
      console.log(`Subscription email would be sent to: ${targetEmail}`);
      console.log(`With content: New subscription from ${email}`);
      
      // In actual implementation you'd use code like:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: targetEmail,
        from: 'noreply@pimgarden.app',
        subject: 'New PimGarden Subscriber',
        text: `New subscriber: ${email}`,
        html: `<p>You have a new subscriber to the PimGarden newsletter:</p><p><strong>${email}</strong></p>`,
      };
      
      await sgMail.send(msg);
      */
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