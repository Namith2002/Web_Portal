// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.alert');
    if (flashMessages.length > 0) {
        setTimeout(function() {
            flashMessages.forEach(function(message) {
                message.style.opacity = '0';
                setTimeout(function() {
                    message.style.display = 'none';
                }, 500);
            });
        }, 5000);
    }

    // Mobile navigation toggle
    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.classList.add('mobile-nav-toggle');
    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('header .container').appendChild(mobileNavToggle);

    mobileNavToggle.addEventListener('click', function() {
        const nav = document.querySelector('nav ul');
        nav.classList.toggle('active');
        this.innerHTML = nav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateInput(input);
            });

            input.addEventListener('input', function() {
                if (input.classList.contains('error')) {
                    validateInput(input);
                }
            });
        });

        // Password strength meter for registration form
        const passwordField = form.querySelector('input[type="password"][id="password"]');
        if (passwordField) {
            const strengthMeter = document.createElement('div');
            strengthMeter.classList.add('password-strength');
            strengthMeter.innerHTML = `
                <div class="strength-meter">
                    <div class="strength-meter-fill"></div>
                </div>
                <div class="strength-text"></div>
            `;
            passwordField.parentNode.insertBefore(strengthMeter, passwordField.nextSibling);

            passwordField.addEventListener('input', function() {
                updatePasswordStrength(passwordField, strengthMeter);
            });
        }

        // Password confirmation validation
        const confirmPasswordField = form.querySelector('input[id="confirm_password"]');
        if (confirmPasswordField && passwordField) {
            confirmPasswordField.addEventListener('input', function() {
                if (confirmPasswordField.value !== passwordField.value) {
                    setErrorFor(confirmPasswordField, 'Passwords do not match');
                } else {
                    setSuccessFor(confirmPasswordField);
                }
            });
        }

        // Form submission validation
        form.addEventListener('submit', function(event) {
            let isValid = true;
            
            // Validate all required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(function(field) {
                if (!validateInput(field)) {
                    isValid = false;
                }
            });
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                // Scroll to the first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    });

    // Function to validate a single input field
    function validateInput(input) {
        let isValid = true;

        // Check if empty for required fields
        if (input.hasAttribute('required') && !input.value.trim()) {
            setErrorFor(input, 'This field is required');
            isValid = false;
        } 
        // Email validation
        else if (input.type === 'email' && input.value.trim()) {
            if (!isValidEmail(input.value)) {
                setErrorFor(input, 'Please enter a valid email address');
                isValid = false;
            } else {
                setSuccessFor(input);
            }
        } 
        // Password validation
        else if (input.type === 'password' && input.value.trim() && !input.id.includes('confirm')) {
            if (input.value.length < 6) {
                setErrorFor(input, 'Password must be at least 6 characters long');
                isValid = false;
            } else {
                setSuccessFor(input);
            }
        } 
        // All other validations passed
        else {
            setSuccessFor(input);
        }

        return isValid;
    }

    // Function to set error state and message
    function setErrorFor(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        // Find or create error message element
        let errorMsg = input.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('div');
            errorMsg.classList.add('error-message');
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
        }
        errorMsg.textContent = message;
    }

    // Function to set success state
    function setSuccessFor(input) {
        input.classList.remove('error');
        input.classList.add('success');
        
        // Remove error message if it exists
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }
    }

    // Function to update password strength meter
    function updatePasswordStrength(passwordField, strengthMeter) {
        const password = passwordField.value;
        let strength = 0;
        let feedback = '';

        if (password.length >= 6) strength += 1;
        if (password.length >= 10) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        const fill = strengthMeter.querySelector('.strength-meter-fill');
        const text = strengthMeter.querySelector('.strength-text');

        // Update the strength meter fill and text
        switch (strength) {
            case 0:
            case 1:
                fill.style.width = '20%';
                fill.style.backgroundColor = '#dc3545';
                feedback = 'Weak password';
                break;
            case 2:
            case 3:
                fill.style.width = '60%';
                fill.style.backgroundColor = '#ffc107';
                feedback = 'Moderate password';
                break;
            case 4:
            case 5:
                fill.style.width = '100%';
                fill.style.backgroundColor = '#28a745';
                feedback = 'Strong password';
                break;
        }

        text.textContent = feedback;
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-box, .service-card, .team-member');
        
        elements.forEach(function(element) {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animate');
            }
        });
    };
    
    // Run animation check on scroll
    window.addEventListener('scroll', animateOnScroll);
    // Run once on page load
    animateOnScroll();

    // Add active class to current navigation item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(function(link) {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        }
    });

    // Initialize any interactive components on specific pages
    initializePageSpecificFunctionality();
});

// Function to initialize page-specific functionality
function initializePageSpecificFunctionality() {
    // Check if we're on the services page
    if (window.location.pathname.includes('/services')) {
        // Add click handlers for service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(function(card) {
            card.addEventListener('click', function() {
                // Toggle active class for expanded view
                this.classList.toggle('expanded');
            });
        });
    }

    // Check if we're on the contact page
    if (window.location.pathname.includes('/contact')) {
        // Add Google Maps integration if available
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            // This would typically use Google Maps API
            // For now, just add a placeholder message
            mapContainer.innerHTML = '<div class="map-placeholder">Interactive map would be displayed here</div>';
        }
    }

    // Check if we're on the profile page
    if (window.location.pathname.includes('/profile')) {
        // Add tab functionality for profile sections
        const tabButtons = document.querySelectorAll('.profile-tabs button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (tabButtons.length > 0) {
            tabButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons and contents
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to current button and content
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // Activate first tab by default
            tabButtons[0].click();
        }
    }
}