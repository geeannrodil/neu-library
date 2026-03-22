const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let visits = [];
let blockedEmails = []; 
// Add your email here to be recognized as an admin
const adminEmails = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph", "your-email@gmail.com"]; 

// 1. Auth: Allow ANY gmail, check if blocked or admin
// Inside server.js
app.post('/visit', (req, res) => {
    // We added userType and course here!
    const { name, email, userType, course, reason } = req.body;
    const timestamp = new Date().toLocaleString();

    const newLog = { name, email, userType, course, reason, timestamp };
    
    // Push it to your database or array
    visitLogs.push(newLog); 

    res.status(200).send({ message: "Success" });
});

// 2. Record Visit
app.post('/visit', (req, res) => {
    const { name, email, userType, course, reason } = req.body;
    const timestamp = new Date().toLocaleString();

    // Log to console for debugging
    console.log(`New Visit: ${name} (${userType}) - ${course}`);

    // If using an array to store logs:
    const newLog = { name, email, userType, course, reason, timestamp };
    visitLogs.push(newLog); 

    res.status(200).send({ message: "Visit recorded!" });
});

// 3. Admin Dashboard Data
app.get("/admin-data", (req, res) => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const stats = {
        today: visits.filter(v => (now - v.timestamp) < oneDay).length,
        week: visits.filter(v => (now - v.timestamp) < oneWeek).length,
        month: visits.filter(v => (now - v.timestamp) < oneMonth).length,
        total: visits.length
    };

    res.json({ stats, logs: visits, blocked: blockedEmails });
});

// 4. Block User
app.post("/block-user", (req, res) => {
    const { email } = req.body;
    if (!blockedEmails.includes(email)) blockedEmails.push(email);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));