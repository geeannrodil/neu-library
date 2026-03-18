const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let visits = [];
let blockedUsers = [];
// ADD YOUR ADMINS HERE
const admins = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph"];

app.post("/auth", (req, res) => {
    const { email } = req.body;
    if (!email.endsWith("@neu.edu.ph")) return res.json({ error: "Access Denied: Use @neu.edu.ph only." });
    if (blockedUsers.includes(email)) return res.json({ blocked: true });
    
    const role = admins.includes(email) ? "admin" : "user";
    res.json({ role, email });
});

app.post("/visit", (req, res) => {
    const newEntry = { 
        ...req.body, 
        dateTime: new Date().toLocaleString('en-PH'), 
        timestamp: new Date() 
    };
    visits.push(newEntry);
    res.json({ success: true });
});

app.get("/stats", (req, res) => {
    const now = new Date();
    const today = visits.filter(v => new Date(v.timestamp).toDateString() === now.toDateString()).length;
    const week = visits.filter(v => (now - new Date(v.timestamp)) < 7 * 24 * 60 * 60 * 1000).length;
    const month = visits.filter(v => new Date(v.timestamp).getMonth() === now.getMonth()).length;
    
    res.json({ today, week, month, data: visits });
});

app.listen(PORT, () => console.log(`NEU Library System Active: http://localhost:${PORT}`));