import express from 'express';
const router = express.Router();
import {
    generateAIPrediction,
    getPatientAIReports,
    chatWithAI,
} from '../controllers/aiController.js';
import { protect, doctor, patient } from '../middleware/authMiddleware.js';

router.route('/chat').post(protect, chatWithAI);
router.route('/predict/:patientId').post(protect, doctor, generateAIPrediction);
router.route('/reports/:patientId').get(protect, patient, getPatientAIReports); // Patient can view their own, Doctor can view their patients'

export default router;
