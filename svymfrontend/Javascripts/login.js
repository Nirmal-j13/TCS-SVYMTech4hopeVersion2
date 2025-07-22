document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordGroup = document.getElementById('confirmNewPasswordGroup');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const messageDiv = document.getElementById('message');

    // Initial state for new password fields (hidden until first login prompt)
    newPasswordGroup.style.display = 'none';
    confirmNewPasswordGroup.style.display = 'none';

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim();
        const currentPassword = passwordInput.value.trim(); // This will be old PIN or password
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        if (!userId || !currentPassword) {
            showMessage('error', 'Please enter both User ID and Password/PIN.');
            return;
        }

        try {
            let apiEndpoint = '/.netlify/functions/login';
            let requestBody = { userId, password: currentPassword }; // Default login payload

            // Logic for handling first login and setting new PIN
            if (newPasswordGroup.style.display === 'block') { // If new password fields are visible
                if (!newPassword || !confirmNewPassword) {
                    showMessage('error', 'Please enter and confirm your new 4-digit PIN.');
                    return;
                }
                if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
                    showMessage('error', 'New PIN must be a 4-digit number.');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showMessage('error', 'New PIN and Confirm New PIN do not match.');
                    return;
                }
                apiEndpoint = '/.netlify/functions/update-pin'; // New endpoint for setting pin
                requestBody = { userId, oldPin: currentPassword, newPin: newPassword };
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isFirstLoginPrompt) {
                    // Show new password fields for first-time login
                    passwordInput.style.display = 'none'; // Hide old password field
                    newPasswordGroup.style.display = 'block';
                    confirmNewPasswordGroup.style.display = 'block';
                    showMessage('info', 'This is your first login. Please set a new 4-digit PIN.');
                } else {
                    // Successful login or PIN update
                    showMessage('success', data.message || 'Action successful!');
                    console.log('User action successful:', userId);
                    // Reset form and UI state
                    loginForm.reset();
                    passwordInput.style.display = 'block'; // Show password field again
                    newPasswordGroup.style.display = 'none';
                    confirmNewPasswordGroup.style.display = 'none';
                    // Optional: Redirect user to a dashboard or welcome page
                    window.location.href = 'candidate_dashboard.html'; // Redirect to dashboard after successful login
                }
            } else {
                showMessage('error', data.message || 'An error occurred.');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            showMessage('error', `An unexpected network error occurred: ${error.message}. Please try again.`);
        }
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('info', 'Forgot Password functionality is not yet implemented. Please contact support.');
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});