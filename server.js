const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let visits = [];
let blockedEmails = []; 
const admins = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph"]; // Add your email here to test admin access

// 1. Auth: Allow ANY gmail, but check if blocked or admin
app.post("/auth", (req, res) => {
    const { email } = req.body;
    if (blockedEmails.includes(email)) return res.json({ blocked: true });
    
    const role = admins.includes(email) ? "admin" : "user";
    res.json({ role, email, blocked: false });
});

// 2. Record Visit
app.post("/visit", (req, res) => {
    const newEntry = { 
        ...req.body, 
        dateTime: new Date().toLocaleString('en-PH'), 
        timestamp: new Date().getTime() 
    };
    visits.unshift(newEntry);
    res.json({ success: true });
});

// 3. Stats & Logs for Admin
app.get("/admin-data", (req, res) => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const stats = {
        today: visits.filter(v => (now - v.timestamp) < oneDay).length,
        week: visits.filter(v => (now - v.timestamp) < oneWeek).length,
        total: visits.length,
        currentlyInside: Math.floor(visits.length * 0.3) // Simulated stat
    };

    res.json({ stats, logs: visits, blocked: blockedEmails });
});

// 4. Block/Unblock
app.post("/block-user", (req, res) => {
    const { email } = req.body;
    if (!blockedEmails.includes(email)) blockedEmails.push(email);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));