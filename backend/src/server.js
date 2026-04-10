import app from "./app.js";
import { OAuth2Client } from 'google-auth-library';

// 1. These MUST be defined outside the route
const PORT = process.env.PORT || 8080;
const CLIENT_ID = "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// 2. Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Aura Backend running on port ${PORT}`);
});

// 3. Your Auth Route
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email;

        // Manager vs Cashier Whitelist
        const managers = [
            "ok.samgarces@gmail.com",
            "reveille.bubbletea@gmail.com", 
            "ibrahimerandhawa@gmail.com", 
            "4andrew.siv@gmail.com",         
        ];

        const cashiers = [
            "purigarv@tamu.edu",
            "cqb.23000@tamu.edu",
            "andrewsiv14@tamu.edu",
            "garcesam0@tamu.edu",
            "ibrahime@tamu.edu",
            "rch27@tamu.edu"
        ];

        let assignedRole = null;

        if (managers.includes(userEmail)) {
            assignedRole = "manager";
        } else if (cashiers.includes(userEmail)) {
            assignedRole = "cashier";
        } else {
            return res.status(403).json({ error: "Access denied. Email not on whitelist." });
        }

        res.json({ 
            success: true, 
            role: assignedRole,
            name: payload.name.split(' ')[0] 
        });

    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ error: "Invalid Google Token" });
    }
});