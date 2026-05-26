import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { len: [2, 50] } // Sequelize validate length
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { len: [2, 50] }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      isIndianPhone(value) {
        if (value && !/^[6-9]\d{9}$/.test(value)) {
          throw new Error('Invalid phone number');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isStrongPassword(value) {
        if (!this.googleUid && (!value || value.length < 8)) {
          throw new Error('Password must be at least 8 characters long');
        }
      }
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleUid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password', 'resetPasswordToken'] }
  },
  scopes: {
    withPassword: { attributes: {} } // Use User.scope('withPassword').findOne(...) to include pass
  }
});

export default User;
