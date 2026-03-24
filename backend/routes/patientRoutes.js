import express from 'express';
const router = express.Router();
import {
    getPatientProfile,
    bookAppointment,
    getMyAppointments,
    getMyPrescriptions,
    uploadMedicalReport,
    getMyAIPredictionResults,
    updatePatientProfile,
    getMyMedicalRecords,
    deleteMedicalRecord,
    getPatientNotifications,
    markNotificationAsRead,
    deleteNotification,
    cancelAppointment,
    deleteAppointment,
    updateAppointment,
} from '../controllers/patientController.js';
import { protect, patient } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // Import upload middleware

router.route('/profile').get(protect, patient, getPatientProfile).put(protect, patient, updatePatientProfile);
router.route('/medical-records')
    .get(protect, patient, getMyMedicalRecords); // New route for medical records
router.route('/medical-records/:id')
    .delete(protect, patient, deleteMedicalRecord); // Route for deleting a specific medical record
router.route('/appointments').post(protect, patient, bookAppointment).get(protect, patient, getMyAppointments);
router.route('/appointments/:id/cancel').put(protect, patient, cancelAppointment); // New route for canceling appointments
router.route('/appointments/:id').delete(protect, patient, deleteAppointment); // New route for deleting appointments
router.route('/appointments/:id').put(protect, patient, updateAppointment); // New route for updating appointments
router.route('/prescriptions').get(protect, patient, getMyPrescriptions);
router.route('/medicalrecords/upload').post(protect, patient, upload.single('medicalReport'), uploadMedicalReport);
router.route('/ai-prediction-results').get(protect, patient, getMyAIPredictionResults);

// Notification routes
router.route('/notifications')
    .get(protect, patient, getPatientNotifications);
router.route('/notifications/:id/read')
    .put(protect, patient, markNotificationAsRead);
router.route('/notifications/:id')
    .delete(protect, patient, deleteNotification);

export default router;
