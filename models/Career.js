import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Career = sequelize.define('Career', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    icon: { type: DataTypes.STRING, allowNull: false },
    categories: { type: DataTypes.JSON, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

export default Career;
