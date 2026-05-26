import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const LiveClass = sequelize.define('LiveClass', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    instructor: {
        type: DataTypes.STRING,
        defaultValue: 'Instructor'
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    roomId: {
        type: DataTypes.STRING,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'live', 'ended'),
        defaultValue: 'scheduled'
    },
    createdBy: {
        type: DataTypes.UUID
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: (liveClass) => {
            if (!liveClass.roomId && liveClass.title) {
                const slug = liveClass.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                liveClass.roomId = `csca-${slug}-${Date.now()}`;
            }
        }
    }
});

export default LiveClass;
