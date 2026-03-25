import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import User from '../models/User.js'; // Import User model
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import MedicalRecord from '../models/MedicalRecord.js';
import AIReport from '../models/AIReport.js';
import Notification from '../models/Notification.js'; // Import Notification model
import Message from '../models/Message.js';
import Doctor from '../models/Doctor.js';
import moment from 'moment'; // Import moment for date handling
import { upload } from '../middleware/uploadMiddleware.js'; // Assuming a multer setup for file uploads

const MOBILE_REGEX = /^\d{10}$/;
const REPORT_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Discharge Summary', 'Checkup', 'Emergency', 'Follow-up', 'Lab Test', 'Surgery'];

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private/Patient
const getPatientProfile = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (patient) {
        // Combine patient-specific data with user email and other user data if needed
        res.json({
            _id: patient._id,
            name: patient.name,
            email: req.user.email, // Get email from the authenticated user object
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            age: patient.age,
            bloodGroup: patient.bloodGroup,
            address: patient.address,
            mobileNumber: patient.mobileNumber, // Assuming mobileNumber exists in Patient model
            profileImage: patient.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('Patient profile not found');
    }
});

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private/Patient
const updatePatientProfile = asyncHandler(async (req, res) => {
    const { name, email, password, dateOfBirth, gender, age, bloodGroup, address, mobileNumber } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user = await User.findById(req.user._id);

    if (user) {
        user.email = email || user.email;
        if (password) {
            user.password = password; // Hashing handled by pre-save hook in User model
        }
        await user.save();

        const patient = await Patient.findOne({ userId: req.user._id });

        if (patient) {
            patient.name = name || patient.name;
            patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
            patient.gender = gender || patient.gender;
            patient.age = age || patient.age;
            patient.bloodGroup = bloodGroup || patient.bloodGroup;
            patient.address = address || patient.address;
            if (profileImage) {
                patient.profileImage = profileImage;
            }

            if (mobileNumber !== undefined) {
                const sanitizedMobile = String(mobileNumber).replace(/\D/g, '');
                if (!MOBILE_REGEX.test(sanitizedMobile)) {
                    res.status(400);
                    throw new Error('Mobile number must be exactly 10 digits');
                }
                patient.mobileNumber = sanitizedMobile;
            }

            const updatedPatient = await patient.save();

            res.json({
                _id: updatedPatient._id,
                name: updatedPatient.name,
                email: user.email,
                dateOfBirth: updatedPatient.dateOfBirth,
                gender: updatedPatient.gender,
                age: updatedPatient.age,
                bloodGroup: updatedPatient.bloodGroup,
                address: updatedPatient.address,
                mobileNumber: updatedPatient.mobileNumber,
                profileImage: updatedPatient.profileImage,
            });
        } else {
            res.status(404);
            throw new Error('Patient profile not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Book an appointment
// @route   POST /api/patient/appointments
// @access  Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
    const { doctor, date, time, reason, type } = req.body; // doctor is doctor's profile ID

    const appointment = await Appointment.create({
        patient: req.user.profileId,
        doctor,
        date,
        time,
        reason,
        type: type || 'Regular',
        status: 'Pending',
    });

    if (appointment) {
        // Create a notification for the patient
        await Notification.create({
            user: req.user._id,
            patient: req.user.profileId,
            type: 'Appointment Confirmation',
            message: `Your appointment with Dr. ${doctor.name} on ${moment(date).format('MMMM Do YYYY')} at ${time} is confirmed.`,
            link: '/patient/appointments',
        });
        res.status(201).json(appointment);
    } else {
        res.status(400);
        throw new Error('Invalid appointment data');
    }
});

// @desc    Get patient's appointments
// @route   GET /api/patient/appointments
// @access  Private/Patient
const getMyAppointments = asyncHandler(async (req, res) => {
    const patientProfile = await Patient.findOne({ userId: req.user._id });

    if (!patientProfile) {
        res.status(404);
        throw new Error('Patient profile not found');
    }

    // Automatically delete completed or past appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Appointment.deleteMany({
        patient: patientProfile._id,
        $or: [
            { status: 'Completed' },
            { date: { $lt: today } }
        ]
    });

    const appointments = await Appointment.find({ patient: patientProfile._id })
        .populate('doctor', 'name specialization');
    res.json(appointments);
});

// @desc    Get patient's prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private/Patient
const getMyPrescriptions = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({ patient: req.user.profileId })
        .populate('doctor', 'name specialization');
    res.json(prescriptions);
});

// @desc    Upload medical report
// @route   POST /api/patient/medicalrecords/upload
// @access  Private/Patient
const uploadMedicalReport = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const {
        title,
        reportType,
        doctorName,
        hospitalName,
        reportDate,
        description,
        isPrivate,
        sharedWithDoctor,
    } = req.body;

    if (!title || !title.trim()) {
        res.status(400);
        throw new Error('Report title is required');
    }

    if (!REPORT_TYPES.includes(reportType)) {
        res.status(400);
        throw new Error('Invalid report type');
    }

    const parsedReportDate = reportDate ? new Date(reportDate) : null;
    if (!parsedReportDate || Number.isNaN(parsedReportDate.getTime())) {
        res.status(400);
        throw new Error('Valid report date is required');
    }

    const medicalRecord = await MedicalRecord.create({
        patient: req.user.profileId,
        title: title.trim(),
        reportType,
        doctorName: doctorName?.trim() || '',
        hospitalName: hospitalName?.trim() || '',
        reportDate: parsedReportDate,
        description: description?.trim() || '',
        isPrivate: String(isPrivate) === 'true',
        sharedWithDoctor: sharedWithDoctor || null,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileMimeType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id,
    });

    if (medicalRecord) {
        res.status(201).json(medicalRecord);
    } else {
        res.status(400);
        throw new Error('Could not save medical record');
    }
});

