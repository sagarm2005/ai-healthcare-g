import axios from 'axios';

const registerTest = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
            role: 'Patient',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            age: '36',
            bloodGroup: 'A+',
            address: '123 Street',
            mobileNumber: '1234567890'
        });
        console.log('Response:', res.status, res.data);
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data);
    }
};

registerTest();
