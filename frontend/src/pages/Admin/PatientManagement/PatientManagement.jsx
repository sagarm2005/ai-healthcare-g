import React, { useState, useEffect } from 'react';
import { getAllPatients, updatePatient, deletePatient } from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../style/PatientManagement.css';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPatient, setEditingPatient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        gender: '',
        mobileNumber: '',
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await getAllPatients();
            setPatients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdatePatient = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updatePatient(editingPatient._id, {
                name: formData.name,
                email: formData.email,
                age: formData.age,
                gender: formData.gender,
                mobileNumber: formData.mobileNumber,
            });
            setEditingPatient(null);
            setFormData({
                name: '',
                email: '',
                age: '',
                gender: '',
                mobileNumber: '',
            });
            fetchPatients();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePatient = async (id) => {
        setLoading(true);
        try {
            await deletePatient(id);
            fetchPatients();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient?.name ?? '',
            email: patient?.userId?.email ?? '',
            age: patient?.age ?? '',
            gender: patient?.gender ?? '',
            mobileNumber: patient?.mobileNumber ?? '',
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
            <h1 className="text-2xl font-bold mb-4">Patient Management</h1>

            {editingPatient && (
                <form onSubmit={handleUpdatePatient} className="bg-white p-4 rounded shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Edit Patient</h2>
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
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
                            Age
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNumber">
                            Mobile Number
                        </label>
                        <input
                            type="text"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Update Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingPatient(null);
                            setFormData({
                                name: '',
                                email: '',
                                age: '',
                                gender: '',
                                mobileNumber: '',
                            });
                        }}
                        className="ml-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-4">Patient List</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                            <tr key={patient._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient?.userId?.email ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.age ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.gender ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.mobileNumber ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.medicalCondition ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => console.log('View Details for patient:', patient._id)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => console.log('Add Prescription for patient:', patient._id)}
                                        className="text-green-600 hover:text-green-900 mr-3"
                                    >
                                        Add Prescription
                                    </button>
                                    <button
                                        onClick={() => startEditing(patient)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePatient(patient._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
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

export default PatientManagement;
