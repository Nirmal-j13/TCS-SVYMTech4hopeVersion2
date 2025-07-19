document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const passwordGroup = document.getElementById('passwordGroup');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const confirmNewPasswordGroup = document.getElementById('confirmNewPasswordGroup');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const messageDiv = document.getElementById('message');

    // Initialize PouchDB database
    // IMPORTANT: Replace 'http://localhost:5984' with your actual CouchDB instance URL
    // And ensure you add admin credentials if your CouchDB requires authentication.
    // Example with credentials: new PouchDB('http://admin:your_couchdb_password@localhost:5984/users_db');

const COUCHDB_URL='REPLACE_COUCHDB_URL_WITH_ENV_VAR';

const db = new PouchDB(COUCHDB_URL);

    let isForgotPasswordFlow = false; // State variable to manage the "Forgot Password" mode

    // --- Initial setup: Ensure only 'password' is required by default ---
    passwordInput.setAttribute('required', 'required');
    newPasswordInput.removeAttribute('required');
    confirmNewPasswordInput.removeAttribute('required');
    // --- End initial setup ---

    // Event listener for the "Forgot Password?" link
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        isForgotPasswordFlow = true; // Activate forgot password flow
        passwordGroup.style.display = 'none'; // Hide current password input
        newPasswordGroup.style.display = 'block'; // Show new PIN inputs
        confirmNewPasswordGroup.style.display = 'block';

        // Dynamically add 'required' to new PIN fields and remove from password
        newPasswordInput.setAttribute('required', 'required');
        confirmNewPasswordInput.setAttribute('required', 'required');
        passwordInput.removeAttribute('required');

        messageDiv.innerHTML = ''; // Clear previous messages
        showMessage('info', 'Please enter your User ID and set your new 4-digit PIN.');
        loginForm.reset(); // Clear form fields
        userIdInput.focus(); // Focus on User ID input
    });

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim().toUpperCase(); // Trim and standardize User ID
        const enteredPassword = passwordInput.value.trim(); // For initial password/PIN check
        const enteredNewPin = newPasswordInput.value.trim(); // For setting new PIN
        const enteredConfirmNewPin = confirmNewPasswordInput.value.trim();

        // Basic validation for User ID format
        if (!userId.startsWith('SVYM') || userId.length !== 8 || !/^\d{4}$/.test(userId.substring(4))) {
            showMessage('error', 'Invalid User ID format. It should be SVYMXXXX (e.g., SVYM1234).');
            return;
        }

        try {
            // Fetch the user document from CouchDB using the User ID
            const userDoc = await db.get(userId);

            // CASE 1: User is in the "Forgot Password" flow (triggered by link)
            if (isForgotPasswordFlow) {
                // The logic for forgot password flow already handles setting new PIN and redirection
                if (!enteredNewPin || !enteredConfirmNewPin) {
                    showMessage('error', 'Please enter and confirm your new 4-digit PIN.');
                    return;
                }
                if (enteredNewPin !== enteredConfirmNewPin) {
                    showMessage('error', 'New PIN and confirmation do not match.');
                    return;
                }
                if (!/^\d{4}$/.test(enteredNewPin)) {
                    showMessage('error', 'New PIN must be exactly 4 digits.');
                    return;
                }

                userDoc.password = btoa(enteredNewPin); // Hash the new PIN
                userDoc.isFirstLogin = false; // Mark as no longer first login
                userDoc.loginCount = (userDoc.loginCount || 0) + 1; // Increment login count
                await db.put(userDoc); // Save updated document

                showMessage('success', 'PIN updated successfully! You can now log in with your new PIN.');
                // Reset form and UI for regular login state
                loginForm.reset();
                passwordGroup.style.display = 'block';
                newPasswordGroup.style.display = 'none';
                confirmNewPasswordGroup.style.display = 'none';
                passwordInput.setAttribute('required', 'required');
                newPasswordInput.removeAttribute('required');
                confirmNewPasswordInput.removeAttribute('required');
                isForgotPasswordFlow = false;
                return; // Exit the function after handling this flow
            }

            // CASE 2: User is on first login (userDoc.isFirstLogin is TRUE)
            // This case handles both entering firstLoginPin AND setting the new PIN.
            if (userDoc.isFirstLogin) {
                // Check if they are trying to set a new PIN (meaning new password fields are visible)
                if (newPasswordGroup.style.display === 'block' && enteredNewPin && enteredConfirmNewPin) {
                    // This is the second submission for a first-time user: setting the new PIN
                    if (enteredNewPin !== enteredConfirmNewPin) {
                        showMessage('error', 'New PIN and confirmation do not match.');
                        return;
                    }
                    if (!/^\d{4}$/.test(enteredNewPin)) {
                        showMessage('error', 'New PIN must be exactly 4 digits.');
                        return;
                    }

                    userDoc.firstLoginPin= btoa(enteredNewPin); // Hash and set the new password
                    userDoc.isFirstLogin = false; // Mark as no longer first login
                    userDoc.loginCount = (userDoc.loginCount || 0) + 1; // Increment login count
                    await db.put(userDoc); // Save updated document

                    showMessage('success', 'New PIN set successfully! Logging you in...');
                    setTimeout(() => { window.location.href = 'candidate_dashboard.html'; }, 1500); // Auto-redirect to dashboard
                    return; // Exit after handling this flow

                } else {
                    // This is the first submission for a first-time user: entering the firstLoginPin
                    if (enteredPassword === userDoc.firstLoginPin) {
                        showMessage('info', 'Welcome! This is your first login. Please set your new 4-digit PIN.');
                        passwordGroup.style.display = 'none';
                        newPasswordGroup.style.display = 'block';
                        confirmNewPasswordGroup.style.display = 'block';
                        newPasswordInput.setAttribute('required', 'required');
                        confirmNewPasswordInput.setAttribute('required', 'required');
                        passwordInput.removeAttribute('required');
                        // No return here, as the user needs to re-submit with the new PIN
                    } else {
                        showMessage('error', 'Incorrect 4-digit PIN for first login.');
                    }
                    return; // Exit after handling the first part of first-time login
                }
            }

            // CASE 3: Regular Login (userDoc.isFirstLogin is FALSE and not in forgot password flow)
            const storedHashedPassword = userDoc.password;
            const enteredHashedPassword = btoa(enteredPassword); // Hash the entered password for comparison

            if (enteredHashedPassword === storedHashedPassword) {
                // Login successful!
                userDoc.loginCount = (userDoc.loginCount || 0) + 1; // Increment login count
                await db.put(userDoc); // Update doc with new loginCount

                showMessage('success', 'Login successful! Redirecting to dashboard...');
                // Ensure required attributes are correct before potential redirect
                passwordInput.setAttribute('required', 'required');
                newPasswordInput.removeAttribute('required');
                confirmNewPasswordInput.removeAttribute('required');

                // Redirect to the candidate dashboard
                setTimeout(() => {
                    window.location.href = 'candidate_dashboard.html'; // Adjust this path if needed
                }, 1000);
            } else {
                showMessage('error', 'Incorrect User ID or PIN/Password.');
            }

        } catch (error) {
            console.error('Error during login process:', error);
            if (error.status === 404) {
                showMessage('error', 'User not found. Please check your User ID.');
            } else {
                showMessage('error', `An unexpected error occurred: ${error.message}. Please try again.`);
            }
        }
    });

    // Helper function to display messages
    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = ''; // Clear previous classes
        messageDiv.classList.add('message', type); // Add base 'message' and type class (e.g., 'success', 'error', 'info')
        messageDiv.style.display = 'block';
    }
});
