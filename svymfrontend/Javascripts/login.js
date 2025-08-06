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

    let isForgotPasswordFlow = false;

    const ADMIN_USERNAME='SVYM12345';
    const ADMIN_PASSWORD='12345';

    // Check if the user is already logged in as admin
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        // Redirect to admin dashboard if already logged in
        window.location.href = 'admin_dashboard.html';
    }
    
    // Initial setup: Ensure only 'password' is required by default
    passwordInput.setAttribute('required', 'required');
    newPasswordInput.removeAttribute('required');
    confirmNewPasswordInput.removeAttribute('required');

    // Event listener for the "Forgot Password?" link
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        isForgotPasswordFlow = true;
        passwordInput.style.display = 'none'; // Hide current password input
        newPasswordGroup.style.display = 'block'; // Show new PIN inputs
        confirmNewPasswordGroup.style.display = 'block';

        // Dynamically add 'required' to new PIN fields and remove from password
        newPasswordInput.setAttribute('required', 'required');
        confirmNewPasswordInput.setAttribute('required', 'required');
        passwordInput.removeAttribute('required');

        messageDiv.innerHTML = '';
        showMessage('info', 'Please enter your User ID and set your new 5-digit PIN.'); // Updated message for 5-digit PIN
        loginForm.reset();
        userIdInput.focus();
    });

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim().toUpperCase();
        const currentPassword = passwordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        if(userId === ADMIN_USERNAME && currentPassword === ADMIN_PASSWORD) {
            // Admin login logic
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin_dashboard.html';
            return;
        }
        // Basic validation for User ID format (SVYMXXXXX)
        if (!userId.startsWith('SVYM') || !/^\d{5}$/.test(userId.substring(4))) { // Adjusted for 5 digits
            showMessage('error', 'Invalid User ID format. It should be SVYM followed by 5 digits (e.g., SVYM12345).'); // Updated format
            return;
        }

        try {
            let functionName; // This will hold 'login' or 'update-pin'
            let requestBody;

            // Determine Netlify Function name and request body based on current state
            if (isForgotPasswordFlow || (newPasswordGroup.style.display === 'block' && newPasswordInput.value !== '')) {
                // This branch handles setting a new PIN (either forgot password or first login second step)
                functionName = 'update-pin'; // Corresponds to netlify/functions/update-pin.js
                requestBody = { userId, newPin: newPassword };

                if (!newPassword || !confirmNewPassword) {
                    showMessage('error', 'Please enter and confirm your new 5-digit PIN.'); // Updated message for 5-digit PIN
                    return;
                }
                if (newPassword.length !== 5 || !/^\d{5}$/.test(newPassword)) { // Validate 5 digits
                    showMessage('error', 'New PIN must be a 5-digit number.');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showMessage('error', 'New PIN and confirmation do not match.');
                    return;
                }

            } else {
                // This branch handles regular login attempts (first-time login with PIN or subsequent login with password)
                functionName = 'login'; // Corresponds to netlify/functions/login.js
                requestBody = { userId, password: currentPassword };
            }

            // CALLING NETLIFY FUNCTION DIRECTLY: Change from '/api/...'
            const response = await fetch(`/.netlify/functions/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isFirstLoginPrompt) {
                    // Signal from backend that it's a first login
                    passwordInput.style.display = 'none'; // Hide old password field
                    newPasswordGroup.style.display = 'block';
                    confirmNewPasswordGroup.style.display = 'block';
                    newPasswordInput.setAttribute('required', 'required'); // Set required
                    confirmNewPasswordInput.setAttribute('required', 'required');
                    showMessage('info', 'This is your first login. Please set a new 5-digit PIN.'); // Updated message for 5-digit PIN
                } else {
                    // Login successful OR PIN updated successfully
                    showMessage('success', data.message || 'Action successful!');
                    console.log('User action successful for:', userId);

                    // Reset form fields and UI state
                    loginForm.reset();
                    passwordInput.style.display = 'block';
                    newPasswordGroup.style.display = 'none';
                    confirmNewPasswordGroup.style.display = 'none';
                    passwordInput.setAttribute('required', 'required'); // Reset required attributes
                    newPasswordInput.removeAttribute('required');
                    confirmNewPasswordInput.removeAttribute('required');
                    isForgotPasswordFlow = false; // Reset flow

                    // If login was successful, redirect to dashboard
                    if (functionName === 'login' && !data.isFirstLoginPrompt) {
                        // Store user ID/name in session storage for dashboard
                        sessionStorage.setItem('loggedInUserId', userId);
                        // You might also want to store data.user.candidateName if your login endpoint returns it
                        window.location.href = 'candidate_dashboard.html';
                    }
                }
            } else {
                // Handle errors from API
                showMessage('error', data.message || 'An error occurred.');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            showMessage('error', `An unexpected network error occurred: ${error.message}. Please try again.`);
        }
    });

    /*forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Redirect to a dedicated forgot password page if you create one,
        // or integrate the flow directly here (which the current UI setup allows for,
        // but the backend handler for /api/forgot-password would be needed).
        showMessage('info', 'Forgot Password functionality (via security questions) is not yet fully implemented. For now, please use the first-time login PIN change flow.');
    });*/


    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});



