const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let visits = []; // This is the official array that holds our data!
let blockedEmails = []; 

// Add your email here to be recognized as an admin
const adminEmails = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph", "your-email@gmail.com"]; 

// 1. AUTH ROUTE: Checks if user is admin, blocked, or regular student
app.post('/auth', (req, res) => {
    const { email } = req.body;
    
    if (blockedEmails.includes(email)) {
        return res.json({ blocked: true });
    }
    
    if (adminEmails.includes(email)) {
        return res.json({ role: 'admin' });
    }
    
    // If not admin or blocked, they are a normal user/visitor
    res.json({ role: 'user' });
});

// 2. RECORD VISIT ROUTE: Saves the data from the frontend
app.post('/visit', (req, res) => {
    const { name, email, userType, course, reason } = req.body;
    
    // We need two times: a number for stats math, and a string to look pretty on the table
    const numericTimestamp = new Date().getTime(); 
    const formattedDate = new Date().toLocaleString();

    const newLog = { 
        name, 
        email, 
        userType, 
        course, 
        reason, 
        timestamp: numericTimestamp,  // Used by the dashboard stats
        dateTime: formattedDate       // Used by the dashboard table
    };

    console.log(`✅ New Visit Saved: ${name} (${userType}) - ${course}`);
    visits.push(newLog); // Push to the 'visits' array
    res.status(200).send({ message: "Success" });
});

// 3. ADMIN DASHBOARD DATA: Sends the logs and calculates the stats
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

// 4. BLOCK USER: Adds an email to the block list
app.post("/block-user", (req, res) => {
    const { email } = req.body;
    if (!blockedEmails.includes(email)) blockedEmails.push(email);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));