// Vercel serverless function for email subscription
import { createClient } from '@supabase/supabase-js';

// Create a supabase client for the API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
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
    
    // Store in Supabase
    const { error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email,
          source: 'website-js'
        }
      ]);
      
    if (error) {
      // Check if it's a duplicate email
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