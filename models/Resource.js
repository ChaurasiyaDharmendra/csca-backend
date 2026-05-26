import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Resource = sequelize.define('Resource', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    type: {
        type: DataTypes.ENUM('Blog', 'Whitepaper', 'Blueprint', 'Handbook', 'Case Study'),
        allowNull: false,
    },
    tag: { type: DataTypes.STRING },
    outcome: { type: DataTypes.STRING },
    details: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    link: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdBy: { type: DataTypes.UUID, allowNull: true }
}, { timestamps: true });

export default Resource;
