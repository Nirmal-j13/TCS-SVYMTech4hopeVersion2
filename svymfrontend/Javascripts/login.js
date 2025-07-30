/*document.addEventListener('DOMContentLoaded', function() {
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
        showMessage('info', 'Please enter your User ID and set your new 4-digit PIN.'); // Updated message for 4-digit PIN
        loginForm.reset();
        userIdInput.focus();
    });

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim().toUpperCase();
        const currentPassword = passwordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        // Basic validation for User ID format (SVYMXXXX)
        if (!userId.startsWith('SVYM') || !/^\d{4}$/.test(userId.substring(4))) { // Adjusted for 4 digits
            showMessage('error', 'Invalid User ID format. It should be SVYM followed by 4 digits (e.g., SVYM1234).'); // Updated format
            return;
        }

        try {
            let functionName; // This will hold 'login' or 'update-pin'
            let requestBody;

            // Determine Netlify Function name and request body based on current state
            if (isForgotPasswordFlow || (newPasswordGroup.style.display === 'block' && newPasswordInput.value !== '')) {
                // This branch handles setting a new PIN (either forgot password or first login second step)
                functionName = 'update-pin'; // Corresponds to netlify/functions/update-pin.js
                requestBody = { userId, oldPin: currentPassword, newPin: newPassword };

                if (!newPassword || !confirmNewPassword) {
                    showMessage('error', 'Please enter and confirm your new 4-digit PIN.'); // Updated message for 4-digit PIN
                    return;
                }
                if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) { // Validate 4 digits
                    showMessage('error', 'New PIN must be a 4-digit number.');
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
                    showMessage('info', 'This is your first login. Please set a new 4-digit PIN.'); // Updated message for 4-digit PIN
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

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Redirect to a dedicated forgot password page if you create one,
        // or integrate the flow directly here (which the current UI setup allows for,
        // but the backend handler for /api/forgot-password would be needed).
        showMessage('info', 'Forgot Password functionality (via security questions) is not yet fully implemented. For now, please use the first-time login PIN change flow.');
    });


    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});*/



