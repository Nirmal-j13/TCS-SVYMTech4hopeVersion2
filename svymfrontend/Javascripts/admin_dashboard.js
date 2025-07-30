document.addEventListener('DOMContentLoaded', function() {
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const mainMessageDiv = document.getElementById('mainMessage');

    // Sidebar elements
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('main.main-content section');

    // --- Security Check: Ensure admin is logged in ---
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loggedInAdminUsername = sessionStorage.getItem('loggedInAdminUsername');

    if (!adminLoggedIn || !loggedInAdminUsername) {
        console.log('Admin not logged in, redirecting to login.html'); // DEBUG: Added log
        window.location.href = 'login.html';
        return;
    }

    console.log(`Admin ${loggedInAdminUsername} is logged in.`);

    // --- Utility Functions ---
    function showMainMessage(type, text) {
        mainMessageDiv.textContent = text;
        mainMessageDiv.className = `message ${type}`;
        mainMessageDiv.style.display = 'block';
        setTimeout(() => {
            mainMessageDiv.style.display = 'none';
        }, 5000);
    }

    // Function to show messages specific to a form (e.g., inside a modal)
    function showFormMessage(messageElement, type, text) {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        // Auto-hide after 3 seconds for form messages
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    // --- Sidebar Navigation Logic ---
    function activateSidebarLink(targetId) {
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar-link[href="#${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        sections.forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Event listeners for sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            activateSidebarLink(targetId);

            // Re-render tables when their section is activated
            if (targetId === 'studentRequests') {
                renderStudentsTable();
            } else if (targetId === 'trainerDetails') {
                renderTrainersTable();
            } else if (targetId === 'mobilizerDetails') {
                renderMobilizersTable();
            }
        });
    });

    // Initial activation: Show the Students section on load
    if (sections.length > 0) {
        activateSidebarLink('studentRequests'); // Default to Students section
    }


    // --- Logout Functionality ---
    adminLogoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('loggedInAdminUsername');
        window.location.href = 'login.html';
    });


    // =========================================================
    // --- Student Management Logic (CRUD Operations) ---
    // =========================================================
    const studentsTableBody = document.getElementById('studentsTableBody');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const closeStudentModalBtn = studentModal ? studentModal.querySelector('.close-button') : null;
    const cancelStudentButton = studentModal ? studentModal.querySelector('.cancel-button') : null;
    const studentModalTitle = document.getElementById('modalTitle');
    const studentForm = document.getElementById('studentForm');
    const formStudentId = document.getElementById('studentFormUserId');

    // Student Form elements
    const formCandidateName = document.getElementById('formCandidateName');
    const formFatherHusbandName = document.getElementById('formFatherHusbandName');
    const formDistrictName = document.getElementById('formDistrictName');
    const formTalukName = document.getElementById('formTalukName');
    const formVillageName = document.getElementById('formVillageName');
    const formDob = document.getElementById('formDob');
    const formAge = document.getElementById('formAge');
    const formFamilyMembers = document.getElementById('formFamilyMembers');
    const formQualification = document.getElementById('formQualification');
    const formCaste = document.getElementById('formCaste');
    const formGender = document.getElementById('formGender');
    const formTribal = document.getElementById('formTribal');
    const formPwd = document.getElementById('formPwd');
    const formAadharNumber = document.getElementById('formAadharNumber');
    const formCandidatePhone = document.getElementById('formCandidatePhone');
    const formParentPhone = document.getElementById('formParentPhone');
    const formMobiliserName = document.getElementById('formMobiliserName');
    const formSupportedProject = document.getElementById('formSupportedProject');
    const formEmail = document.getElementById('formEmail');
    const formStatus = document.getElementById('formStatus');
    const formSecurityQuestion = document.getElementById('formSecurityQuestion');
    const formSecurityAnswer = document.getElementById('formSecurityAnswer');
    const formPinGroup = document.getElementById('formPinGroup');
    const formPin = document.getElementById('formPin');
    const formConfirmPinGroup = document.getElementById('formConfirmPinGroup');
    const formConfirmPin = document.getElementById('formConfirmPin');
    const formMessage = document.getElementById('formMessage');

    // Event listener for DOB to calculate age automatically
    if (formDob) {
        formDob.addEventListener('change', function() {
            if (this.value) {
                const birthDate = new Date(this.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                formAge.value = age;
            } else {
                formAge.value = '';
            }
        });
    }


    function renderStudentsTable() {
        console.log('renderStudentsTable called.'); // DEBUG: Added log
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        console.log('All users from sessionStorage:', users); // DEBUG: Added log
        // Filter for actual student users (User IDs starting with 'SVYM' and length 9)
        const students = users.filter(user => user.userId && user.userId.startsWith('SVYM') && user.userId.length === 9);
        console.log('Filtered students:', students); // DEBUG: Added log

        if (studentsTableBody) {
            studentsTableBody.innerHTML = ''; // Clear existing content

            if (students.length === 0) {
                studentsTableBody.innerHTML = '<tr><td colspan="6">No student records found.</td></tr>';
            } else {
                students.forEach(student => {
                    const row = `
                        <tr>
                            <td>${student.userId}</td>
                            <td>${student.candidateName || 'N/A'}</td>
                            <td>${student.email || 'N/A'}</td>
                            <td>${student.districtName || 'N/A'}</td>
                            <td>${student.status || (student.isFirstLogin ? 'Pending Activation' : 'Active')}</td>
                            <td>
                                <button class="action-btn-primary edit-student-btn" data-user-id="${student.userId}">Edit</button>
                                <button class="action-btn-danger delete-student-btn" data-user-id="${student.userId}">Delete</button>
                            </td>
                        </tr>
                    `;
                    studentsTableBody.insertAdjacentHTML('beforeend', row);
                });

                // Attach event listeners for edit and delete buttons
                studentsTableBody.querySelectorAll('.edit-student-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToEdit = this.dataset.userId;
                        openAddEditStudentModal(userIdToEdit);
                    });
                });

                studentsTableBody.querySelectorAll('.delete-student-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToDelete = this.dataset.userId;
                        deleteStudent(userIdToDelete);
                    });
                });
            }
        } else {
            console.error('studentsTableBody element not found!'); // DEBUG: Added error log
        }
    }

    function openAddEditStudentModal(userId = null) {
        if (!studentModal) return;

        showFormMessage(formMessage, '', ''); // Clear previous messages
        studentForm.reset(); // Clear the form

        if (userId) { // Edit mode
            studentModalTitle.textContent = `Edit Student: ${userId}`;
            formStudentId.value = userId; // Store userId in hidden field
            formPinGroup.style.display = 'none'; // Hide PIN fields for edit
            formPin.removeAttribute('required');
            formConfirmPinGroup.style.display = 'none';
            formConfirmPin.removeAttribute('required');

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const studentToEdit = users.find(u => u.userId === userId);

            if (studentToEdit) {
                // Populate all fields from session storage
                formCandidateName.value = studentToEdit.candidateName || '';
                formFatherHusbandName.value = studentToEdit.fatherHusbandName || '';
                formDistrictName.value = studentToEdit.districtName || '';
                formTalukName.value = studentToEdit.talukName || '';
                formVillageName.value = studentToEdit.villageName || '';
                formDob.value = studentToEdit.dob || '';
                formAge.value = studentToEdit.age || '';
                formFamilyMembers.value = studentToEdit.familyMembers || '';
                formQualification.value = studentToEdit.qualification || '';
                formCaste.value = studentToEdit.caste || '';
                formGender.value = studentToEdit.gender || '';
                formTribal.value = studentToEdit.tribal || '';
                formPwd.value = studentToEdit.pwd || '';
                formAadharNumber.value = studentToEdit.aadharNumber || '';
                formCandidatePhone.value = studentToEdit.candidatePhone || '';
                formParentPhone.value = studentToEdit.parentPhone || '';
                formMobiliserName.value = studentToEdit.mobiliserName || '';
                formSupportedProject.value = studentToEdit.supportedProject || '';
                formEmail.value = studentToEdit.email || '';
                formStatus.value = studentToEdit.status || (studentToEdit.isFirstLogin ? 'Pending' : 'Active');
                formSecurityQuestion.value = studentToEdit.securityQuestion || '';
                formSecurityAnswer.value = studentToEdit.securityAnswer || '';
                console.log('Populated student data for edit:', studentToEdit); // DEBUG: Added log
            } else {
                showFormMessage(formMessage, 'error', 'Student not found for editing.');
                console.warn('Student not found for editing, userId:', userId); // DEBUG: Added log
                return;
            }
        } else { // Add mode
            studentModalTitle.textContent = 'Add New Student';
            formStudentId.value = ''; // Clear hidden ID
            formPinGroup.style.display = 'block'; // Show PIN fields for new user
            formPin.setAttribute('required', 'required');
            formConfirmPinGroup.style.display = 'block';
            formConfirmPin.setAttribute('required', 'required');
            formStatus.value = 'Pending'; // Default status for new users
            console.log('Opening modal for new student.'); // DEBUG: Added log
        }
        studentModal.style.display = 'flex'; // Show modal
    }

    if (studentForm) {
        studentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Student form submitted.'); // DEBUG: Added log

            const isEditMode = !!formStudentId.value;
            let users = JSON.parse(sessionStorage.getItem('users')) || [];

            const newStudentData = {
                candidateName: formCandidateName.value,
                fatherHusbandName: formFatherHusbandName.value,
                districtName: formDistrictName.value,
                talukName: formTalukName.value,
                villageName: formVillageName.value,
                dob: formDob.value,
                age: formAge.value,
                familyMembers: formFamilyMembers.value,
                qualification: formQualification.value,
                caste: formCaste.value,
                gender: formGender.value,
                tribal: formTribal.value,
                pwd: formPwd.value,
                aadharNumber: formAadharNumber.value,
                candidatePhone: formCandidatePhone.value,
                parentPhone: formParentPhone.value,
                mobiliserName: formMobiliserName.value,
                supportedProject: formSupportedProject.value,
                email: formEmail.value,
                status: formStatus.value,
                securityQuestion: formSecurityQuestion.value,
                securityAnswer: formSecurityAnswer.value
            };

            if (!isEditMode) { // Adding a new student
                console.log('Attempting to add new student.'); // DEBUG: Added log
                if (formPin.value !== formConfirmPin.value) {
                    showFormMessage(formMessage, 'error', 'PIN and Confirm PIN do not match.');
                    console.warn('PIN mismatch.'); // DEBUG: Added log
                    return;
                }
                if (formPin.value.length !== 4 || !/^\d{4}$/.test(formPin.value)) {
                    showFormMessage(formMessage, 'error', 'PIN must be a 4-digit number.');
                    console.warn('Invalid PIN format.'); // DEBUG: Added log
                    return;
                }

                // Check if email or Aadhar already exists for any user (admin or student)
                if (users.some(u => u.email && u.email.toLowerCase() === newStudentData.email.toLowerCase())) {
                    showFormMessage(formMessage, 'error', 'A user with this Email ID already exists.');
                    console.warn('Duplicate email:', newStudentData.email); // DEBUG: Added log
                    return;
                }
                if (users.some(u => u.aadharNumber === newStudentData.aadharNumber)) {
                    showFormMessage(formMessage, 'error', 'A user with this Aadhar Number already exists.');
                    console.warn('Duplicate Aadhar:', newStudentData.aadharNumber); // DEBUG: Added log
                    return;
                }

                // Generate a unique User ID
                let newUserId;
                do {
                    newUserId = 'SVYM' + Math.floor(1000 + Math.random() * 9000); // SVYM1000-SVYM9999
                } while (users.some(u => u.userId === newUserId)); // Ensure uniqueness

                const newStudent = {
                    userId: newUserId,
                    role: 'student', // Assign role
                    ...newStudentData,
                    pin: formPin.value, // Store plain PIN for demo; in real app, hash it!
                    isFirstLogin: true, // New users are always first login
                };

                users.push(newStudent);
                console.log('New student object created and added to array:', newStudent); // DEBUG: Added log
                showFormMessage(formMessage, 'success', 'Student added successfully!');

            } else { // Editing an existing student
                console.log('Attempting to edit existing student.'); // DEBUG: Added log
                const userIdToEdit = formStudentId.value;
                const studentIndex = users.findIndex(u => u.userId === userIdToEdit);

                if (studentIndex !== -1) {
                    // Check if email or Aadhar already exists for another user (if changed)
                    if (users.some((u, idx) => u.email && u.email.toLowerCase() === newStudentData.email.toLowerCase() && idx !== studentIndex)) {
                        showFormMessage(formMessage, 'error', 'A user with this Email ID already exists.');
                        console.warn('Duplicate email during edit:', newStudentData.email); // DEBUG: Added log
                        return;
                    }
                    if (users.some((u, idx) => u.aadharNumber === newStudentData.aadharNumber && idx !== studentIndex)) {
                        showFormMessage(formMessage, 'error', 'A user with this Aadhar Number already exists.');
                        console.warn('Duplicate Aadhar during edit:', newStudentData.aadharNumber); // DEBUG: Added log
                        return;
                    }

                    // Update all mutable fields
                    users[studentIndex] = {
                        ...users[studentIndex],
                        ...newStudentData
                    };
                    console.log('Student updated in array:', users[studentIndex]); // DEBUG: Added log
                    showFormMessage(formMessage, 'success', `Student ${userIdToEdit} updated successfully!`);
                } else {
                    showFormMessage(formMessage, 'error', 'Error: Student not found for update.');
                    console.error('Student not found for update, userId:', userIdToEdit); // DEBUG: Added error log
                }
            }

            sessionStorage.setItem('users', JSON.stringify(users));
            console.log('Users array saved to sessionStorage. Current sessionStorage users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
            renderStudentsTable();
            setTimeout(() => {
                if(studentModal) studentModal.style.display = 'none';
            }, 1500); // Hide modal after a delay
        });
    }

    function deleteStudent(userId) {
        if (confirm(`Are you sure you want to delete student ${userId}? This action cannot be undone.`)) {
            console.log('Attempting to delete student:', userId); // DEBUG: Added log
            let users = JSON.parse(sessionStorage.getItem('users')) || [];
            const initialLength = users.length;
            users = users.filter(user => user.userId !== userId);

            if (users.length < initialLength) {
                sessionStorage.setItem('users', JSON.stringify(users));
                console.log('Student deleted from sessionStorage. Remaining users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
                renderStudentsTable();
                showMainMessage('success', `Student ${userId} deleted successfully.`);
            } else {
                showMainMessage('error', 'Error: Student not found for deletion.');
                console.error('Student not found for deletion:', userId); // DEBUG: Added error log
            }
        }
    }

    // --- Student Modal Event Listeners ---
    if (addStudentBtn) addStudentBtn.addEventListener('click', () => openAddEditStudentModal());
    if (closeStudentModalBtn) closeStudentModalBtn.addEventListener('click', () => studentModal.style.display = 'none');
    if (cancelStudentButton) cancelStudentButton.addEventListener('click', () => studentModal.style.display = 'none');
    if (studentModal) {
        window.addEventListener('click', (event) => {
            if (event.target === studentModal) {
                studentModal.style.display = 'none';
            }
        });
    }


    // =========================================================
    // --- Trainer Management Logic (CRUD Operations) ---
    // =========================================================
    // (Existing Trainer code - no new debug logs needed here for student issue)
    const trainersTableBody = document.getElementById('trainersTableBody');
    const addTrainerBtn = document.getElementById('addTrainerBtn');
    const trainerModal = document.getElementById('trainerModal');
    const closeTrainerModalBtn = trainerModal ? trainerModal.querySelector('.close-button') : null;
    const cancelTrainerButton = trainerModal ? trainerModal.querySelector('.cancel-button') : null;
    const trainerModalTitle = trainerModal ? trainerModal.querySelector('#trainerModalTitle') : null;
    const trainerForm = document.getElementById('trainerForm');
    const formTrainerId = document.getElementById('formTrainerId');
    const formTrainerName = document.getElementById('formTrainerName');
    const formTrainerExpertise = document.getElementById('formTrainerExpertise');
    const formTrainerContact = document.getElementById('formTrainerContact');
    const formTrainerPin = document.getElementById('formTrainerPin');
    const formTrainerConfirmPin = document.getElementById('formTrainerConfirmPin');
    const formTrainerSecurityQuestion = document.getElementById('formTrainerSecurityQuestion');
    const formTrainerSecurityAnswer = document.getElementById('formTrainerSecurityAnswer');
    const formTrainerPinGroup = document.getElementById('formTrainerPinGroup');
    const formTrainerConfirmPinGroup = document.getElementById('formTrainerConfirmPinGroup');
    const formTrainerMessage = trainerModal ? trainerModal.querySelector('#trainerFormMessage') : null;


    function renderTrainersTable() {
        console.log('renderTrainersTable called.'); // DEBUG: Added log
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        const trainers = users.filter(user => user.role === 'trainer');
        console.log('Filtered trainers:', trainers); // DEBUG: Added log

        if (trainersTableBody) {
            trainersTableBody.innerHTML = '';
            if (trainers.length === 0) {
                trainersTableBody.innerHTML = '<tr><td colspan="5">No trainer records found.</td></tr>';
            } else {
                trainers.forEach(trainer => {
                    const row = `
                        <tr>
                            <td>${trainer.userId}</td>
                            <td>${trainer.name || 'N/A'}</td>
                            <td>${trainer.expertise || 'N/A'}</td>
                            <td>${trainer.contact || 'N/A'}</td>
                            <td>
                                <button class="action-btn-primary edit-trainer-btn" data-user-id="${trainer.userId}">Edit</button>
                                <button class="action-btn-danger delete-trainer-btn" data-user-id="${trainer.userId}">Delete</button>
                            </td>
                        </tr>
                    `;
                    trainersTableBody.insertAdjacentHTML('beforeend', row);
                });

                trainersTableBody.querySelectorAll('.edit-trainer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToEdit = this.dataset.userId;
                        openAddEditTrainerModal(userIdToEdit);
                    });
                });

                trainersTableBody.querySelectorAll('.delete-trainer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToDelete = this.dataset.userId;
                        deleteTrainer(userIdToDelete);
                    });
                });
            }
        } else {
            console.error('trainersTableBody element not found!'); // DEBUG: Added error log
        }
    }

    function openAddEditTrainerModal(userId = null) {
        if (!trainerModal) return;

        showFormMessage(formTrainerMessage, '', ''); // Clear previous messages
        trainerForm.reset();

        if (userId) { // Edit mode
            trainerModalTitle.textContent = `Edit Trainer: ${userId}`;
            formTrainerId.value = userId;
            formTrainerPinGroup.style.display = 'none';
            formTrainerPin.removeAttribute('required');
            formTrainerConfirmPinGroup.style.display = 'none';
            formTrainerConfirmPin.removeAttribute('required');

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const trainerToEdit = users.find(u => u.userId === userId);

            if (trainerToEdit) {
                formTrainerName.value = trainerToEdit.name || '';
                formTrainerExpertise.value = trainerToEdit.expertise || '';
                formTrainerContact.value = trainerToEdit.contact || '';
                formTrainerSecurityQuestion.value = trainerToEdit.securityQuestion || '';
                formTrainerSecurityAnswer.value = trainerToEdit.securityAnswer || '';
                console.log('Populated trainer data for edit:', trainerToEdit); // DEBUG: Added log
            } else {
                showFormMessage(formTrainerMessage, 'error', 'Trainer not found for editing.');
                console.warn('Trainer not found for editing, userId:', userId); // DEBUG: Added log
                return;
            }
        } else { // Add mode
            trainerModalTitle.textContent = 'Add New Trainer';
            formTrainerId.value = '';
            formTrainerPinGroup.style.display = 'block';
            formTrainerPin.setAttribute('required', 'required');
            formTrainerConfirmPinGroup.style.display = 'block';
            formTrainerConfirmPin.setAttribute('required', 'required');
            console.log('Opening modal for new trainer.'); // DEBUG: Added log
        }
        trainerModal.style.display = 'flex';
    }

    if (trainerForm) {
        trainerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Trainer form submitted.'); // DEBUG: Added log

            const isEditMode = !!formTrainerId.value;
            let users = JSON.parse(sessionStorage.getItem('users')) || [];

            const newTrainerData = {
                name: formTrainerName.value,
                expertise: formTrainerExpertise.value,
                contact: formTrainerContact.value,
                securityQuestion: formTrainerSecurityQuestion.value,
                securityAnswer: formTrainerSecurityAnswer.value
            };

            if (!isEditMode) { // Adding a new trainer
                console.log('Attempting to add new trainer.'); // DEBUG: Added log
                if (formTrainerPin.value !== formTrainerConfirmPin.value) {
                    showFormMessage(formTrainerMessage, 'error', 'PIN and Confirm PIN do not match.');
                    console.warn('Trainer PIN mismatch.'); // DEBUG: Added log
                    return;
                }
                if (formTrainerPin.value.length !== 4 || !/^\d{4}$/.test(formTrainerPin.value)) {
                    showFormMessage(formTrainerMessage, 'error', 'PIN must be a 4-digit number.');
                    console.warn('Invalid Trainer PIN format.'); // DEBUG: Added log
                    return;
                }

                if (users.some(u => u.contact && u.contact.toLowerCase() === newTrainerData.contact.toLowerCase())) {
                    showFormMessage(formTrainerMessage, 'error', 'A trainer with this Contact (Email/Phone) already exists.');
                    console.warn('Duplicate trainer contact:', newTrainerData.contact); // DEBUG: Added log
                    return;
                }

                let newUserId;
                do {
                    newUserId = 'TRN' + Math.floor(100 + Math.random() * 900); // TRN100-TRN999
                } while (users.some(u => u.userId === newUserId));

                const newTrainer = {
                    userId: newUserId,
                    role: 'trainer',
                    ...newTrainerData,
                    pin: formTrainerPin.value,
                    isFirstLogin: true,
                    status: 'Active' // Default status for trainers
                };

                users.push(newTrainer);
                console.log('New trainer object created and added to array:', newTrainer); // DEBUG: Added log
                showFormMessage(formTrainerMessage, 'success', 'Trainer added successfully!');

            } else { // Editing an existing trainer
                console.log('Attempting to edit existing trainer.'); // DEBUG: Added log
                const userIdToEdit = formTrainerId.value;
                const trainerIndex = users.findIndex(u => u.userId === userIdToEdit);

                if (trainerIndex !== -1) {
                    if (users.some((u, idx) => u.contact && u.contact.toLowerCase() === newTrainerData.contact.toLowerCase() && idx !== trainerIndex)) {
                        showFormMessage(formTrainerMessage, 'error', 'A trainer with this Contact (Email/Phone) already exists.');
                        console.warn('Duplicate trainer contact during edit:', newTrainerData.contact); // DEBUG: Added log
                        return;
                    }

                    users[trainerIndex] = {
                        ...users[trainerIndex],
                        ...newTrainerData
                    };
                    console.log('Trainer updated in array:', users[trainerIndex]); // DEBUG: Added log
                    showFormMessage(formTrainerMessage, 'success', `Trainer ${userIdToEdit} updated successfully!`);
                } else {
                    showFormMessage(formTrainerMessage, 'error', 'Error: Trainer not found for update.');
                    console.error('Trainer not found for update, userId:', userIdToEdit); // DEBUG: Added error log
                }
            }

            sessionStorage.setItem('users', JSON.stringify(users));
            console.log('Users array saved to sessionStorage. Current sessionStorage users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
            renderTrainersTable();
            setTimeout(() => {
                if (trainerModal) trainerModal.style.display = 'none';
            }, 1500);
        });
    }

    function deleteTrainer(userId) {
        if (confirm(`Are you sure you want to delete trainer ${userId}? This action cannot be undone.`)) {
            console.log('Attempting to delete trainer:', userId); // DEBUG: Added log
            let users = JSON.parse(sessionStorage.getItem('users')) || [];
            const initialLength = users.length;
            users = users.filter(user => user.userId !== userId);

            if (users.length < initialLength) {
                sessionStorage.setItem('users', JSON.stringify(users));
                console.log('Trainer deleted from sessionStorage. Remaining users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
                renderTrainersTable();
                showMainMessage('success', `Trainer ${userId} deleted successfully.`);
            } else {
                showMainMessage('error', 'Error: Trainer not found for deletion.');
                console.error('Trainer not found for deletion:', userId); // DEBUG: Added error log
            }
        }
    }

    // --- Trainer Modal Event Listeners ---
    if (addTrainerBtn) addTrainerBtn.addEventListener('click', () => openAddEditTrainerModal());
    if (closeTrainerModalBtn) closeTrainerModalBtn.addEventListener('click', () => trainerModal.style.display = 'none');
    if (cancelTrainerButton) cancelTrainerButton.addEventListener('click', () => trainerModal.style.display = 'none');
    if (trainerModal) {
        window.addEventListener('click', (event) => {
            if (event.target === trainerModal) {
                trainerModal.style.display = 'none';
            }
        });
    }


    // =========================================================
    // --- Field Mobilizer Management Logic (CRUD Operations) ---
    // =========================================================
    // (Existing Mobilizer code - no new debug logs needed here for student issue)
    const mobilizersTableBody = document.getElementById('mobilizersTableBody');
    const addMobilizerBtn = document.getElementById('addMobilizerBtn');
    const mobilizerModal = document.getElementById('mobilizerModal');
    const closeMobilizerModalBtn = mobilizerModal ? mobilizerModal.querySelector('.close-button') : null;
    const cancelMobilizerButton = mobilizerModal ? mobilizerModal.querySelector('.cancel-button') : null;
    const mobilizerModalTitle = mobilizerModal ? mobilizerModal.querySelector('#mobilizerModalTitle') : null;
    const mobilizerForm = document.getElementById('mobilizerForm');
    const formMobilizerId = document.getElementById('formMobilizerId');
    const formMobilizerName = document.getElementById('formMobilizerName');
    const formMobilizerArea = document.getElementById('formMobilizerArea');
    const formMobilizerContact = document.getElementById('formMobilizerContact');
    const formMobilizerTotalSignups = document.getElementById('formMobilizerTotalSignups');
    const formMobilizerPin = document.getElementById('formMobilizerPin');
    const formMobilizerConfirmPin = document.getElementById('formMobilizerConfirmPin');
    const formMobilizerSecurityQuestion = document.getElementById('formMobilizerSecurityQuestion');
    const formMobilizerSecurityAnswer = document.getElementById('formMobilizerSecurityAnswer');
    const formMobilizerPinGroup = document.getElementById('formMobilizerPinGroup');
    const formMobilizerConfirmPinGroup = document.getElementById('formMobilizerConfirmPinGroup');
    const formMobilizerMessage = mobilizerModal ? mobilizerModal.querySelector('#mobilizerFormMessage') : null;


    function renderMobilizersTable() {
        console.log('renderMobilizersTable called.'); // DEBUG: Added log
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        const mobilizers = users.filter(user => user.role === 'mobilizer');
        console.log('Filtered mobilizers:', mobilizers); // DEBUG: Added log

        if (mobilizersTableBody) {
            mobilizersTableBody.innerHTML = '';
            if (mobilizers.length === 0) {
                mobilizersTableBody.innerHTML = '<tr><td colspan="5">No mobilizer records found.</td></tr>';
            } else {
                mobilizers.forEach(mobilizer => {
                    const row = `
                        <tr>
                            <td>${mobilizer.userId}</td>
                            <td>${mobilizer.name || 'N/A'}</td>
                            <td>${mobilizer.area || 'N/A'}</td>
                            <td>${mobilizer.totalSignups || 0}</td>
                            <td>
                                <button class="action-btn-primary edit-mobilizer-btn" data-user-id="${mobilizer.userId}">Edit</button>
                                <button class="action-btn-danger delete-mobilizer-btn" data-user-id="${mobilizer.userId}">Delete</button>
                            </td>
                        </tr>
                    `;
                    mobilizersTableBody.insertAdjacentHTML('beforeend', row);
                });

                mobilizersTableBody.querySelectorAll('.edit-mobilizer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToEdit = this.dataset.userId;
                        openAddEditMobilizerModal(userIdToEdit);
                    });
                });

                mobilizersTableBody.querySelectorAll('.delete-mobilizer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToDelete = this.dataset.userId;
                        deleteMobilizer(userIdToDelete);
                    });
                });
            }
        } else {
            console.error('mobilizersTableBody element not found!'); // DEBUG: Added error log
        }
    }

    function openAddEditMobilizerModal(userId = null) {
        if (!mobilizerModal) return;

        showFormMessage(formMobilizerMessage, '', ''); // Clear previous messages
        mobilizerForm.reset();

        if (userId) { // Edit mode
            mobilizerModalTitle.textContent = `Edit Mobilizer: ${userId}`;
            formMobilizerId.value = userId;
            formMobilizerPinGroup.style.display = 'none';
            formMobilizerPin.removeAttribute('required');
            formMobilizerConfirmPinGroup.style.display = 'none';
            formMobilizerConfirmPin.removeAttribute('required');

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const mobilizerToEdit = users.find(u => u.userId === userId);

            if (mobilizerToEdit) {
                formMobilizerName.value = mobilizerToEdit.name || '';
                formMobilizerArea.value = mobilizerToEdit.area || '';
                formMobilizerContact.value = mobilizerToEdit.contact || '';
                formMobilizerTotalSignups.value = mobilizerToEdit.totalSignups || 0;
                formMobilizerSecurityQuestion.value = mobilizerToEdit.securityQuestion || '';
                formMobilizerSecurityAnswer.value = mobilizerToEdit.securityAnswer || '';
                console.log('Populated mobilizer data for edit:', mobilizerToEdit); // DEBUG: Added log
            } else {
                showFormMessage(formMobilizerMessage, 'error', 'Mobilizer not found for editing.');
                console.warn('Mobilizer not found for editing, userId:', userId); // DEBUG: Added log
                return;
            }
        } else { // Add mode
            mobilizerModalTitle.textContent = 'Add New Mobilizer';
            formMobilizerId.value = '';
            formMobilizerPinGroup.style.display = 'block';
            formMobilizerPin.setAttribute('required', 'required');
            formMobilizerConfirmPinGroup.style.display = 'block';
            formMobilizerConfirmPin.setAttribute('required', 'required');
            formMobilizerTotalSignups.value = 0; // Default new mobilizer signups to 0
            console.log('Opening modal for new mobilizer.'); // DEBUG: Added log
        }
        mobilizerModal.style.display = 'flex';
    }

    if (mobilizerForm) {
        mobilizerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Mobilizer form submitted.'); // DEBUG: Added log

            const isEditMode = !!formMobilizerId.value;
            let users = JSON.parse(sessionStorage.getItem('users')) || [];

            const newMobilizerData = {
                name: formMobilizerName.value,
                area: formMobilizerArea.value,
                contact: formMobilizerContact.value,
                totalSignups: parseInt(formMobilizerTotalSignups.value, 10) || 0,
                securityQuestion: formMobilizerSecurityQuestion.value,
                securityAnswer: formMobilizerSecurityAnswer.value
            };

            if (!isEditMode) { // Adding a new mobilizer
                console.log('Attempting to add new mobilizer.'); // DEBUG: Added log
                if (formMobilizerPin.value !== formMobilizerConfirmPin.value) {
                    showFormMessage(formMobilizerMessage, 'error', 'PIN and Confirm PIN do not match.');
                    console.warn('Mobilizer PIN mismatch.'); // DEBUG: Added log
                    return;
                }
                if (formMobilizerPin.value.length !== 4 || !/^\d{4}$/.test(formMobilizerPin.value)) {
                    showFormMessage(formMobilizerMessage, 'error', 'PIN must be a 4-digit number.');
                    console.warn('Invalid Mobilizer PIN format.'); // DEBUG: Added log
                    return;
                }

                if (users.some(u => u.contact && u.contact.toLowerCase() === newMobilizerData.contact.toLowerCase())) {
                    showFormMessage(formMobilizerMessage, 'error', 'A mobilizer with this Contact (Email/Phone) already exists.');
                    console.warn('Duplicate mobilizer contact:', newMobilizerData.contact); // DEBUG: Added log
                    return;
                }

                let newUserId;
                do {
                    newUserId = 'MOB' + Math.floor(100 + Math.random() * 900); // MOB100-MOB999
                } while (users.some(u => u.userId === newUserId));

                const newMobilizer = {
                    userId: newUserId,
                    role: 'mobilizer',
                    ...newMobilizerData,
                    pin: formMobilizerPin.value,
                    isFirstLogin: true,
                    status: 'Active' // Default status for mobilizers
                };

                users.push(newMobilizer);
                console.log('New mobilizer object created and added to array:', newMobilizer); // DEBUG: Added log
                showFormMessage(formMobilizerMessage, 'success', 'Mobilizer added successfully!');

            } else { // Editing an existing mobilizer
                console.log('Attempting to edit existing mobilizer.'); // DEBUG: Added log
                const userIdToEdit = formMobilizerId.value;
                const mobilizerIndex = users.findIndex(u => u.userId === userIdToEdit);

                if (mobilizerIndex !== -1) {
                    if (users.some((u, idx) => u.contact && u.contact.toLowerCase() === newMobilizerData.contact.toLowerCase() && idx !== mobilizerIndex)) {
                        showFormMessage(formMobilizerMessage, 'error', 'A mobilizer with this Contact (Email/Phone) already exists.');
                        console.warn('Duplicate mobilizer contact during edit:', newMobilizerData.contact); // DEBUG: Added log
                        return;
                    }

                    users[mobilizerIndex] = {
                        ...users[mobilizerIndex],
                        ...newMobilizerData
                    };
                    console.log('Mobilizer updated in array:', users[mobilizerIndex]); // DEBUG: Added log
                    showFormMessage(formMobilizerMessage, 'success', `Mobilizer ${userIdToEdit} updated successfully!`);
                } else {
                    showFormMessage(formMobilizerMessage, 'error', 'Error: Mobilizer not found for update.');
                    console.error('Mobilizer not found for update, userId:', userIdToEdit); // DEBUG: Added error log
                }
            }

            sessionStorage.setItem('users', JSON.stringify(users));
            console.log('Users array saved to sessionStorage. Current sessionStorage users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
            renderMobilizersTable();
            setTimeout(() => {
                if (mobilizerModal) mobilizerModal.style.display = 'none';
            }, 1500);
        });
    }

    function deleteMobilizer(userId) {
        if (confirm(`Are you sure you want to delete mobilizer ${userId}? This action cannot be undone.`)) {
            console.log('Attempting to delete mobilizer:', userId); // DEBUG: Added log
            let users = JSON.parse(sessionStorage.getItem('users')) || [];
            const initialLength = users.length;
            users = users.filter(user => user.userId !== userId);

            if (users.length < initialLength) {
                sessionStorage.setItem('users', JSON.stringify(users));
                console.log('Mobilizer deleted from sessionStorage. Remaining users:', JSON.parse(sessionStorage.getItem('users'))); // DEBUG: Added log
                renderMobilizersTable();
                showMainMessage('success', `Mobilizer ${userId} deleted successfully.`);
            } else {
                showMainMessage('error', 'Error: Mobilizer not found for deletion.');
                console.error('Mobilizer not found for deletion:', userId); // DEBUG: Added error log
            }
        }
    }

    // --- Mobilizer Modal Event Listeners ---
    if (addMobilizerBtn) addMobilizerBtn.addEventListener('click', () => openAddEditMobilizerModal());
    if (closeMobilizerModalBtn) closeMobilizerModalBtn.addEventListener('click', () => mobilizerModal.style.display = 'none');
    if (cancelMobilizerButton) cancelMobilizerButton.addEventListener('click', () => mobilizerModal.style.display = 'none');
    if (mobilizerModal) {
        window.addEventListener('click', (event) => {
            if (event.target === mobilizerModal) {
                mobilizerModal.style.display = 'none';
            }
        });
    }

    // =========================================================
    // --- Initial Renders on Load ---
    // =========================================================
    renderStudentsTable();
    renderTrainersTable(); // Render trainers on load
    renderMobilizersTable(); // Render mobilizers on load

    // Initialize sessionStorage with a dummy admin user if not present
    let users = JSON.parse(sessionStorage.getItem('users')) || [];
    if (!users.some(user => user.role === 'admin' && user.username === 'admin')) {
        const adminUser = {
            userId: 'ADM001',
            username: 'admin',
            password: 'adminpassword', // In a real app, hash this!
            role: 'admin'
        };
        users.push(adminUser);
        sessionStorage.setItem('users', JSON.stringify(users));
        console.log('Initial admin user added to sessionStorage:', adminUser); // DEBUG: Added log
    }
});