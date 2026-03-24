import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const MOBILE_REGEX = /^\d{10}$/;

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
        res.status(503);
        throw new Error('Database is currently not connected. Please check your MongoDB Atlas connection settings.');
    }

    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
        // Check if the associated profile still exists
        let profile;
        if (user.role === 'Admin') {
            profile = await Admin.findById(user.profileId);
        } else if (user.role === 'Doctor') {
            profile = await Doctor.findById(user.profileId);
        } else if (user.role === 'Patient') {
            profile = await Patient.findById(user.profileId);
        }

        if (!profile) {
            res.status(401);
            throw new Error('User profile not found. Your account might be in an inconsistent state.');
        }

        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            profileId: user.profileId,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register/:role
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
        res.status(503);
        throw new Error('Database is currently not connected. Please check your MongoDB Atlas connection settings.');
    }

    const {
        email,
        password,
        name,
        role,
        dateOfBirth,
        gender,
        age,
        bloodGroup,
        address,
        medicalRegistrationNumber,
        specialization,
        qualification,
        yearsOfExperience,
        hospitalName,
        adminId,
        mobileNumber,
    } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    const sanitizedMobile = mobileNumber === undefined || mobileNumber === null || mobileNumber === ''
        ? ''
        : String(mobileNumber).replace(/\D/g, '');

    if (sanitizedMobile && !MOBILE_REGEX.test(sanitizedMobile)) {
        res.status(400);
        throw new Error('Mobile number must be exactly 10 digits');
    }

    const requiredFieldsByRole = {
        Admin: ['name', 'adminId'],
        Doctor: ['name', 'medicalRegistrationNumber', 'qualification', 'specialization', 'yearsOfExperience', 'hospitalName'],
        Patient: ['name'],
    };
    const payload = {
        email: normalizedEmail,
        password,
        name,
        role,
        dateOfBirth,
        gender,
        age,
        bloodGroup,
        address,
        medicalRegistrationNumber,
        specialization,
        qualification,
        yearsOfExperience,
        hospitalName,
        adminId,
        mobileNumber: sanitizedMobile,
    };

    if (!normalizedEmail || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    if (!['Admin', 'Doctor', 'Patient'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role specified');
    }

    const missingFields = requiredFieldsByRole[role].filter(
        (field) => payload[field] === undefined || payload[field] === null || payload[field] === ''
    );
    if (missingFields.length > 0) {
        res.status(400);
        throw new Error(`Missing required field(s): ${missingFields.join(', ')}`);
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    console.log(`Registration attempt for: ${normalizedEmail}. Found in DB: ${!!userExists}`);

    if (userExists) {
        res.status(400);
        throw new Error(`User with email ${normalizedEmail} already exists`);
    }

    let profile;
    let user;

    try {
        if (role === 'Admin') {
            const profileId = new mongoose.Types.ObjectId();

            const adminExists = await Admin.findOne({ adminId });
            if (adminExists) {
                res.status(400);
                throw new Error('Admin with this ID already exists');
            }
            user = await User.create({ email: normalizedEmail, password, role, profileId });
            profile = await Admin.create({
                _id: profileId,
                userId: user._id,
                name,
                email: normalizedEmail,
                password,
                adminId,
                mobileNumber: sanitizedMobile,
            });
        } else if (role === 'Doctor') {
            const profileId = new mongoose.Types.ObjectId();
            const normalizedExperience = Number(yearsOfExperience);
            if (!Number.isFinite(normalizedExperience) || normalizedExperience < 0) {
                res.status(400);
                throw new Error('yearsOfExperience must be a valid non-negative number');
            }
            const doctorExists = await Doctor.findOne({ medicalRegistrationNumber });
            if (doctorExists) {
                res.status(400);
                throw new Error('Doctor with this medical registration number already exists');
            }
            user = await User.create({ email: normalizedEmail, password, role, profileId });
            profile = await Doctor.create({
                _id: profileId,
                userId: user._id,
                name,
                email: normalizedEmail,
                password,
                medicalRegistrationNumber,
                specialization,
                qualification,
                yearsOfExperience: normalizedExperience,
                hospitalName,
            });
        } else if (role === 'Patient') {
            const profileId = new mongoose.Types.ObjectId();
            if (!name) {
                res.status(400);
                throw new Error('Please add a name for the patient');
            }
            user = await User.create({ email: normalizedEmail, password, role, profileId });
            profile = await Patient.create({
                _id: profileId,
                userId: user._id,
                name,
                email: normalizedEmail,
                password,
                dateOfBirth,
                gender,
                age,
                bloodGroup,
                address,
                mobileNumber: sanitizedMobile,
            });
        } else {
            res.status(400);
            throw new Error('Invalid role');
        }
    } catch (error) {
        // Cleanup if user was created but profile failed
        if (user && !profile) {
            await User.findByIdAndDelete(user._id);
        }
        throw error;
    }

    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            profileId: user.profileId,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the protect middleware
    const user = {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profileId: req.user.profileId,
    };
    res.status(200).json(user);
});

export { loginUser, registerUser, getMe };
