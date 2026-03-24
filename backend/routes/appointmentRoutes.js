import express from 'express';
const router = express.Router();
import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Admin can manage all, others via their own routes

router.route('/')
    .get(protect, admin, getAppointments) // Admin can view all appointments
    .post(protect, createAppointment); // Admin or Patient (via specific routes) can create

router.route('/:id')
    .get(protect, getAppointmentById) // Admin or relevant user
    .put(protect, updateAppointment) // Admin or relevant Doctor
    .delete(protect, admin, deleteAppointment); // Admin can delete

export default router;
