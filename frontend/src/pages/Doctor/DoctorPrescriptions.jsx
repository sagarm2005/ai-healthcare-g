import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/ViewPrescriptions.css'; // Reusing prescriptions style

const DoctorPrescriptions = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor-dashboard/prescriptions');
            setPrescriptions(response.data.map(pres => ({
                _id: pres._id,
                prescriptionId: pres._id.toString().slice(-8).toUpperCase(),
                patientId: pres.patient ? (pres.patient._id || pres.patient) : 'N/A',
                patientName: pres.patient ? pres.patient.name : 'N/A',
                visitDate: pres.dateIssued,
                notes: pres.notes || 'N/A',
                medicines: pres.medications.map(med => ({
                    medicineName: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    duration: med.duration || 'N/A',
                    instructions: med.notes || 'N/A',
                })) || []
            })));
        } catch (err) {
            setError('Failed to fetch prescriptions.');
            toast.error('Failed to load prescriptions.');
            console.error("Error fetching prescriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const filteredPrescriptions = prescriptions.filter(pres => {
        const matchesSearch =
            pres.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pres.notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate === '' || moment(pres.visitDate).isSame(moment(filterDate), 'day');
        return matchesSearch && matchesDate;
    });

    const handleViewDetails = (pres) => {
        setSelectedPrescription(pres);
    };

    const handleEdit = (pres) => {
        if (pres.patientId === 'N/A') {
            toast.error('Cannot edit prescription: Patient data missing.');
            return;
        }
        navigate(`/doctor/patients/${pres.patientId}/editprescription/${pres._id}`);
    };

    if (loading) {
        return <div className="view-prescriptions-page">Loading prescriptions...</div>;
    }

    if (error) {
        return <div className="view-prescriptions-page error">{error}</div>;
    }

    return (
        <div className="view-prescriptions-page">
            <h1>Patient Prescriptions</h1>

            <div className="prescriptions-header">
                <input
                    type="text"
                    placeholder="Search by patient name or advice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="filter-date"
                />
            </div>

            <div className="summary-section">
                <p>Total Issued: <strong>{filteredPrescriptions.length}</strong></p>
            </div>

            {filteredPrescriptions.length === 0 ? (
                <p>No prescriptions found.</p>
            ) : (
                <div className="prescriptions-table-container">
                    <table className="prescriptions-table">
                        <thead>
                            <tr>
                                <th>Sr No.</th>
                                <th>ID</th>
                                <th>Patient Name</th>
                                <th>Date Issued</th>
                                <th>Notes/Advice</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrescriptions.map((pres, index) => (
                                <tr key={pres._id}>
                                    <td>{index + 1}</td>
                                    <td>{pres.prescriptionId}</td>
                                    <td>{pres.patientName}</td>
                                    <td>{moment(pres.visitDate).format('YYYY-MM-DD')}</td>
                                    <td>{pres.notes}</td>
                                    <td className="actions-column">
                                        <button onClick={() => handleViewDetails(pres)} className="action-button view">View Details</button>
                                        <button onClick={() => handleEdit(pres)} className="action-button edit">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedPrescription && (
                <div className="prescription-details-modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setSelectedPrescription(null)}>&times;</span>
                        <h2>Prescription Details ({selectedPrescription.prescriptionId})</h2>
                        <p><strong>Patient:</strong> {selectedPrescription.patientName}</p>
                        <p><strong>Date Issued:</strong> {moment(selectedPrescription.visitDate).format('MMMM Do YYYY')}</p>
                        <p><strong>Notes/Advice:</strong> {selectedPrescription.notes}</p>

                        <h3>Medicines:</h3>
                        <table className="medicines-table">
                            <thead>
                                <tr>
                                    <th>Medicine Name</th>
                                    <th>Dosage</th>
                                    <th>Frequency</th>
                                    <th>Duration</th>
                                    <th>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPrescription.medicines.map((med, index) => (
                                    <tr key={index}>
                                        <td>{med.medicineName}</td>
                                        <td>{med.dosage}</td>
                                        <td>{med.frequency}</td>
                                        <td>{med.duration}</td>
                                        <td>{med.instructions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPrescriptions;
