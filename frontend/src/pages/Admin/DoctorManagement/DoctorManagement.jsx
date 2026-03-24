import React, { useState, useEffect } from 'react';
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, approveDoctor } from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../style/DoctorManagement.css';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        qualifications: '',
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await getAllDoctors();
            setDoctors(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createDoctor(formData);
            setFormData({
                name: '',
                email: '',
                password: '',
                specialization: '',
                qualifications: '',
            });
            fetchDoctors();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoctor(editingDoctor._id, formData);
            setEditingDoctor(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                specialization: '',
                qualifications: '',
            });
            fetchDoctors();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoctor = async (id) => {
        setLoading(true);
        try {
            await deleteDoctor(id);
            fetchDoctors();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDoctor = async (id, isApproved) => {
        setLoading(true);
        try {
            await approveDoctor(id, isApproved);
            fetchDoctors();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            name: doctor?.name ?? '',
            email: doctor?.userId?.email ?? '',
            specialization: doctor?.specialization ?? '',
            qualifications: doctor?.qualifications ?? '',
            password: '', // Password should not be pre-filled
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Doctor Management</h1>

            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor} className="bg-white p-4 rounded shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
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
                    />
                </div>
                {!editingDoctor && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialization">
                        Specialization
                    </label>
                    <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="qualifications">
                        Qualifications
                    </label>
                    <input
                        type="text"
                        id="qualifications"
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
                {editingDoctor && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingDoctor(null);
                            setFormData({
                                name: '',
                                email: '',
                                password: '',
                                specialization: '',
                                qualifications: '',
                            });
                        }}
                        className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-4">Doctor List</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {doctors.map((doctor) => (
                            <tr key={doctor._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor?.userId?.email ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            doctor.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {doctor.isApproved ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => startEditing(doctor)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDoctor(doctor._id)}
                                        className="text-red-600 hover:text-red-900 mr-3"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => handleApproveDoctor(doctor._id, !doctor.isApproved)}
                                        className={`${
                                            doctor.isApproved ? 'text-yellow-600' : 'text-green-600'
                                        } hover:text-gray-900`}
                                    >
                                        {doctor.isApproved ? 'Unapprove' : 'Approve'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorManagement;
