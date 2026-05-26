import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const IndustrySector = sequelize.define('IndustrySector', {
    id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    tagline: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: false },
    roles: { type: DataTypes.STRING },
    risks: { type: DataTypes.STRING },
    rec: { type: DataTypes.STRING },
    icon: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

export default IndustrySector;
