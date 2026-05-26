import { sequelize } from '../config/db.js';

import User from './User.js';
import Exam from './Exam.js';
import Result from './Result.js';
import ProctorSession from './ProctorSession.js';
import Course from './Course.js';
import LiveClass from './LiveClass.js';
import Enrollment from './Enrollment.js';
import Certification from './Certification.js';
import Career from './Career.js';
import IndustrySector from './IndustrySector.js';
import Resource from './Resource.js';
import Partnership from './Partnership.js';

// Define Associations

// User -> Exam
User.hasMany(Exam, { foreignKey: 'createdBy' });
Exam.belongsTo(User, { foreignKey: 'createdBy' });

// User -> Result
User.hasMany(Result, { foreignKey: 'userId' });
Result.belongsTo(User, { foreignKey: 'userId' });

// Exam -> Result
Exam.hasMany(Result, { foreignKey: 'examId' });
Result.belongsTo(Exam, { foreignKey: 'examId' });

// User -> ProctorSession
User.hasMany(ProctorSession, { foreignKey: 'userId' });
ProctorSession.belongsTo(User, { foreignKey: 'userId' });

// Exam -> ProctorSession
Exam.hasMany(ProctorSession, { foreignKey: 'examId' });
ProctorSession.belongsTo(Exam, { foreignKey: 'examId' });

// User -> Course
User.hasMany(Course, { foreignKey: 'createdBy' });
Course.belongsTo(User, { foreignKey: 'createdBy' });

// Course -> Enrollment
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// User -> Enrollment
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

// Course -> LiveClass
Course.hasMany(LiveClass, { foreignKey: 'courseId' });
LiveClass.belongsTo(Course, { foreignKey: 'courseId' });

// User -> LiveClass
User.hasMany(LiveClass, { foreignKey: 'createdBy' });
LiveClass.belongsTo(User, { foreignKey: 'createdBy' });

// User -> Resource
User.hasMany(Resource, { foreignKey: 'createdBy' });
Resource.belongsTo(User, { foreignKey: 'createdBy' });

export {
    sequelize,
    User,
    Exam,
    Result,
    ProctorSession,
    Course,
    LiveClass,
    Enrollment,
    Certification,
    Career,
    IndustrySector,
    Resource,
    Partnership
};
