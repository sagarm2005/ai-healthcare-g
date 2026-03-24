import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!content) {
        res.status(400);
        throw new Error('Content is required');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        res.status(404);
        throw new Error('Receiver not found');
    }

        // Role-based validation
        if (req.user.role === 'Patient') {
            // Patients can message:
            // 1. Doctors they've had an appointment with
            // 2. Any Admin
            if (receiver.role === 'Doctor') {
                const hasAppointment = await Appointment.exists({
                    patient: req.user.profileId,
                    doctor: receiver.profileId
                });
                if (!hasAppointment) {
                    res.status(401);
                    throw new Error('You can only message doctors you have appointments with');
                }
            } else if (receiver.role !== 'Admin') {
                res.status(401);
                throw new Error('You can only message doctors or admins');
            }
        }

    const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content
    });

    res.status(201).json(message);
});

// @desc    Get messages with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        $or: [
            { sender: currentUserId, receiver: otherUserId },
            { sender: otherUserId, receiver: currentUserId }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
});

// @desc    Get all users current user has chatted with
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    // Find all unique users current user has messaged or received from
    const sentTo = await Message.distinct('receiver', { sender: currentUserId });
    const receivedFrom = await Message.distinct('sender', { receiver: currentUserId });
    
    const uniqueIds = Array.from(new Set([...sentTo, ...receivedFrom]));
    
    const conversations = await User.find({ _id: { $in: uniqueIds } })
        .select('email role profileId')
        .populate('profileId', 'name');

    res.json(conversations);
});

// @desc    Get list of available contacts a user can message
// @route   GET /api/messages/contacts/available
// @access  Private
const getAvailableContacts = asyncHandler(async (req, res) => {
    if (req.user.role === 'Patient') {
        // Doctors with appointments
        const doctorProfileIds = await Appointment.find({ patient: req.user.profileId }).distinct('doctor');
        const doctors = await User.find({ role: 'Doctor', profileId: { $in: doctorProfileIds } })
            .populate('profileId', 'name');
            
        // All Admins
        const admins = await User.find({ role: 'Admin' }).populate('profileId', 'name');
        
        res.json({ doctors, admins, patients: [] });
    } else if (req.user.role === 'Doctor') {
        // Patients with appointments
        const patientProfileIds = await Appointment.find({ doctor: req.user.profileId }).distinct('patient');
        const patients = await User.find({ role: 'Patient', profileId: { $in: patientProfileIds } })
            .populate('profileId', 'name');
            
        // All Admins
        const admins = await User.find({ role: 'Admin' }).populate('profileId', 'name');
        
        res.json({ doctors: [], admins, patients });
    } else if (req.user.role === 'Admin') {
        // All Doctors and Patients
        const doctors = await User.find({ role: 'Doctor' }).populate('profileId', 'name');
        const patients = await User.find({ role: 'Patient' }).populate('profileId', 'name');
        
        res.json({ doctors, admins: [], patients });
    } else {
        res.json({ doctors: [], admins: [], patients: [] });
    }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        if (message.receiver.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this message');
        }
        message.isRead = true;
        await message.save();
        res.json({ message: 'Message marked as read' });
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (message) {
        if (message.receiver.toString() !== req.user._id.toString() && message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to delete this message');
        }
        await message.deleteOne();
        res.json({ message: 'Message removed' });
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

// @desc    Delete all messages for a user
// @route   DELETE /api/messages/all
// @access  Private
const deleteAllMessages = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    await Message.deleteMany({
        $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
        ]
    });
    res.json({ message: 'All messages deleted' });
});

export { 
    sendMessage, 
    getMessages, 
    getConversations, 
    getAvailableContacts,
    markMessageAsRead,
    deleteMessage,
    deleteAllMessages
};
