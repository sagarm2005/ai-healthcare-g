import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String, // e.g., "10:00 AM"
        required: true,
    },
    type: {
        type: String,
        enum: ['Regular', 'Emergency', 'Checkup', 'Follow-up'],
        default: 'Regular',
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Confirmed', 'Canceled', 'Cancelled', 'Completed', 'Rescheduled'],
        default: 'Pending',
    },
    reason: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
