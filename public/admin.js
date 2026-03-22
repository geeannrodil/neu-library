let allLogs = []; 

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
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
    if (confirm(`Are you sure you want to block ${email}?`)) {
        fetch('/block-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(() => loadDashboard());
    }
}

function unblockUser(email) {
    if (confirm(`Allow ${email} to access the library again?`)) {
        fetch('/unblock-user', { // Make sure this route exists in server.js!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(() => loadDashboard());
    }
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
    if (confirm("Are you sure you want to sign out?")) {
        // Redirects back to the main login/visitor page
        window.location.href = '/'; 
    }
}