import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/DoctorAppointments.css'; // Reusing doctor appointment styles for consistency or I can create a new one
import moment from 'moment';

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', time: '', reason: '', type: 'Regular' });

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/patient/appointments');
            setAppointments(response.data);
            setFilteredAppointments(response.data);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch appointments';
            setError(message);
            toast.error(message);
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const filterAppointments = useCallback(() => {
        let filtered = [...appointments];

        if (filterStatus !== 'All') {
            filtered = filtered.filter(apt => apt.status === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAppointments(filtered);
    }, [appointments, filterStatus, searchTerm]);

    useEffect(() => {
        filterAppointments();
    }, [filterAppointments]);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.put(`/patient/appointments/${appointmentId}/cancel`, { status: 'Cancelled' });
                toast.success('Appointment cancelled successfully!');
                fetchAppointments();
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to cancel appointment.';
                toast.error(message);
                console.error('Error cancelling appointment:', err);
            }
        }
    };

    const handleEditAppointment = async (appointmentId) => {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        if (appointment) {
            setEditForm({
                date: moment(appointment.date).format('YYYY-MM-DD'),
                time: appointment.time,
                reason: appointment.reason,
                type: appointment.type || 'Regular',
            });
            setEditingAppointment(appointmentId);
        }
    };

    const handleUpdateAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/patient/appointments/${editingAppointment}`, editForm);
            toast.success('Appointment updated successfully!');
            setEditingAppointment(null);
            setEditForm({ date: '', time: '', reason: '', type: 'Regular' });
            fetchAppointments();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update appointment.';
            toast.error(message);
            console.error('Error updating appointment:', err);
        }
    };

    const handleCloseModal = () => {
        setEditingAppointment(null);
        setEditForm({ date: '', time: '', reason: '', type: 'Regular' });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending': return 'badge-pending';
            case 'Approved': 
            case 'Confirmed': return 'badge-approved';
            case 'Completed': return 'badge-completed';
            case 'Canceled': 
            case 'Cancelled': return 'badge-canceled';
            case 'Rescheduled': return 'badge-rescheduled';
            default: return 'badge-default';
        }
    };

    if (loading) {
        return <div className="doctor-appointments-page"><div className="loading-spinner">Loading appointments...</div></div>;
    }

    if (error) {
        return <div className="doctor-appointments-page"><div className="error-message">{error}</div></div>;
    }

    return (
        <div className="doctor-appointments-page">
            <div className="page-header">
                <div className="title-section">
                    <h1>My Appointments</h1>
                    <p className="appointments-count">Total: {filteredAppointments.length} appointment(s)</p>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label htmlFor="statusFilter">Filter by Status:</label>
                        <select
                            id="statusFilter"
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rescheduled">Rescheduled</option>
                        </select>
                </div>

                <div className="search-group">
                    <label htmlFor="searchInput">Search:</label>
                    <input
                        type="text"
                        id="searchInput"
                        className="search-input"
                        placeholder="Search by doctor name or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                    <p>No appointments found.</p>
                </div>
            ) : (
                <div className="appointments-grid">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="card-header">
                                <h3>Dr. {appointment.doctor?.name || 'Unknown Doctor'}</h3>
                                <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                                    {appointment.status}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span className="label">Date:</span>
                                    <span className="value">{moment(appointment.date).format('MMMM DD, YYYY')}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Time:</span>
                                    <span className="value">{appointment.time}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Type:</span>
                                    <span className="value">{appointment.type || 'Regular'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Reason:</span>
                                    <span className="value">{appointment.reason}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                {(appointment.status === 'Pending' || appointment.status === 'Confirmed' || appointment.status === 'Approved') && (
                                    <>
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => handleEditAppointment(appointment._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-cancel"
                                            onClick={() => handleCancelAppointment(appointment._id)}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingAppointment && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Appointment</h2>
                        <form onSubmit={handleUpdateAppointment}>
                            <div className="form-group">
                                <label htmlFor="editDate">Date:</label>
                                <input
                                    type="date"
                                    id="editDate"
                                    className="form-input"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editTime">Time:</label>
                                <input
                                    type="time"
                                    id="editTime"
                                    className="form-input"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editType">Type:</label>
                                <select
                                    id="editType"
                                    className="form-input"
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    required
                                >
                                    <option value="Regular">Regular</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Checkup">Checkup</option>
                                    <option value="Follow-up">Follow-up</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editReason">Reason:</label>
                                <input
                                    type="text"
                                    id="editReason"
                                    className="form-input"
                                    value={editForm.reason}
                                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-cancel-modal" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-confirm-modal">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
