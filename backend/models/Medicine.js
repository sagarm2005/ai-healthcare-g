import mongoose from 'mongoose';

const medicineSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    uses: {
        type: String,
        required: true,
    },
    side_effects: {
        type: String,
    },
    how_to_use: {
        type: String,
    },
    safety_advice: {
        type: String,
    },
}, {
    timestamps: true,
});

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
