// Server-side handler for HTML form submissions (no JavaScript required)
import { createClient } from '@supabase/supabase-js';
import parseForm from '../middleware/form-parser';

// Create a supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable built-in body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.redirect('/?error=method');
  }

  try {
    // Parse the form data
    await parseForm(req, res);
    
    // Get the email from form data
    const email = req.body.email;
    
    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.redirect('/?error=invalid-email');
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