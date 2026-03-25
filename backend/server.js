import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import doctorDashboardRoutes from './routes/doctorDashboardRoutes.js'; // Import doctorDashboardRoutes
import { getAllApprovedDoctors } from './controllers/doctorController.js'; // Import getAllApprovedDoctors
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });
if (!process.env.MONGO_URI) {
    dotenv.config(); // Fallback if already in backend folder
}
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // Body parser
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('API is running and root route updated with debug message!');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/doctor-dashboard', doctorDashboardRoutes); // Mount doctorDashboardRoutes
app.use('/api/patient', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicalrecords', medicalRecordRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);

// Public route to get all approved doctors
app.get('/api/doctors', getAllApprovedDoctors);

app.use(notFound);
app.use((err, req, res, next) => errorHandler(err, req, res, next));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
