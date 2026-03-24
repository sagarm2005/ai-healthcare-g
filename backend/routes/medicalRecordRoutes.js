import express from 'express';
const router = express.Router();
import {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
} from '../controllers/medicalRecordController.js';
import { protect, admin, doctor, patient } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getMedicalRecords) // Admins can get all, doctors/patients can filter for theirs
    .post(protect, createMedicalRecord); // Can be created by doctor or patient

router.route('/:id')
    .get(protect, getMedicalRecordById) // View by admin, relevant doctor/patient
    .put(protect, doctor, updateMedicalRecord) // Update by admin or relevant doctor
    .delete(protect, admin, deleteMedicalRecord); // Delete by admin

export default router;
