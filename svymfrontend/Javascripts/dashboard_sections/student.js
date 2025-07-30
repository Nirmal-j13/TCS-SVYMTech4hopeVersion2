document.addEventListener('DOMContentLoaded', function() {
    console.log('Students section JS loaded with CRUD capabilities.');

    // DOM Elements
    const studentsTableBody = document.getElementById('studentsTableBody');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const closeModalBtn = studentModal.querySelector('.close-button');
    const cancelButton = studentModal.querySelector('.cancel-button');
    const modalTitle = document.getElementById('modalTitle');
    const studentForm = document.getElementById('studentForm');
    const formStudentId = document.getElementById('studentFormUserId');
    const formCandidateName = document.getElementById('formCandidateName');
    const formEmail = document.getElementById('formEmail');
    const formDistrictName = document.getElementById('formDistrictName');
    const formStatus = document.getElementById('formStatus');
    const formPinGroup = document.getElementById('formPinGroup');
    const formPin = document.getElementById('formPin');
    const formConfirmPinGroup = document.getElementById('formConfirmPinGroup');
    const formConfirmPin = document.getElementById('formConfirmPin');
    const formMessage = document.getElementById('formMessage');

    // Helper to show messages within the form modal
    function showFormMessage(type, text) {
        formMessage.textContent = text;
        formMessage.className = `message ${type}`;
        formMessage.style.display = 'block';
    }

    // --- CRUD Operations ---

    // READ: Render/Refresh the students table
    function renderStudentsTable() {
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        // Filter for actual student users (User IDs starting with 'SVYM' and length 9)
        const students = users.filter(user => user.userId && user.userId.startsWith('SVYM') && user.userId.length === 9);

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
                            <button class="edit-student-btn" data-user-id="${student.userId}">Edit</button>
                            <button class="delete-student-btn" data-user-id="${student.userId}">Delete</button>
                        </td>
                    </tr>
                `;
                studentsTableBody.insertAdjacentHTML('beforeend', row);
            });

            // Attach event listeners for edit and delete buttons
            studentsTableBody.querySelectorAll('.edit-student-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const userIdToEdit = this.dataset.userId;
                    openAddEditModal(userIdToEdit);
                });
            });

            studentsTableBody.querySelectorAll('.delete-student-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const userIdToDelete = this.dataset.userId;
                    deleteStudent(userIdToDelete);
                });
            });
        }
    }

    // CREATE/UPDATE: Open the modal for adding or editing a student
    function openAddEditModal(userId = null) {
        formMessage.style.display = 'none'; // Hide any previous form messages
        studentForm.reset(); // Clear the form

        if (userId) { // Edit mode
            modalTitle.textContent = `Edit Student: ${userId}`;
            formStudentId.value = userId; // Store userId in hidden field
            formPinGroup.style.display = 'none'; // Hide PIN fields for edit
            formPin.removeAttribute('required');
            formConfirmPinGroup.style.display = 'none';
            formConfirmPin.removeAttribute('required');

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const studentToEdit = users.find(u => u.userId === userId);

            if (studentToEdit) {
                formCandidateName.value = studentToEdit.candidateName || '';
                formEmail.value = studentToEdit.email || '';
                formDistrictName.value = studentToEdit.districtName || '';
                formStatus.value = studentToEdit.status || (studentToEdit.isFirstLogin ? 'Pending' : 'Active');
            } else {
                showFormMessage('error', 'Student not found for editing.');
                return;
            }
        } else { // Add mode
            modalTitle.textContent = 'Add New Student';
            formStudentId.value = ''; // Clear hidden ID
            formPinGroup.style.display = 'block'; // Show PIN fields for new user
            formPin.setAttribute('required', 'required');
            formConfirmPinGroup.style.display = 'block';
            formConfirmPin.setAttribute('required', 'required');
            formStatus.value = 'Pending'; // Default status for new users
        }
        studentModal.style.display = 'flex'; // Show modal
    }

    // CREATE/UPDATE: Handle form submission
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const isEditMode = !!formStudentId.value; // True if formStudentId has a value
        let users = JSON.parse(sessionStorage.getItem('users')) || [];

        const newStudentData = {
            candidateName: formCandidateName.value,
            email: formEmail.value,
            districtName: formDistrictName.value,
            status: formStatus.value,
            // Add any other fields as necessary (e.g., security question, answer)
        };

        if (!isEditMode) { // Adding a new student
            if (formPin.value !== formConfirmPin.value) {
                showFormMessage('error', 'PIN and Confirm PIN do not match.');
                return;
            }
            if (formPin.value.length !== 4 || !/^\d{4}$/.test(formPin.value)) {
                showFormMessage('error', 'PIN must be a 4-digit number.');
                return;
            }

            // Check if email already exists
            if (users.some(u => u.email === newStudentData.email)) {
                showFormMessage('error', 'A user with this Email ID already exists.');
                return;
            }

            // Generate a unique User ID
            let newUserId;
            do {
                newUserId = 'SVYM' + Math.floor(1000 + Math.random() * 9000); // SVYM1000-SVYM9999
            } while (users.some(u => u.userId === newUserId)); // Ensure uniqueness

            const newStudent = {
                userId: newUserId,
                ...newStudentData,
                pin: formPin.value, // Store plain PIN for demo; in real app, hash it!
                isFirstLogin: true, // New users are always first login
                securityQuestion: 'What is your favorite color?', // Default for demo
                securityAnswer: 'blue' // Default for demo
            };

            users.push(newStudent);
            showFormMessage('success', 'Student added successfully!');

        } else { // Editing an existing student
            const userIdToEdit = formStudentId.value;
            const studentIndex = users.findIndex(u => u.userId === userIdToEdit);

            if (studentIndex !== -1) {
                // Check if email already exists for another user (if email changed)
                if (users.some((u, idx) => u.email === newStudentData.email && idx !== studentIndex)) {
                    showFormMessage('error', 'A user with this Email ID already exists.');
                    return;
                }

                // Update only mutable fields
                users[studentIndex].candidateName = newStudentData.candidateName;
                users[studentIndex].email = newStudentData.email;
                users[studentIndex].districtName = newStudentData.districtName;
                users[studentIndex].status = newStudentData.status;
                // Note: PIN is NOT updated via edit mode here; separate flow for that if needed.
                showFormMessage('success', `Student ${userIdToEdit} updated successfully!`);
            } else {
                showFormMessage('error', 'Error: Student not found for update.');
            }
        }

        sessionStorage.setItem('users', JSON.stringify(users)); // Save updated array to session storage
        renderStudentsTable(); // Refresh the table
        setTimeout(() => studentModal.style.display = 'none', 1000); // Hide modal after a delay
    });

    // DELETE: Remove a student
    function deleteStudent(userId) {
        if (confirm(`Are you sure you want to delete student ${userId}? This action cannot be undone.`)) {
            let users = JSON.parse(sessionStorage.getItem('users')) || [];
            const initialLength = users.length;
            users = users.filter(user => user.userId !== userId); // Filter out the user to delete

            if (users.length < initialLength) {
                sessionStorage.setItem('users', JSON.stringify(users)); // Save updated array
                renderStudentsTable(); // Refresh the table
                alert(`Student ${userId} deleted successfully.`);
            } else {
                alert('Error: Student not found for deletion.');
            }
        }
    }

    // --- Modal Event Listeners ---
    addStudentBtn.addEventListener('click', () => openAddEditModal());
    closeModalBtn.addEventListener('click', () => studentModal.style.display = 'none');
    cancelButton.addEventListener('click', () => studentModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === studentModal) {
            studentModal.style.display = 'none';
        }
    });

    // Initial render of the table when the section is loaded
    renderStudentsTable();
});