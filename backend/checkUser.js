import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Admin from './models/Admin.js';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'sagar_doctor@gmail.com';
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log('User found in User model:');
            console.log(JSON.stringify(user, null, 2));

            const doctor = await Doctor.findOne({ userId: user._id });
            if (doctor) {
                console.log('Associated Doctor profile found:');
                console.log(JSON.stringify(doctor, null, 2));
            }

            const patient = await Patient.findOne({ userId: user._id });
            if (patient) {
                console.log('Associated Patient profile found:');
                console.log(JSON.stringify(patient, null, 2));
            }

            const admin = await Admin.findOne({ userId: user._id });
            if (admin) {
                console.log('Associated Admin profile found:');
                console.log(JSON.stringify(admin, null, 2));
            }
        } else {
            console.log(`No user found with email: ${email}`);
            
            // Just in case, check by email in profiles directly
            const docByEmail = await Doctor.findOne({ email: email.toLowerCase() });
            if (docByEmail) console.log('Doctor found by email directly in Doctor model:', docByEmail._id);
            
            const patByEmail = await Patient.findOne({ email: email.toLowerCase() });
            if (patByEmail) console.log('Patient found by email directly in Patient model:', patByEmail._id);

            const admByEmail = await Admin.findOne({ email: email.toLowerCase() });
            if (admByEmail) console.log('Admin found by email directly in Admin model:', admByEmail._id);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkUser();
