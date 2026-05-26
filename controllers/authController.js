import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";
import { generatePassword } from "../utils/passwordGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import { sendPhoneOtp } from "../utils/sendPhoneOtp.js";

// Register Route Controller
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        const role = adminEmails.includes(email) ? 'admin' : 'user';

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const messages = err.errors.map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email or phone number already in use' });
        }
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};

// Forgot Password Route Controller 
export const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;

        console.log("Forgot Password Request:", { email, phone });

        let query = {};
        if (email) {
            query.email = { [Op.like]: email };
        } else if (phone) {
            query.phone = phone;
        } else {
            return res.status(400).json({ message: "Provide email or phone number" });
        }

        const user = await User.findOne({ where: query });
        console.log("User search result:", user ? "Found" : "Not Found");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Generate new password
        const newPassword = generatePassword(10);
        const hashed = await bcrypt.hash(newPassword, 10);

        user.password = hashed;
        user.resetPasswordExpires = new Date(); // Storing forgotPasswordUsedAt here

        await user.save();

        // Send Password
        const message = `Your new password is: ${newPassword}\n\nPlease change it after logging in.`;

        if (email) {
            await sendEmail(email, "Password Reset", message);
        }

        if (phone) {
            await sendPhoneOtp(phone, newPassword);
        }

        console.log("New Password Generated:", newPassword);

        res.json({
            message: "New password generated and sent to your email/phone.",
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password for Mobile (Frontend Verified) Controller
export const resetPasswordMobileVerified = async (req, res) => {
    try {

        const { phone } = req.body;

        const user = await User.findOne({ where: { phone } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const newPassword = generatePassword(10);
        const hashed = await bcrypt.hash(newPassword, 10);

        user.password = hashed;
        user.resetPasswordExpires = new Date();
        await user.save();

        // Return password to frontend so user can see it
        res.json({ message: "Password reset successful.", newPassword });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Login Route Controller
export const loginUser = async (req, res) => {
    try {
        let { identifier, password, email } = req.body;

        identifier = identifier || email;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Please provide email/phone and password" });
        }

        let query = {};
        if (identifier.includes('@')) {
            query.email = { [Op.like]: identifier };
        } else {
            query.phone = identifier;
        }

        const user = await User.scope('withPassword').findOne({ where: query });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google Login. Please login with Google or use Forgot Password to set a password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
        if (adminEmails.includes(user.email) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// Verify Login OTP
export const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });

        // Since loginOtp is not directly on the model, this logic implies a secondary storage/feature which is pseudo for now
        if (!user || user.resetPasswordToken !== otp) { // repurposed variable since loginOtp didn't exist in schema
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.resetPasswordToken = null;
        await user.save();

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Login successful after OTP",
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
};

// Google Login Controller
export const googleLogin = async (req, res) => {
    try {
        const { email, firstName, lastName, avatar, uid, name } = req.body;

        let userFirstName = firstName;
        let userLastName = lastName;

        if (!userFirstName && !userLastName) {
            let finalName = name || email.split('@')[0];
            const parts = finalName.split(' ');
            userFirstName = parts[0] || 'Google';
            userLastName = parts.slice(1).join(' ') || 'User';
        } else if (!userFirstName) {
            userFirstName = 'Google';
        } else if (!userLastName) {
            userLastName = 'User';
        }

        let user = await User.findOne({ where: { email } });

        if (!user) {
            const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
            const role = adminEmails.includes(email) ? 'admin' : 'user';

            user = await User.create({
                firstName: userFirstName,
                lastName: userLastName,
                email,
                avatar,
                googleUid: uid,
                role
            });
        } else {
            if (!user.firstName) user.firstName = userFirstName;
            if (!user.lastName) user.lastName = userLastName;

            if (!user.avatar && avatar) {
                user.avatar = avatar;
            }
            user.googleUid = uid || user.googleUid;

            const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
            if (adminEmails.includes(email) && user.role !== 'admin') {
                user.role = 'admin';
            }

            await user.save();
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Google Login successful",
            user: {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: err.message });
    }
};

// Logout Controller
export const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: "Logged out successfully" });
};

// Get Me (Current User) Controller
export const getMe = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.json({ status: "success", user: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.json({ status: "success", user: null });
        }

        res.json({
            status: "success",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        res.json({ status: "success", user: null });
    }
};
