import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Doctor from '../models/Doctor.js';

// @desc    Get dashboard summary
// @route   GET /api/doctor-dashboard/summary
// @access  Private/Doctor
const getDashboardSummary = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const userId = req.user._id;

    // Dates for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Total Patients (already exists)
    const doctorAppointmentsCount = await Appointment.find({ doctor: doctorId }).distinct('patient');
    const totalPatients = await Patient.countDocuments({ _id: { $in: doctorAppointmentsCount } });

    // Total Appointments Today
    const totalAppointmentsToday = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfToday, $lte: endOfToday },
    });

    // Completed Appointments Today
    const completedAppointmentsToday = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfToday, $lte: endOfToday },
        status: 'Completed',
    });

    // Pending Appointments (overall, not just today, as per previous logic)
    const pendingAppointments = await Appointment.countDocuments({
        doctor: doctorId,
        status: 'Pending',
    });

    // Cancelled Appointments Today
    const cancelledAppointmentsToday = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfToday, $lte: endOfToday },
        status: 'Cancelled',
    });

    // Emergency Appointments Today (assuming 'type: "Emergency"' in Appointment model)
    const emergencyAppointmentsToday = await Appointment.countDocuments({
        doctor: doctorId,
        date: { $gte: startOfToday, $lte: endOfToday },
        type: 'Emergency', // Assuming 'type' field exists in Appointment model
    });

    // Reports to Review (already exists)
    const medicalRecordsToReview = await MedicalRecord.countDocuments({
        patient: { $in: doctorAppointmentsCount },
    });

    // New Messages / Notifications (already exists)
    const unreadNotifications = await Notification.countDocuments({
        user: userId,
        isRead: false,
    });

    const unreadMessages = await Message.countDocuments({
        receiver: userId,
        isRead: false,
    });

    res.json({
        totalPatients,
        totalAppointmentsToday, // New
        completedAppointmentsToday, // New
        pendingAppointments, // Existing, renamed for clarity
        cancelledAppointmentsToday, // New
        emergencyAppointmentsToday, // New
        reportsToReview: medicalRecordsToReview,
        newMessages: unreadNotifications + unreadMessages,
    });
});

// @desc    Get medical reports for review
// @route   GET /api/doctor-dashboard/medical-reports
// @access  Private/Doctor
const getMedicalReportsForReview = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    // Get distinct patient IDs assigned to the current doctor
    const doctorAppointments = await Appointment.find({ doctor: doctorId }).distinct('patient');

    // Find medical records for these patients
    const medicalReports = await MedicalRecord.find({
        patient: { $in: doctorAppointments },
    }).populate('patient', 'name userId').populate('uploadedBy', 'name'); // Populate patient name and uploadedBy name

    res.json(medicalReports);
});

// @desc    Get prescriptions by doctor
// @route   GET /api/doctor-dashboard/prescriptions
// @access  Private/Doctor
const getPrescriptionsByDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    const prescriptions = await Prescription.find({ doctor: doctorId })
        .populate('patient', 'name userId'); // Populate patient name
    
    res.json(prescriptions);
});

// @desc    Get notifications for doctor
// @route   GET /api/doctor-dashboard/notifications
// @access  Private/Doctor
const getDoctorNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
        .populate('patient', 'name')
        .populate('doctor', 'name');

    // Fetch messages where doctor is the receiver
    const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate({
        path: 'sender',
        select: 'email role profileId',
        populate: { path: 'profileId', select: 'name' }
    })
    .populate({
        path: 'receiver',
        select: 'email role profileId',
        populate: { path: 'profileId', select: 'name' }
    });

    // Merge and format
    const formattedNotifications = notifications.map(n => ({
        ...n.toObject(),
        itemType: 'notification'
    }));

    const formattedMessages = messages.map(m => {
        const isCurrentUserSender = m.sender._id.toString() === userId.toString();
        const otherParty = isCurrentUserSender ? m.receiver : m.sender;

        return {
            ...m.toObject(),
            itemType: 'message',
            type: isCurrentUserSender ? 'Message Sent' : `Message from ${otherParty?.role || 'User'}`,
            message: m.content,
            senderName: otherParty?.profileId?.name || otherParty?.email || 'Unknown User'
        };
    });

    const allItems = [...formattedNotifications, ...formattedMessages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.json(allItems);
});

