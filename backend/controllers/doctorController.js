import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import AIReport from '../models/AIReport.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
const getAllApprovedDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({}).select(
        'name specialization yearsOfExperience qualification hospitalName medicalRegistrationNumber profileImage'
    );
    res.json(doctors);
});


// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private/Doctor
const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'email');
    if (doctor) {
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private/Doctor
const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (doctor) {
        doctor.name = req.body.name || doctor.name;
        doctor.medicalRegistrationNumber = req.body.medicalRegistrationNumber || doctor.medicalRegistrationNumber;
        doctor.specialization = req.body.specialization || doctor.specialization;
        doctor.qualification = req.body.qualification || doctor.qualification;
        doctor.yearsOfExperience = req.body.yearsOfExperience || doctor.yearsOfExperience;
        doctor.hospitalName = req.body.hospitalName || doctor.hospitalName;
        doctor.profileImage = req.body.profileImage || doctor.profileImage;

        const updatedDoctor = await doctor.save();

        res.json({
            _id: updatedDoctor._id,
            name: updatedDoctor.name,
            medicalRegistrationNumber: updatedDoctor.medicalRegistrationNumber,
            specialization: updatedDoctor.specialization,
            qualification: updatedDoctor.qualification,
            yearsOfExperience: updatedDoctor.yearsOfExperience,
            hospitalName: updatedDoctor.hospitalName,
            profileImage: updatedDoctor.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});


// @desc    Get assigned patients for a doctor
// @route   GET /api/doctor/patients
// @access  Private/Doctor
const getAssignedPatients = asyncHandler(async (req, res) => {
    // This assumes a relationship where appointments link doctors to patients.
    // A more direct assignment might be needed depending on requirements.
    const doctorAppointments = await Appointment.find({ doctor: req.user.profileId }).distinct('patient');
    const patients = await Patient.find({ _id: { $in: doctorAppointments } }).populate('userId', 'email');
    res.json(patients);
});

// @desc    Update patient medical records
// @route   PUT /api/doctor/patients/:patientId/medicalrecords
// @access  Private/Doctor
const updatePatientMedicalRecord = asyncHandler(async (req, res) => {
    const { title, description, fileUrl } = req.body;
    const patientId = req.params.patientId;

    const medicalRecord = await MedicalRecord.create({
        patient: patientId,
        title,
        description,
        fileUrl,
        uploadedBy: req.user._id,
    });

    if (medicalRecord) {
        res.status(201).json(medicalRecord);
    } else {
        res.status(400);
        throw new Error('Invalid medical record data');
    }
});

// @desc    Create prescription
// @route   POST /api/doctor/patients/:patientId/prescriptions
// @access  Private/Doctor
const createPrescription = asyncHandler(async (req, res) => {
    const { medications } = req.body; // medications is an array of {name, dosage, instructions}
    const patientId = req.params.patientId;

    const prescription = await Prescription.create({
        patient: patientId,
        doctor: req.user.profileId,
        medications,
    });

    if (prescription) {
        res.status(201).json(prescription);
    } else {
        res.status(400);
        throw new Error('Invalid prescription data');
    }
});

// @desc    View AI health predictions for a patient
// @route   GET /api/doctor/patients/:patientId/ai-predictions
// @access  Private/Doctor
const getPatientAIPredictions = asyncHandler(async (req, res) => {
    const aiReports = await AIReport.find({ patient: req.params.patientId, doctor: req.user.profileId });
    res.json(aiReports);
});

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ doctor: req.user.profileId })
        .populate('patient', 'name dateOfBirth');
    res.json(appointments);
});

// @desc    Update doctor's appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private/Doctor
const updateDoctorAppointmentStatus = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment && appointment.doctor.toString() === req.user.profileId.toString()) {
        appointment.status = req.body.status;
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found or not authorized');
    }
});


// @desc    Get doctor's available slots for a given date
// @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// @access  Public (or Private/Patient)
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { id: doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
        res.status(400);
        throw new Error('Date is required to find available slots.');
    }

    // Convert date string to a Date object for the start of the day
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Define doctor's working hours and slot duration (example: 8 AM to 8 PM, 30-minute slots)
    const workingHoursStart = 8; // 8 AM
    const workingHoursEnd = 20;   // 8 PM
    const slotDurationMinutes = 30;

    // Generate all potential slots for the day
    const allPotentialSlots = [];
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
        for (let minutes = 0; minutes < 60; minutes += slotDurationMinutes) {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinutes = String(minutes).padStart(2, '0');
            const slotTime = `${displayHour}:${displayMinutes} ${ampm}`;
            allPotentialSlots.push(slotTime);
        }
    }

    // Fetch existing appointments for the doctor on the given date
    const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date: {
            $gte: queryDate,
            $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Next day's start
        }
    });

    // Extract booked times
    const bookedTimes = bookedAppointments.map(app => app.time);

    // Filter out booked slots from all potential slots
    const availableSlots = allPotentialSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ doctorId, date, slots: availableSlots });
});

// @desc    Upload doctor profile image
// @route   POST /api/doctor/profile/upload
// @access  Private/Doctor
const uploadProfileImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    res.json({
        message: 'Image uploaded successfully',
        fileUrl: `/uploads/${req.file.filename}`,
    });
});

export {
    getDoctorProfile,
    updateDoctorProfile,
    getAssignedPatients,
    updatePatientMedicalRecord,
    createPrescription,
    getPatientAIPredictions,
    getDoctorAppointments,
    updateDoctorAppointmentStatus,
    getAllApprovedDoctors,
    getAvailableSlots,
    uploadProfileImage,
};
