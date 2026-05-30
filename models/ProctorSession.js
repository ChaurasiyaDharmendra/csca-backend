import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ProctorSession = sequelize.define('ProctorSession', {
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
    examId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    attemptId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastSnapshot: {
        type: DataTypes.TEXT('long'), // Base64 string
        allowNull: true
    },
    idSnapshot: {
        type: DataTypes.TEXT('long'), // Base64 string of student ID
        allowNull: true
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
    },
   // kycData: {
     //   type: DataTypes.JSON,
    // },

    kycData: {
    type: DataTypes.TEXT,
    allowNull: true
},
   // messages: {
     //   type: DataTypes.JSON,
    //    defaultValue: []
   // },

   messages: {
    type: DataTypes.TEXT,
    allowNull: true
},
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['userId', 'examId', 'attemptId'] }
    ]
});

export default ProctorSession;
