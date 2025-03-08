// Vercel serverless function for email subscription
import { createClient } from '@supabase/supabase-js';

// Create a supabase client for the API - with better debugging
let supabase = null;
let initError = null;

try {
  // Log available environment variables (sanitized)
  const envVars = Object.keys(process.env)
    .filter(key => key.includes('SUPABASE') || key.includes('NEXT_PUBLIC'))
    .reduce((obj, key) => {
      // Show the first few characters of each value for debugging
      const value = process.env[key];
      obj[key] = value ? `${value.substring(0, 6)}...` : 'undefined';
      return obj;
    }, {});
  
  console.log('Available environment variables:', envVars);
  
  // Try to get Supabase URL and key from different possible sources
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.SUPABASE_URL ||
                      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
                      
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_KEY ||
                      process.env.SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY;
  
  console.log('Attempting to use Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'undefined');
  console.log('Supabase Key exists:', !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    initError = 'Missing Supabase URL or key';
    console.error(initError);
  } else if (supabaseUrl.includes('${') || supabaseKey.includes('${')) {
    initError = 'Supabase env vars contain template literals';
    console.error(initError);
  } else {
    console.log('Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
  }
} catch (error) {
  initError = `Error initializing Supabase: ${error.message}`;
  console.error(initError);
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
      console.log(`Supabase not initialized: ${initError || 'Unknown reason'}`);
      
      // Return a more helpful message for fixing the environment variables
      return res.status(200).json({ 
        success: true, 
        message: 'Email received (Supabase integration pending)',
        debug: { 
          error: initError, 
          email: email,
          help: 'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel dashboard under Project Settings → Environment Variables. Do not use ${} syntax.'
        }
      });
    }
    
    // Store in Supabase if initialized
    console.log('Attempting to insert email into Supabase...');
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
        error: 'An error occurred while storing your subscription',
        debug: { dbError: error }
      });
    }
    
    console.log('Email successfully added to Supabase');
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Subscription successful' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your subscription',
      debug: { error: error.message }
    });
  }
} 