import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import PatientDetailsModal from '../../components/PatientDetailsModal'; // Import PatientDetailsModal
import '../style/DoctorDashboard.css';
import '../../components/DashboardCard.css';
import api from '../../services/api'; // Assuming api service is available here

const DoctorDashboard = () => {
    const [overviewData, setOverviewData] = useState({
        totalPatients: 0,
        totalAppointmentsToday: 0, // New
        completedAppointmentsToday: 0, // New
        pendingAppointments: 0,
        cancelledAppointmentsToday: 0, // New
        emergencyAppointmentsToday: 0, // New
        reportsToReview: 0,
        newMessages: 0,
    });
    const [appointmentsData, setAppointmentsData] = useState([]);
    const [recentPatientsData, setRecentPatientsData] = useState([]);
    const [medicalReportsData, setMedicalReportsData] = useState([]);
    const [prescriptionsData, setPrescriptionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false); // New state for modal
    const [selectedPatientId, setSelectedPatientId] = useState(null); // New state for selected patient ID
    const navigate = useNavigate(); // Initialize useNavigate

    const fetchDashboardData = async () => {
        try {
            const summaryRes = await api.get('/doctor-dashboard/summary');
            setOverviewData(summaryRes.data);

            const appointmentsRes = await api.get('/doctor-dashboard/appointments');
            setAppointmentsData(appointmentsRes.data);

            const recentPatientsRes = await api.get('/doctor-dashboard/patients');
            setRecentPatientsData(recentPatientsRes.data);

            const medicalReportsRes = await api.get('/doctor-dashboard/medical-reports');
            setMedicalReportsData(medicalReportsRes.data);

            const prescriptionsRes = await api.get('/doctor-dashboard/prescriptions');
            setPrescriptionsData(prescriptionsRes.data);
            
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleConfirmAppointment = async (appointmentId) => {
        try {
            await api.put(`/doctor-dashboard/appointments/${appointmentId}/confirm`);
            fetchDashboardData();
        } catch (err) {
            console.error('Error confirming appointment:', err);
            alert(err.response?.data?.message || 'Failed to confirm appointment');
        }
    };

    const handleRescheduleAppointment = (appointmentId) => {
        const newDate = prompt("Enter new date (YYYY-MM-DD):");
        if (newDate) {
            api.put(`/doctor-dashboard/appointments/${appointmentId}/reschedule`, { newdate: newDate })
                .then(() => fetchDashboardData())
                .catch(err => {
                    console.error('Error rescheduling appointment:', err);
                    alert(err.response?.data?.message || 'Failed to reschedule appointment');
                });
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            try {
                await api.put(`/doctor-dashboard/appointments/${appointmentId}/cancel`);
                fetchDashboardData();
            } catch (err) {
                console.error('Error cancelling appointment:', err);
                alert(err.response?.data?.message || 'Failed to cancel appointment');
            }
        }
    };

    const handleViewPatientDetails = (patientId) => {
        setSelectedPatientId(patientId);
        setShowPatientDetailsModal(true);
    };

    const handleAddPrescription = (patientId) => {
        navigate(`/doctor/create-prescription/${patientId}`); // Navigate to create prescription page
        console.log('Adding prescription for:', patientId);
    };

    const handleAddNotes = (appointmentId) => {
        const notes = prompt("Enter notes for this appointment:");
        if (notes !== null) {
            api.put(`/doctor-dashboard/appointments/${appointmentId}/notes`, { notes })
                .then(() => fetchDashboardData())
                .catch(err => {
                    console.error('Error adding notes:', err);
                    alert(err.response?.data?.message || 'Failed to add notes');
                });
        }
    };

    const handleMarkAsCompleted = async (appointmentId) => {
        try {
            await api.put(`/doctor-dashboard/appointments/${appointmentId}/complete`);
            fetchDashboardData();
        } catch (err) {
            console.error('Error marking appointment as completed:', err);
            alert(err.response?.data?.message || 'Failed to mark appointment as completed');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }


    return (
        <div className="doctor-dashboard">
            <h1>Doctor Dashboard</h1>
            <div className="dashboard-cards-container">
                <DashboardCard title="Total Patients" value={overviewData.totalPatients} />
                <DashboardCard title="Total Appointments Today" value={overviewData.totalAppointmentsToday} />
                <DashboardCard title="Completed Appointments Today" value={overviewData.completedAppointmentsToday} />
                <DashboardCard title="Pending Appointments" value={overviewData.pendingAppointments} />
                <DashboardCard title="Cancelled Appointments Today" value={overviewData.cancelledAppointmentsToday} />
                <DashboardCard title="Emergency Appointments Today" value={overviewData.emergencyAppointmentsToday} />
                <DashboardCard title="Reports to Review" value={overviewData.reportsToReview} />
                <DashboardCard title="New Messages" value={overviewData.newMessages} />
            </div>
            
            <div className="appointments-section">
                <h2>Today's Appointments <span className="appointment-count">{appointmentsData.length}</span></h2>
                <table>
                    <thead>
                        <tr>
                            <th>Appointment ID</th>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointmentsData.map(appointment => (
                            <tr key={appointment._id}>
                                <td>{appointment._id}</td>
                                <td>{appointment.patient ? appointment.patient.name : 'N/A'}</td>
                                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                <td>{appointment.time}</td>
                                <td>{appointment.type || 'Regular'}</td>
                                <td>{appointment.reason}</td>
                                <td><span className={`status-${appointment.status.toLowerCase()}`}>{appointment.status}</span></td>
                                <td className="actions-cell">
                                    <button onClick={() => handleConfirmAppointment(appointment._id)} disabled={appointment.status !== 'Pending'}>Confirm</button>
                                    <button onClick={() => handleRescheduleAppointment(appointment._id)} disabled={appointment.status !== 'Pending' && appointment.status !== 'Confirmed'}>Reschedule</button>
                                    <button onClick={() => handleCancelAppointment(appointment._id)} disabled={appointment.status === 'Cancelled' || appointment.status === 'Completed'}>Cancel</button>
                                    <button onClick={() => handleViewPatientDetails(appointment.patient._id)}>View Patient</button>
                                    <button onClick={() => handleAddPrescription(appointment.patient._id)}>Add Prescription</button>
                                    <button onClick={() => handleAddNotes(appointment._id)}>Add Notes</button>
                                    <button onClick={() => handleMarkAsCompleted(appointment._id)} disabled={appointment.status === 'Completed'}>Complete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="recent-patients-section">
                <h2>Recent Patients</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Age / Gender</th>
                            <th>Last Visit Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentPatientsData.map(patient => (
                            <tr key={patient._id}>
                                <td>{patient.name}</td>
                                <td>{`${patient.age || 'N/A'} / ${patient.gender || 'N/A'}`}</td>
                                <td>{patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : 'N/A'}</td>
                                <td><button onClick={() => handleViewPatientDetails(patient._id)}>View Medical History</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="medical-reports-section">
                <h2>Medical Reports</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Report Title</th>
                            <th>Report Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicalReportsData.map(report => (
                            <tr key={report._id}>
                                <td>{report.patient?.name || 'N/A'}</td>
                                <td>{report.title}</td>
                                <td>{report.reportType}</td>
                                <td>
                                    <button onClick={() => window.open(report.fileUrl, '_blank')}>Download/View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="prescriptions-section">
                <h2>Prescriptions</h2>
                <button className="create-prescription-button" onClick={() => navigate('/doctor/createprescription')}>Create New Prescription</button>
                <table>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Medications</th>
                            <th>Dosage</th>
                            <th>Issued Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptionsData.map(prescription => (
                            <tr key={prescription._id}>
                                <td>{prescription.patient?.name || 'N/A'}</td>
                                <td>{prescription.medications.map(med => med.name).join(', ')}</td>
                                <td>{prescription.medications.map(med => med.dosage).join(', ')}</td>
                                <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => navigate(`/doctor/patients/${prescription.patient?._id}/createprescription?prescriptionId=${prescription._id}`)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="chat-section">
                <h2>Chat / Message</h2>
                <div className="chat-list">
                    {/* Chat messages will be displayed here */}
                </div>
                <div className="chat-interface">
                    <div className="message-display">
                        {/* Messages will be displayed here */}
                    </div>
                    <div className="message-input">
                        <input type="text" placeholder="Type a message..." />
                        <button>Send</button>
                    </div>
                </div>
            </div>

            {showPatientDetailsModal && selectedPatientId && (
                <PatientDetailsModal
                    patientId={selectedPatientId}
                    onClose={() => {
                        setShowPatientDetailsModal(false);
                        setSelectedPatientId(null);
                    }}
                />
            )}
        </div>
    );
};

export default DoctorDashboard;
