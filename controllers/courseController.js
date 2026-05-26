import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { notifyAdmins } from '../utils/emailService.js';

// --- Public Controllers ---

// Get all active courses
export const getActiveCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { isActive: true },
            attributes: ['id', 'title', 'description', 'thumbnail', 'price', 'category', 'level']
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching courses" });
    }
};

// Get user's enrolled courses
export const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({
            where: { userId: req.user.id, status: 'Completed' },
            include: [{ model: Course }]
        });
        res.json(enrollments.map(e => e.Course));
    } catch (error) {
        res.status(500).json({ message: "Server error fetching your courses" });
    }
};

// Get course details (basic info)
export const getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const publicCourse = course.toJSON();
        if (publicCourse.chapters) {
            publicCourse.chapters = publicCourse.chapters.map(ch => {
                ch.hasVideo = !!ch.videoUrl;
                ch.hasPdf = !!ch.pdfUrl;
                if (!ch.isPreview) {
                    delete ch.videoUrl;
                    delete ch.pdfUrl;
                }
                return ch;
            });
        }
        res.json(publicCourse);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching course details" });
    }
};

// --- Protected Controllers (Enrolled Users) ---

// Get full course content (videos/pdfs)
export const getCourseContent = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const enrollment = await Enrollment.findOne({
            where: { userId: req.user.id, courseId: req.params.id, status: 'Completed' }
        });

        if (!isAdmin && !enrollment) {
            return res.status(403).json({ message: "Access denied. Course not purchased." });
        }

        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching course content" });
    }
};

// Enroll in a free course
export const enrollFreeCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (course.price > 0) {
            return res.status(400).json({ message: "This course is not free." });
        }

        const existingEnrollment = await Enrollment.findOne({
            where: { userId: req.user.id, courseId: course.id, status: 'Completed' }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: "Already enrolled." });
        }

        const newEnrollment = await Enrollment.create({
            userId: req.user.id,
            courseId: course.id,
            paymentId: 'FREE_ENROLLMENT',
            orderId: 'FREE_ENROLLMENT',
            amount: 0,
            status: 'Completed'
        });

        res.status(200).json({ message: "Enrolled successfully", enrollment: newEnrollment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error enrolling in free course" });
    }
};


// --- Admin Controllers ---

// Create a new course
export const createCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        const newCourse = await Course.create({ ...req.body, createdBy: req.user.id });
        
        // Notify Admins
        await notifyAdmins(
            `New Course Created: ${newCourse.title}`,
            `
            <h3>A new course has been created on the platform.</h3>
            <p><strong>Title:</strong> ${newCourse.title}</p>
            <p><strong>Category:</strong> ${newCourse.category}</p>
            <p><strong>Price:</strong> ${newCourse.price === 0 ? 'Free' : '₹' + newCourse.price}</p>
            <p><strong>Created By:</strong> Admin (ID: ${req.user.id})</p>
            <hr>
            <p>Please review the course content in the admin dashboard.</p>
            `
        );

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: "Error creating course", error: error.message });
    }
};

// Update a course
export const updateCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        const updateData = { ...req.body };

        if (updateData.chapters && Array.isArray(updateData.chapters)) {
            const existingCourse = await Course.findByPk(req.params.id);
            if (existingCourse && existingCourse.chapters) {
                updateData.chapters = updateData.chapters.map((incomingChapter, idx) => {
                    const existingChapter = existingCourse.chapters[idx];
                    if (existingChapter) {
                        return {
                            ...incomingChapter,
                            videoUrl: incomingChapter.videoUrl || existingChapter.videoUrl || '',
                            pdfUrl: incomingChapter.pdfUrl || existingChapter.pdfUrl || ''
                        };
                    }
                    return incomingChapter;
                });
            }
        }

        await Course.update(updateData, { where: { id: req.params.id } });
        const updatedCourse = await Course.findByPk(req.params.id);

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: "Error updating course" });
    }
};

// Delete a course
export const deleteCourse = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    try {
        await Course.destroy({ where: { id: req.params.id } });
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting course" });
    }
};
