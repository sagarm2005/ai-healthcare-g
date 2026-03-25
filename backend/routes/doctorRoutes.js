import express from 'express';
const router = express.Router();
import {
    getDoctorProfile,
    updateDoctorProfile,
    getAssignedPatients,
    updatePatientMedicalRecord,
    createPrescription,
    getPatientAIPredictions,
    getDoctorAppointments,
    updateDoctorAppointmentStatus,
    getAllApprovedDoctors, // Import the new function
    getAvailableSlots,
    uploadProfileImage,
} from '../controllers/doctorController.js';
import { protect, doctor } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

router.route('/profile').get(protect, doctor, getDoctorProfile).put(protect, doctor, upload.single('profileImage'), updateDoctorProfile);
router.route('/profile/upload').post(protect, doctor, upload.single('profileImage'), uploadProfileImage);
router.route('/patients').get(protect, doctor, getAssignedPatients);
router.route('/patients/:patientId/medicalrecords').post(protect, doctor, updatePatientMedicalRecord);
router.route('/patients/:patientId/prescriptions').post(protect, doctor, createPrescription);
router.route('/patients/:patientId/ai-predictions').get(protect, doctor, getPatientAIPredictions);
router.route('/appointments').get(protect, doctor, getDoctorAppointments);
router.route('/appointments/:id/status').put(protect, doctor, updateDoctorAppointmentStatus);
router.route('/:id/available-slots').get(getAvailableSlots);

export default router;
