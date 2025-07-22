document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Collect all form data
        const formData = {
            candidateName: document.getElementById('candidateName').value.trim(),
            fatherHusbandName: document.getElementById('fatherHusbandName').value.trim(),
            villageName: document.getElementById('villageName').value.trim(),
            talukName: document.getElementById('talukName').value.trim(),
            districtName: document.getElementById('districtName').value.trim(),
            dob: document.getElementById('dob').value.trim(),
            age: parseInt(document.getElementById('age').value.trim(), 10),
            familyMembers: parseInt(document.getElementById('familyMembers').value.trim(), 10),
            qualification: document.getElementById('qualification').value.trim(),
            caste: document.getElementById('caste').value.trim(),
            gender: document.getElementById('gender').value.trim(),
            tribal: document.getElementById('tribal').value.trim(),
            pwd: document.getElementById('pwd').value.trim(),
            aadharNumber: document.getElementById('aadharNumber').value.trim(),
            candidatePhone: document.getElementById('candidatePhone').value.trim(),
            parentPhone: document.getElementById('parentPhone').value.trim(),
            mobiliserName: document.getElementById('mobiliserName').value.trim(),
            supportedProject: document.getElementById('supportedProject').value.trim(),
            email: document.getElementById('email').value.trim()
        };

        // Basic Frontend Validation (Backend will re-validate too)
        const {
            candidateName, email, dob, age, familyMembers, qualification, caste,
            gender, tribal, pwd, singleParentWidow, aadharNumber, candidatePhone,
            parentPhone, mobiliserName
        } = formData;

        if (!candidateName || !email || !dob || isNaN(age) || isNaN(familyMembers) ||
            !qualification || !caste || !gender || !tribal || !pwd  ||
            !aadharNumber || !candidatePhone || !parentPhone || !mobiliserName) {
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
            // **NEW: Call the Netlify Function for signup**
            const response = await fetch('/.netlify/functions/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('success', data.message);
                generatedUserIdDiv.innerHTML = `Your User ID: <strong>${data.userId}</strong><br>Your First-time Login PIN: <strong>${data.firstLoginPin}</strong>`;
                generatedUserIdDiv.style.display = 'block';
                signupForm.reset();
            } else {
                showMessage('error', data.message || 'Sign up failed due to an unknown error.');
            }

        } catch (error) {
            console.error('Error during signup fetch:', error);
            showMessage('error', `An unexpected network error occurred: ${error.message}. Please try again.`);
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});