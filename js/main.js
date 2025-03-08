// Main JavaScript for PimGarden website
document.addEventListener('DOMContentLoaded', function() {
  // =====================
  // Check URL parameters for form submission results
  // =====================
  const urlParams = new URLSearchParams(window.location.search);
  const successParam = urlParams.get('success');
  const errorParam = urlParams.get('error');
  const noteParam = urlParams.get('note');
  
  if (successParam) {
    let message = 'Thanks for subscribing! We\'ll keep you updated on PimGarden news.';
    if (successParam === 'already-subscribed') {
      message = 'You\'re already subscribed to our updates!';
    }
    
    // Handle special case for when environment variables aren't set
    if (noteParam === 'env-pending') {
      message += ' (Setup in progress - your email has been logged but storage is pending)';
    }
    
    showMessage(message, 'success');
  } else if (errorParam) {
    let message = 'Sorry, something went wrong. Please try again later.';
    if (errorParam === 'invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (errorParam === 'database') {
      message = 'There was an issue saving your email. Please try again later.';
    }
    showMessage(message, 'error');
  }
  
  // Function to show messages
  function showMessage(message, type) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-message';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
      messageElement.remove();
      // Clean up URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('success');
      url.searchParams.delete('error');
      url.searchParams.delete('note');
      window.history.replaceState({}, document.title, url);
    };
    messageElement.appendChild(closeButton);
    
    // Add to page
    document.body.insertBefore(messageElement, document.body.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        messageElement.remove();
      }
    }, 5000);
  }

  // =====================
  // Email Subscription Form
  // =====================
  const subscribeForm = document.getElementById('subscribe-form');
  
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async function(e) {
      // Only prevent default if JavaScript is enabled
      // This allows the form to submit normally when JS is disabled
      e.preventDefault();
      
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();
      
      // Simple validation
      if (!email || !email.includes('@')) {
        showMessage('Please enter a valid email address.', 'error');
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
          showMessage('Thanks for subscribing! We\'ll keep you updated on PimGarden news.', 'success');
        } else {
          showMessage(`Error: ${data.error || 'Something went wrong'}`, 'error');
        }
      } catch (error) {
        console.error('Subscription error:', error);
        showMessage('Sorry, something went wrong. Please try again later.', 'error');
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