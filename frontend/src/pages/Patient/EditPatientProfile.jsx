import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/PatientProfile.css';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';
import { toast } from 'react-toastify';
import { getUploadUrl } from '../../utils/constants';

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
        address: '',
        profileImage: '',
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
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
                    address: data.address || '',
                    profileImage: data.profileImage || '',
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

        if (name === 'dateOfBirth') {
            const birthDate = new Date(value);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setPatient((prevPatient) => ({
                ...prevPatient,
                dateOfBirth: value,
                age: calculatedAge >= 0 ? calculatedAge.toString() : ''
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
        if (isEditing) {
            setProfileImageFile(null);
            setProfileImagePreview('');
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setProfileImageFile(null);
            setProfileImagePreview('');
            return;
        }

        setProfileImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImagePreview(reader.result?.toString() || '');
        };
        reader.readAsDataURL(file);
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
            const formData = new FormData();
            formData.append('name', patient.name || '');
            formData.append('mobileNumber', patient.mobileNumber || '');
            formData.append('email', patient.email || '');
            formData.append('gender', patient.gender || '');
            formData.append('dateOfBirth', patient.dateOfBirth || '');
            formData.append('age', patient.age || '');
            formData.append('bloodGroup', patient.bloodGroup || '');
            formData.append('address', patient.address || '');
            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }

            const response = await api.put('/patient/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data = response.data || {};
            setPatient((prev) => ({
                ...prev,
                profileImage: data.profileImage || prev.profileImage,
            }));
            setProfileImageFile(null);
            setProfileImagePreview('');
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
                    <label>Profile Image:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                            src={profileImagePreview || getUploadUrl(patient.profileImage) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            alt="Patient profile"
                            style={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e5e7eb',
                            }}
                        />
                        <input
                            type="file"
                            id="profileImage"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
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
                        readOnly
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
