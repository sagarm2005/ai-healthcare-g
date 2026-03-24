import express from 'express';
const router = express.Router();
import {
    getPrescriptions,
    getPrescriptionById,
    createPrescription,
    updatePrescription,
    deletePrescription,
} from '../controllers/prescriptionController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Admin can manage all, others via their own routes

router.route('/')
    .get(protect, admin, getPrescriptions) // Admin can view all prescriptions
    .post(protect, createPrescription); // Admin or Doctor can create

router.route('/:id')
    .get(protect, getPrescriptionById) // Admin or relevant user
    .put(protect, updatePrescription) // Admin or relevant Doctor
    .delete(protect, admin, deletePrescription); // Admin can delete

export default router;
