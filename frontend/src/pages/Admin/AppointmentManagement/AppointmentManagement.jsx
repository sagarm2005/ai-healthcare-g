import React, { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointmentStatus, getAllDoctors, rescheduleAppointment } from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner';
import '../../style/AppointmentManagement.css';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [doctors, setDoctors] = useState([]);

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
    const [newRescheduleDate, setNewRescheduleDate] = useState('');
    const [newRescheduleTime, setNewRescheduleTime] = useState('');


    useEffect(() => {
        fetchDoctorsList();
        fetchAppointments();
    }, []);

    const fetchDoctorsList = async () => {
        try {
            const doctorsData = await getAllDoctors();
            setDoctors(doctorsData);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchAppointments = async (filters = {}) => {
        try {
            const data = await getAllAppointments(filters);
            setAppointments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setLoading(true);
        try {
            await updateAppointmentStatus(id, status);
            fetchAppointments();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const filters = {};
        if (filterDate) filters.date = filterDate;
        if (filterDoctor) filters.doctor = filterDoctor;
        if (filterStatus) filters.status = filterStatus;
        fetchAppointments(filters);
    };

    const openRescheduleModal = (appointment) => {
        setAppointmentToReschedule(appointment);
        // Pre-fill with current date and time or leave empty
        setNewRescheduleDate(appointment.date.split('T')[0]); // Assuming date is ISO string
        setNewRescheduleTime(appointment.time);
        setShowRescheduleModal(true);
    };

    const closeRescheduleModal = () => {
        setShowRescheduleModal(false);
        setAppointmentToReschedule(null);
        setNewRescheduleDate('');
        setNewRescheduleTime('');
    };

    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();
        if (!appointmentToReschedule || !newRescheduleDate || !newRescheduleTime) {
            setError('Please select a new date and time.');
            return;
        }
        setLoading(true);
        try {
            await rescheduleAppointment(
                appointmentToReschedule._id,
                newRescheduleDate,
                newRescheduleTime
            );
            closeRescheduleModal();
            fetchAppointments(); // Refresh appointments
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Appointment Management</h1>

            <div className="filter-controls bg-white p-4 rounded shadow-md mb-4">
                <h2 className="text-xl font-semibold mb-3">Filter Appointments</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="form-group">
                        <label htmlFor="filterDate" className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                        <input
                            type="date"
                            id="filterDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="filterDoctor" className="block text-gray-700 text-sm font-bold mb-2">Doctor</label>
                        <select
                            id="filterDoctor"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={filterDoctor}
                            onChange={(e) => setFilterDoctor(e.target.value)}
                        >
                            <option value="">All Doctors</option>
                            {doctors.map(doc => (
                                <option key={doc._id} value={doc._id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="filterStatus" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                        <select
                            id="filterStatus"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Canceled">Canceled</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                            <tr key={appointment._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{appointment.patient?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{appointment.doctor?.name} ({appointment.doctor?.specialization})</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(appointment.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            appointment.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <select
                                        value={appointment.status}
                                        onChange={(e) => handleUpdateStatus(appointment._id, e.target.value)}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Canceled">Canceled</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <button
                                        onClick={() => openRescheduleModal(appointment)}
                                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline"
                                    >
                                        Reschedule
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showRescheduleModal && appointmentToReschedule && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Reschedule Appointment</h2>
                        <p className="mb-4">
                            Rescheduling appointment for patient <strong>{appointmentToReschedule.patient?.name}</strong> with Dr. <strong>{appointmentToReschedule.doctor?.name}</strong> on {new Date(appointmentToReschedule.date).toLocaleDateString()} at {appointmentToReschedule.time}.
                        </p>
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="newDate" className="block text-gray-700 text-sm font-bold mb-2">New Date</label>
                                <input
                                    type="date"
                                    id="newDate"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRescheduleDate}
                                    onChange={(e) => setNewRescheduleDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="newTime" className="block text-gray-700 text-sm font-bold mb-2">New Time</label>
                                <input
                                    type="time"
                                    id="newTime"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={newRescheduleTime}
                                    onChange={(e) => setNewRescheduleTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeRescheduleModal}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Confirm Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentManagement;
