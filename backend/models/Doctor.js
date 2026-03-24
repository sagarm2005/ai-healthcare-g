import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const doctorSchema = mongoose.Schema({
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
    medicalRegistrationNumber: {
        type: String,
        required: true,
        unique: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    qualification: {
        type: String,
        required: true,
    },
    yearsOfExperience: {
        type: Number,
        required: true,
    },
    hospitalName: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png', // Generic doctor icon
    },
    isApproved: {
        type: Boolean,
        default: true,
    },
    // Add other doctor specific fields
}, {
    timestamps: true,
});

doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
