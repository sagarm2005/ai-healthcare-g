import React, { useState, useEffect } from 'react';
import moment from 'moment';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getUploadUrl } from '../../utils/constants';
import '../style/DocumentsPage.css';

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [previewDocument, setPreviewDocument] = useState(null);

    // Dummy data for demonstration
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await api.get('/patient/medical-records');
                setDocuments(response.data.map(doc => ({
                    _id: doc._id,
                    reportTitle: doc.title,
                    reportType: doc.reportType,
                    doctorName: doc.doctorName || 'N/A',
                    hospitalName: doc.hospitalName || 'N/A',
                    reportDate: doc.reportDate,
                    uploadDate: doc.createdAt, // createdAt from timestamps
                    fileType: doc.fileMimeType ? doc.fileMimeType.split('/')[1].toUpperCase() : 'N/A',
                    status: doc.isPrivate ? 'Private' : 'Shared',
                    fileUrl: doc.fileUrl,
                })));
            } catch (err) {
                setError('Failed to fetch documents.');
                toast.error('Failed to load documents.');
                console.error("Error fetching documents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.reportTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === '' || doc.reportType === filterType;
        const matchesDate = filterDate === '' || moment(doc.reportDate).isSame(moment(filterDate), 'day');
        return matchesSearch && matchesType && matchesDate;
    });

    const handleView = (doc) => {
        setPreviewDocument(doc);
    };

    const handleDownload = (doc) => {
        // Construct the full URL for download if fileUrl is relative
        const fullFileUrl = getUploadUrl(doc.fileUrl);
        window.open(fullFileUrl, '_blank');
        toast.info(`Downloading ${doc.reportTitle}`);
    };

    const handleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await api.delete(`/patient/medical-records/${docId}`); // Assuming this endpoint exists
                setDocuments(documents.filter(doc => doc._id !== docId));
                toast.success('Document deleted successfully!');
                setPreviewDocument(null); // Close preview if the deleted doc was being previewed
            } catch (err) {
                toast.error('Failed to delete document.');
                console.error("Error deleting document:", err);
            }
        }
    };

    const handleShare = async (docId) => {
        // In a real app, this would open a modal to select a doctor to share with
        toast.info(`Sharing document ${docId} with a doctor (feature not fully implemented).`);
        try {
            // await api.post(`/api/patient/medical-records/${docId}/share`, { doctorId: 'selectedDoctorId' }); // Assuming this endpoint exists
            toast.success('Document shared successfully!');
        } catch (err) {
            toast.error('Failed to share document.');
            console.error("Error sharing document:", err);
        }
    };

    // Sort documents by uploadDate for summary and display
    const sortedDocuments = [...filteredDocuments].sort((a, b) => moment(b.uploadDate).diff(moment(a.uploadDate)));

    const totalDocuments = sortedDocuments.length;
    const recentlyUploaded = sortedDocuments.length > 0 ? moment(sortedDocuments[0].uploadDate).format('MMMM Do YYYY') : 'N/A';
    const lastUpdatedDate = sortedDocuments.length > 0 ? moment(sortedDocuments[0].uploadDate).format('MMMM Do YYYY, h:mm A') : 'N/A';

    if (loading) {
        return <div className="documents-page">Loading documents...</div>;
    }

    if (error) {
        return <div className="documents-page error">{error}</div>;
    }

    return (
        <div className="documents-page">
            <h1>My Documents</h1>

            <div className="documents-header">
                <input
                    type="text"
                    placeholder="Search by report name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                    <option value="">All Types</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="Prescription">Prescription</option>
                    {/* Add more report types as needed */}
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="filter-date"
                />
            </div>

            <div className="summary-section">
                <p>Total Documents: <strong>{totalDocuments}</strong></p>
                <p>Recently Uploaded: <strong>{recentlyUploaded}</strong></p>
                <p>Last Updated: <strong>{lastUpdatedDate}</strong></p>
            </div>

            {filteredDocuments.length === 0 ? (
                <p>No documents found matching your criteria.</p>
            ) : (
                <div className="documents-table-container">
                    <table className="documents-table">
                        <thead>
                            <tr>
                                <th>Sr No.</th>
                                <th>Report Title</th>
                                <th>Report Type</th>
                                <th>Doctor Name</th>
                                <th>Hospital Name</th>
                                <th>Report Date</th>
                                <th>Upload Date</th>
                                <th>File Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map((doc, index) => (
                                <tr key={doc._id}>
                                    <td>{index + 1}</td>
                                    <td>{doc.reportTitle}</td>
                                    <td>{doc.reportType}</td>
                                    <td>{doc.doctorName}</td>
                                    <td>{doc.hospitalName}</td>
                                    <td>{moment(doc.reportDate).format('YYYY-MM-DD')}</td>
                                    <td>{moment(doc.uploadDate).format('YYYY-MM-DD HH:mm')}</td>
                                    <td>{doc.fileType}</td>
                                    <td>{doc.status}</td>
                                    <td className="actions-column">
                                        <button onClick={() => handleView(doc)} className="action-button view">View</button>
                                        <button onClick={() => handleDownload(doc)} className="action-button download">Download</button>
                                        {/* <button className="action-button edit">Edit</button> */}
                                        <button onClick={() => handleDelete(doc._id)} className="action-button delete">Delete</button>
                                        <button onClick={() => handleShare(doc._id)} className="action-button share">Share</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {previewDocument && (
                <div className="document-preview-modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={() => setPreviewDocument(null)}>&times;</span>
                        <h2>{previewDocument.reportTitle}</h2>
                        <p><strong>Type:</strong> {previewDocument.reportType}</p>
                        <p><strong>Doctor:</strong> {previewDocument.doctorName}</p>
                        <p><strong>Hospital:</strong> {previewDocument.hospitalName}</p>
                        <p><strong>Report Date:</strong> {moment(previewDocument.reportDate).format('YYYY-MM-DD')}</p>
                        <p><strong>Upload Date:</strong> {moment(previewDocument.uploadDate).format('YYYY-MM-DD HH:mm')}</p>
                        <p><strong>Status:</strong> {previewDocument.status}</p>

                        <div className="preview-area">
                            {previewDocument.fileType === 'PDF' ? (
                                <iframe src={getUploadUrl(previewDocument.fileUrl)} width="100%" height="500px" title="Document Preview"></iframe>
                            ) : (
                                <img src={getUploadUrl(previewDocument.fileUrl)} alt="Document Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                            )}
                        </div>
                        <button onClick={() => handleDownload(previewDocument)} className="action-button download full-width">Download</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;