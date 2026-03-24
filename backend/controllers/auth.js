
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User'); // Add User model
const jwt = require('jsonwebtoken');

// @desc    Register admin
// @route   POST /api/auth/register/admin
// @access  Public
exports.registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const admin = await Admin.create({ name, email, password });
        sendTokenResponse(admin, 200, res);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Register doctor
// @route   POST /api/auth/register/doctor
// @access  Public
exports.registerDoctor = async (req, res, next) => {
    try {
        const { name, email, password, specialization } = req.body;
        const doctor = await Doctor.create({ name, email, password, specialization });
        // Admin will approve later
        res.status(201).json({ success: true, message: 'Doctor registration request sent for approval' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Register patient
// @route   POST /api/auth/register/patient
// @access  Public
exports.registerPatient = async (req, res, next) => {
    try {
        const { name, email, password, dateOfBirth, gender, age, bloodGroup, address, mobileNumber } = req.body;

        // Create User
        const user = await User.create({ email, password, role: 'Patient' });

        // Create Patient profile linked to User
        const patient = await Patient.create({
            userId: user._id,
            name,
            dateOfBirth,
            gender,
            age,
            bloodGroup,
            address,
            mobileNumber
        });

        // Update User with profileId
        user.profileId = patient._id;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Login admin
// @route   POST /api/auth/login/admin
// @access  Public
exports.loginAdmin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(admin, 200, res);
};

// @desc    Login doctor
// @route   POST /api/auth/login/doctor
// @access  Public
exports.loginDoctor = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!doctor.isApproved) {
        return res.status(401).json({ success: false, message: 'Your registration is not yet approved by the admin.' });
    }

    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(doctor, 200, res);
};

// @desc    Login patient
// @route   POST /api/auth/login/patient
// @access  Public
exports.loginPatient = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(patient, 200, res);
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        role: user.role
    });
};
