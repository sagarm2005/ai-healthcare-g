import express from 'express';
const router = express.Router();
import {
    getAllDoctors,
    approveDoctor,
    getAllPatients,
    getAllAppointments,
    updateAppointmentStatus,
    getAllAIReports,
    getDashboardStats,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    updatePatient,
    deletePatient,
    getAdminProfile,
    updateAdminProfile,
    getAdminNotifications,
    markAdminNotificationAsRead,
    deleteAdminNotification,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

router.route('/doctors').get(protect, admin, getAllDoctors).post(protect, admin, createDoctor);
router.route('/doctors/:id').put(protect, admin, updateDoctor).delete(protect, admin, deleteDoctor);
router.route('/doctors/:id/approve').put(protect, admin, approveDoctor);
router.route('/patients').get(protect, admin, getAllPatients);
router.route('/patients/:id').put(protect, admin, updatePatient).delete(protect, admin, deletePatient);
router.route('/appointments').get(protect, admin, getAllAppointments);
router.route('/appointments/:id/status').put(protect, admin, updateAppointmentStatus);
router.route('/aireports').get(protect, admin, getAllAIReports);
router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/profile').get(protect, admin, getAdminProfile).put(protect, admin, upload.single('profileImage'), updateAdminProfile);

// Notification routes
router.route('/notifications').get(protect, admin, getAdminNotifications);
router.route('/notifications/:id/read').put(protect, admin, markAdminNotificationAsRead);
router.route('/notifications/:id').delete(protect, admin, deleteAdminNotification);

export default router;
