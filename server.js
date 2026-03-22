const express = require("express");
const fs = require("fs"); // NEW: Allows the server to read/write files
const path = require("path"); // NEW: Helps find the file path safely
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// --- 💾 DATABASE SETUP (Replaces the old arrays) ---
const dbPath = path.join(__dirname, 'database.json');

// Function to load data from the file when the server wakes up
function loadDB() {
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath);
        return JSON.parse(rawData);
    }
    // If no file exists yet, create an empty structure
    return { visits: [], blockedEmails: [] }; 
}

// Function to save data to the file so it never disappears
function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Load the database into memory
let db = loadDB(); 
// ---------------------------------------------------

// Add your email here to be recognized as an admin
const adminEmails = ["jcesperanza@neu.edu.ph", "geeann.rodil@neu.edu.ph", "your-email@gmail.com"]; 

// 1. AUTH ROUTE: Checks if user is admin, blocked, or regular student
app.post('/auth', (req, res) => {
    const { email } = req.body;

    // 1. Check if the email is from NEU
    if (!email.endsWith('@neu.edu.ph')) {
        return res.json({ 
            success: false, 
            message: "Access Denied: Please use your NEU student/faculty email." 
        });
    }

    // 2. Check if the user is manually blocked by an admin (Now checks the database)
    if (db.blockedEmails.includes(email)) {
        return res.json({ 
            success: false, 
            blocked: true, 
            message: "Your account has been restricted by the administrator." 
        });
    }

    // 3. Check if they are an Admin
    if (adminEmails.includes(email)) {
        return res.json({ success: true, role: 'admin' });
    }

    // 4. Otherwise, they are a valid NEU visitor
    res.json({ success: true, role: 'user' });
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
    
    // Push to the database array and SAVE TO FILE
    db.visits.push(newLog); 
    saveDB(); 
    
    res.status(200).send({ message: "Success" });
});

// 3. ADMIN DASHBOARD DATA: Sends the logs and calculates the stats
app.get("/admin-data", (req, res) => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const stats = {
        today: db.visits.filter(v => (now - v.timestamp) < oneDay).length,
        week: db.visits.filter(v => (now - v.timestamp) < oneWeek).length,
        month: db.visits.filter(v => (now - v.timestamp) < oneMonth).length,
        total: db.visits.length
    };

    // Send data straight from the database
    res.json({ stats, logs: db.visits, blocked: db.blockedEmails });
});

// 4. BLOCK USER: Adds an email to the block list
app.post("/block-user", (req, res) => {
    const { email } = req.body;
    if (!db.blockedEmails.includes(email)) {
        db.blockedEmails.push(email);
        saveDB(); // SAVE TO FILE
    }
    res.json({ success: true });
});

// 5. UNBLOCK USER: Removes an email from the block list
app.post("/unblock-user", (req, res) => {
    const { email } = req.body;
    db.blockedEmails = db.blockedEmails.filter(e => e !== email);
    saveDB(); // SAVE TO FILE
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));