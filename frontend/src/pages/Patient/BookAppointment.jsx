import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/BookAppointment.css';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const BookAppointment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patientInfo, setPatientInfo] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentReason, setAppointmentReason] = useState('');
    const [appointmentType, setAppointmentType] = useState('Regular'); // Default to Regular
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Effect to fetch patient info and doctors list
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const patientResponse = await api.get('/patient/profile');
                setPatientInfo(patientResponse.data);

                const doctorsResponse = await api.get('/doctors');
                setDoctors(doctorsResponse.data);
            } catch (err) {
                setError('Failed to load necessary data.');
                toast.error('Failed to load data for booking appointment.');
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user, navigate]);

    // Effect to update selected doctor details
    useEffect(() => {
        if (selectedDoctorId) {
            const doctor = doctors.find(doc => doc._id === selectedDoctorId);
            setSelectedDoctorDetails(doctor);
        } else {
            setSelectedDoctorDetails(null);
        }
    }, [selectedDoctorId, doctors]);

    // Effect to fetch available slots when doctor or date changes
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (selectedDoctorId && appointmentDate) {
                try {
                    // Assuming an API endpoint like /doctors/:id/available-slots?date=YYYY-MM-DD
                    const response = await api.get(`/doctor/${selectedDoctorId}/available-slots`, {
                        params: { date: appointmentDate }
                    });
                    setAvailableSlots(response.data.slots);
                    setAppointmentTime(''); // Reset selected time when slots change
                } catch (err) {
                    toast.error('Failed to fetch available slots.');
                    console.error('Error fetching available slots:', err);
                    setAvailableSlots([]);
                }
            } else {
                setAvailableSlots([]);
                setAppointmentTime('');
            }
        };
        fetchAvailableSlots();
    }, [selectedDoctorId, appointmentDate]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!selectedDoctorId || !appointmentDate || !appointmentTime || !appointmentReason || !appointmentType) {
            toast.error('Please fill in all appointment details.');
            setIsSubmitting(false);
            return;
        }

        try {
            const appointmentData = {
                doctor: selectedDoctorId,
                date: appointmentDate,
                time: appointmentTime,
                reason: appointmentReason,
                type: appointmentType,
                patient: patientInfo._id, // Assuming patientInfo has the _id
            };

            await api.post('/appointments', appointmentData);
            toast.success('Appointment booked successfully!');
            setIsSubmitting(false); // Reset submitting state before navigating
            setTimeout(() => {
                navigate('/patient/dashboard'); // Or to an appointments list page
            }, 500); // 500ms delay
        } catch (err) {
            const message = err.response && err.response.data.message
                ? err.response.data.message
                : err.message;
            setError(message);
            toast.error(message);
            console.error('Error booking appointment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="book-appointment-page">Loading data...</div>;
    }

    if (error) {
        return <div className="book-appointment-page error">{error}</div>;
    }

    if (!patientInfo) {
        return <div className="book-appointment-page">Could not load patient information. Please try again.</div>;
    }

    return (
        <div className="book-appointment-page">
            <h1>Book Appointment</h1>

            <div className="patient-info-card">
                <h2>Your Information</h2>
                <p><strong>Name:</strong> {patientInfo.name}</p>
                <p><strong>Email:</strong> {patientInfo.email}</p>
                <p><strong>Mobile:</strong> {patientInfo.mobileNumber || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> {patientInfo.dateOfBirth ? moment(patientInfo.dateOfBirth).format('YYYY-MM-DD') : 'N/A'}</p>
                {/* Add other patient details as needed */}
            </div>

            <div className="select-doctor-section">
                <h2>Select Doctor</h2>
                {doctors.length === 0 ? (
                    <p>No approved doctors available at this time.</p>
                ) : (
                    <div className="doctor-cards-grid">
                        {doctors.map(doctor => (
                            <div 
                                key={doctor._id} 
                                className={`doctor-card ${selectedDoctorId === doctor._id ? 'selected' : ''}`}
                                onClick={() => setSelectedDoctorId(doctor._id)}
                            >
                                <img 
                                    src={doctor.profileImage || 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'} 
                                    alt={doctor.name} 
                                    className="doctor-card-image" 
                                />
                                <div className="doctor-card-info">
                                    <h3>{doctor.name}</h3>
                                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                    <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>
                                    <p><strong>Hospital:</strong> {doctor.hospitalName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedDoctorDetails && (
                <div className="appointment-details-section">
                    <h2>Appointment Details for {selectedDoctorDetails.name}</h2>
                    <form onSubmit={handleBookAppointment}>
                        <div className="form-group">
                            <label htmlFor="appointmentDate">Appointment Date:</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                className="form-control"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                required
                                min={moment().format('YYYY-MM-DD')} // Only allow future dates
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentTime">Appointment Time:</label>
                            <select
                                id="appointmentTime"
                                className="form-control"
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                                required
                                disabled={availableSlots.length === 0}
                            >
                                <option value="">-- Select Time --</option>
                                {availableSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentReason">Reason for Appointment:</label>
                            <textarea
                                id="appointmentReason"
                                className="form-control"
                                value={appointmentReason}
                                onChange={(e) => setAppointmentReason(e.target.value)}
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentType">Appointment Type:</label>
                            <select
                                id="appointmentType"
                                className="form-control"
                                value={appointmentType}
                                onChange={(e) => setAppointmentType(e.target.value)}
                            >
                                <option value="Regular">Regular</option>
                                <option value="Emergency">Emergency</option>
                                <option value="Checkup">Checkup</option>
                                <option value="Follow-up">Follow-up</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Booking...' : 'Submit'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BookAppointment;