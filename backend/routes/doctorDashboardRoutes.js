import express from 'express';
const router = express.Router();
import {
    getDashboardSummary,
    getMedicalReportsForReview,
    getPrescriptionsByDoctor,
    getDoctorNotifications,
    getDoctorAppointments,
    getDoctorPatients,
    getAllPatientsForDoctor,
    getPatientDetailsForDoctor,
    confirmAppointment,
    rescheduleAppointment,
    cancelAppointment,
    completeAppointment,
    addAppointmentNotes,
    deleteAppointment,
    deleteAllAppointments,
    sendMessageToPatient,
    markDoctorNotificationAsRead,
    deleteDoctorNotification,
    deleteAllDoctorNotifications,
    deleteMedicalReport,
} from '../controllers/doctorDashboardController.js';
import { protect, doctor } from '../middleware/authMiddleware.js';

router.route('/summary').get(protect, doctor, getDashboardSummary);
router.route('/medical-reports').get(protect, doctor, getMedicalReportsForReview);
router.route('/medical-reports/:id').delete(protect, doctor, deleteMedicalReport);
router.route('/prescriptions').get(protect, doctor, getPrescriptionsByDoctor);
router.route('/notifications')
    .get(protect, doctor, getDoctorNotifications)
    .delete(protect, doctor, deleteAllDoctorNotifications);
router.route('/notifications/:id/read').put(protect, doctor, markDoctorNotificationAsRead);
router.route('/notifications/:id').delete(protect, doctor, deleteDoctorNotification);
router.route('/appointments')
    .get(protect, doctor, getDoctorAppointments)
    .delete(protect, doctor, deleteAllAppointments);
router.route('/patients').get(protect, doctor, getDoctorPatients);
router.route('/patients/all').get(protect, doctor, getAllPatientsForDoctor);
router.route('/patient/:id/details').get(protect, doctor, getPatientDetailsForDoctor);
router.route('/patients/:id/message').post(protect, doctor, sendMessageToPatient);
router.route('/appointments/:id').delete(protect, doctor, deleteAppointment);
router.route('/appointments/:id/confirm').put(protect, doctor, confirmAppointment);
router.route('/appointments/:id/reschedule').put(protect, doctor, rescheduleAppointment);
router.route('/appointments/:id/cancel').put(protect, doctor, cancelAppointment);
router.route('/appointments/:id/complete').put(protect, doctor, completeAppointment);
router.route('/appointments/:id/notes').put(protect, doctor, addAppointmentNotes);

export default router;
