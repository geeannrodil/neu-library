// admin.js
let allLogs = []; // Stores the original data so we can filter it

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Listen for typing in the search bar
    const searchInput = document.getElementById('logSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterLogs);
    }
});

function loadDashboard() {
    fetch('/admin-data')
        .then(res => res.json())
        .then(data => {
            allLogs = data.logs; // Save logs globally for searching
            
            // Update Stats
            document.getElementById('todayCount').innerText = data.stats.today;
            document.getElementById('weekCount').innerText = data.stats.week;
            document.getElementById('monthCount').innerText = data.stats.month;
            document.getElementById('totalCount').innerText = data.stats.total;

            renderTable(allLogs);
        })
        .catch(err => console.error("Error loading dashboard:", err));
}

// Function to actually draw the table rows
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

// The Search Logic
function filterLogs() {
    const searchTerm = document.getElementById('logSearch').value.toLowerCase();
    
    const filtered = allLogs.filter(log => {
        return (
            log.name.toLowerCase().includes(searchTerm) ||
            log.email.toLowerCase().includes(searchTerm) ||
            log.course.toLowerCase().includes(searchTerm) ||
            log.userType.toLowerCase().includes(searchTerm) ||
            log.reason.toLowerCase().includes(searchTerm)
        );
    });

    renderTable(filtered);
}

function blockUser(email) {
    if (confirm(`Are you sure you want to block ${email}?`)) {
        fetch('/block-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        }).then(() => loadDashboard());
    }
}