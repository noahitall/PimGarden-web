// Server-side handler for HTML form submissions (no JavaScript required)
import { createClient } from '@supabase/supabase-js';

// Create a supabase client with enhanced debugging
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
  
  console.log('[Form Handler] Available environment variables:', envVars);
  
  // Try to get Supabase URL and key from different possible sources
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.SUPABASE_URL ||
                      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
                      
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_KEY ||
                      process.env.SERVICE_ROLE_KEY ||
                      process.env.SUPABASE_SERVICE_KEY;
  
  console.log('[Form Handler] Attempting to use Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'undefined');
  console.log('[Form Handler] Supabase Key exists:', !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    initError = 'Missing Supabase URL or key';
    console.error('[Form Handler]', initError);
  } else if (supabaseUrl.includes('${') || supabaseKey.includes('${')) {
    initError = 'Supabase env vars contain template literals';
    console.error('[Form Handler]', initError);
  } else {
    console.log('[Form Handler] Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Form Handler] Supabase client created successfully');
  }
} catch (error) {
  initError = `Error initializing Supabase: ${error.message}`;
  console.error('[Form Handler]', initError);
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
    // Log the entire request body for debugging
    console.log('[Form Handler] Request body:', req.body);
    
    // With Vercel, urlencoded form data should be accessible in req.body
    const email = req.body?.email;
    
    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      console.log('[Form Handler] Invalid email format:', email);
      return res.redirect('/?error=invalid-email');
    }
    
    // Log email for debugging
    console.log(`[Form Handler] Form submission for email: ${email}`);
    
    // Check if Supabase is properly initialized
    if (!supabase) {
      console.log(`[Form Handler] Supabase not initialized: ${initError || 'Unknown reason'}`);
      
      // Special redirect for debugging
      return res.redirect(`/?success=subscribed&note=env-pending&debug=${encodeURIComponent(initError || 'unknown')}`);
    }
    
    // Insert the email into Supabase
    console.log('[Form Handler] Attempting to insert email into Supabase...');
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
        console.log('[Form Handler] Duplicate email:', email);
        return res.redirect('/?success=already-subscribed');
      }
      
      console.error('[Form Handler] Database error:', error);
      return res.redirect(`/?error=database&debug=${encodeURIComponent(error.message)}`);
    }
    
    console.log('[Form Handler] Email successfully added to Supabase');
    // Redirect back to the homepage with a success message
    return res.redirect('/?success=subscribed');
  } catch (error) {
    console.error('[Form Handler] Form submission error:', error);
    return res.redirect(`/?error=server&debug=${encodeURIComponent(error.message)}`);
  }
} 