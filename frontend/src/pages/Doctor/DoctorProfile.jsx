import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/DoctorDashboard.css'; // Reusing some dashboard styles or I will create a new one
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState({
        name: '',
        medicalRegistrationNumber: '',
        specialization: '',
        qualification: '',
        yearsOfExperience: '',
        hospitalName: '',
        profileImage: '',
        email: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            if (!user) {
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await api.get('/doctor/profile');
                const data = response.data;
                setDoctor({
                    name: data.name || '',
                    medicalRegistrationNumber: data.medicalRegistrationNumber || '',
                    specialization: data.specialization || '',
                    qualification: data.qualification || '',
                    yearsOfExperience: data.yearsOfExperience || '',
                    hospitalName: data.hospitalName || '',
                    profileImage: data.profileImage || '',
                    email: data.userId?.email || ''
                });
            } catch (err) {
                setError('Failed to fetch doctor profile.');
                toast.error('Failed to load profile data.');
                console.error('Error fetching doctor profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorProfile();
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    const handleUpdate = async () => {
        try {
            await api.put('/doctor/profile', doctor);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update profile.');
            console.error('Error updating doctor profile:', err);
        }
    };

    if (loading) {
        return <div className="p-4">Loading profile...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Doctor Profile</h1>
            <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={doctor.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={doctor.email}
                            disabled
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Medical Registration Number:</label>
                        <input
                            type="text"
                            name="medicalRegistrationNumber"
                            value={doctor.medicalRegistrationNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Specialization:</label>
                        <input
                            type="text"
                            name="specialization"
                            value={doctor.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Qualification:</label>
                        <input
                            type="text"
                            name="qualification"
                            value={doctor.qualification}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Years of Experience:</label>
                        <input
                            type="number"
                            name="yearsOfExperience"
                            value={doctor.yearsOfExperience}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Hospital Name:</label>
                        <input
                            type="text"
                            name="hospitalName"
                            value={doctor.hospitalName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Profile Image URL:</label>
                        <input
                            type="text"
                            name="profileImage"
                            value={doctor.profileImage}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Enter image URL"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!isEditing ? 'bg-gray-100' : ''}`}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={handleEditToggle}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleUpdate}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={handleEditToggle}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DoctorProfile;
