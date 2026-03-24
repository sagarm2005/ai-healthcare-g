import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/PatientProfile.css';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import { toast } from 'react-toastify';

const MOBILE_REGEX = /^\d{10}$/;

const EditPatientProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patient, setPatient] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        bloodGroup: '',
        address: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientProfile = async () => {
            if (!user) {
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await api.get('/patient/profile');
                const data = response.data;
                setPatient({
                    name: data.name || '',
                    mobileNumber: data.mobileNumber || '',
                    email: data.email || '',
                    gender: data.gender || '',
                    dateOfBirth: data.dateOfBirth ? moment(data.dateOfBirth).format('YYYY-MM-DD') : '',
                    age: data.age || '',
                    bloodGroup: data.bloodGroup || '',
                    address: data.address || ''
                });
            } catch (err) {
                setError('Failed to fetch patient profile.');
                toast.error('Failed to load profile data.');
                console.error('Error fetching patient profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientProfile();
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'mobileNumber') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setPatient((prevPatient) => ({
                ...prevPatient,
                mobileNumber: digitsOnly
            }));
            return;
        }

        setPatient((prevPatient) => ({
            ...prevPatient,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    const handleUpdate = async () => {
        if (!isEditing) {
            return;
        }

        if (!MOBILE_REGEX.test(patient.mobileNumber)) {
            toast.error('Mobile number must be exactly 10 digits.');
            return;
        }

        try {
            await api.put('/patient/profile', patient);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update profile.');
            console.error('Error updating patient profile:', err);
        }
    };

    if (loading) {
        return <div className="edit-patient-profile">Loading profile...</div>;
    }

    if (error) {
        return <div className="edit-patient-profile error">{error}</div>;
    }

    return (
        <div className="edit-patient-profile">
            <h1>Patient Profile</h1>
            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={patient.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mobileNumber">Mobile Number:</label>
                    <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={patient.mobileNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Enter exactly 10 digits"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={patient.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="gender">Gender:</label>
                    <select
                        id="gender"
                        name="gender"
                        value={patient.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth:</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={patient.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="age">Age:</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={patient.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="bloodGroup">Blood Group:</label>
                    <input
                        type="text"
                        id="bloodGroup"
                        name="bloodGroup"
                        value={patient.bloodGroup}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address:</label>
                    <textarea
                        id="address"
                        name="address"
                        value={patient.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
                <div className="form-actions">
                    {!isEditing ? (
                        <button type="button" onClick={handleEditToggle} className="edit-button">
                            Edit
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={handleUpdate} className="update-button">
                                Update
                            </button>
                            <button type="button" onClick={handleEditToggle} className="cancel-button">
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EditPatientProfile;
