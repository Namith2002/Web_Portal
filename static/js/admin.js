/**
 * Admin Panel JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add active class to current menu item
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.admin-menu a');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentLocation) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Modal functionality
    const modals = document.querySelectorAll('.admin-modal');
    const closeButtons = document.querySelectorAll('.modal-close, .btn-outline');

    // Open modals
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    };

    // Close modals
    const closeModal = (modal) => {
        modal.classList.remove('active');
    };

    // Close all modals
    const closeAllModals = () => {
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    };

    // Close modal when clicking outside content
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.admin-modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            document.getElementById('userId').value = '';
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPassword').value = '';
            document.getElementById('userRole').value = 'user';

            document.getElementById('modalTitle').textContent = 'Add New User';
            openModal('userModal');
        });
    }

    // Edit user buttons
    const editButtons = document.querySelectorAll('.action-btn.edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = this.getAttribute('data-name');
            const userEmail = this.getAttribute('data-email');
            const userRole = this.getAttribute('data-role');

            document.getElementById('userId').value = userId;
            document.getElementById('userName').value = userName;
            document.getElementById('userEmail').value = userEmail;
            document.getElementById('userPassword').value = '';
            document.getElementById('userRole').value = userRole;

            document.getElementById('modalTitle').textContent = 'Edit User';
            openModal('userModal');
        });
    });

    // Delete user buttons
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = this.getAttribute('data-name');

            document.getElementById('deleteUserId').value = userId;
            document.getElementById('deleteUserName').textContent = userName;

            openModal('deleteModal');
        });
    });

    // View message buttons
    const viewButtons = document.querySelectorAll('.action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const email = this.getAttribute('data-email');
            const message = this.getAttribute('data-message');
            const date = this.getAttribute('data-date');

            document.getElementById('viewName').textContent = name;
            document.getElementById('viewEmail').textContent = email;
            document.getElementById('viewMessage').textContent = message;
            document.getElementById('viewDate').textContent = date;

            openModal('viewModal');
        });
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
});