import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Exam = sequelize.define('Exam', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
   // questions: {
        // Store the array of question objects as JSON
    //    type: DataTypes.JSON,
    //    defaultValue: [],
  //  },
  
  questions: {
    type: DataTypes.TEXT,
    allowNull: true,
},
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        // Association will handle the foreign key constraint
    }
}, {
    timestamps: true,
});

export default Exam;
