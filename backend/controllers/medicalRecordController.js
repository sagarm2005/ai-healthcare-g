import asyncHandler from 'express-async-handler';
import MedicalRecord from '../models/MedicalRecord.js';
import { upload } from '../middleware/uploadMiddleware.js'; // Assuming a multer setup for file uploads

// @desc    Get all medical records (admin only) or for a specific patient/doctor
// @route   GET /api/medicalrecords
// @access  Private/Admin or Private/Doctor or Private/Patient
const getMedicalRecords = asyncHandler(async (req, res) => {
    // This controller provides a more general way to get medical records
    // Admin can get all, Doctor can get for their patients, Patient can get their own
    const query = {};
    if (req.query.patientId) {
        query.patient = req.query.patientId;
    }
    // Add logic here to filter by doctor if needed

    const medicalRecords = await MedicalRecord.find(query)
        .populate('patient', 'name')
        .populate('uploadedBy', 'email role'); // Populate user who uploaded

    res.json(medicalRecords);
});

// @desc    Get single medical record by ID
// @route   GET /api/medicalrecords/:id
// @access  Private (Admin or relevant Doctor/Patient)
const getMedicalRecordById = asyncHandler(async (req, res) => {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
        .populate('patient', 'name')
        .populate('uploadedBy', 'email role');

    if (medicalRecord) {
        // Add authorization check: only admin, or doctor/patient associated with record can view
        if (req.user.role === 'Admin' ||
            (req.user.role === 'Patient' && medicalRecord.patient.toString() === req.user.profileId.toString()) ||
            (req.user.role === 'Doctor' /* && medicalRecord.patient is one of doctor's patients */)
        ) {
            res.json(medicalRecord);
        } else {
            res.status(403);
            throw new Error('Not authorized to view this medical record');
        }
    } else {
        res.status(404);
        throw new Error('Medical record not found');
    }
});

// @desc    Create a medical record (if not handled by patient/doctor controller)
// @route   POST /api/medicalrecords
// @access  Private/Admin or Private/Doctor or Private/Patient
const createMedicalRecord = asyncHandler(async (req, res) => {
    const { patient, patientId, title, description, fileUrl, reportType, recordType, diagnosis, treatment, notes } = req.body;

    const medicalRecord = new MedicalRecord({
        patient: patient || patientId,
        title: title || `Clinical Note - ${new Date().toLocaleDateString()}`,
        reportType: reportType || recordType || 'Checkup',
        description,
        diagnosis,
        treatment,
        notes,
        fileUrl,
        uploadedBy: req.user._id,
    });

    const createdMedicalRecord = await medicalRecord.save();
    res.status(201).json(createdMedicalRecord);
});


// @desc    Update a medical record
// @route   PUT /api/medicalrecords/:id
// @access  Private/Admin or relevant Doctor
const updateMedicalRecord = asyncHandler(async (req, res) => {
    const { title, description, fileUrl, diagnosis, treatment, notes } = req.body;

    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
        medicalRecord.title = title || medicalRecord.title;
        medicalRecord.description = description || medicalRecord.description;
        medicalRecord.fileUrl = fileUrl || medicalRecord.fileUrl;
        medicalRecord.diagnosis = diagnosis || medicalRecord.diagnosis;
        medicalRecord.treatment = treatment || medicalRecord.treatment;
        medicalRecord.notes = notes || medicalRecord.notes;

        const updatedMedicalRecord = await medicalRecord.save();
        res.json(updatedMedicalRecord);
    } else {
        res.status(404);
        throw new Error('Medical record not found');
    }
});


// @desc    Delete a medical record
// @route   DELETE /api/medicalrecords/:id
// @access  Private/Admin
const deleteMedicalRecord = asyncHandler(async (req, res) => {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
        // Add authorization check here
        if (req.user.role === 'Admin') {
            await medicalRecord.deleteOne();
            res.json({ message: 'Medical record removed' });
        } else {
            res.status(403);
            throw new Error('Not authorized to delete this medical record');
        }
    } else {
        res.status(404);
        throw new Error('Medical record not found');
    }
});

export {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
};
