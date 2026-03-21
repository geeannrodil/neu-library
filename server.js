const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public")); // Put your HTML/CSS/JS and images in a "public" folder

let visits = [];
let blockedUsers = []; // Stores blocked emails
const admins = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph"];

// 1. Auth & Block Check
app.post("/auth", (req, res) => {
    const { email } = req.body;
    if (!email.endsWith("@neu.edu.ph")) return res.json({ error: "Access Denied: Use @neu.edu.ph only." });
    if (blockedUsers.includes(email)) return res.json({ blocked: true });
    
    const role = admins.includes(email) ? "admin" : "user";
    res.json({ role, email, blocked: false });
});

// 2. Record Visit
app.post("/visit", (req, res) => {
    const newEntry = { 
        ...req.body, 
        dateTime: new Date().toLocaleString('en-PH'), 
        timestamp: new Date() 
    };
    visits.unshift(newEntry); // Adds to the top of the list
    res.json({ success: true });
});

// 3. Get Logs for Admin Table
app.get("/logs", (req, res) => {
    res.json(visits);
});

// 4. Block a User
app.post("/block", (req, res) => {
    const { email } = req.body;
    if (!blockedUsers.includes(email)) blockedUsers.push(email);
    res.json({ success: true, blockedUsers });
});

// 5. Delete Log
app.post("/delete", (req, res) => {
    const { index } = req.body;
    visits.splice(index, 1);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`NEU Library System Active: http://localhost:${PORT}`));