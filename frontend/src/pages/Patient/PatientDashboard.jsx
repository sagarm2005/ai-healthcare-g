import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/PatientDashboard.css';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment'; // Import moment for date handling
import { toast } from 'react-toastify'; // Import toast for messages

const PatientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [totalPrescriptions, setTotalPrescriptions] = useState(0);
    const [totalMedicalRecords, setTotalMedicalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const patientResponse = await api.get('/patient/profile');
                setPatientData(patientResponse.data);

                const appointmentsResponse = await api.get('/patient/appointments');
                const allAppointments = appointmentsResponse.data;
                const now = moment();
                const upcoming = allAppointments.filter(app => moment(app.date).isAfter(now));
                setUpcomingAppointments(upcoming);

                const prescriptionsResponse = await api.get('/patient/prescriptions');
                setTotalPrescriptions(prescriptionsResponse.data.length);

                const medicalRecordsResponse = await api.get('/patient/medical-records');
                setTotalMedicalRecords(medicalRecordsResponse.data.length);

            } catch (err) {
                setError('Failed to fetch dashboard data.');
                toast.error('Failed to fetch dashboard data.');
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleEditProfile = () => {
        navigate('/patient/edit-profile');
    };

    const handleBookAppointment = () => {
        navigate('/patient/book-appointment');
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.put(`/patient/appointments/${appointmentId}/cancel`, { status: 'Cancelled' });
                toast.success('Appointment cancelled successfully!');
                // Re-fetch appointments to update the list
                const appointmentsResponse = await api.get('/patient/appointments');
                const allAppointments = appointmentsResponse.data;
                const now = moment();
                const upcoming = allAppointments.filter(app => moment(app.date).isAfter(now));
                setUpcomingAppointments(upcoming);
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to cancel appointment.';
                toast.error(message);
                console.error('Error cancelling appointment:', err);
            }
        }
    };

    const handleRescheduleAppointment = async (appointmentId) => {
        toast.info(`Rescheduling appointment: ${appointmentId} (feature not fully implemented).`);
        // Navigate to a reschedule page or open a modal
        // navigate(`/patient/reschedule-appointment/${appointmentId}`);
    };

    const handleEditAppointment = async (appointmentId) => {
        toast.info(`Editing appointment: ${appointmentId} (feature not fully implemented).`);
        // Navigate to an edit page or open a modal
        // navigate(`/patient/edit-appointment/${appointmentId}`);
    };

    if (loading) {
        return <div className="patient-dashboard">Loading patient data...</div>;
    }

    if (error) {
        return <div className="patient-dashboard error">{error}</div>;
    }

    if (!patientData) {
        return <div className="patient-dashboard">No patient data available.</div>;
    }

    const totalAppointments = upcomingAppointments.length;

    return (
        <div className="patient-dashboard">
            <h1>Patient Dashboard</h1>
            <p>Welcome, {patientData.name || 'Patient'}!</p>

            <div className="summary-cards-container">
                <div className="dashboard-card">
                    <h3>Total Appointments</h3>
                    <p>{totalAppointments}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Upcoming Appointments</h3>
                    <p>{upcomingAppointments.length}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Total Prescriptions</h3>
                    <p>{totalPrescriptions}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Total Medical Records</h3>
                    <p>{totalMedicalRecords}</p>
                </div>
            </div>

            <div className="profile-info-card">
                <h2>Profile Information</h2>
                <p><strong>Patient Name:</strong> {patientData.name}</p>
                <p><strong>Patient ID:</strong> {patientData._id}</p>
                <p><strong>Age:</strong> {patientData.age || 'N/A'}</p>
                <p><strong>Gender:</strong> {patientData.gender || 'N/A'}</p>
                <p><strong>Contact Number:</strong> {patientData.mobileNumber || 'N/A'}</p>
                <p><strong>Email:</strong> {patientData.email}</p>
                <p><strong>Address:</strong> {patientData.address || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {patientData.bloodGroup || 'N/A'}</p>
                <button onClick={handleEditProfile} className="edit-profile-button">
                    Profile
                </button>
            </div>

            <div className="appointments-section">
                <h2>Appointments</h2>
                <button onClick={handleBookAppointment} className="book-appointment-button">
                    Book New Appointment
                </button>

                <h3>Upcoming Appointments</h3>
                {upcomingAppointments.length === 0 ? (
                    <p>No upcoming appointments.</p>
                ) : (
                    <div className="appointment-list">
                        {upcomingAppointments.map(appointment => (
                            <div key={appointment._id} className="appointment-card">
                                <p><strong>Doctor:</strong> {appointment.doctor.name}</p>
                                <p><strong>Date & Time:</strong> {moment(appointment.date).format('MMMM Do YYYY')} at {appointment.time}</p>
                                <p><strong>Status:</strong> {appointment.status}</p>
                                <div className="appointment-actions">
                                    <button onClick={() => handleEditAppointment(appointment._id)} className="edit-button">Edit</button>
                                    <button onClick={() => handleCancelAppointment(appointment._id)} className="cancel-button">Cancel</button>
                                    <button onClick={() => handleRescheduleAppointment(appointment._id)} className="reschedule-button">Reschedule</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
