import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getUploadUrl } from '../../utils/constants';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../style/DoctorDashboard.css';
import '../style/MedicalReports.css';

const MedicalReports = () => {
    const [medicalReportsData, setMedicalReportsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const fetchMedicalReports = async () => {
        try {
            setLoading(true);
            const medicalReportsRes = await api.get('/doctor-dashboard/medical-reports');
            setMedicalReportsData(medicalReportsRes.data);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch medical reports';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (id) => {
        if (window.confirm('Are you sure you want to delete this medical report?')) {
            try {
                await api.delete(`/doctor-dashboard/medical-reports/${id}`);
                toast.success('Medical report deleted successfully!');
                fetchMedicalReports();
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to delete medical report';
                toast.error(message);
                console.error('Error deleting report:', err);
            }
        }
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowViewModal(true);
    };

    const downloadAsPDF = (report) => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Medical Report Details', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        const reportInfo = [
            ['Field', 'Information'],
            ['Patient Name', report.patient?.name || 'N/A'],
            ['Report Title', report.title || 'N/A'],
            ['Report Type', report.reportType || 'N/A'],
            ['Uploaded By', report.uploadedBy?.name || 'User'],
            ['Date', new Date(report.reportDate || report.createdAt).toLocaleDateString()],
            ['Description', report.description || 'No description provided']
        ];

        doc.autoTable({
            startY: 25,
            head: [reportInfo[0]],
            body: reportInfo.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`${report.title || 'medical-report'}.pdf`);
        toast.success('PDF download started');
    };

    const downloadAsExcel = (report) => {
        const data = [
            ['Field', 'Information'],
            ['Patient Name', report.patient?.name || 'N/A'],
            ['Report Title', report.title || 'N/A'],
            ['Report Type', report.reportType || 'N/A'],
            ['Uploaded By', report.uploadedBy?.name || 'User'],
            ['Date', new Date(report.reportDate || report.createdAt).toLocaleDateString()],
            ['Description', report.description || 'No description provided']
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + data.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${report.title || 'medical-report'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Excel (CSV) download started');
    };

    useEffect(() => {
        fetchMedicalReports();
    }, []);

    const filteredReports = medicalReportsData.filter(report => 
        report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="doctor-dashboard">Loading medical reports...</div>;
    }

    if (error) {
        return <div className="doctor-dashboard error">{error}</div>;
    }

    return (
        <div className="doctor-dashboard medical-reports-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Patient Medical Reports</h1>
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Search by patient, title or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '300px' }}
                    />
                </div>
            </div>

            <div className="medical-reports-section" style={{ marginTop: 0 }}>
                {filteredReports.length === 0 ? (
                    <p>No medical reports found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Report Title</th>
                                <th>Report Type</th>
                                <th>Uploaded By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report._id}>
                                    <td>{report.patient?.name || 'N/A'}</td>
                                    <td>{report.title}</td>
                                    <td>{report.reportType}</td>
                                    <td>{report.uploadedBy?.name || 'User'}</td>
                                    <td>{new Date(report.reportDate || report.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => handleViewReport(report)}
                                            >
                                                View
                                            </button>
                                            
                                            <div className="download-options">
                                                <button className="action-btn download-btn">
                                                    Download ▼
                                                </button>
                                                <div className="download-dropdown">
                                                    <button 
                                                        className="download-dropdown-item"
                                                        onClick={() => downloadAsPDF(report)}
                                                    >
                                                        PDF Format
                                                    </button>
                                                    <button 
                                                        className="download-dropdown-item"
                                                        onClick={() => downloadAsExcel(report)}
                                                    >
                                                        Excel (CSV)
                                                    </button>
                                                </div>
                                            </div>

                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteReport(report._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* View Modal */}
            {showViewModal && selectedReport && (
                <div className="report-modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="report-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="report-modal-header">
                            <div>
                                <h2>{selectedReport.title}</h2>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                    Patient: {selectedReport.patient?.name} | Type: {selectedReport.reportType}
                                </p>
                            </div>
                            <button className="close-modal-btn" onClick={() => setShowViewModal(false)}>&times;</button>
                        </div>
                        <div className="report-view-container">
                            {selectedReport.fileUrl ? (
                                selectedReport.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                    <iframe 
                                        src={getUploadUrl(selectedReport.fileUrl)} 
                                        className="report-pdf-viewer"
                                        title="PDF Viewer"
                                    />
                                ) : (
                                    <img 
                                        src={getUploadUrl(selectedReport.fileUrl)} 
                                        alt={selectedReport.title} 
                                        className="report-image"
                                    />
                                )
                            ) : (
                                <div className="no-preview">
                                    <p>No file attached to this report.</p>
                                    <p>Description: {selectedReport.description || 'No description available.'}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="action-btn view-btn" onClick={() => window.open(getUploadUrl(selectedReport.fileUrl), '_blank')}>
                                Open in New Tab
                            </button>
                            <button className="action-btn" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalReports;
