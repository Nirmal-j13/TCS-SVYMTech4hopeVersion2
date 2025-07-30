/*document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    // Form fields
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const districtSelect = document.getElementById('districtName');
    const talukSelect = document.getElementById('talukName');

    // Error message spans
    const errorSpans = {
        candidateName: document.getElementById('candidateNameError'),
        fatherHusbandName: document.getElementById('fatherHusbandNameError'),
        districtName: document.getElementById('districtNameError'),
        talukName: document.getElementById('talukNameError'),
        villageName: document.getElementById('villageNameError'),
        dob: document.getElementById('dobError'),
        age: document.getElementById('ageError'),
        familyMembers: document.getElementById('familyMembersError'),
        qualification: document.getElementById('qualificationError'),
        caste: document.getElementById('casteError'),
        gender: document.getElementById('genderError'),
        tribal: document.getElementById('tribalError'),
        pwd: document.getElementById('pwdError'),
        aadharNumber: document.getElementById('aadharNumberError'),
        candidatePhone: document.getElementById('candidatePhoneError'),
        parentPhone: document.getElementById('parentPhoneError'),
        mobiliserName: document.getElementById('mobiliserNameError'),
        supportedProject: document.getElementById('supportedProjectError'),
        email: document.getElementById('emailError')
    };

    // Populate districts (Full list for Karnataka)
    const districts = [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
        "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal",
        "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
        "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"
    ].sort(); // Sort alphabetically for better UX

    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // --- Dynamic Taluk Population Logic (Expanded List for Karnataka) ---
    const districtTaluks = {
        "Bagalkot": ["Badami", "Bagalkot", "Bilgi", "Hungund", "Jamkhandi", "Mudhol", "Rabkavi Banhatti"],
        "Ballari": ["Ballari", "Hospet (Vijayanagara)", "Kudligi", "Sandur", "Siruguppa", "Kampli", "Hagaribommanahalli", "Kotturu", "Kurugodu", "Hoovina Hadagali"],
        "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikodi", "Gokak", "Hukkeri", "Khanapur", "Raibag", "Ramdurg", "Saundatti", "Kagwad", "Mudalagi", "Nippani"],
        "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Vijayapura"],
        "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka", "Kengeri"],
        "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad", "Kamalanagar", "Chitguppa"],
        "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
        "Chikkaballapur": ["Bagepalli", "Chikkaballapur", "Gauribidanur", "Gudibanda", "Sidlaghatta", "Chintamani"],
        "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
        "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
        "Dakshina Kannada": ["Bantwal", "Belthangady", "Mangaluru", "Puttur", "Sullia", "Kadaba", "Mulki", "Moodabidri"],
        "Davanagere": ["Channagiri", "Davanagere", "Harihar", "Honnali", "Jagalur", "Nyamathi"],
        "Dharwad": ["Annigeri", "Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar"],
        "Gadag": ["Gadag", "Gajendragad", "Laxmeshwar", "Mundargi", "Nargund", "Ron", "Shirhatti"],
        "Hassan": ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapattana", "Hassan", "Holenarasipur", "Sakleshpur"],
        "Haveri": ["Byadgi", "Hanagal", "Haveri", "Hirekerur", "Ranebennur", "Savnur", "Shiggaon"],
        "Kalaburagi (Gulbarga)": ["Afzalpur", "Aland", "Chincholi", "Chittapur", "Kalaburagi", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Yadrami"],
        "Kodagu": ["Madikeri", "Somvarpet", "Virajpet"],
        "Kolar": ["Bangarapet", "Kolar", "Malur", "Mulbagal", "Srinivaspur"],
        "Koppal": ["Gangavati", "Koppal", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi"],
        "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna", "Maddur"],
        "Mysuru": ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipur", "Krishnarajanagara", "Piriyapatna", "Saragur"],
        "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur", "Maski", "Sirwar"],
        "Ramanagara": ["Channapattana", "Kanakapura", "Magadi", "Ramanagara"],
        "Shivamogga (Shimoga)": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripur", "Shivamogga", "Sorab", "Thirthahalli"],
        "Tumakuru": ["Chiknayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
        "Udupi": ["Brahmavar", "Byndoor", "Karkala", "Kaup", "Kundapura", "Udupi", "Hebri"],
        "Uttara Kannada (Karwar)": ["Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
        "Vijayapura (Bijapur)": ["Basavana Bagewadi", "Bijapur (Vijayapura)", "Indi", "Muddebihal", "Sindagi", "Kolhar", "Tikota"],
        "Yadgir": ["Gurumitkal", "Shahapur", "Shorapur", "Vadagera", "Yadgir", "Gurumitkal"]
    };

    districtSelect.addEventListener('change', function() {
        const selectedDistrict = this.value;
        talukSelect.innerHTML = '<option value="">Select Taluk</option>'; // Reset taluk options
        talukSelect.disabled = true; // Disable until a valid district is selected

        if (selectedDistrict && districtTaluks[selectedDistrict]) {
            // Sort taluks alphabetically for the selected district
            const taluksForDistrict = districtTaluks[selectedDistrict].sort();
            taluksForDistrict.forEach(taluk => {
                const option = document.createElement('option');
                option.value = taluk;
                option.textContent = taluk;
                talukSelect.appendChild(option);
            });
            talukSelect.disabled = false; // Enable taluk dropdown
        }
        clearError(districtSelect); // Clear error if district selected
        clearError(talukSelect); // Clear taluk error if district changes
    });

    // --- End Dynamic Taluk Population Logic ---


    // Calculate age based on DOB
    dobInput.addEventListener('change', function() {
        const dob = new Date(this.value);
        if (isNaN(dob)) {
            ageInput.value = '';
            showError(dobInput, 'Please enter a valid date.');
            return;
        }
        clearError(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        ageInput.value = age;
        if (age < 18) {
            showError(ageInput, 'Applicant must be at least 18 years old.');
        } else {
            clearError(ageInput);
        }
    });

    // Helper to show error messages next to fields
    function showError(inputElement, message) {
        const errorSpanId = inputElement.id + 'Error';
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = message;
            inputElement.classList.add('input-error'); // Add a class for visual error styling
        }
    }

    // Helper to clear error messages
    function clearError(inputElement) {
        const errorSpanId = inputElement.id + 'Error';
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = '';
            inputElement.classList.remove('input-error');
        }
    }

    // Live validation for required fields
    signupForm.querySelectorAll('input, select').forEach(input => {
        if (input.hasAttribute('required')) {
            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    showError(this, 'This field is required.');
                } else {
                    clearError(this);
                }
            });
        }
        // Specific pattern validation (e.g., Aadhar, Phone)
        if (input.hasAttribute('pattern')) {
            input.addEventListener('input', function() {
                if (!this.validity.valid) {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (!this.validity.valid && this.value.trim() !== '') {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
        }
    });

    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Clear previous messages and errors
        messageDiv.style.display = 'none';
        generatedUserIdDiv.style.display = 'none';
        messageDiv.className = '';
        Object.values(errorSpans).forEach(span => {
            if (span) span.textContent = '';
        });
        signupForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Manual validation before submission
        let isValid = true;
        const formData = new FormData(signupForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }

        // Re-validate all fields on submit
        signupForm.querySelectorAll('input, select').forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                showError(input, 'This field is required.');
                isValid = false;
            } else if (input.hasAttribute('pattern') && input.value.trim() !== '' && !input.validity.valid) {
                showError(input, input.title || 'Invalid format.');
                isValid = false;
            } else {
                clearError(input);
            }
        });

        if (parseInt(ageInput.value) < 18) {
            showError(ageInput, 'Applicant must be at least 18 years old.');
            isValid = false;
        }

        // Specific validation for dropdowns
        if (districtSelect.value === '') {
            showError(districtSelect, 'Please select a district.');
            isValid = false;
        }
        if (talukSelect.value === '') {
            showError(talukSelect, 'Please select a taluk.');
            isValid = false;
        }


        if (!isValid) {
            showMessage('error', 'Please correct the errors in the form.');
            return;
        }

        try {
            // CALLING NETLIFY FUNCTION DIRECTLY: Change from '/api/...'
            const response = await fetch('/.netlify/functions/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('success', result.message || 'Sign up successful!');
                generatedUserIdDiv.innerHTML = `Your User ID: <strong>${result.userId}</strong><br>Please remember this ID for login.`;
                generatedUserIdDiv.style.display = 'block';
                signupForm.reset(); // Clear the form
                ageInput.value = ''; // Clear age field too
                talukSelect.innerHTML = '<option value="">Select Taluk</option>'; // Reset taluk options
                talukSelect.disabled = true; // Disable taluk dropdown
            } else {
                showMessage('error', result.message || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            showMessage('error', 'An unexpected error occurred. Please try again later.');
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = ''; // Clear existing classes
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});*/

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    // Form fields
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const districtSelect = document.getElementById('districtName');
    const talukSelect = document.getElementById('talukName');

    // Error message spans
    const errorSpans = {
        candidateName: document.getElementById('candidateNameError'),
        fatherHusbandName: document.getElementById('fatherHusbandNameError'),
        districtName: document.getElementById('districtNameError'),
        talukName: document.getElementById('talukNameError'),
        villageName: document.getElementById('villageNameError'),
        dob: document.getElementById('dobError'),
        age: document.getElementById('ageError'),
        familyMembers: document.getElementById('familyMembersError'),
        qualification: document.getElementById('qualificationError'),
        caste: document.getElementById('casteError'),
        gender: document.getElementById('genderError'),
        tribal: document.getElementById('tribalError'),
        pwd: document.getElementById('pwdError'),
        aadharNumber: document.getElementById('aadharNumberError'),
        candidatePhone: document.getElementById('candidatePhoneError'),
        parentPhone: document.getElementById('parentPhoneError'),
        mobiliserName: document.getElementById('mobiliserNameError'),
        supportedProject: document.getElementById('supportedProjectError'),
        email: document.getElementById('emailError')
    };

    // Populate districts (Full list for Karnataka)
    const districts = [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
        "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal",
        "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
        "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"
    ].sort(); // Sort alphabetically for better UX

    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // --- Dynamic Taluk Population Logic (Expanded List for Karnataka) ---
    const districtTaluks = {
        "Bagalkot": ["Badami", "Bagalkot", "Bilgi", "Hungund", "Jamkhandi", "Mudhol", "Rabkavi Banhatti"],
        "Ballari": ["Ballari", "Hospet (Vijayanagara)", "Kudligi", "Sandur", "Siruguppa", "Kampli", "Hagaribommanahalli", "Kotturu", "Kurugodu", "Hoovina Hadagali"],
        "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikodi", "Gokak", "Hukkeri", "Khanapur", "Raibag", "Ramdurg", "Saundatti", "Kagwad", "Mudalagi", "Nippani"],
        "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Vijayapura"],
        "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka", "Kengeri"],
        "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad", "Kamalanagar", "Chitguppa"],
        "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
        "Chikkaballapur": ["Bagepalli", "Chikkaballapur", "Gauribidanur", "Gudibanda", "Sidlaghatta", "Chintamani"],
        "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
        "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
        "Dakshina Kannada": ["Bantwal", "Belthangady", "Mangaluru", "Puttur", "Sullia", "Kadaba", "Mulki", "Moodabidri"],
        "Davanagere": ["Channagiri", "Davanagere", "Harihar", "Honnali", "Jagalur", "Nyamathi"],
        "Dharwad": ["Annigeri", "Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar"],
        "Gadag": ["Gadag", "Gajendragad", "Laxmeshwar", "Mundargi", "Nargund", "Ron", "Shirhatti"],
        "Hassan": ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapattana", "Hassan", "Holenarasipur", "Sakleshpur"],
        "Haveri": ["Byadgi", "Hanagal", "Haveri", "Hirekerur", "Ranebennur", "Savnur", "Shiggaon"],
        "Kalaburagi (Gulbarga)": ["Afzalpur", "Aland", "Chincholi", "Chittapur", "Kalaburagi", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Yadrami"],
        "Kodagu": ["Madikeri", "Somvarpet", "Virajpet"],
        "Kolar": ["Bangarapet", "Kolar", "Malur", "Mulbagal", "Srinivaspur"],
        "Koppal": ["Gangavati", "Koppal", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi"],
        "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna", "Maddur"],
        "Mysuru": ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipur", "Krishnarajanagara", "Piriyapatna", "Saragur"],
        "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur", "Maski", "Sirwar"],
        "Ramanagara": ["Channapattana", "Kanakapura", "Magadi", "Ramanagara"],
        "Shivamogga (Shimoga)": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripur", "Shivamogga", "Sorab", "Thirthahalli"],
        "Tumakuru": ["Chiknayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
        "Udupi": ["Brahmavar", "Byndoor", "Karkala", "Kaup", "Kundapura", "Udupi", "Hebri"],
        "Uttara Kannada (Karwar)": ["Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
        "Vijayapura (Bijapur)": ["Basavana Bagewadi", "Bijapur (Vijayapura)", "Indi", "Muddebihal", "Sindagi", "Kolhar", "Tikota"],
        "Yadgir": ["Gurumitkal", "Shahapur", "Shorapur", "Vadagera", "Yadgir", "Gurumitkal"]
    };

    districtSelect.addEventListener('change', function() {
        const selectedDistrict = this.value;
        talukSelect.innerHTML = '<option value="">Select Taluk</option>'; // Reset taluk options
        talukSelect.disabled = true; // Disable until a valid district is selected

        if (selectedDistrict && districtTaluks[selectedDistrict]) {
            const taluksForDistrict = districtTaluks[selectedDistrict].sort();
            taluksForDistrict.forEach(taluk => {
                const option = document.createElement('option');
                option.value = taluk;
                option.textContent = taluk;
                talukSelect.appendChild(option);
            });
            talukSelect.disabled = false;
        }
        clearError(districtSelect);
        clearError(talukSelect);
    });

    dobInput.addEventListener('change', function() {
        const dob = new Date(this.value);
        if (isNaN(dob)) {
            ageInput.value = '';
            showError(dobInput, 'Please enter a valid date.');
            return;
        }
        clearError(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        ageInput.value = age;
        if (age < 18) {
            showError(ageInput, 'Applicant must be at least 18 years old.');
        } else {
            clearError(ageInput);
        }
    });

    function showError(inputElement, message) {
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = message;
            inputElement.classList.add('input-error');
        }
    }

    function clearError(inputElement) {
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = '';
            inputElement.classList.remove('input-error');
        }
    }

    signupForm.querySelectorAll('input, select').forEach(input => {
        if (input.hasAttribute('required')) {
            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    showError(this, 'This field is required.');
                } else {
                    clearError(this);
                }
            });
        }
        if (input.hasAttribute('pattern')) {
            input.addEventListener('input', function() {
                if (!this.validity.valid) {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (!this.validity.valid && this.value.trim() !== '') {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
        }
    });

    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        messageDiv.style.display = 'none';
        generatedUserIdDiv.style.display = 'none';
        messageDiv.className = '';
        Object.values(errorSpans).forEach(span => {
            if (span) span.textContent = '';
        });
        signupForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        let isValid = true;
        const formData = new FormData(signupForm);
        const userData = {};
        for (let [key, value] of formData.entries()) {
            userData[key] = value.trim();
        }

        signupForm.querySelectorAll('input, select').forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                showError(input, 'This field is required.');
                isValid = false;
            } else if (input.hasAttribute('pattern') && input.value.trim() !== '' && !input.validity.valid) {
                showError(input, input.title || 'Invalid format.');
                isValid = false;
            } else {
                clearError(input);
            }
        });

        if (parseInt(ageInput.value) < 18) {
            showError(ageInput, 'Applicant must be at least 18 years old.');
            isValid = false;
        }

        if (districtSelect.value === '') {
            showError(districtSelect, 'Please select a district.');
            isValid = false;
        }
        if (talukSelect.value === '') {
            showError(talukSelect, 'Please select a taluk.');
            isValid = false;
        }

        if (!isValid) {
            showMessage('error', 'Please correct the errors in the form.');
            return;
        }

        // --- Client-Side Storage Logic ---
        let users = JSON.parse(sessionStorage.getItem('users')) || [];

        let userId = '';
        let initialPin = ''; // Declare initialPin here
        let isUnique = false;
        // Generate a random 4-digit ID and check for uniqueness within current session
        while (!isUnique) {
            const randomNum = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
            const randomIdPart = String(randomNum).padStart(4, '0'); // Ensure it's always 4 digits string
            const potentialUserId = 'SVYM' + randomIdPart;

            if (!users.some(u => u.userId === potentialUserId)) {
                userId = potentialUserId;
                initialPin = randomIdPart; // Use the 4-digit padded random number directly as PIN
                isUnique = true;
            }
        }

        // Check for Aadhar/Email uniqueness within current session storage users
        const isAadharTaken = users.some(u => u.aadharNumber === userData.aadharNumber);
        const isEmailTaken = users.some(u => u.email === userData.email);

        if (isAadharTaken) {
            showMessage('error', 'A user with this Aadhar Number already exists in this session.');
            showError(document.getElementById('aadharNumber'), 'Aadhar Number already registered.');
            return;
        }
        if (isEmailTaken) {
            showMessage('error', 'A user with this Email ID already exists in this session.');
            showError(document.getElementById('email'), 'Email ID already registered.');
            return;
        }

        const newUser = {
            ...userData,
            userId: userId,
            pin: initialPin, // Set PIN to the generated 4-digit random part
            isFirstLogin: true, // Flag for first-time login PIN change
            status: 'pending' // For admin approval simulation, if needed later
        };

        users.push(newUser);
        sessionStorage.setItem('users', JSON.stringify(users));

        showMessage('success', 'Sign up successful! Your account has been created.');
        generatedUserIdDiv.innerHTML = `Your User ID: <strong>${userId}</strong><br>Your default PIN is: <strong>${initialPin}</strong>. Please remember these for login.`;
        generatedUserIdDiv.style.display = 'block';

        // Clear form and reset UI
        signupForm.reset();
        ageInput.value = '';
        talukSelect.innerHTML = '<option value="">Select Taluk</option>';
        talukSelect.disabled = true;

        console.log("Users in session storage:", users);
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});