// Main JavaScript for PimGarden website
document.addEventListener('DOMContentLoaded', function() {
  // =====================
  // Email Subscription Form
  // =====================
  const subscribeForm = document.getElementById('subscribe-form');
  
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();
      
      // Simple validation
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      
      try {
        // Show loading state
        const submitButton = subscribeForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Send to our API endpoint
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        // Reset form state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Handle response
        if (data.success) {
          emailInput.value = '';
          alert('Thanks for subscribing! We\'ll keep you updated on PimGarden news.');
        } else {
          alert(`Error: ${data.error || 'Something went wrong'}`);
        }
      } catch (error) {
        console.error('Subscription error:', error);
        alert('Sorry, something went wrong. Please try again later.');
      }
    });
  }
  
  // =====================
  // Mobile Navigation (if needed)
  // =====================
  // This is a placeholder for mobile navigation functionality
  // For a simple site, you might not need JavaScript for navigation
  
  // =====================
  // Current Year for Copyright
  // =====================
  const currentYear = new Date().getFullYear();
  const copyrightElement = document.querySelector('.copyright p');
  
  if (copyrightElement && copyrightElement.textContent.includes('2023')) {
    copyrightElement.textContent = copyrightElement.textContent.replace('2023', currentYear);
  }
}); 