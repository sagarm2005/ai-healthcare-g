import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';

// @desc    Get all appointments (can be filtered/paginated later)
// @route   GET /api/appointments
// @access  Private (e.g., by Admin, or for a specific user role through query)
const getAppointments = asyncHandler(async (req, res) => {
    // This controller is more generic. For specific user roles, dedicated controllers are better.
    // This could be used by an Admin or perhaps to get all for a doctor/patient with query params.
    const appointments = await Appointment.find({})
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');
    res.json(appointments);
});

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (e.g., by Admin or relevant Doctor/Patient)
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'name')
        .populate('doctor', 'name specialization');

    if (appointment) {
        res.json(appointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Create an appointment (if not handled by patientController)
// @route   POST /api/appointments
// @access  Private (e.g., by Admin or Patient)
const createAppointment = asyncHandler(async (req, res) => {
    const { patient, doctor, date, time, status, reason, type } = req.body;

    const appointment = new Appointment({
        patient,
        doctor,
        date,
        time,
        status,
        reason,
        type: type || 'Regular',
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
});

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private (e.g., by Admin or relevant Doctor)
const updateAppointment = asyncHandler(async (req, res) => {
    const { date, time, status, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        appointment.date = date || appointment.date;
        appointment.time = time || appointment.time;
        appointment.status = status || appointment.status;
        appointment.reason = reason || appointment.reason;
        if (req.body.type) appointment.type = req.body.type;

        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private (e.g., by Admin)
const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (appointment) {
        await appointment.deleteOne();
        res.json({ message: 'Appointment removed' });
    } else {
        res.status(404);
        throw new Error('Appointment not found');
    }
});


export {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
};
