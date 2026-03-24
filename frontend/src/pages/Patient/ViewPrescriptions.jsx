import React, { useState, useEffect } from 'react';
import moment from 'moment';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/ViewPrescriptions.css';
import { useAuth } from '../../hooks/useAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewPrescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Fetch patient info and prescriptions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, prescriptionsRes] = await Promise.all([
                    api.get('/patient/profile'),
                    api.get('/patient/prescriptions')
                ]);
                
                setPatientInfo(patientRes.data);
                setPrescriptions(prescriptionsRes.data.map(pres => ({
                    _id: pres._id,
                    prescriptionId: pres._id.toString().slice(-8).toUpperCase(),
                    doctorName: pres.doctor ? pres.doctor.name : 'N/A',
                    specialization: pres.doctor ? pres.doctor.specialization : 'N/A',
                    hospitalName: pres.doctor ? pres.doctor.hospitalName : 'Smart Healthcare Hospital',
                    visitDate: pres.dateIssued,
                    notes: pres.notes || 'N/A',
                    status: moment(pres.dateIssued).add(30, 'days').isAfter(moment()) ? 'Active' : 'Completed',
                    medicines: pres.medications.map(med => ({
                        medicineName: med.name,
                        dosage: med.dosage,
                        frequency: med.frequency,
                        duration: med.duration || 'N/A',
                        instructions: med.notes || 'N/A',
                    })) || []
                })));
            } catch (err) {
                setError('Failed to fetch data.');
                toast.error('Failed to load prescriptions.');
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPrescriptions = prescriptions.filter(pres => {
        const matchesSearch =
            pres.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pres.notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate === '' || moment(pres.visitDate).isSame(moment(filterDate), 'day');
        const matchesDoctor = filterDoctor === '' || pres.doctorName === filterDoctor;
        return matchesSearch && matchesDate && matchesDoctor;
    });

    const handleViewDetails = (pres) => {
        setSelectedPrescription(pres);
    };

    const generatePrescriptionPDF = (pres, shouldPrint = false) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(63, 81, 181); // Indigo color
        doc.text(pres.hospitalName, 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Smart AI-Driven Healthcare System', 105, 26, { align: 'center' });
        
        doc.setDrawColor(63, 81, 181);
        doc.line(20, 30, 190, 30);
        
        // Patient and Doctor Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('Patient Details:', 20, 40);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${patientInfo?.name || 'N/A'}`, 20, 48);
        doc.text(`Age/Gender: ${patientInfo?.age || 'N/A'} / ${patientInfo?.gender || 'N/A'}`, 20, 56);
        doc.text(`Contact: ${patientInfo?.mobileNumber || 'N/A'}`, 20, 64);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Doctor Details:', 120, 40);
        doc.setFont('helvetica', 'normal');
        doc.text(`Dr. ${pres.doctorName}`, 120, 48);
        doc.text(`Spec: ${pres.specialization}`, 120, 56);
        doc.text(`Date: ${moment(pres.visitDate).format('YYYY-MM-DD')}`, 120, 64);
        
        doc.line(20, 70, 190, 70);
        
        // Prescription ID and Notes
        doc.setFont('helvetica', 'bold');
        doc.text(`Prescription ID: ${pres.prescriptionId}`, 20, 80);
        doc.setFont('helvetica', 'normal');
        doc.text(`Diagnosis/Notes: ${pres.notes}`, 20, 88);
        
        // Medicines Table
        const tableColumn = ["Sr No.", "Medicine Name", "Dosage", "Frequency", "Duration", "Instructions"];
        const tableRows = pres.medicines.map((med, index) => [
            index + 1,
            med.medicineName,
            med.dosage,
            med.frequency,
            med.duration,
            med.instructions
        ]);
        
        autoTable(doc, {
            startY: 95,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [63, 81, 181] },
            margin: { top: 95 },
        });
        
        // Footer
        const finalY = doc.lastAutoTable.finalY || 95;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('This is an electronically generated prescription.', 105, finalY + 20, { align: 'center' });
        doc.text('Powered by AI Healthcare System', 105, finalY + 26, { align: 'center' });
        
        if (shouldPrint) {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');
        } else {
            doc.save(`Prescription_${pres.prescriptionId}.pdf`);
            toast.success('Prescription downloaded successfully!');
        }
    };

    const handleDownload = (pres) => {
        generatePrescriptionPDF(pres);
    };

    const handlePrint = (pres) => {
        generatePrescriptionPDF(pres, true);
    };

    const handleShare = (pres) => {
        toast.info(`Sharing prescription ${pres.prescriptionId} (feature not fully implemented).`);
        // Logic to share prescription (e.g., via email or with another doctor)
    };

    const handleDownloadAsPdf = (pres) => {
        generatePrescriptionPDF(pres);
    };

    const handleEmailPrescription = (pres) => {
        toast.info(`Emailing prescription ${pres.prescriptionId} (feature not fully implemented).`);
        // Logic to email prescription
    };

    const totalPrescriptions = filteredPrescriptions.length;
    const latestPrescriptionDate = prescriptions.length > 0
        ? moment(prescriptions.reduce((a, b) => (moment(a.visitDate).isAfter(moment(b.visitDate)) ? a : b)).visitDate).format('MMMM Do YYYY')
        : 'N/A';
    const activePrescriptionsCount = filteredPrescriptions.filter(pres => pres.status === 'Active').length;

    if (loading) {
        return <div className="view-prescriptions-page">Loading prescriptions...</div>;
    }

    if (error) {
        return <div className="view-prescriptions-page error">{error}</div>;
    }

    const uniqueDoctors = [...new Set(prescriptions.map(pres => pres.doctorName))];

    return (
        <div className="view-prescriptions-page">
            <h1>View Prescriptions</h1>

            <div className="prescriptions-header">
                <input
                    type="text"
                    placeholder="Search by doctor name or diagnosis..."
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
                <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="filter-select">
                    <option value="">All Doctors</option>
                    {uniqueDoctors.map(doctor => (
                        <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                </select>
            </div>

            <div className="summary-section">
                <p>Total Prescriptions: <strong>{totalPrescriptions}</strong></p>
                <p>Latest Prescription Date: <strong>{latestPrescriptionDate}</strong></p>
                <p>Active Prescriptions: <strong>{activePrescriptionsCount}</strong></p>
            </div>

            {filteredPrescriptions.length === 0 ? (
                <p>No prescriptions found matching your criteria.</p>
            ) : (
                <div className="prescriptions-table-container">
                    <table className="prescriptions-table">
                        <thead>
                            <tr>
                                <th>Sr No.</th>
                                <th>Prescription ID</th>
                                <th>Doctor Name</th>
                                <th>Specialization</th>
                                <th>Visit Date</th>
                                <th>Notes/Advice</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrescriptions.map((pres, index) => (
                                <tr key={pres._id}>
                                    <td>{index + 1}</td>
                                    <td>{pres.prescriptionId}</td>
                                    <td>{pres.doctorName}</td>
                                    <td>{pres.specialization}</td>
                                    <td>{moment(pres.visitDate).format('YYYY-MM-DD')}</td>
                                    <td>{pres.notes}</td>
                                    <td>{pres.status}</td>
                                    <td className="actions-column">
                                        <button onClick={() => handleViewDetails(pres)} className="action-button view">View Details</button>
                                        <button onClick={() => handleDownload(pres)} className="action-button download">Download</button>
                                        <button onClick={() => handlePrint(pres)} className="action-button print">Print</button>
                                        <button onClick={() => handleShare(pres)} className="action-button share">Share</button>
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
                        <p><strong>Doctor:</strong> {selectedPrescription.doctorName} ({selectedPrescription.specialization})</p>
                        <p><strong>Visit Date:</strong> {moment(selectedPrescription.visitDate).format('MMMM Do YYYY')}</p>
                        <p><strong>Notes/Advice:</strong> {selectedPrescription.notes}</p>
                        <p><strong>Status:</strong> {selectedPrescription.status}</p>

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

                        <div className="extra-features">
                            <button onClick={() => handleDownloadAsPdf(selectedPrescription)} className="action-button download-pdf">Download as PDF</button>
                            <button onClick={() => handleEmailPrescription(selectedPrescription)} className="action-button email-pres">Email Prescription</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewPrescriptions;