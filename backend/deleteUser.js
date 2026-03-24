import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Admin from './models/Admin.js';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const deleteUser = async () => {
    const email = 'sagar_doctor@gmail.com';
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log(`Found user: ${user.email} (${user.role})`);
            
            // Delete associated profile
            if (user.role === 'Doctor') {
                await Doctor.deleteOne({ userId: user._id });
                console.log('Deleted Doctor profile');
            } else if (user.role === 'Patient') {
                await Patient.deleteOne({ userId: user._id });
                console.log('Deleted Patient profile');
            } else if (user.role === 'Admin') {
                await Admin.deleteOne({ userId: user._id });
                console.log('Deleted Admin profile');
            }

            // Delete the user record
            await User.deleteOne({ _id: user._id });
            console.log(`Deleted User record for ${email}`);
            
            console.log('User and associated profiles successfully deleted.');
        } else {
            console.log(`No user found with email: ${email}`);
            
            // Cleanup orphans if any
            const dResult = await Doctor.deleteMany({ email: email.toLowerCase() });
            if (dResult.deletedCount > 0) console.log(`Deleted ${dResult.deletedCount} orphan Doctor profile(s)`);
            
            const pResult = await Patient.deleteMany({ email: email.toLowerCase() });
            if (pResult.deletedCount > 0) console.log(`Deleted ${pResult.deletedCount} orphan Patient profile(s)`);

            const aResult = await Admin.deleteMany({ email: email.toLowerCase() });
            if (aResult.deletedCount > 0) console.log(`Deleted ${aResult.deletedCount} orphan Admin profile(s)`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Check if confirmed via command line argument
if (process.argv[2] === '--confirm') {
    deleteUser();
} else {
    console.log('This script will PERMANENTLY DELETE the user sagar_doctor@gmail.com.');
    console.log('To confirm, run: node backend/deleteUser.js --confirm');
    process.exit();
}