// @desc    Get appointments for doctor
// @route   GET /api/doctor-dashboard/appointments
// @access  Private/Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    // Automatically delete completed or past appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Appointment.deleteMany({
        doctor: doctorId,
        $or: [
            { status: 'Completed' },
            { date: { $lt: today } }
        ]
    });

    const appointments = await Appointment.find({ doctor: doctorId })
        .populate('patient', 'name email') // Populate patient name and email
        .sort({ date: 1 }); // Sort by date

    res.json(appointments);
});

// @desc    Get patients for doctor
// @route   GET /api/doctor-dashboard/patients
// @access  Private/Doctor
const getDoctorPatients = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    // Get distinct patient IDs assigned to the current doctor
    const doctorAppointments = await Appointment.find({ doctor: doctorId }).distinct('patient');

    // Find patients for these IDs
    const patients = await Patient.find({ _id: { $in: doctorAppointments } })
        .select('-password'); // Exclude password field

    res.json(patients);
});

// @desc    Get all patients for doctor (for My Patients list)
// @route   GET /api/doctor-dashboard/patients/all
// @access  Private/Doctor
const getAllPatientsForDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    // Get distinct patient IDs assigned to the current doctor
    const doctorAppointments = await Appointment.find({ doctor: doctorId }).distinct('patient');

    // Find patients for these IDs and select required fields, populate userId for email
    const patients = await Patient.find({ _id: { $in: doctorAppointments } })
        .populate('userId', 'email');

    // For now, add dummy lastVisitDate and status, and map fields for the frontend
    const patientsWithAdditionalInfo = patients.map(patient => ({
        ...patient.toObject(),
        email: patient.userId ? patient.userId.email : 'N/A',
        contactNumber: patient.mobileNumber, // Map mobileNumber to contactNumber as expected by frontend
        lastVisitDate: new Date().toISOString(), // Dummy last visit date
        status: 'Active', // Dummy status
    }));

    res.json(patientsWithAdditionalInfo);
});


// @desc    Get detailed patient information for doctor
// @route   GET /api/doctor-dashboard/patient/:id/details
// @access  Private/Doctor
const getPatientDetailsForDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const patientId = req.params.id;

    // Verify patient is assigned to this doctor
    const isPatientAssigned = await Appointment.exists({ doctor: doctorId, patient: patientId });

    if (!isPatientAssigned) {
        res.status(404);
        throw new Error('Patient not found or not assigned to this doctor');
    }

    // Fetch Patient personal details
    const patient = await Patient.findById(patientId);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Fetch Medical History
    const medicalHistory = await MedicalRecord.find({ patient: patientId })
        .populate('sharedWithDoctor', 'name'); // Field is sharedWithDoctor, not doctor

    // Fetch Lab Reports
    const labReports = medicalHistory.filter(record => 
        (record.reportType && (
            record.reportType === 'Blood Test' || 
            record.reportType === 'X-Ray' || 
            record.reportType === 'MRI' || 
            record.reportType === 'CT Scan'
        )) ||
        (record.description && record.description.toLowerCase().includes('lab report'))
    );


    // Fetch Previous Prescriptions
    const prescriptions = await Prescription.find({ patient: patientId })
        .populate('doctor', 'name');

    // Fetch Uploaded Medical Documents
    const uploadedDocuments = medicalHistory.filter(record => record.fileUrl); // Field is fileUrl, not documentUrl

    // Fetch Appointment History
    const appointmentHistory = await Appointment.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort({ date: -1 });

    res.json({
        personalDetails: patient,
        medicalHistory,
        labReports,
        prescriptions,
        uploadedDocuments,
        appointmentHistory,
    });
});