// @desc    Get patient's AI-based disease prediction result
// @route   GET /api/patient/ai-prediction-results
// @access  Private/Patient
const getMyMedicalRecords = asyncHandler(async (req, res) => {
    // Find patient profile ID from the user object
    const patientProfile = await Patient.findOne({ userId: req.user._id });

    if (!patientProfile) {
        res.status(404);
        throw new Error('Patient profile not found');
    }

    const medicalRecords = await MedicalRecord.find({ patient: patientProfile._id })
        .populate('uploadedBy', 'email') // Populate the User who uploaded if needed
        .populate('sharedWithDoctor', 'name specialization'); // Populate doctor info if shared

    res.json(medicalRecords);
});

// @desc    Delete medical record
// @route   DELETE /api/patient/medical-records/:id
// @access  Private/Patient
const deleteMedicalRecord = asyncHandler(async (req, res) => {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (medicalRecord) {
        const patientProfile = await Patient.findOne({ userId: req.user._id });

        if (!patientProfile) {
            res.status(404);
            throw new Error('Patient profile not found');
        }

        // Ensure the medical record belongs to the authenticated patient
        if (medicalRecord.patient.toString() !== patientProfile._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this medical record');
        }

        await medicalRecord.deleteOne();
        res.json({ message: 'Medical record removed' });
    } else {
        res.status(404);
        throw new Error('Medical record not found');
    }
});

// @desc    Get patient's notifications
// @route   GET /api/patient/notifications
// @access  Private/Patient
const getPatientNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
        .populate('patient', 'name')
        .populate('doctor', 'name');

    // Fetch messages where patient is the receiver
    const messages = await Message.find({ receiver: userId })
        .populate({
            path: 'sender',
            select: 'email role profileId',
            populate: {
                path: 'profileId',
                select: 'name'
            }
        });

    // Merge and format
    const formattedNotifications = notifications.map(n => {
        const obj = n.toObject();
        obj.itemType = 'notification';
        return obj;
    });

    const formattedMessages = messages.map(m => {
        const obj = m.toObject();
        obj.itemType = 'message';
        obj.type = m.sender?.role === 'Admin' ? 'Admin Message' : 'Doctor Message';
        obj.message = m.content;
        obj.senderName = m.sender?.profileId?.name || m.sender?.email || 'Unknown Sender';
        return obj;
    });

    const allItems = [...formattedNotifications, ...formattedMessages].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allItems);
});

// @desc    Mark patient notification as read
// @route   PUT /api/patient/notifications/:id/read
// @access  Private/Patient
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this notification');
        }
        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Delete patient notification
// @route   DELETE /api/patient/notifications/:id
// @access  Private/Patient
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this notification');
        }
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});


// @desc    Get patient's AI-based disease prediction result
// @route   GET /api/patient/ai-prediction-results
// @access  Private/Patient
const getMyAIPredictionResults = asyncHandler(async (req, res) => {
    const aiReports = await AIReport.find({ patient: req.user.profileId, reportType: 'DiseasePrediction' })
        .populate('doctor', 'name specialization');
    res.json(aiReports);
});

// @desc    Cancel an appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private/Patient
const cancelAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const patientProfile = await Patient.findOne({ userId: req.user._id });

    if (!patientProfile) {
        res.status(404);
        throw new Error('Patient profile not found');
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Verify the appointment belongs to this patient
    if (appointment.patient.toString() !== patientProfile._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to cancel this appointment');
    }

    // Allow cancellation only for Pending or Confirmed appointments
    if (['Completed', 'Canceled', 'Cancelled'].includes(appointment.status)) {
        res.status(400);
        throw new Error('Cannot cancel this appointment');
    }

    appointment.status = status || 'Cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully', appointment });
});

// @desc    Delete an appointment
// @route   DELETE /api/patient/appointments/:id
// @access  Private/Patient
const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const patientProfile = await Patient.findOne({ userId: req.user._id });

    if (!patientProfile) {
        res.status(404);
        throw new Error('Patient profile not found');
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Verify the appointment belongs to this patient
    if (appointment.patient.toString() !== patientProfile._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this appointment');
    }

    await appointment.deleteOne();

    res.json({ message: 'Appointment deleted successfully' });
});

// @desc    Update an appointment
// @route   PUT /api/patient/appointments/:id
// @access  Private/Patient
const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, time, reason } = req.body;

    const patientProfile = await Patient.findOne({ userId: req.user._id });

    if (!patientProfile) {
        res.status(404);
        throw new Error('Patient profile not found');
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Verify the appointment belongs to this patient
    if (appointment.patient.toString() !== patientProfile._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this appointment');
    }

    // Allow update only for Pending, Confirmed, or Approved appointments
    if (['Completed', 'Canceled', 'Cancelled'].includes(appointment.status)) {
        res.status(400);
        throw new Error('Cannot update this appointment');
    }

    if (date) appointment.date = new Date(date);
    if (time) appointment.time = time;
    if (reason) appointment.reason = reason;
    if (req.body.type) appointment.type = req.body.type;

    await appointment.save();

    res.json({ message: 'Appointment updated successfully', appointment });
});

export {
    getPatientProfile,
    bookAppointment,
    getMyAppointments,
    getMyPrescriptions,
    uploadMedicalReport,
    getMyAIPredictionResults,
    getMyMedicalRecords,
    updatePatientProfile,
    deleteMedicalRecord,
    getPatientNotifications,
    markNotificationAsRead,
    deleteNotification,
    cancelAppointment,
    deleteAppointment,
    updateAppointment,
};
