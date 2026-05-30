import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false }
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'cscs_secure',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false,
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL Database Connected Successfully");
    } catch (err) {
        console.error("MySQL Connection Error:", err);
       // process.exit(1);
    }
};

export { sequelize };
export default connectDB;
