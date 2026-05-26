import ProctorSession from '../models/ProctorSession.js';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Exam from '../models/Exam.js';
import fs from 'fs';
import path from 'path';
import { notifyAdmins } from '../utils/emailService.js';

// Helper to save base64 to local storage
const uploadToBase64 = async (base64String, subDir, req) => {
    try {
        // Strip base64 prefix
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const uploadDir = 'uploads';
        const targetDir = path.join(uploadDir, subDir);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
        const filePath = path.join(targetDir, fileName);

        fs.writeFileSync(filePath, buffer);

        // Construct full URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${subDir}/${fileName}`.replace(/\\/g, '/');
        return fileUrl;
    } catch (error) {
        console.error('[Storage] Upload error:', error);
        throw new Error('Failed to save image to server storage');
    }
};

// Upload Snapshot
export const uploadSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, snapshot } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !snapshot) return res.status(400).json({ message: 'Missing required fields' });

        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        // Check if exam exists before creating proctor session
        const examExists = await Exam.findByPk(examId);
        if (!examExists) return res.status(404).json({ message: 'Exam not found' });

        const imageUrl = await uploadToBase64(snapshot, `proctor/exams/${examId}/snapshots`, req);

        const filter = { userId, examId, attemptId };
        const update = { lastSnapshot: imageUrl, lastUpdated: Date.now() };

        let session = await ProctorSession.findOne({ where: filter });
        if (session) {
            await session.update(update);
        } else {
            session = await ProctorSession.create({ ...filter, ...update });
        }

        res.status(200).json({
            message: 'Snapshot uploaded',
            url: imageUrl,
            sessionId: session.id
        });
    } catch (error) {
        console.error('[Proctor] Snapshot upload error:', error);
        res.status(500).json({ message: 'Server error during snapshot upload', error: error.message });
    }
};

// Get Active Sessions for an Exam (Admin only)
export const getActiveSessions = async (req, res) => {
    try {
        const sessions = await ProctorSession.findAll({
            where: { examId: req.params.examId },
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }],
            order: [['lastUpdated', 'DESC']]
        });

        const mappedSessions = sessions.map(s => {
            const sessionData = s.toJSON();
            sessionData.userId = sessionData.User;
            delete sessionData.User;
            return sessionData;
        });

        res.status(200).json(mappedSessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload ID Snapshot
export const uploadIdSnapshot = async (req, res) => {
    try {
        const { examId, attemptId, idSnapshot, kycData } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated' });
        if (!examId || !attemptId || !idSnapshot) return res.status(400).json({ message: 'Missing required fields' });

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(examId)) return res.status(400).json({ message: 'Invalid examId format' });

        // Check if exam exists
        const examExists = await Exam.findByPk(examId);
        if (!examExists) return res.status(404).json({ message: 'Exam not found' });

        const idUrl = await uploadToBase64(idSnapshot, `proctor/exams/${examId}/ids`, req);

        const filter = { userId, examId, attemptId };
        const update = { idSnapshot: idUrl, kycData, verificationStatus: 'pending', lastUpdated: Date.now() };

        let session = await ProctorSession.findOne({
            where: filter,
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName'] }]
        });

        if (session) {
            await session.update(update);
        } else {
            session = await ProctorSession.create({ ...filter, ...update });
            // Fetch again to get the populated user object for socket event
            session = await ProctorSession.findByPk(session.id, {
                include: [{ model: User, attributes: ['id', 'firstName', 'lastName'] }]
            });
        }

        if (!session) throw new Error("Failed to create or update proctor session");

        const io = req.app.get('io');
        if (io) {
            const proctorRoom = `proctor_exam_${examId}`;
            io.to(proctorRoom).emit('new_id_verification', {
                userId,
                examId,
                attemptId,
                studentName: `${session.User?.firstName || ''} ${session.User?.lastName || ''}`.trim(),
                sessionId: session.id,
                idSnapshot: idUrl,
                kycData
            });
        }

        // Notify Admins via Email
        await notifyAdmins(
            `Exam ID Verification Required: ${session.User?.firstName || 'Student'}`,
            `
            <h3>A student has uploaded their ID for exam verification.</h3>
            <p><strong>Student Name:</strong> ${session.User?.firstName || ''} ${session.User?.lastName || ''}</p>
            <p><strong>Exam ID:</strong> ${examId}</p>
            <p><strong>ID Type:</strong> ${kycData?.idType || 'Not Provided'}</p>
            <p><strong>ID Number:</strong> ${kycData?.idNumber || 'Not Provided'}</p>
            <p><strong>Verification Status:</strong> Pending</p>
            <hr>
            <p>Please log in to the admin dashboard to verify the identity and approve the student for the exam.</p>
            `
        );

        res.status(200).json({
            message: "ID Snapshot uploaded successfully",
            url: idUrl,
            sessionId: session.id
        });
    } catch (error) {
        console.error('[Proctor] ID upload error:', error);
        res.status(500).json({ message: 'Server error during ID upload', error: error.message });
    }
};

// Verify ID (Admin only)
export const verifyId = async (req, res) => {
    try {
        const { sessionId, status } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const session = await ProctorSession.findByPk(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await session.update({ verificationStatus: status, lastUpdated: Date.now() });

        const io = req.app.get('io');
        const room = `${session.examId.toString()}_${session.userId.toString()}_${session.attemptId}`;
        console.log(`[Backend] Emitting verification_updated to room: ${room} with status: ${status}`);
        io.to(room).emit('verification_updated', { status });

        res.status(200).json({ message: `ID ${status}`, session });
    } catch (error) {
        console.error('Verify ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get My Session (Student)
export const getMySession = async (req, res) => {
    try {
        const session = await ProctorSession.findOne({
            where: {
                userId: req.user.id,
                examId: req.params.examId,
                attemptId: req.params.attemptId
            }
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Session (Admin only)
export const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await ProctorSession.findByPk(id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        await session.destroy();
        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Auto-Cleanup Sessions (Internal use)
export const autoCleanupSessions = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const deletedCount = await ProctorSession.destroy({
            where: {
                lastUpdated: {
                    [Op.lt]: twentyFourHoursAgo
                }
            }
        });
        if (deletedCount > 0) {
            console.log(`[Scheduled Task] Auto-cleaned ${deletedCount} old proctor sessions.`);
        }
    } catch (error) {
        console.error('[Scheduled Task] Auto-cleanup failed:', error);
    }
};
