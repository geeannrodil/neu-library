let currentUserPayload = null;

// --- VISITOR LOGIC ---

// 1. Google Decode & Check
function handleCredentialResponse(response) {
    currentUserPayload = parseJwt(response.credential);
    
    // Check with server if user is blocked or admin
    fetch('/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserPayload.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else if (data.blocked) {
            document.getElementById('restriction-box').style.display = 'flex';
        } else if (data.role === 'admin') {
            window.location.href = "admin.html";
        } else {
            // Valid user, show reasons
            document.getElementById('step-login').style.display = 'none';
            document.getElementById('step-reason').style.display = 'block';
        }
    });
}

// 2. Submit Reason & Show Welcome
function submitVisit(reason) {
    const entry = {
        name: currentUserPayload.name,
        email: currentUserPayload.email,
        reason: reason
    };

    fetch('/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    }).then(() => {
        document.getElementById('display-name').innerText = currentUserPayload.name.toUpperCase();
        document.getElementById('step-welcome').style.display = 'flex';
        setTimeout(() => { location.reload(); }, 2500); // Reset page
    });
}

// Helper: Decode Google JWT Token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// --- ADMIN LOGIC ---

function loadAdminTable() {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    fetch('/logs')
    .then(res => res.json())
    .then(logs => {
        tbody.innerHTML = logs.map((item, index) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td><span class="reason-badge">${item.reason}</span></td>
                <td>${item.dateTime}</td>
                <td>
                    <button onclick="blockUser('${item.email}')" class="action-btn block-btn">Block</button>
                    <button onclick="deleteEntry(${index})" class="action-btn del-btn">Delete</button>
                </td>
            </tr>`).join('');
    });
}

function blockUser(email) {
    if(confirm(`Are you sure you want to block ${email}?`)) {
        fetch('/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        }).then(() => {
            alert(email + " has been blocked.");
        });
    }
}

function deleteEntry(index) {
    fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: index })
    }).then(() => loadAdminTable());
}

function filterTable() {
    let val = document.getElementById("searchBar").value.toLowerCase();
    document.querySelectorAll("#logTableBody tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("NEU Library Visitor Logs", 14, 15);
    doc.autoTable({ html: '#logTable', startY: 25, headStyles: {fillColor: [46, 204, 113]} });
    doc.save("NEU_Library_Logs.pdf");
}

window.onload = loadAdminTable;