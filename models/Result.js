import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Result = sequelize.define('Result', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        // foreign key will be wired in index.js
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
        // foreign key will be wired in index.js
    },
    examTitle: {
        type: DataTypes.STRING,
    },
   // responses: {
        // Store the array of response objects as JSON
    //    type: DataTypes.JSON,
     //   defaultValue: [],
   // },

   responses: {
    type: DataTypes.TEXT,
    allowNull: true
},
    score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    totalMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('Pass', 'Fail'),
        defaultValue: 'Fail',
    },
    timeTaken: {
        type: DataTypes.INTEGER, // in seconds
    },
    completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true,
});

export default Result;
