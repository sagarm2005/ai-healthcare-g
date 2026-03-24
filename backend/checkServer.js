import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const testServer = async () => {
    try {
        await connectDB();
        const app = express();
        const PORT = process.env.PORT || 5000;
        
        const server = app.listen(PORT, () => {
            console.log(`Test server successfully started on port ${PORT}`);
            server.close();
            process.exit(0);
        });
    } catch (error) {
        console.error('Failed to start test server:', error.message);
        process.exit(1);
    }
};

testServer();
