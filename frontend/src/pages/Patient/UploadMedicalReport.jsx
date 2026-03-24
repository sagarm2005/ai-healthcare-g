import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/UploadMedicalReport.css';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { REPORT_TYPES } from '../../utils/constants';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

const initialForm = {
    title: '',
    reportType: 'Blood Test',
    doctorName: '',
    hospitalName: '',
    reportDate: '',
    description: '',
    isPrivate: false,
    shareWithDoctor: '',
};

const UploadMedicalReport = () => {
    const navigate = useNavigate();

    const [patientInfo, setPatientInfo] = useState({ name: '', email: '', mobileNumber: '' });
    const [doctorOptions, setDoctorOptions] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadResult, setUploadResult] = useState(null);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [profileRes, appointmentsRes] = await Promise.all([
                    api.get('/patient/profile'),
                    api.get('/patient/appointments'),
                ]);

                const profile = profileRes.data || {};
                setPatientInfo({
                    name: profile.name || '',
                    email: profile.email || '',
                    mobileNumber: profile.mobileNumber || '',
                });

                const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
                const uniqueDoctors = [];
                const seen = new Set();

                appointments.forEach((appointment) => {
                    const doctor = appointment?.doctor;
                    if (doctor && typeof doctor === 'object' && doctor._id && !seen.has(doctor._id)) {
                        seen.add(doctor._id);
                        uniqueDoctors.push({ id: doctor._id, name: doctor.name || 'Doctor' });
                    }
                });

                setDoctorOptions(uniqueDoctors);
            } catch (error) {
                toast.error('Failed to load patient info for upload form.');
                console.error('Upload page load error:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const filePreview = useMemo(() => {
        if (!selectedFile) {
            return null;
        }

        const extension = selectedFile.name.split('.').pop()?.toLowerCase() || '';
        if (!['jpg', 'jpeg', 'png'].includes(extension)) {
            return null;
        }

        return URL.createObjectURL(selectedFile);
    }, [selectedFile]);

    useEffect(() => {
        return () => {
            if (filePreview) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    const validateFile = (file) => {
        if (!file) {
            return 'Please upload a file.';
        }

        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return 'Invalid file format. Use PDF, JPG, PNG, DOC, or DOCX.';
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File size exceeds 5MB limit.';
        }

        return null;
    };

    const applyFile = (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSelectedFile(file);
    };

    const onFileInputChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            applyFile(file);
        }
    };

    const onDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            applyFile(file);
        }
    };

    const onDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const onDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const onFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;

        setForm((prev) => ({
            ...prev,
            [name]: nextValue,
            ...(name === 'isPrivate' && checked ? { shareWithDoctor: '' } : {}),
        }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setSelectedFile(null);
        setUploadResult(null);
    };

    const submitForm = async () => {
        if (!form.title.trim()) {
            toast.error('Report title is required.');
            return;
        }

        if (!form.reportDate) {
            toast.error('Report date is required.');
            return;
        }

        const fileValidation = validateFile(selectedFile);
        if (fileValidation) {
            toast.error(fileValidation);
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('medicalReport', selectedFile);
            formData.append('title', form.title.trim());
            formData.append('reportType', form.reportType);
            formData.append('doctorName', form.doctorName.trim());
            formData.append('hospitalName', form.hospitalName.trim());
            formData.append('reportDate', form.reportDate);
            formData.append('description', form.description.trim());
            formData.append('isPrivate', String(form.isPrivate));
            formData.append('sharedWithDoctor', form.isPrivate ? '' : form.shareWithDoctor);

            const response = await api.post('/patient/medicalrecords/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const record = response.data;
            const apiBase = api.defaults.baseURL?.replace('/api', '') || '';
            const fullFileUrl = record?.fileUrl ? `${apiBase}${record.fileUrl}` : '';

            setUploadResult({
                message: 'Report Uploaded Successfully',
                fileUrl: fullFileUrl,
                fileName: record?.fileName || selectedFile.name,
            });
            toast.success('Report uploaded successfully.');
        } catch (error) {
            const message = error?.response?.data?.message || 'Upload failed. Please try again.';
            toast.error(message);
            console.error('Upload error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="upload-report-page">Loading upload form...</div>;
    }

    return (
        <div className="upload-report-page">
            <div className="upload-report-header">
                <h1>Upload Medical Report</h1>
            </div>

            <section className="upload-card patient-info-card">
                <h2>Patient Information (Auto-filled)</h2>
                <div className="patient-grid">
                    <div><span>Name:</span> {patientInfo.name || 'N/A'}</div>
                    <div><span>Email:</span> {patientInfo.email || 'N/A'}</div>
                    <div><span>Mobile Number:</span> {patientInfo.mobileNumber || 'N/A'}</div>
                </div>
            </section>

            <section className="upload-card">
                <h2>Report Details</h2>

                <div className="field-grid">
                    <div className="field-group full-width">
                        <label htmlFor="title">Report Title</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g., Blood Test Report"
                            value={form.title}
                            onChange={onFieldChange}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="reportType">Report Type</label>
                        <select id="reportType" name="reportType" value={form.reportType} onChange={onFieldChange}>
                            {REPORT_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field-group">
                        <label htmlFor="reportDate">Report Date</label>
                        <input id="reportDate" name="reportDate" type="date" value={form.reportDate} onChange={onFieldChange} />
                    </div>

                    <div className="field-group">
                        <label htmlFor="doctorName">Doctor Name</label>
                        <input id="doctorName" name="doctorName" type="text" value={form.doctorName} onChange={onFieldChange} />
                    </div>

                    <div className="field-group">
                        <label htmlFor="hospitalName">Hospital / Clinic Name</label>
                        <input id="hospitalName" name="hospitalName" type="text" value={form.hospitalName} onChange={onFieldChange} />
                    </div>

                    <div className="field-group full-width">
                        <label htmlFor="description">Description / Notes</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={form.description}
                            onChange={onFieldChange}
                        />
                    </div>
                </div>
            </section>

            <section className="upload-card">
                <h2>File Upload</h2>
                <div
                    className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <p>Drag & Drop file here</p>
                    <p className="supported-formats">Supported: PDF, JPG/PNG, DOC/DOCX (Max 5MB)</p>
                    <label className="upload-file-button" htmlFor="medicalReportFile">Upload File</label>
                    <input id="medicalReportFile" type="file" onChange={onFileInputChange} />
                </div>

                {selectedFile && (
                    <div className="file-preview-wrap">
                        <div className="file-meta">
                            <p><strong>Selected:</strong> {selectedFile.name}</p>
                            <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        {filePreview && <img src={filePreview} alt="Uploaded preview" className="image-preview" />}
                        <button type="button" className="remove-file-button" onClick={() => setSelectedFile(null)}>
                            Remove File
                        </button>
                    </div>
                )}
            </section>

            <section className="upload-card">
                <h2>Additional Options</h2>
                <div className="field-grid">
                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                            name="isPrivate"
                            checked={form.isPrivate}
                            onChange={onFieldChange}
                        />
                        Make Report Private
                    </label>

                    <div className="field-group">
                        <label htmlFor="shareWithDoctor">Share with Doctor</label>
                        <select
                            id="shareWithDoctor"
                            name="shareWithDoctor"
                            value={form.shareWithDoctor}
                            onChange={onFieldChange}
                            disabled={form.isPrivate}
                        >
                            <option value="">Do not share</option>
                            {doctorOptions.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <div className="action-row">
                <button type="button" className="primary-btn" onClick={submitForm} disabled={isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Upload / Submit'}
                </button>
                <button type="button" className="secondary-btn" onClick={resetForm} disabled={isSubmitting}>
                    Reset
                </button>
                <button type="button" className="ghost-btn" onClick={() => navigate('/patient/dashboard')} disabled={isSubmitting}>
                    Cancel / Back to Dashboard
                </button>
            </div>

            {uploadResult && (
                <section className="upload-card success-card">
                    <h2>{uploadResult.message}</h2>
                    <div className="action-row">
                        <a className="primary-btn link-btn" href={uploadResult.fileUrl} target="_blank" rel="noreferrer">
                            View Report
                        </a>
                        <a className="secondary-btn link-btn" href={uploadResult.fileUrl} download={uploadResult.fileName}>
                            Download Report
                        </a>
                    </div>
                </section>
            )}
        </div>
    );
};

export default UploadMedicalReport;
