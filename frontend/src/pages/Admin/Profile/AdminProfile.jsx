import React, { useState, useEffect } from 'react';
import { getAdminProfile, updateAdminProfile } from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../style/AdminProfile.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        adminId: '',
        mobileNumber: '',
    });
    const [message, setMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // New state for edit mode
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('edit') === 'true') {
            setIsEditing(true);
            setError(null);
            setMessage(null);
        }
        fetchAdminProfile();
    }, [location.search]);

    const fetchAdminProfile = async () => {
        try {
            const data = await getAdminProfile();
            setFormData({
                name: data?.name ?? '',
                email: data?.email ?? '',
                adminId: data?.adminId ?? '',
                mobileNumber: data?.mobileNumber ?? data?.contact ?? data?.phone ?? '',
                password: '',
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobileNumber') {
            const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, mobileNumber: onlyDigits });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing) return; // Prevent submission if not in edit mode
        if (!/^\d{10}$/.test(formData.mobileNumber || '')) {
            setError('Mobile number must be exactly 10 digits.');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await updateAdminProfile(formData);
            setMessage('Successfully updated.');
            toast.success('Successfully updated.');
            setIsEditing(false); // Exit edit mode after saving
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">Error: {error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adminId">
                        Admin ID
                    </label>
                    <input
                        type="text"
                        id="adminId"
                        name="adminId"
                        value={formData.adminId}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        readOnly
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        readOnly={!isEditing}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNumber">
                        Mobile Number
                    </label>
                    <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Please enter exactly 10 digits"
                        readOnly={!isEditing}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        readOnly={!isEditing}
                    />
                </div>
                {isEditing && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            New Password (optional)
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            readOnly={!isEditing}
                        />
                    </div>
                )}
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Back
                    </button>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setMessage(null);
                                    setIsEditing(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Edit Profile
                            </button>
                        )}
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError(null);
                                        setMessage(null);
                                        setIsEditing(false);
                                        fetchAdminProfile();
                                    }}
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Update
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminProfile;

