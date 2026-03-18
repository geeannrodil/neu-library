// GOOGLE SIGN IN REDIRECT
function handleCredentialResponse(response) {
    console.log("Login Success");
    window.location.href = "admin.html";
}

// VISITOR LOGGING
function manualSubmit() {
    const name = document.getElementById('v_name').value;
    const sid = document.getElementById('v_sid').value;

    if (!name || !sid) { alert("Please fill Name and ID"); return; }

    const entry = {
        name: name.toUpperCase(),
        sid: sid,
        college: document.getElementById('v_college').value,
        reason: document.getElementById('v_reason').value,
        time: new Date().toLocaleString()
    };

    let logs = JSON.parse(localStorage.getItem('neu_library_data')) || [];
    logs.push(entry);
    localStorage.setItem('neu_library_data', JSON.stringify(logs));

    document.getElementById('display-name').innerText = name.toUpperCase();
    document.getElementById('welcomeModal').style.display = 'flex';
    setTimeout(() => { location.reload(); }, 2000);
}

// ADMIN TABLE
function loadAdminTable() {
    const tbody = document.getElementById('logTableBody');
    if (!tbody) return;

    const logs = JSON.parse(localStorage.getItem('neu_library_data')) || [];
    tbody.innerHTML = logs.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.sid}</td>
            <td>${item.college}</td>
            <td>${item.reason}</td>
            <td>${item.time}</td>
            <td><button onclick="deleteEntry(${index})" style="color:red; border:none; background:none; cursor:pointer;">Delete</button></td>
        </tr>`).join('');

    if(document.getElementById('todayCount')) {
        document.getElementById('todayCount').innerText = logs.length;
    }
}

function deleteEntry(index) {
    let logs = JSON.parse(localStorage.getItem('neu_library_data'));
    logs.splice(index, 1);
    localStorage.setItem('neu_library_data', JSON.stringify(logs));
    loadAdminTable();
}

function filterTable() {
    let val = document.getElementById("searchBar").value.toUpperCase();
    document.querySelectorAll("#logTableBody tr").forEach(row => {
        row.style.display = row.innerText.toUpperCase().includes(val) ? "" : "none";
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = jsPDF();
    doc.text("NEU Library Visitor Logs", 14, 20);
    doc.autoTable({ html: '#logTable', startY: 30, theme: 'grid', headStyles: {fillColor: [20, 90, 50]} });
    doc.save("NEU_Logs.pdf");
}

window.onload = loadAdminTable;