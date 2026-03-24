import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Patient from '../models/Patient.js'; // Import Patient model
import Doctor from '../models/Doctor.js';   // Import Doctor model
import Admin from '../models/Admin.js';     // Import Admin model

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            res.status(401);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Not authorized, token expired');
            } else {
                throw new Error('Not authorized, token failed');
            }
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const doctor = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'doctor') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a doctor');
    }
};

const patient = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'patient') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a patient');
    }
};

export { protect, admin, doctor, patient };
