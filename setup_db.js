import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });

    try {
        const dbName = process.env.DB_NAME || 'cscs_secure';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database "${dbName}" created or already exists.`);
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await connection.end();
    }
}

setupDatabase();
