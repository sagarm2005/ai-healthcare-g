import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    age: {
        type: Number,
    },
    bloodGroup: {
        type: String,
    },
    address: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    // Add other patient specific fields
}, {
    timestamps: true,
});

patientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

patientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
