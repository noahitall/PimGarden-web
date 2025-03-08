// Vercel serverless function for email subscription with database storage
import supabase from '../utils/supabase';

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
    
    // Store email in Supabase
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email,
          subscribed_at: new Date().toISOString(),
          source: 'website'
        }
      ]);
    
    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          error: 'You are already subscribed!' 
        });
      }
      
      console.error('Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'An error occurred while storing your subscription' 
      });
    }
    
    // Optionally, still send an email notification
    try {
      // SendGrid code from the other handler could go here
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Continue anyway - we stored the email in the database
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