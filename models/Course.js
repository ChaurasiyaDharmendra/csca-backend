import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Course = sequelize.define('Course', {
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
    thumbnail: {
        type: DataTypes.STRING, // Local or Cloud URL
    },
    price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
        defaultValue: 'Beginner',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    chapters: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
    }
}, {
    timestamps: true,
});

export default Course;
