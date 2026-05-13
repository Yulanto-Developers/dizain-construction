import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
// console.log("BREVO KEY:", process.env.BREVO_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    // res.send("Backend Running");
});

app.post("/send-email", async (req, res) => {
    try {
        const {
            name,
            phone,
            budget,
            email,
            location,
            details
        } = req.body;

        // =========================
        // ADMIN EMAIL TEMPLATE
        // =========================
        const adminHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #F97316; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏗️ New Consultation Request</h1>
    </div>
    <div style="padding: 30px; color: #334155;">
        <p style="font-size: 16px; margin-bottom: 20px;">You have received a new inquiry from the website:</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #64748b; width: 30%;">Name</td>
                <td style="padding: 12px 0; color: #1e293b;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #64748b;">Phone</td>
                <td style="padding: 12px 0; color: #1e293b;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #64748b;">Email</td>
                <td style="padding: 12px 0; color: #1e293b;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #64748b;">Budget</td>
                <td style="padding: 12px 0; color: #F97316; font-weight: bold;">${budget}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #64748b;">Location</td>
                <td style="padding: 12px 0; color: #1e293b;">${location}</td>
            </tr>
            ${details ? `
<tr>
    <td style="padding: 12px 0; font-weight: bold; color: #64748b;">Details</td>
    <td style="padding: 12px 0; color: #1e293b;">${details}</td>
</tr>
` : ""}
        </table>
    </div>
    <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
        Sent via Dizain Upgraded Portal
    </div>
</div>`.trim();
        // console.log("HTML Content to be sent:", adminHtml);
        // =========================
        // CUSTOMER EMAIL TEMPLATE
        // =========================
        const customerHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #F97316; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Thank You, ${name}! ❤️</h1>
    </div>
    <div style="padding: 40px; text-align: center; color: #334155;">
        <p style="font-size: 18px; line-height: 1.6;">We’ve received your consultation request and our team is already reviewing it.</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #fff7ed; border-radius: 12px; border: 1px dashed #F97316; text-align: left;">
            <h3 style="margin-top: 0; color: #F97316; font-size: 16px; text-transform: uppercase;">Your Details:</h3>
            <p style="margin: 8px 0; color: #1e293b;"><strong>Budget:</strong> ${budget}</p>
            <p style="margin: 8px 0; color: #1e293b;"><strong>Location:</strong> ${location}</p>
        </div>
        <p style="font-size: 14px; color: #64748b;">We will contact you shortly.</p>
    </div>
    <div style="background-color: #1e293b; padding: 30px; color: #ffffff; text-align: center;">
        <p style="font-weight: bold; margin: 0; font-size: 16px; color: #ffffff;">Dizain Upgraded Team</p>
        <p style="margin: 5px 0; font-size: 13px; color: #cbd5e1;">📍 Chennai, Tamil Nadu</p>
        <p style="margin: 5px 0; font-size: 13px; color: #cbd5e1;">📞 +91 89393 30941</p>
    </div>
</div>`.trim();

        // Admin Email Fetch
        const adminResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { name: "Dizain Upgraded", email: "yulantodevelopers@gmail.com" },
                to: [{ email: "yulantodevelopers@gmail.com", name: "Admin" }],
                subject: "🏗️ New Consultation Request",
                htmlContent: adminHtml,
            }),
        });

        // Thank You Email Fetch
        const thankYouResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { name: "Dizain Upgraded", email: "yulantodevelopers@gmail.com" },
                to: [{ email: email, name: name }],
                subject: "Thank You For Contacting Us ❤️",
                htmlContent: customerHtml,
            }),
        });

        const adminData = await adminResponse.json();
        const thankYouData = await thankYouResponse.json();

        if (!adminResponse.ok || !thankYouResponse.ok) {
            return res.status(500).json({ success: false, adminData, thankYouData });
        }

        res.json({ success: true, message: "Emails Sent Successfully" });

    } catch (error) {
        console.error("FULL ERROR:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.listen(5000, () => {
    console.log("Server Running On Port 5000");
});