// @desc    Confirm an appointment
// @route   PUT /api/doctor-dashboard/appointments/:id/confirm
// @access  Private/Doctor
const confirmAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to confirm this appointment');
        }

        appointment.status = 'Confirmed';
        await appointment.save();
        res.json({ message: 'Appointment confirmed', appointment });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Reschedule an appointment
// @route   PUT /api/doctor-dashboard/appointments/:id/reschedule
// @access  Private/Doctor
const rescheduleAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { newdate } = req.body; // Expecting newdate in ISO string format

    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to reschedule this appointment');
        }

        appointment.date = new Date(newdate);
        appointment.status = 'Rescheduled'; // Or 'Confirmed' if preferred after reschedule
        await appointment.save();
        res.json({ message: 'Appointment rescheduled', appointment });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Cancel an appointment
// @route   PUT /api/doctor-dashboard/appointments/:id/cancel
// @access  Private/Doctor
const cancelAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to cancel this appointment');
        }

        appointment.status = 'Cancelled';
        await appointment.save();
        res.json({ message: 'Appointment cancelled', appointment });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Mark an appointment as completed
// @route   PUT /api/doctor-dashboard/appointments/:id/complete
// @access  Private/Doctor
const completeAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to complete this appointment');
        }

        await appointment.deleteOne();
        res.json({ message: 'Appointment marked as completed and automatically deleted', appointment });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Add notes to an appointment
// @route   PUT /api/doctor-dashboard/appointments/:id/notes
// @access  Private/Doctor
const addAppointmentNotes = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const { notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to add notes to this appointment');
        }

        appointment.notes = notes; // Assuming an 'notes' field exists in Appointment model
        await appointment.save();
        res.json({ message: 'Notes added to appointment', appointment });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Delete an appointment
// @route   DELETE /api/doctor-dashboard/appointments/:id
// @access  Private/Doctor
const deleteAppointment = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        if (appointment.doctor.toString() !== doctorId.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this appointment');
        }

        await appointment.deleteOne();
        res.json({ message: 'Appointment removed' });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Delete all appointments for a doctor
// @route   DELETE /api/doctor-dashboard/appointments
// @access  Private/Doctor
const deleteAllAppointments = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;

    await Appointment.deleteMany({ doctor: doctorId });

    res.json({ message: 'All appointments removed' });
});

// @desc    Send message to patient
// @route   POST /api/doctor-dashboard/patients/:id/message
// @access  Private/Doctor
const sendMessageToPatient = asyncHandler(async (req, res) => {
    const doctorId = req.user.profileId;
    const patientId = req.params.id;
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message content is required');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Verify patient is assigned to this doctor (at least one appointment)
    const isPatientAssigned = await Appointment.exists({ doctor: doctorId, patient: patientId });
    if (!isPatientAssigned) {
        res.status(401);
        throw new Error('Not authorized to message this patient');
    }

    // Create a notification for the patient
    await Notification.create({
        user: patient.userId,
        patient: patientId,
        doctor: doctorId,
        type: 'Doctor Message',
        message: message,
    });

    res.status(201).json({ success: true, message: 'Message sent successfully' });
});

// @desc    Mark doctor notification as read
// @route   PUT /api/doctor-dashboard/notifications/:id/read
// @access  Private/Doctor
const markDoctorNotificationAsRead = asyncHandler(async (req, res) => {
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

// @desc    Delete doctor notification
// @route   DELETE /api/doctor-dashboard/notifications/:id
// @access  Private/Doctor
const deleteDoctorNotification = asyncHandler(async (req, res) => {
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

// @desc    Delete all doctor notifications
// @route   DELETE /api/doctor-dashboard/notifications
// @access  Private/Doctor
const deleteAllDoctorNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'All notifications removed' });
});

// @desc    Delete a medical report
// @route   DELETE /api/doctor-dashboard/medical-reports/:id
// @access  Private/Doctor
const deleteMedicalReport = asyncHandler(async (req, res) => {
    const report = await MedicalRecord.findById(req.params.id);

    if (report) {
        await report.deleteOne();
        res.json({ message: 'Medical report removed' });
    } else {
        res.status(404);
        throw new Error('Medical report not found');
    }
});

export {
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
};
