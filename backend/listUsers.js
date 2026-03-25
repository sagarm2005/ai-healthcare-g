import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Admin from './models/Admin.js';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log('Using MONGO_URI:', process.env.MONGO_URI);

const listAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', process.env.MONGO_URI);

        const users = await User.find({});
        console.log(`Total users found: ${users.length}`);
        
        for (const user of users) {
            console.log(`- Email: ${user.email}, Role: ${user.role}, ProfileId: ${user.profileId}`);
            
            if (user.role === 'Doctor') {
                const profile = await Doctor.findById(user.profileId);
                console.log(`  Profile found: ${!!profile}`);
            } else if (user.role === 'Patient') {
                const profile = await Patient.findById(user.profileId);
                console.log(`  Profile found: ${!!profile}`);
            } else if (user.role === 'Admin') {
                const profile = await Admin.findById(user.profileId);
                console.log(`  Profile found: ${!!profile}`);
            }
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

listAllUsers();
