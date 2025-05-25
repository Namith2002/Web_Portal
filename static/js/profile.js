// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the edit profile and change password buttons
    const editProfileBtn = document.querySelector('.profile-card .btn-outline:nth-of-type(1)');
    const changePasswordBtn = document.querySelector('.profile-card .btn-outline:nth-of-type(2)');
    
    // Add click event listeners
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Navigate to edit profile page
            window.location.href = '/edit-profile';
        });
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Navigate to change password page
            window.location.href = '/change-password';
        });
    }
});