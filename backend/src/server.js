import app from "./app.js";
import { OAuth2Client } from 'google-auth-library';
import pool from "./config/db.js"; 

// 1. Configuration
const PORT = process.env.PORT || 8080;
const CLIENT_ID = "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// 2. Auth Route
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const googleId = payload.sub; // Unique numeric ID from Google
        const fullName = payload.name;
        const firstName = payload.name.split(' ')[0];

        // --- Whitelists ---
        const managers = [
            "ok.samgarces@gmail.com",
            "reveille.bubbletea@gmail.com", 
            "ibrahimerandhawa@gmail.com", 
            "4andrew.siv@gmail.com",  
            "christianb62791@gmail.com",       
            "rch27@tamu.edu"
        ];

        const cashiers = [
            "purigarv@tamu.edu",
            "cqb.23000@tamu.edu",
            "andrewsiv14@tamu.edu",
            "garcesam0@tamu.edu",
            "ibrahime@tamu.edu"
        ];

        let assignedRole = null;

        // Check Roles
        if (managers.includes(userEmail)) {
            assignedRole = "manager";
        } else if (cashiers.includes(userEmail)) {
            assignedRole = "cashier";
        } else {
            // NEW: If not an employee, handle as a Customer
            assignedRole = "customer";
            
            try {
                // Upsert customer: Insert if new, or do nothing if already exists
                // We use the 'sub' from Google as our customer_id
                await pool.query(
                    `INSERT INTO customers (customer_id, name, stamps, lucky_draw_eligible, reward_points) 
                     VALUES ($1, $2, 0, false, 0) 
                     ON CONFLICT (customer_id) DO NOTHING`,
                    [googleId, fullName]
                );
                console.log(`✅ Customer Handled: ${fullName} (${googleId})`);
            } catch (dbErr) {
                console.error("Database Error saving customer:", dbErr.message);
                // We don't block login if DB fails, but we log it
            }
        }

        // Return the response to the frontend
        res.json({ 
            success: true, 
            role: assignedRole,
            name: firstName,
            customer_id: googleId // Send this back so the frontend can use it for orders!
        });

    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ error: "Invalid Google Token" });
    }
});

// 4. Employees Route
app.get("/api/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT employee_id, name, role, shift_status FROM employees ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Employee Fetch Error:", err.message);
        res.status(500).json([]); 
    }
});

// 5. Add Employee Route
app.post("/api/employees", async (req, res) => {
    const { name, role } = req.body;
    try {
        const idRes = await pool.query("SELECT MAX(employee_id) FROM employees");
        const nextId = (idRes.rows[0].max || 0) + 1;
        
        await pool.query(
            "INSERT INTO employees (employee_id, name, role, shift_status) VALUES ($1, $2, $3, false)", 
            [nextId, name, role]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Add Employee Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Aura Backend running on port ${PORT}`);
});