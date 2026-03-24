import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Assuming api service is available here
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PatientDetailsModal from '../../components/PatientDetailsModal'; // We will create this later
import '../style/MyPatients.css';

const MyPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null); // Changed selectedPatient to selectedPatientId
    const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false); // New state for modal
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctor-dashboard/patients/all');
                setPatients(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const handleViewDetails = (patientId) => { // Changed patient to patientId
        setSelectedPatientId(patientId); // Store only the ID
        setShowPatientDetailsModal(true);
    };

    const handleEditPatient = (patientId) => {
        // Navigate to edit patient page or open edit modal
        navigate(`/doctor/patients/${patientId}/updatemedicalrecord`);
        console.log('Edit patient:', patientId);
    };

    const handlePrescribe = (patientId) => {
        // Navigate to create prescription page
        navigate(`/doctor/patients/${patientId}/createprescription`);
        console.log('Prescribe for patient:', patientId);
    };

    const handleOpenMessageModal = (patientId) => {
        setSelectedPatientId(patientId);
        setShowMessageModal(true);
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSending(true);
        try {
            await api.post(`/doctor-dashboard/patients/${selectedPatientId}/message`, { message: messageContent });
            toast.success('Message sent successfully!');
            setShowMessageModal(false);
            setMessageContent('');
            setSelectedPatientId(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send message';
            toast.error(errorMsg);
            console.error('Error sending message:', err);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return <div>Loading patients...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="my-patients-container">
            <h1>My Patients</h1>

            {patients.length === 0 ? (
                <p>No patients assigned to you yet.</p>
            ) : (
                <div className="patients-table-responsive">
                    <table className="patients-table">
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Patient Name</th>
                                <th>Age / Gender</th>
                                <th>Contact Number</th>
                                <th>Email ID</th>
                                <th>Last Visit Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient._id}>
                                    <td>{patient._id}</td>
                                    <td>{patient.name}</td>
                                    <td>{`${patient.age} / ${patient.gender}`}</td>
                                    <td>{patient.contactNumber || 'N/A'}</td>
                                    <td>{patient.email}</td>
                                    <td>{patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{patient.status || 'Active'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleViewDetails(patient._id)}>View</button>
                                        <button onClick={() => handleEditPatient(patient._id)}>Edit</button>
                                        <button onClick={() => handlePrescribe(patient._id)}>Prescribe</button>
                                        <button onClick={() => handleOpenMessageModal(patient._id)}>Message</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showPatientDetailsModal && selectedPatientId && (
                <PatientDetailsModal
                    patientId={selectedPatientId} // Pass patientId
                    onClose={() => {
                        setShowPatientDetailsModal(false);
                        setSelectedPatientId(null); // Clear selected patient when modal closes
                    }}
                />
            )}

            {showMessageModal && (
                <div className="message-modal-overlay">
                    <div className="message-modal-content">
                        <h2>Send Message to Patient</h2>
                        <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message here..."
                            rows="5"
                        ></textarea>
                        <div className="message-modal-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessageContent('');
                                    setSelectedPatientId(null);
                                }}
                                disabled={isSending}
                            >
                                Cancel
                            </button>
                            <button 
                                className="send-btn" 
                                onClick={handleSendMessage}
                                disabled={isSending}
                            >
                                {isSending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPatients;
