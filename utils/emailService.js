import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a generic email to a recipient.
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"CSCA Platform" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error("Nodemailer send failed:", err.message);
    }
};

/**
 * Notifies all admins listed in .env about a specific event.
 */
export const notifyAdmins = async (subject, html) => {
    try {
        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
        if (adminEmails.length === 0) {
            console.warn("No admin emails found in .env (ADMIN_EMAILS).");
            return;
        }

        const mailOptions = {
            from: `"CSCA System Alert" <${process.env.EMAIL}>`,
            to: adminEmails.join(','),
            subject: `[ADMIN ALERT] ${subject}`,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Admin notification sent to ${adminEmails.length} recipients.`);
        return info;
    } catch (err) {
        console.error("Admin notification failed:", err.message);
    }
};
