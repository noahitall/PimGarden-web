// Vercel serverless function for email subscription
import { createClient } from '@supabase/supabase-js';

// Create a supabase client for the API - with error handling
let supabase = null;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('${NEXT_PUBLIC_SUPABASE_URL}') || 
      supabaseKey.includes('${SUPABASE_SERVICE_ROLE_KEY}')) {
    console.error('Supabase environment variables not properly configured');
    // We'll handle this in the request handler
  } else {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // We'll handle this in the request handler
}

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
    
    // Check if Supabase is properly initialized
    if (!supabase) {
      // For now, just log this to the console and return a success
      // This allows testing the frontend without Supabase
      console.log('Supabase not initialized, but received email:', email);
      return res.status(200).json({ 
        success: true, 
        message: 'Email received (Supabase integration pending)' 
      });
    }
    
    // Store in Supabase if initialized
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