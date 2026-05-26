import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    paymentId: {
        type: DataTypes.STRING,
    },
    orderId: {
        type: DataTypes.STRING,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Pending'
    },
    completedChapters: {
        type: DataTypes.JSON, // Array of UUIDs
        defaultValue: []
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'courseId'] }
    ]
});

export default Enrollment;
