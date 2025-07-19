document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    // Initialize PouchDB database
    // IMPORTANT: Ensure you add admin credentials if your CouchDB requires authentication.
    // Example with credentials: new PouchDB('http://admin:your_couchdb_password@localhost:5984/users_db');

const COUCHDB_URL='REPLACE_COUCHDB_URL_WITH_ENV_VAR';

console.log(COUCHDB_URL);

const db = new PouchDB(COUCHDB_URL);

    // Function to generate a unique 4-digit number for userId suffix and firstLoginPin
    async function generateUniqueFourDigitSuffix(maxAttempts = 100) {
        let suffix;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < maxAttempts) {
            suffix = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit number
            const potentialUserId = `SVYM${suffix}`;

            try {
                // Check if a document with this _id (which includes the suffix) already exists
                await db.get(potentialUserId);
                // If db.get() succeeds, it means the ID exists, so it's not unique
                console.log(`Potential userId ${potentialUserId} already exists. Retrying...`);
            } catch (error) {
                if (error.status === 404) {
                    // 404 means document not found, so the ID is unique
                    isUnique = true;
                    console.log(`Generated unique suffix: ${suffix} for userId: ${potentialUserId}`);
                } else {
                    // Other errors (e.g., network issue) should be handled
                    console.error("Error checking User ID uniqueness (not a 404):", error);
                    throw error; // Re-throw to be caught by the outer catch block
                }
            }
            attempts++;
        }
        if (attempts >= maxAttempts && !isUnique) {
            console.error('Failed to generate a unique 4-digit suffix after multiple attempts.');
            throw new Error('Failed to generate unique User ID suffix. Please try again.');
        }
        return suffix;
    }

    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Collect all form data
        const candidateName = document.getElementById('candidateName').value.trim();
        const fatherHusbandName = document.getElementById('fatherHusbandName').value.trim();
        const villageName = document.getElementById('villageName').value.trim();
        const talukName = document.getElementById('talukName').value.trim();
        const districtName = document.getElementById('districtName').value.trim();
        const dob = document.getElementById('dob').value.trim();
        const age = parseInt(document.getElementById('age').value.trim(), 10);
        const familyMembers = parseInt(document.getElementById('familyMembers').value.trim(), 10);
        const qualification = document.getElementById('qualification').value.trim();
        const caste = document.getElementById('caste').value.trim();
        const gender = document.getElementById('gender').value.trim();
        const tribal = document.getElementById('tribal').value.trim();
        const pwd = document.getElementById('pwd').value.trim();
        const singleParentWidow = document.getElementById('singleParentWidow').value.trim();
        const aadharNumber = document.getElementById('aadharNumber').value.trim();
        const candidatePhone = document.getElementById('candidatePhone').value.trim();
        const parentPhone = document.getElementById('parentPhone').value.trim();
        const mobiliserName = document.getElementById('mobiliserName').value.trim();
        const supportedProject = document.getElementById('supportedProject').value.trim();
        const email = document.getElementById('email').value.trim();

        // Basic Validation
        if (!candidateName || !email || !dob || isNaN(age) || isNaN(familyMembers) || !qualification || !caste || !gender || !tribal || !pwd || !singleParentWidow || !aadharNumber || !candidatePhone || !parentPhone || !mobiliserName) {
            showMessage('error', 'Please fill in all required fields.');
            return;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            showMessage('error', 'Please enter a valid email address.');
            return;
        }
        if (!/^\d{12}$/.test(aadharNumber)) {
            showMessage('error', 'Please enter a valid 12-digit Aadhar Number.');
            return;
        }
        if (!/^\d{10}$/.test(candidatePhone) || !/^\d{10}$/.test(parentPhone)) {
            showMessage('error', 'Please enter valid 10-digit phone numbers.');
            return;
        }

        try {
            // 1. Check if user already exists by email
            const emailCheckResult = await db.query('users/by_email', {
                key: email,
                include_docs: true
            });

            if (emailCheckResult.rows.length > 0) {
                showMessage('error', 'A user with this email ID already exists. Please use a different email or login.');
                return;
            }

            // --- Generate Unique User ID (SVYMXXXX) ---
            const uniqueSuffix = await generateUniqueFourDigitSuffix();
            const userId = `SVYM${uniqueSuffix}`;
            console.log('Generated userId:', userId);

            // --- Set First Login PIN as the last 4 digits of the generated User ID ---
            const firstLoginPin = uniqueSuffix; // Directly use the generated suffix
            console.log('First Login PIN (last 4 digits of User ID):', firstLoginPin);

            // Create a new user document object
            const newUser = {
                _id: userId, // The generated SVYMXXXX ID as the document ID
                candidateName: candidateName,
                fatherHusbandName: fatherHusbandName,
                villageName: villageName,
                talukName: talukName,
                districtName: districtName,
                dob: dob,
                age: age,
                familyMembers: familyMembers,
                qualification: qualification,
                caste: caste,
                gender: gender,
                tribal: tribal,
                pwd: pwd,
                singleParentWidow: singleParentWidow,
                aadharNumber: aadharNumber,
                candidatePhone: candidatePhone,
                parentPhone: parentPhone,
                mobiliserName: mobiliserName,
                supportedProject: supportedProject,
                email: email,
                // The 'password' field is not set here; it will be set by the user during their first login.
                firstLoginPin: firstLoginPin, // This is the 4-digit PIN for the very first login
                isFirstLogin: true, // Flag to indicate a user's first login
                loginCount: 0,
                createdAt: new Date().toISOString()
            };

            console.log('Attempting to put newUser document:', newUser);
            if (!newUser._id) {
                console.error('Fatal Error: newUser._id is missing or empty before db.put()', newUser);
                showMessage('error', 'Internal system error: User ID could not be generated. Please contact support.');
                return;
            }

            // Save the user document
            const response = await db.put(newUser);

            if (response.ok) {
                showMessage('success', 'Sign up successful! Your User ID and First-time PIN are generated.');
                generatedUserIdDiv.innerHTML = `Your User ID: <strong>${userId}</strong><br>Your First-time Login PIN: <strong>${firstLoginPin}</strong>`;
                generatedUserIdDiv.style.display = 'block';
                signupForm.reset(); // Clear the form
            } else {
                showMessage('error', `Sign up failed: ${response.reason || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Full error during signup process:', error);
            if (error.status === 409) {
                showMessage('error', 'A user with this ID already exists (system conflict). Please try again.');
            } else if (error.message.includes('You are not a server admin')) {
                showMessage('error', 'Authentication error: You are not authorized to perform this action. Please ensure CouchDB credentials are set correctly in your JavaScript files.');
            } else {
                showMessage('error', `An unexpected error occurred during signup: ${error.message}. Please try again.`);
            }
        }
    });

    // Helper function to display messages
    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});
