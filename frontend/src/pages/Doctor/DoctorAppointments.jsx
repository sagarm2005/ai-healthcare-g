import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/DoctorAppointments.css';
import moment from 'moment';

const DoctorAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState('');

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor-dashboard/appointments');
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
                apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAppointments(filtered);
    }, [appointments, filterStatus, searchTerm]);

    useEffect(() => {
        filterAppointments();
    }, [filterAppointments]);

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await api.put(`/doctor-dashboard/appointments/${appointmentId}/${actionType.toLowerCase()}`);
            toast.success(`Appointment ${newStatus.toLowerCase()} successfully!`);
            fetchAppointments();
            setShowModal(false);
            setSelectedAppointment(null);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update appointment';
            toast.error(message);
            console.error('Error updating appointment:', err);
        }
    };

    const openActionModal = (appointment, action) => {
        setSelectedAppointment(appointment);
        setActionType(action);
        setShowModal(true);
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
                        placeholder="Search by patient name or reason..."
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
                                <h3>{appointment.patient?.name || 'Unknown Patient'}</h3>
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
                                {appointment.patient?.mobileNumber && (
                                    <div className="info-row">
                                        <span className="label">Patient Phone:</span>
                                        <span className="value">{appointment.patient.mobileNumber}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {appointment.status === 'Pending' && (
                                    <>
                                        <button
                                            className="btn btn-approve"
                                            onClick={() => openActionModal(appointment, 'confirm')}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            className="btn btn-cancel"
                                            onClick={() => openActionModal(appointment, 'cancel')}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'Confirmed' && (
                                    <>
                                        <button
                                            className="btn btn-complete"
                                            onClick={() => openActionModal(appointment, 'complete')}
                                        >
                                            Mark Complete
                                        </button>
                                        <button
                                            className="btn btn-prescription"
                                            onClick={() => navigate(`/doctor/patients/${appointment.patient?._id}/createprescription`)}
                                        >
                                            Give Prescription
                                        </button>
                                        <button
                                            className="btn btn-cancel"
                                            onClick={() => openActionModal(appointment, 'cancel')}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'Approved' && (
                                    <>
                                        <button
                                            className="btn btn-complete"
                                            onClick={() => openActionModal(appointment, 'complete')}
                                        >
                                            Mark Complete
                                        </button>
                                        <button
                                            className="btn btn-prescription"
                                            onClick={() => navigate(`/doctor/patients/${appointment.patient?._id}/createprescription`)}
                                        >
                                            Give Prescription
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'Completed' && (
                                    <button
                                        className="btn btn-prescription"
                                        onClick={() => navigate(`/doctor/patients/${appointment.patient?._id}/createprescription`)}
                                    >
                                        Give Prescription
                                    </button>
                                )}
                                {appointment.status === 'Rescheduled' && (
                                    <span className="rescheduled-text">↻ Rescheduled</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Action</h2>
                        <p>
                            Are you sure you want to {actionType.toLowerCase()} the appointment with{' '}
                            <strong>{selectedAppointment?.patient?.name}</strong> on{' '}
                            {moment(selectedAppointment?.date).format('MMMM DD, YYYY')} at {selectedAppointment?.time}?
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-cancel-modal" onClick={() => setShowModal(false)}>
                                No, Cancel
                            </button>
                            <button
                                className="btn btn-confirm-modal"
                                onClick={() => {
                                    handleStatusUpdate(selectedAppointment._id, actionType);
                                }}
                            >
                                Yes, {actionType.replace('-', ' ')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
