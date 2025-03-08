// Server-side handler for HTML form submissions (no JavaScript required)
import { createClient } from '@supabase/supabase-js';

// Create a supabase client with error handling
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

// Handle form data
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

  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.redirect('/?error=method');
  }

  try {
    // With Vercel, urlencoded form data should be accessible in req.body
    const email = req.body?.email;
    
    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.redirect('/?error=invalid-email');
    }
    
    // Log email for debugging
    console.log(`Form submission for email: ${email}`);
    
    // Check if Supabase is properly initialized
    if (!supabase) {
      // For now, just log this to the console and redirect with success
      console.log('Supabase not initialized, but received email from form:', email);
      return res.redirect('/?success=subscribed&note=env-pending');
    }
    
    // Insert the email into Supabase
    const { error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email,
          source: 'website-no-js'
        }
      ]);
    
    if (error) {
      // Check if it's a duplicate email error
      if (error.code === '23505') {
        return res.redirect('/?success=already-subscribed');
      }
      
      console.error('Database error:', error);
      return res.redirect('/?error=database');
    }
    
    // Redirect back to the homepage with a success message
    return res.redirect('/?success=subscribed');
  } catch (error) {
    console.error('Form submission error:', error);
    return res.redirect('/?error=server');
  }
} 