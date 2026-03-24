import mongoose from 'mongoose';

const medicalRecordSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    reportType: {
        type: String,
        enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Discharge Summary', 'Checkup', 'Emergency', 'Follow-up', 'Lab Test', 'Surgery'],
        required: true,
    },
    doctorName: {
        type: String,
        trim: true,
    },
    hospitalName: {
        type: String,
        trim: true,
    },
    reportDate: {
        type: Date,
    },
    description: {
        type: String,
        trim: true,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    sharedWithDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        default: null,
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    fileMimeType: {
        type: String,
    },
    fileUrl: {
        type: String,
        required: false, // Changed to false to allow text-only clinical notes
    },
    diagnosis: {
        type: String,
        trim: true,
    },
    treatment: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
