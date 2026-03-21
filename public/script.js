let currentUser = null;

// --- CLOCK ---
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
        timeEl.innerText = now.toLocaleTimeString();
        document.getElementById('live-date').innerText = now.toDateString();
    }
}
setInterval(updateClock, 1000);

// --- AUTH HANDLER ---
function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    
    fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.blocked) {
            document.getElementById('block-msg').style.display = 'block';
        } else if (data.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            // TRANSITION TO REASON PICKER
            currentUser = payload;
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('step-reason').style.display = 'block';
        }
    });
}

// --- RECORD VISIT ---
function submitVisit(reason) {
    const data = { name: currentUser.name, email: currentUser.email, reason: reason };
    fetch('/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById('visitor-name').innerText = currentUser.name;
        document.getElementById('welcome-overlay').style.display = 'flex';
        setTimeout(() => location.reload(), 3000);
    });
}

// --- ADMIN DASHBOARD ---
function loadDashboard() {
    if (!document.getElementById('logBody')) return;
    fetch('/admin-data').then(res => res.json()).then(data => {
        document.getElementById('s-today').innerText = data.stats.today;
        document.getElementById('s-week').innerText = data.stats.week;
        document.getElementById('s-month').innerText = data.stats.month;
        document.getElementById('s-total').innerText = data.stats.total;

        document.getElementById('logBody').innerHTML = data.logs.map(log => `
            <tr>
                <td>${log.name}</td>
                <td>${log.email}</td>
                <td>${log.reason}</td>
                <td>${log.dateTime}</td>
                <td><button class="block-btn" onclick="blockUser('${log.email}')">Block</button></td>
            </tr>
        `).join('');
    });
}

function blockUser(email) {
    if (confirm(`Block ${email}?`)) {
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
    doc.autoTable({ html: '#logTable', startY: 20 });
    doc.save("Library_Logs.pdf");
}

function parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

window.onload = () => { updateClock(); loadDashboard(); };