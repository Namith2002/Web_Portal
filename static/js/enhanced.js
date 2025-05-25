// Enhanced JavaScript for Web Portal
document.addEventListener('DOMContentLoaded', function() {
    // Footer animations
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections.forEach(section => {
        // Add fade-in animation when scrolled into view
        if (isElementInViewport(section)) {
            section.classList.add('fade-in');
        }
    });

    // Social media hover effects
    const socialLinks = document.querySelectorAll('.socials a');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) rotate(5deg)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0)';
        });
    });

    // Values section animations
    const valueItems = document.querySelectorAll('.value-item');
    valueItems.forEach((item, index) => {
        // Staggered animation delay
        setTimeout(() => {
            if (isElementInViewport(item)) {
                item.classList.add('animate-in');
            }
        }, index * 150);
    });

    // Add scroll event listener for animations
    window.addEventListener('scroll', function() {
        // Animate footer sections when scrolled into view
        footerSections.forEach(section => {
            if (isElementInViewport(section) && !section.classList.contains('fade-in')) {
                section.classList.add('fade-in');
            }
        });

        // Animate value items when scrolled into view
        valueItems.forEach(item => {
            if (isElementInViewport(item) && !item.classList.contains('animate-in')) {
                item.classList.add('animate-in');
            }
        });
    });

    // Profile page enhancements
    const profileCards = document.querySelectorAll('.profile-card');
    profileCards.forEach((card, index) => {
        // Staggered animation delay
        setTimeout(() => {
            card.classList.add('slide-in');
        }, index * 100);
    });

    // Activity items hover effect
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(5px)';
        });
    });

    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Add CSS classes for animations
    const style = document.createElement('style');
    style.textContent = `
        .footer-section, .value-item, .profile-card {
            opacity: 0;
            transition: all 0.5s ease;
        }
        
        .footer-section.fade-in {
            opacity: 1;
        }
        
        .value-item {
            transform: translateY(20px);
        }
        
        .value-item.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .profile-card {
            transform: translateX(-20px);
        }
        
        .profile-card.slide-in {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);
});