document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password'); // This will serve as current PIN for users, or password for admin
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordGroup = document.getElementById('confirmNewPasswordGroup');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const messageDiv = document.getElementById('message');

    let isForgotPasswordFlow = false; // Flag to track if user is in forgot password flow

    // --- Hardcoded Admin Credentials (UPDATED AS PER YOUR REQUEST) ---
    const ADMIN_USERNAME = 'SVYM1234'; // Changed from 'admin'
    const ADMIN_PASSWORD = '1234';       // Changed from 'password123'

    // Ensure new PIN fields are hidden and not required by default
    newPasswordGroup.style.display = 'none';
    confirmNewPasswordGroup.style.display = 'none';
    newPasswordInput.removeAttribute('required');
    confirmNewPasswordInput.removeAttribute('required');
    passwordInput.setAttribute('required', 'required'); // Ensure current PIN/Password field is always required


    // Helper function to hide new PIN fields and reset their required status
    function hideNewPinFields() {
        newPasswordGroup.style.display = 'none';
        confirmNewPasswordGroup.style.display = 'none';
        newPasswordInput.removeAttribute('required');
        confirmNewPasswordInput.removeAttribute('required');
        passwordInput.setAttribute('required', 'required'); // Re-enable current password required
    }

    // Event listener for the "Forgot PIN?" link
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        isForgotPasswordFlow = true;

        passwordInput.style.display = 'none'; // Hide current PIN input for this flow
        newPasswordGroup.style.display = 'block'; // Show new PIN inputs
        confirmNewPasswordGroup.style.display = 'block';

        newPasswordInput.setAttribute('required', 'required');
        confirmNewPasswordInput.setAttribute('required', 'required');
        passwordInput.removeAttribute('required'); // Remove required for current password as it's hidden

        messageDiv.innerHTML = '';
        showMessage('info', 'Enter new 4 digit pin and confirm.');
        loginForm.reset();
        userIdInput.focus();
    });


    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const inputId = userIdInput.value.trim().toUpperCase(); // Could be User ID or Admin Username
        const inputPassword = passwordInput.value.trim(); // Could be current PIN or Admin Password
        const newPin = newPasswordInput.value.trim(); // Only relevant for user PIN change
        const confirmNewPin = confirmNewPasswordInput.value.trim(); // Only relevant for user PIN change

        messageDiv.style.display = 'none';
        messageDiv.className = '';

        // --- 1. Attempt Admin Login ---
        // Ensure that the inputId (after trim and toUpperCase) matches the ADMIN_USERNAME (also toUpperCase)
        // And the inputPassword matches ADMIN_PASSWORD
        if (inputId === ADMIN_USERNAME.toUpperCase() && inputPassword === ADMIN_PASSWORD) {
            if (isForgotPasswordFlow) { // Admins don't change passwords via this flow.
                showMessage('error', 'Admin passwords cannot be reset through this form. Please contact support.');
                // Reset form to normal login state
                isForgotPasswordFlow = false;
                hideNewPinFields();
                loginForm.reset();
                return;
            }

            showMessage('success', 'Admin login successful! Redirecting...');
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('loggedInAdminUsername', ADMIN_USERNAME);
            sessionStorage.removeItem('isLoggedIn'); // Clear user session if any
            sessionStorage.removeItem('loggedInUserId'); // Clear user session if any

            setTimeout(() => {
                window.location.href = 'admin_dashboard.html'; // Redirect to consolidated admin dashboard
            }, 500);
            return; // Exit after successful admin login
        }

        // --- 2. Attempt User Login ---
        // Validate user ID format ONLY if it was NOT an admin login attempt
        // This block will only execute if the above admin login check failed.
        if (!inputId.startsWith('SVYM')|| !/^\d{4}$/.test(inputId.substring(4))) {
            showMessage('error', 'Invalid User ID format. It should be SVYM followed by 4 digits (e.g., SVYM1234).');
            return;
        }

        let users = JSON.parse(sessionStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.userId === inputId);

        if (userIndex === -1) {
            showMessage('error', 'User ID not found.');
            return;
        }

        let user = users[userIndex]; // Found user object

        // --- Handle First Login / Forgot PIN for Regular User ---
        if (isForgotPasswordFlow || user.isFirstLogin) {
            // If it's a first login, and the entered inputPassword matches the default PIN.
            // For forgot password flow, we don't check `inputPassword` against current PIN.
            if (user.isFirstLogin && inputPassword !== user.pin && !isForgotPasswordFlow) {
                 showMessage('error', 'Incorrect default PIN. Please try again or use "Forgot PIN".');
                 return;
            }

            // Validate new PIN
            if (!newPin || !confirmNewPin) {
                showMessage('error', 'Please enter and confirm your new 4-digit PIN.');
                return;
            }
            if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
                showMessage('error', 'New PIN must be a 4-digit number.');
                return;
            }
            if (newPin !== confirmNewPin) {
                showMessage('error', 'New PIN and confirmation do not match.');
                return;
            }

            // Update user's PIN and first login status in session storage
            user.pin = newPin;
            user.isFirstLogin = false; // Mark as not first login anymore
            users[userIndex] = user; // Update the user object in the array
            sessionStorage.setItem('users', JSON.stringify(users)); // Save back to session storage

            console.log('PIN updated successfully for:', inputId);
            showMessage('success', 'PIN updated successfully. Redirecting to dashboard...');

            // Clear admin session if any
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('loggedInAdminUsername');
            // Set user session
            sessionStorage.setItem('loggedInUserId', inputId);
            sessionStorage.setItem('isLoggedIn', 'true');

            // Redirect to candidate dashboard
            setTimeout(() => {
                window.location.href = 'candidate_dashboard.html'; // Assuming this is your user dashboard
            }, 500);
            return; // Exit after successful PIN update
        } else {
            // --- Regular User Login ---
            if (!inputPassword) {
                showMessage('error', 'Please enter your PIN.');
                return;
            }

            if (user.pin === inputPassword) {
                showMessage('success', 'Login successful!');
                console.log('User logged in:', inputId);

                // Clear admin session if any
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('loggedInAdminUsername');
                // Set user session
                sessionStorage.setItem('loggedInUserId', inputId);
                sessionStorage.setItem('isLoggedIn', 'true');

                window.location.href = 'candidate_dashboard.html'; // Assuming this is your user dashboard
            } else {
                showMessage('error', 'Invalid PIN.');
            }
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});