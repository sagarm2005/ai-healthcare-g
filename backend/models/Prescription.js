import mongoose from 'mongoose';

const prescriptionSchema = mongoose.Schema({
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
    medications: [
        {
            name: {
                type: String,
                required: true,
            },
            dosage: {
                type: String,
                required: true,
            },
            frequency: {
                type: String,
                required: true,
            },
            duration: {
                type: String,
            },
            notes: {
                type: String,
            },
        },
    ],
    notes: {
        type: String,
    },
    dateIssued: {
        type: Date,
        default: Date.now,
    },
    // Any other prescription specific fields
}, {
    timestamps: true,
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
