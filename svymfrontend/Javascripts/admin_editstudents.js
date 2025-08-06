 document.addEventListener('DOMContentLoaded', async function() {
    
    const viewModal = document.getElementById('viewModal');
    const closeBtn = document.querySelector('.close-btn');
    const studentsData = [
          
        ];
     try {
                // Fetch data from the specified endpoint
                const response = await fetch('/.netlify/functions/allstudents');
                
                // Check if the response is okay (status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const fetchedData = await response.json();

                console.log('Fetched student data:', typeof(fetchedData.students));
                for (const student of fetchedData.students) {
                    studentsData.push({
                        id: student._id,
                        name: student.candidateName,
                        email: student.email,
                        course: student.supportedProject,
                        status: student.isAppRejPen === 0 ? 'Pending' : (student.isAppRejPen === 1 ? 'Approved' : 'Rejected'),
                        fatherHusbandName: student.fatherHusbandName,
                        villageName: student.villageName,
                        talukName: student.talukName,
                        districtName: student.districtName,
                        dob: student.dob,
                        age: student.age,
                        gender: student.gender,
                        tribal: student.tribal,
                        pwd: student.pwd,
                        aadharNumber: student.aadharNumber,
                        candidatePhone: student.candidatePhone,
                        parentPhone: student.parentPhone,
                        familyMembers: student.familyMembers,
                        qualification: student.qualification,
                        caste: student.caste,
                        mobiliserName: student.mobiliserName

                    });
                    // Log each student's details to the console
                    console.log(`Student ID: ${student._id}, Name: ${student.candidateName}, Email: ${student.email}, Course: ${student.supportedProject}, Status: ${student.isAppRejPen}`);
                }
                
                // Render the table with the fetched data
                renderTable(studentsData);

            } catch (error) {
                // Log any errors that occur during the fetch process
                console.error('Failed to fetch student data:', error);
                const tableBody = document.getElementById('studentTableBody');
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">
                    Failed to load data. Please try again later.
                </td></tr>`;
            }
 

        // Function to render the table rows based on provided data
        function renderTable(data) {
            const tableBody = document.getElementById('studentTableBody');
            // Clear any existing table rows
            tableBody.innerHTML = '';

            // Loop through the data and create a row for each student
            data.forEach(student => {
                const row = document.createElement('tr');
                
                // Set the status badge class based on the student's status
                const statusClass = student.status.toLowerCase();
                const statusHtml = `<span class="status ${statusClass}">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>`;

                // Set the inner HTML of the row with all the student details
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.course}</td>
                    <td>${statusHtml}</td>
                    <td>
                        <div class="actions">
                            <button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button>
                            <button class="action-btn edit-btn" id="updatestudent"><i class="fas fa-edit"></i> Edit</button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i> InActive</button>
                        </div>
                    </td>
                `;

                // Append the new row to the table body
                tableBody.appendChild(row);
                     row.querySelector('.view-btn').addEventListener('click', function() {
                        // Populate the modal with the current student's data
                        document.getElementById('modalStudentName').textContent = student.id + " " + student.name;
                        document.getElementById('modalUserId').textContent = student.id;
                        document.getElementById('modalUserName').textContent = student.name;
                        document.getElementById('modalUserEmail').textContent = student.email;
                        document.getElementById('modalUserCourse').textContent = student.course;
                        document.getElementById('modalUserStatus').textContent = student.status;
                        document.getElementById('modalUserFatherHusband').textContent=student.fatherHusbandName || 'N/A';
                        document.getElementById('modalUserVillageName').textContent = student.villageName || 'N/A';
                        document.getElementById('modalUserTalukName').textContent = student.talukName || 'N/A';
                        document.getElementById('modalUserDistrictName').textContent = student.districtName || 'N/A';
                        document.getElementById('modalUserDob').textContent = student.dob || 'N/A';
                        document.getElementById('modalUserAge').textContent = student.age || 'N/A';
                        document.getElementById('modalUserGender').textContent = student.gender || 'N/A';
                        document.getElementById('modalUserTribal').textContent = student.tribal || 'N/A';
                        document.getElementById('modalUserPWD').textContent = student.pwd || 'N/A';
                        document.getElementById('modalUserAadharNumber').textContent = student.aadharNumber || 'N/A';
                        document.getElementById('modalUserMobileNumber').textContent = student.candidatePhone || 'N/A';
                        document.getElementById('modalUserParentMobileNo').textContent = student.parentPhone || 'N/A';
                        document.getElementById('modalUserFamilyMembers').textContent = student.familyMembers || 'N/A';
                        document.getElementById('modalUserQualification').textContent = student.qualification || 'N/A';
                        document.getElementById('modalUserCaste').textContent = student.caste || 'N/A';
                        document.getElementById('modalUserMobiliserName').textContent = student.mobiliserName || 'N/A';
                        
                        const mus=document.getElementById('modalUserStatus');
                        mus.textContent = student.status;
                        mus.style.color = student.status === 'Approved' ? 'green' : (student.status === 'Rejected' ? 'red' : 'orange');
                        mus.style.fontWeight = 'bold';
                        
                        // Display the modal
                        viewModal.style.display = 'flex';
                    });
                row.querySelector('.edit-btn').addEventListener('click', function() {
                    // Redirect to the student update page with the student's ID
                    window.location.href = `admin_studentupdate.html?studentId=${student.id}`;
                });
            });
        }

        // Function to handle the search logic
        function handleSearch() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            // Filter the original data array based on the search term
            const filteredData = studentsData.filter(student => 
                
                student.name.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                student.course.toLowerCase().includes(searchTerm)
            );

            // Re-render the table with the filtered data
            renderTable(filteredData);
        }
          closeBtn.addEventListener('click', () => {
                viewModal.style.display = 'none';
            });
          renderTable(studentsData);
            
            // Add event listener to the search input for real-time filtering
            document.getElementById('searchInput').addEventListener('keyup', handleSearch);
            
            // Add event listener to the search button
            document.getElementById('searchBtn').addEventListener('click', handleSearch);
    });