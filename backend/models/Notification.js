import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patient: { // Optional: Link to patient profile for patient-specific notifications
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    doctor: { // Optional: Link to doctor profile for doctor-specific notifications
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    type: {
        type: String,
        required: true,
        enum: [
            'Appointment Confirmation',
            'Appointment Reminder',
            'Appointment Rescheduled',
            'Appointment Cancelled',
            'Doctor Unavailable',
            'Test Report Ready',
            'Doctor Message',
            'System Alert',
        ],
    },
    message: {
        type: String,
        required: true,
    },
    link: { // Optional: Link to a related page/resource
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    // Add other relevant fields like related appointment ID, etc.
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        // No ref here, as it can refer to different models (Appointment, MedicalRecord, etc.)
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
