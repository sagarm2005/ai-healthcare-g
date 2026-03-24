import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Medicine from './models/Medicine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const medicines = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'medicines.json'), 'utf-8')
);

const importData = async () => {
  try {
    await connectDB();
    await Medicine.deleteMany();
    await Medicine.insertMany(medicines);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Medicine.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
