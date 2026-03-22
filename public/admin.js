let allLogs = []; 

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // THE REAL-TIME MAGIC: Refresh the data every 5 seconds automatically!
    setInterval(loadDashboard, 5000); 
    
    const searchInput = document.getElementById('logSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterLogs);
    }
});

// 1. LOAD DATA FROM SERVER
function loadDashboard() {
    fetch('/admin-data')
        .then(res => res.json())
        .then(data => {
            allLogs = data.logs; 
            
            // Update Stats
            document.getElementById('todayCount').innerText = data.stats.today;
            document.getElementById('weekCount').innerText = data.stats.week;
            document.getElementById('monthCount').innerText = data.stats.month;
            document.getElementById('totalCount').innerText = data.stats.total;

            renderTable(allLogs);
            renderBlockedUsers(data.blocked); // NEW: Load the blocked list
        })
        .catch(err => console.error("Error loading dashboard:", err));
}

// 2. RENDER VISITOR TABLE
function renderTable(logsToDisplay) {
    const logBody = document.getElementById('visitorLogs');
    if (!logBody) return;

    logBody.innerHTML = logsToDisplay.map(log => `
        <tr>
            <td><strong>${log.name}</strong><br><small>${log.email}</small></td>
            <td><span class="type-badge ${log.userType.toLowerCase()}">${log.userType}</span></td>
            <td>${log.course}</td>
            <td>${log.reason}</td>
            <td>${log.dateTime}</td>
            <td>
                <button class="block-btn" onclick="blockUser('${log.email}')">Block</button>
            </td>
        </tr>
    `).join('');
}

// 3. RENDER BLOCKED USERS (User Management)
function renderBlockedUsers(blockedList) {
    const blockedBody = document.getElementById('blockedUserList');
    if (!blockedBody) return;

    if (blockedList.length === 0) {
        blockedBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:gray;">No blocked users.</td></tr>';
        return;
    }

    blockedBody.innerHTML = blockedList.map(email => `
        <tr>
            <td>${email}</td>
            <td><span class="type-badge student" style="border-color: #ff4757; color: #ff4757;">Restricted</span></td>
            <td>
                <button class="block-btn" style="border-color: #2ecc71; color: #2ecc71;" onclick="unblockUser('${email}')">Unblock</button>
            </td>
        </tr>
    `).join('');
}

// 4. BLOCK/UNBLOCK ACTIONS
function blockUser(email) {
    Swal.fire({
        title: 'Block User?',
        text: `Are you sure you want to restrict ${email}?`,
        icon: 'error',
        background: '#151b23',
        color: '#ffffff',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Yes, block them'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/block-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }).then(() => {
                Swal.fire({
                    title: 'Blocked!',
                    text: 'User has been moved to the restricted list.',
                    icon: 'success',
                    background: '#151b23',
                    color: '#ffffff',
                    confirmButtonColor: '#bb86fc' // Purple accent
                });
                loadDashboard();
            });
        }
    });
}

function unblockUser(email) {
    Swal.fire({
        title: 'Unblock User?',
        text: `Allow ${email} to access the library again?`,
        icon: 'question',
        background: '#151b23',
        color: '#ffffff',
        showCancelButton: true,
        confirmButtonColor: '#2ecc71', // Green confirm button
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Yes, unblock'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/unblock-user', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }).then(() => {
                Swal.fire({
                    title: 'Restored!',
                    text: 'User can now sign in normally.',
                    icon: 'success',
                    background: '#151b23',
                    color: '#ffffff',
                    confirmButtonColor: '#bb86fc'
                });
                loadDashboard();
            });
        }
    });
}

// 5. SIDEBAR NAVIGATION LOGIC
function switchView(viewId, event) {
    // Prevent default anchor behavior
    if (event) event.preventDefault();

    // Update active class in sidebar
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    // Smooth scroll to the section
    const element = document.getElementById(viewId + '-view');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Keep your existing filterLogs, exportPDF, and logout functions below...

// --- EXPORT PDF FUNCTION ---
function exportPDF() {
    // Check if jsPDF is loaded
    if (!window.jspdf) {
        alert("PDF library is still loading. Please try again in a second.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add a title to the PDF
    doc.text("NEU Library Visitor Logs", 14, 15);
    
    // Map the data from your allLogs array to rows
    const tableData = allLogs.map(log => [
        log.name, 
        log.userType, 
        log.course, 
        log.reason, 
        log.dateTime
    ]);

    // Generate the table
    doc.autoTable({
        head: [['Name', 'Type', 'Course', 'Purpose', 'Timestamp']],
        body: tableData,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [187, 134, 252] }, // Purple theme
        styles: { fontSize: 9 }
    });
    
    // Download the file
    doc.save("NEU_Library_Logs.pdf");
}

// --- LOGOUT FUNCTION ---
function logout() {
    Swal.fire({
        title: 'Sign Out?',
        text: "Are you sure you want to leave the dashboard?",
        icon: 'warning',
        background: '#151b23', // Matches your dark theme
        color: '#ffffff',
        showCancelButton: true,
        confirmButtonColor: '#ff4757', // Red confirm button
        cancelButtonColor: '#4b5563',  // Gray cancel button
        confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Yes, sign out',
        customClass: {
            popup: 'glass-popup' // Optional: if you want to add CSS to it later
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/'; 
        }
    });
}