import mongoose from 'mongoose';

const aiReportSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
    },
    reportType: {
        type: String,
        enum: ['DiseasePrediction', 'HealthAssessment'], // Example types
        required: true,
    },
    reportData: { // Store AI prediction results as JSON
        type: Object,
        required: true,
    },
    generatedDate: {
        type: Date,
        default: Date.now,
    },
    // Any other AI report specific fields
}, {
    timestamps: true,
});

const AIReport = mongoose.model('AIReport', aiReportSchema);

export default AIReport;
