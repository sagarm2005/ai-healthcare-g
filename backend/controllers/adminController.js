import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import AIReport from '../models/AIReport.js';
import Admin from '../models/Admin.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({}).populate('userId', 'email'); // Populate user email
    res.json(doctors);
});

// @desc    Approve/Reject doctor registration
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private/Admin
const approveDoctor = asyncHandler(async (req, res) => {
    const { isApproved } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { isApproved: isApproved },
        { new: true, runValidators: false } // Return the updated document, but DO NOT run other validators
    );

    if (doctor) {
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
const getAllPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: 'appointments',
                localField: '_id',
                foreignField: 'patient',
                as: 'appointments',
            },
        },
        {
            $addFields: {
                lastVisitDate: { $max: '$appointments.date' },
            },
        },
        {
            $lookup: {
                from: 'medicalrecords',
                localField: '_id',
                foreignField: 'patient',
                as: 'medicalRecords',
            },
        },
        {
            $addFields: {
                latestMedicalRecord: {
                    $arrayElemAt: [
                        {
                            $sortArray: {
                                input: '$medicalRecords',
                                sortBy: { createdAt: -1 },
                            },
                        },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                dateOfBirth: 1,
                gender: 1,
                age: 1,
                bloodGroup: 1,
                address: 1,
                mobileNumber: 1,
                userId: '$user._id',
                email: '$user.email',
                lastVisitDate: 1,
                medicalCondition: '$latestMedicalRecord.diagnosis', // Assuming diagnosis field for medical condition
            },
        },
    ]);
    res.json(patients);
});

// @desc    Manage appointments (get all)
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAllAppointments = asyncHandler(async (req, res) => {
    const { date, doctor, status } = req.query;
    let query = {};

    if (date) {
        // Assuming date is in 'YYYY-MM-DD' format and we want to find appointments for that specific day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (doctor) {
        query.doctor = doctor; // Assuming doctor parameter is the doctor's _id
    }
    if (status) {
        query.status = status; // e.g., 'Pending', 'Approved', 'Canceled', 'Completed'
    }

    const appointments = await Appointment.find(query)
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');
    res.json(appointments);
});

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        appointment.status = req.body.status; // e.g., 'Approved', 'Canceled'
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    View all AI reports
// @route   GET /api/admin/aireports
// @access  Private/Admin
const getAllAIReports = asyncHandler(async (req, res) => {
    const aiReports = await AIReport.find({})
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');
    res.json(aiReports);
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalDoctors = await Doctor.countDocuments({});
    const totalPatients = await Patient.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    const latestDoctor = await Doctor.findOne({}).sort({ createdAt: -1 }).select('name email createdAt');
    const latestPatient = await Patient.findOne({}).sort({ createdAt: -1 }).select('name email createdAt');
    const latestAdmin = await Admin.findOne({}).sort({ createdAt: -1 }).select('name email createdAt');

    res.json({
        totalDoctors,
        totalPatients,
        totalAppointments,
        latestDoctor,
        latestPatient,
        latestAdmin,
    });
});

// @desc    Create a new doctor
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = asyncHandler(async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        specialization, 
        qualifications, 
        medicalRegistrationNumber, 
        yearsOfExperience, 
        hospitalName 
    } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const profileId = new mongoose.Types.ObjectId();

    const user = await User.create({
        email: normalizedEmail,
        password,
        role: 'Doctor',
        profileId: profileId,
    });

    if (user) {
        try {
            const doctor = await Doctor.create({
                _id: profileId,
                userId: user._id,
                name,
                email: normalizedEmail,
                password,
                specialization,
                qualification: qualifications,
                medicalRegistrationNumber: medicalRegistrationNumber || `REG-${Date.now()}`,
                yearsOfExperience: Number(yearsOfExperience) || 0,
                hospitalName: hospitalName || 'General Hospital',
                isApproved: true,
            });
            res.status(201).json(doctor);
        } catch (error) {
            // Rollback User creation if Doctor creation fails
            await User.findByIdAndDelete(user._id);
            res.status(400);
            throw new Error(`Doctor profile creation failed: ${error.message}`);
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update a doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
const updateDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
        doctor.name = req.body.name || doctor.name;
        doctor.specialization = req.body.specialization || doctor.specialization;
        doctor.qualifications = req.body.qualifications || doctor.qualifications;

        const updatedDoctor = await doctor.save();
        res.json(updatedDoctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Delete a doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (doctor) {
        await User.deleteOne({ _id: doctor.userId });
        await Doctor.deleteOne({ _id: req.params.id });
        res.json({ message: 'Doctor removed' });
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
});

// @desc    Update a patient
// @route   PUT /api/admin/patients/:id
// @access  Private/Admin
const updatePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
        patient.name = req.body.name || patient.name;
        patient.age = req.body.age || patient.age;
        patient.gender = req.body.gender || patient.gender;
        patient.mobileNumber = req.body.mobileNumber || patient.mobileNumber;

        const updatedPatient = await patient.save();
        res.json(updatedPatient);
    } else {
        res.status(404);
        throw new Error('Patient not found');
    }
});

// @desc    Delete a patient
// @route   DELETE /api/admin/patients/:id
// @access  Private/Admin
const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
        await User.deleteOne({ _id: patient.userId });
        await Patient.deleteOne({ _id: req.params.id });
        res.json({ message: 'Patient removed' });
    } else {
        res.status(404);
        throw new Error('Patient not found');
    }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user.profileId);
    const user = await User.findById(req.user._id);

    if (admin && user) {
        res.json({
            ...admin.toObject(),
            email: user.email,
        });
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
const updateAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user.profileId);

    if (admin) {
        const user = await User.findById(req.user._id);
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        await user.save();

        admin.name = req.body.name || admin.name;
        admin.mobileNumber = req.body.mobileNumber || admin.mobileNumber;
        const updatedAdmin = await admin.save();
        res.json(updatedAdmin);
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
});

// @desc    Get all notifications for admin
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getAdminNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
        .populate('patient', 'name')
        .populate('doctor', 'name');

    // Fetch messages where admin is the receiver
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
    const formattedNotifications = notifications.map(n => ({
        ...n.toObject(),
        itemType: 'notification'
    }));

    const formattedMessages = messages.map(m => ({
        ...m.toObject(),
        itemType: 'message',
        type: m.sender?.role === 'Doctor' ? 'Doctor Message' : 'Patient Message',
        message: m.content,
        senderName: m.sender?.profileId?.name || m.sender?.email || 'Unknown Sender'
    }));

    const allItems = [...formattedNotifications, ...formattedMessages].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allItems);
});

// @desc    Mark admin notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markAdminNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Delete admin notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
const deleteAdminNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

export {
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
};
