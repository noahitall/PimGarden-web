// Main JavaScript for PimGarden website
document.addEventListener('DOMContentLoaded', function() {
  // =====================
  // Check URL parameters for form submission results
  // =====================
  const urlParams = new URLSearchParams(window.location.search);
  const successParam = urlParams.get('success');
  const errorParam = urlParams.get('error');
  const noteParam = urlParams.get('note');
  const debugParam = urlParams.get('debug');
  
  if (successParam) {
    let message = 'Thanks for subscribing! We\'ll keep you updated on PimGarden news.';
    if (successParam === 'already-subscribed') {
      message = 'You\'re already subscribed to our updates!';
    }
    
    // Handle special case for when environment variables aren't set
    if (noteParam === 'env-pending') {
      message += ' (Setup in progress - your email has been logged but storage is pending)';
      
      // Add debug info for site admin
      if (debugParam) {
        console.log('Subscription debug info:', debugParam);
        message += '\n\nDebug info: ' + debugParam;
      }
    }
    
    showMessage(message, 'success');
  } else if (errorParam) {
    let message = 'Sorry, something went wrong. Please try again later.';
    if (errorParam === 'invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (errorParam === 'database') {
      message = 'There was an issue saving your email. Please try again later.';
    }
    
    // Add debug info for site admin
    if (debugParam) {
      console.log('Error debug info:', debugParam);
      message += '\n\nDebug info: ' + debugParam;
    }
    
    showMessage(message, 'error');
  }
  
  // Function to show messages
  function showMessage(message, type) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    // Format message text (handle newlines for debug info)
    if (message.includes('\n')) {
      const parts = message.split('\n\n');
      // Main message
      const mainMessage = document.createElement('div');
      mainMessage.textContent = parts[0];
      messageElement.appendChild(mainMessage);
      
      // Debug info in smaller text
      if (parts.length > 1) {
        const debugInfo = document.createElement('div');
        debugInfo.className = 'debug-info';
        debugInfo.textContent = parts[1];
        messageElement.appendChild(debugInfo);
      }
    } else {
      messageElement.textContent = message;
    }
    
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
      url.searchParams.delete('debug');
      window.history.replaceState({}, document.title, url);
    };
    messageElement.appendChild(closeButton);
    
    // Add to page
    document.body.insertBefore(messageElement, document.body.firstChild);
    
    // Auto-hide after 10 seconds (longer for debug messages)
    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        messageElement.remove();
      }
    }, message.includes('Debug info') ? 30000 : 5000);
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
  
  // =====================
  // Image Slideshow
  // =====================
  let slideIndex = 1;
  showSlides(slideIndex);
  
  // Attach event listeners to the prev/next buttons
  const prevButtons = document.querySelectorAll('.prev');
  const nextButtons = document.querySelectorAll('.next');
  const dots = document.querySelectorAll('.dot');
  
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      plusSlides(-1);
    });
  });
  
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      plusSlides(1);
    });
  });
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide(index + 1);
    });
  });
  
  // Add functions to window object to make them available for onclick handlers
  window.plusSlides = plusSlides;
  window.currentSlide = currentSlide;
  window.showSlides = showSlides;
  
  function plusSlides(n) {
    showSlides(slideIndex += n);
  }
  
  function currentSlide(n) {
    showSlides(slideIndex = n);
  }
  
  function showSlides(n) {
    let i;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return; // No slides found
    
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active-dot", "");
    }
    
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active-dot";
  }
  
  // Auto-advance slides every 5 seconds
  setInterval(() => {
    plusSlides(1);
  }, 5000);
  
  // =====================
  // Smooth Scrolling for iOS
  // =====================
  // Handle internal anchor links for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (isIOS) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // Calculate position considering fixed header
        const headerOffset = 80; // Match with CSS var(--scroll-padding)
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Scroll to the element
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      });
    });
  }
}); 