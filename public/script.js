let currentVisitor = null;

// --- CLOCK ---
function updateClock() {
    const now = new Date();
    if(document.getElementById('live-time')) {
        document.getElementById('live-time').innerText = now.toLocaleTimeString();
        document.getElementById('live-date').innerText = now.toDateString();
    }
}
setInterval(updateClock, 1000);

// --- VISITOR LOGIC ---
function handleCredentialResponse(response) {
    const user = parseJwt(response.credential);
    fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
    }).then(res => res.json()).then(data => {
        if(data.blocked) {
            document.getElementById('block-msg').style.display = 'block';
        } else if(data.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            currentVisitor = user;
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('step-reason').style.display = 'block';
        }
    });
}

function submitVisit(reason) {
    const entry = { name: currentVisitor.name, email: currentVisitor.email, reason: reason };
    fetch('/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    }).then(() => {
        document.getElementById('visitor-name').innerText = currentVisitor.name;
        document.getElementById('welcome-overlay').style.display = 'flex';
        setTimeout(() => location.reload(), 3000);
    });
}

// --- ADMIN LOGIC ---
function loadAdminData() {
    if(!document.getElementById('adminLogBody')) return;
    fetch('/admin-data').then(res => res.json()).then(data => {
        document.getElementById('stat-today').innerText = data.stats.today;
        document.getElementById('stat-week').innerText = data.stats.week;
        document.getElementById('stat-total').innerText = data.stats.total;
        document.getElementById('stat-inside').innerText = data.stats.currentlyInside;

        document.getElementById('adminLogBody').innerHTML = data.logs.map(log => `
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
    if(confirm(`Block ${email}?`)) {
        fetch('/block-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(() => alert('User Blocked'));
    }
}

function filterTable() {
    let val = document.getElementById("searchBar").value.toLowerCase();
    document.querySelectorAll("#adminLogBody tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("NEU Library Logs", 14, 15);
    doc.autoTable({ html: '#logTable', startY: 20 });
    doc.save("Library_Logs.pdf");
}

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

window.onload = () => { updateClock(); loadAdminData(); };