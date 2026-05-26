import { Op } from 'sequelize';
import LiveClass from '../models/LiveClass.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// Admin: Create/schedule a live class
export const createLiveClass = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const { course, title, instructor, scheduledAt } = req.body;
        const liveClass = await LiveClass.create({
            courseId: course,
            title,
            instructor: instructor || req.user.name,
            scheduledAt,
            createdBy: req.user.id
        });
        res.status(201).json(liveClass);
    } catch (error) {
        res.status(500).json({ message: 'Error creating live class', error: error.message });
    }
};

// Admin: Get all live classes
export const getAllLiveClasses = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const classes = await LiveClass.findAll({
            include: [{ model: Course, attributes: ['title'] }],
            order: [['scheduledAt', 'DESC']]
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live classes' });
    }
};

// Admin: Update status (start / end a class)
export const updateLiveClassStatus = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const { status } = req.body;

        await LiveClass.update({ status }, { where: { id: req.params.id } });
        const liveClass = await LiveClass.findByPk(req.params.id);

        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Notify enrolled students via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`course_${liveClass.courseId}`).emit('live_class_update', {
                courseId: liveClass.courseId,
                status,
                roomId: liveClass.roomId,
                title: liveClass.title,
            });
        }

        res.json(liveClass);
    } catch (error) {
        res.status(500).json({ message: 'Error updating live class status' });
    }
};

// Admin: Delete a live class
export const deleteLiveClass = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        await LiveClass.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Live class deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting live class' });
    }
};

// Student/Auth: Get active or upcoming live class for a specific course
export const getCourseLiveClass = async (req, res) => {
    try {
        // Check if user is enrolled (or admin)
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) {
            const enrollment = await Enrollment.findOne({
                where: {
                    userId: req.user.id,
                    courseId: req.params.courseId,
                    status: 'Completed'
                }
            });
            if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });
        }

        // Return any live or upcoming class for this course
        const liveClass = await LiveClass.findOne({
            where: {
                courseId: req.params.courseId,
                status: { [Op.in]: ['live', 'scheduled'] }
            },
            order: [['scheduledAt', 'ASC']]
        });

        res.json(liveClass || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live class' });
    }
};
