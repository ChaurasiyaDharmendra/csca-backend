import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import User from "../models/User.js";

// @route   GET /api/results/all
// @desc    Get all exam results (Admin only)
// @access  Private/Admin
export const getAllResults = async (req, res) => {
    try {
        const results = await Result.findAll({
            include: [
                { model: User, attributes: ['firstName', 'lastName', 'email'] },
                { model: Exam, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   POST /api/results/submit
// @desc    Submit exam and calculate score
// @access  Private
export const submitExamResult = async (req, res) => {
    try {
        const { examId, answers, timeTaken } = req.body;

        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        let totalScore = 0;
        let totalMarks = 0;
        const resultResponses = [];

        exam.questions.forEach((q, idx) => {
            const selectedOptIdx = answers[idx];
            let isCorrect = false;
            let selectedOptionText = null;

            if (selectedOptIdx !== undefined && selectedOptIdx !== null) {
                selectedOptionText = q.options[selectedOptIdx];
                if (selectedOptionText && selectedOptionText.trim() === q.correctAnswer.trim()) {
                    isCorrect = true;
                    totalScore += (q.marks || 1);
                }
            }

            totalMarks += (q.marks || 1);

            resultResponses.push({
                questionId: q.id || idx,
                questionText: q.questionText,
                selectedOption: selectedOptionText,
                correctAnswer: q.correctAnswer,
                isCorrect,
                marksObtained: isCorrect ? (q.marks || 1) : 0
            });
        });

        const percentage = (totalScore / totalMarks) * 100;
        const status = percentage >= 70 ? 'Pass' : 'Fail';

        const result = await Result.create({
            userId: req.user.id,
            examId: examId,
            examTitle: exam.title,
            responses: resultResponses,
            score: totalScore,
            totalMarks,
            percentage,
            status,
            timeTaken
        });

        res.status(201).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// @route   GET /api/results/my-history
// @desc    Get current user's exam history
// @access  Private
export const getMyHistory = async (req, res) => {
    try {
        const results = await Result.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   DELETE /api/results/:id
// @desc    Delete a result
// @access  Private/Admin
export const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByPk(req.params.id);
        if (!result) return res.status(404).json({ message: "Result not found" });

        await Result.destroy({ where: { id: req.params.id } });
        res.json({ message: "Result removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   PUT /api/results/:id
// @desc    Update a result (Score/Status)
// @access  Private/Admin
export const updateResult = async (req, res) => {
    try {
        const { score, totalMarks, status } = req.body;
        const result = await Result.findByPk(req.params.id);
        if (!result) return res.status(404).json({ message: "Result not found" });

        result.score = score !== undefined ? score : result.score;
        result.totalMarks = totalMarks !== undefined ? totalMarks : result.totalMarks;
        result.status = status || result.status;

        if (score !== undefined || totalMarks !== undefined) {
            result.percentage = (result.score / result.totalMarks) * 100;
        }

        await result.save();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route   GET /api/results/:id/certificate
// @desc    Get certificate data for a passed result
// @access  Private
export const getCertificateData = async (req, res) => {
    try {
        const result = await Result.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }]
        });

        if (!result) return res.status(404).json({ message: "Result not found" });

        if (result.userId !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (result.status !== 'Pass') {
            return res.status(400).json({ message: "Certificate only available for passed exams" });
        }

        res.json({
            certificateId: result.id,
            userName: `${result.User.firstName} ${result.User.lastName}`,
            examTitle: result.examTitle,
            score: result.score,
            totalMarks: result.totalMarks,
            percentage: Math.round(result.percentage),
            status: result.status,
            completedAt: result.completedAt,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
