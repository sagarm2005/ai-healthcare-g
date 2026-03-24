import asyncHandler from 'express-async-handler';
import Prescription from '../models/Prescription.js';

// @desc    Get all prescriptions (can be filtered/paginated later)
// @route   GET /api/prescriptions
// @access  Private (e.g., by Admin, or for a specific user role through query)
const getPrescriptions = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({})
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');
    res.json(prescriptions);
});

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private (e.g., by Admin or relevant Doctor/Patient)
const getPrescriptionById = asyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id)
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');

    if (prescription) {
        res.json(prescription);
    } else {
        res.status(404);
        throw new Error('Prescription not found');
    }
});

// @desc    Create a prescription (if not handled by doctorController)
// @route   POST /api/prescriptions
// @access  Private (e.g., by Admin or Doctor)
const createPrescription = asyncHandler(async (req, res) => {
    const { patient, doctor, medications, notes } = req.body;

    const prescription = new Prescription({
        patient,
        doctor,
        medications,
        notes,
    });

    const createdPrescription = await prescription.save();
    res.status(201).json(createdPrescription);
});

// @desc    Update a prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (e.g., by Admin or relevant Doctor)
const updatePrescription = asyncHandler(async (req, res) => {
    const { medications, notes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (prescription) {
        prescription.medications = medications || prescription.medications;
        prescription.notes = notes !== undefined ? notes : prescription.notes;

        const updatedPrescription = await prescription.save();
        res.json(updatedPrescription);
    } else {
        res.status(404);
        throw new Error('Prescription not found');
    }
});

// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (e.g., by Admin)
const deletePrescription = asyncHandler(async (req, res) => {
    const prescription = await Prescription.findById(req.params.id);

    if (prescription) {
        await prescription.deleteOne();
        res.json({ message: 'Prescription removed' });
    } else {
        res.status(404);
        throw new Error('Prescription not found');
    }
});

export {
    getPrescriptions,
    getPrescriptionById,
    createPrescription,
    updatePrescription,
    deletePrescription,
};
