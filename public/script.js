let currentUser = null;

// --- 1. CLOCK & INITIALIZATION ---
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('live-time');
    const dateEl = document.getElementById('live-date');
    if (timeEl) timeEl.innerText = now.toLocaleTimeString();
    if (dateEl) dateEl.innerText = now.toDateString();
}
setInterval(updateClock, 1000);

window.onload = () => { 
    updateClock(); 
    if (document.getElementById('logBody')) {
        loadDashboard(); // Only runs if we are on the Admin page
    }
};

// --- 2. AUTH HANDLER (Visitor Login) ---
function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('mode') === 'test';

    fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            // Show the Error Card if not @neu.edu.ph
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('error-card').style.display = 'block';
        } 
        // IF ADMIN AND NOT IN TEST MODE -> GO TO DASHBOARD
        else if (data.role === 'admin' && !isTestMode) {
            window.location.href = '/admin.html';
        } 
        // IF STUDENT OR ADMIN-IN-TEST-MODE -> SHOW REASON PICKER
        else {
            currentUser = payload;
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('step-reason').style.display = 'block';
        }
    });
}
// --- 3. RECORD VISIT (Visitor Submit) ---
function submitVisit(reason) {
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const courseInput = document.getElementById('course').value.trim();
    const errorMsg = document.getElementById('error-msg');

    if (courseInput === "") {
        errorMsg.innerText = "⚠️ Please enter your Program or Course.";
        document.getElementById('course').focus();
        return; 
    }
    
    errorMsg.innerText = "";

    const data = { 
        name: currentUser.name, 
        email: currentUser.email, 
        userType: userType,
        course: courseInput,
        reason: reason 
    };

    fetch('/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById('visitor-name').innerText = currentUser.name;
        document.getElementById('welcome-overlay').style.display = 'flex';
        setTimeout(() => location.reload(), 3000);
    })
    .catch(err => console.error("Error saving visit:", err));
}

// --- 4. ADMIN DASHBOARD (Fetch & Display) ---
function loadDashboard() {
    const logBody = document.getElementById('logBody');
    if (!logBody) return;

    fetch('/admin-data')
        .then(res => res.json())
        .then(data => {
            // Update the Stats Cards
            document.getElementById('s-today').innerText = data.stats.today;
            document.getElementById('s-week').innerText = data.stats.week;
            document.getElementById('s-month').innerText = data.stats.month;
            document.getElementById('s-total').innerText = data.stats.total;

            // Generate Table Rows with New Columns
            logBody.innerHTML = data.logs.map(log => `
                <tr>
                    <td><strong>${log.name}</strong><br><small>${log.email}</small></td>
                    <td><span class="type-badge ${log.userType.toLowerCase()}">${log.userType}</span></td>
                    <td>${log.course}</td>
                    <td>${log.reason}</td>
                    <td>${log.dateTime || log.timestamp}</td>
                    <td>
                        <button class="block-btn" onclick="blockUser('${log.email}')">Block</button>
                    </td>
                </tr>
            `).join('');
        });
}

// --- 5. SEARCH LOGS (Real-time Filtering) ---
function searchLogs() {
    const input = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#logTable tbody tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}

// --- 6. ADMIN ACTIONS ---
function blockUser(email) {
    if (confirm(`Are you sure you want to block ${email}?`)) {
        fetch('/block-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(() => loadDashboard());
    }
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("NEU Library Visitor Logs", 14, 15);
    doc.autoTable({ 
        html: '#logTable', 
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [187, 134, 252] } // Matching purple theme for PDF
    });
    doc.save("Library_Logs.pdf");
}

// --- HELPER: PARSE GOOGLE TOKEN ---
function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}