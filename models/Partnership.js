import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Partnership = sequelize.define('Partnership', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationName: { type: DataTypes.STRING, allowNull: false },
    websiteUrl: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING, allowNull: false },
    partnerType: {
        type: DataTypes.ENUM('Academic Partner', 'Training Partner', 'Technology Partner'),
        allowNull: false
    },
    yearsInBusiness: { type: DataTypes.INTEGER },
    estimatedStudentsPerYear: { type: DataTypes.INTEGER },
    contactPersonName: { type: DataTypes.STRING, allowNull: false },
    officialEmail: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, { timestamps: true });

export default Partnership;
