import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Assuming api service is available here

const PatientDetailsModal = ({ patientId, onClose }) => { // Changed patient prop to patientId
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/doctor-dashboard/patient/${patientId}/details`);
                setPatientDetails(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPatientDetails();
        }
    }, [patientId]); // Refetch when patientId changes

    if (!patientId) return null; // Ensure we have a patientId before rendering

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div>Loading patient details...</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div>Error: {error.message}</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    if (!patientDetails) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div>No patient details found.</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    const { personalDetails, medicalHistory, labReports, prescriptions, uploadedDocuments, appointmentHistory } = patientDetails;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Patient Details: {personalDetails.name}</h2>
                <button className="close-button" onClick={onClose}>X</button> {/* Added a close button with class */}

                <h3>Personal Details</h3>
                <p><strong>Patient ID:</strong> {personalDetails._id}</p>
                <p><strong>Name:</strong> {personalDetails.name}</p>
                <p><strong>Email:</strong> {personalDetails.userId?.email || 'N/A'}</p>
                <p><strong>Age:</strong> {personalDetails.age}</p>
                <p><strong>Gender:</strong> {personalDetails.gender}</p>
                <p><strong>Contact Number:</strong> {personalDetails.mobileNumber || 'N/A'}</p>
                <p><strong>Address:</strong> {personalDetails.address || 'N/A'}</p>

                <h3>Medical History</h3>
                {medicalHistory.length > 0 ? (
                    medicalHistory.map((record, index) => (
                        <div key={record._id || index} className="medical-record-item">
                            <p><strong>Date:</strong> {record.reportDate ? new Date(record.reportDate).toLocaleDateString() : new Date(record.createdAt).toLocaleDateString()}</p>
                            <p><strong>Type:</strong> {record.reportType}</p>
                            <p><strong>Title:</strong> {record.title}</p>
                            {record.description && <p><strong>Description:</strong> {record.description}</p>}
                            {record.diagnosis && <p><strong>Diagnosis:</strong> {record.diagnosis}</p>}
                            {record.treatment && <p><strong>Treatment:</strong> {record.treatment}</p>}
                            {record.notes && <p><strong>Clinical Notes:</strong> {record.notes}</p>}
                            <p><strong>Hospital/Clinic:</strong> {record.hospitalName || 'N/A'}</p>
                            <p><strong>Doctor:</strong> {record.doctorName || (record.sharedWithDoctor ? record.sharedWithDoctor.name : 'N/A')}</p>
                            {record.fileUrl && <p><a href={record.fileUrl} target="_blank" rel="noopener noreferrer">View Document</a></p>}
                        </div>
                    ))
                ) : (
                    <p>No medical history available.</p>
                )}


                <h3>Lab Reports</h3>
                {labReports.length > 0 ? (
                    labReports.map((report, index) => (
                        <div key={report._id || index} className="lab-report-item">
                            <p><strong>Report ID:</strong> {report._id}</p>
                            <p><strong>Date:</strong> {new Date(report.reportDate || report.createdAt).toLocaleDateString()}</p>
                            <p><strong>Description:</strong> {report.description}</p>
                             {report.fileUrl && <p><a href={report.fileUrl} target="_blank" rel="noopener noreferrer">View Report</a></p>}
                        </div>
                    ))
                ) : (
                    <p>No lab reports available.</p>
                )}

                <h3>Previous Prescriptions</h3>
                {prescriptions.length > 0 ? (
                    prescriptions.map((prescription, index) => (
                        <div key={prescription._id || index} className="prescription-item">
                            <p><strong>Date:</strong> {prescription.dateIssued ? new Date(prescription.dateIssued).toLocaleDateString() : new Date(prescription.createdAt).toLocaleDateString()}</p>
                            <p><strong>Doctor:</strong> {prescription.doctor ? prescription.doctor.name : 'N/A'}</p>
                            <div>
                                <strong>Medications:</strong>
                                <ul>
                                    {prescription.medications.map((med, medIndex) => (
                                        <li key={medIndex}>
                                            {med.name} - {med.dosage} {med.instructions && `(${med.instructions})`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No previous prescriptions available.</p>
                )}


                <h3>Uploaded Medical Documents</h3>
                {uploadedDocuments.length > 0 ? (
                    uploadedDocuments.map((doc, index) => (
                        <div key={doc._id || index} className="document-item">
                            <p><strong>Document ID:</strong> {doc._id}</p>
                            <p><strong>Date:</strong> {new Date(doc.reportDate || doc.createdAt).toLocaleDateString()}</p>
                            <p><strong>Description:</strong> {doc.description}</p>
                            {doc.fileUrl && <p><a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View Document</a></p>}
                        </div>
                    ))
                ) : (
                    <p>No uploaded medical documents found.</p>
                )}

                <h3>Appointment History</h3>
                {appointmentHistory.length > 0 ? (
                    appointmentHistory.map((appointment, index) => (
                        <div key={appointment._id || index} className="appointment-item">
                            <p><strong>Appointment ID:</strong> {appointment._id}</p>
                            <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p><strong>Reason:</strong> {appointment.reason}</p>
                            <p><strong>Status:</strong> {appointment.status}</p>
                            <p><strong>Doctor:</strong> {appointment.doctor ? appointment.doctor.name : 'N/A'}</p>
                        </div>
                    ))
                ) : (
                    <p>No appointment history available.</p>
                )}

                <button onClick={onClose}>Close Details</button>
            </div>
        </div>
    );
};

export default PatientDetailsModal;
