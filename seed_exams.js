import { sequelize, User, Exam } from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedExams() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Find an admin user to associate the exam with
        const admin = await User.findOne({ where: { role: 'admin' } });
        const adminId = admin ? admin.id : null;

        // The specific ID from your error message to fix the 404
        const examId = 'dce42a4b-09d9-40cd-85f2-c5d2facb5a21';

        const examData = {
            id: examId,
            title: 'Sample Security Certification Exam',
            description: 'This is a sample exam to test the proctoring and exam player system.',
            duration: 60,
            totalQuestions: 2,
            category: 'Security',
            price: 0,
            createdBy: adminId,
            questions: [
                {
                    question: 'What does SQL stand for?',
                    options: ['Structured Query Language', 'Strong Question Logic', 'Secure Query Level', 'Standard Query List'],
                    answer: 'Structured Query Language'
                },
                {
                    question: 'Which of these is a symetric encryption algorithm?',
                    options: ['RSA', 'AES', 'ECC', 'Diffie-Hellman'],
                    answer: 'AES'
                }
            ]
        };

        const [exam, created] = await Exam.findOrCreate({
            where: { id: examId },
            defaults: examData
        });

        if (created) {
            console.log(`Exam with ID ${examId} created successfully.`);
        } else {
            console.log(`Exam with ID ${examId} already exists.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedExams();
