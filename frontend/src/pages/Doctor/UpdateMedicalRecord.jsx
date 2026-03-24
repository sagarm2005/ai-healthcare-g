import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../style/UpdateMedicalRecord.css';

const UpdateMedicalRecord = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [patient, setPatient] = useState(null);
        const [formData, setFormData] = useState({
            reportType: 'Checkup',
            description: '',
            diagnosis: '',
            treatment: '',
            notes: ''
        });
    
        useEffect(() => {
            const fetchPatientAndRecord = async () => {
                try {
                    // Fetch patient details to show who we're editing
                    const patientRes = await api.get(`/doctor-dashboard/patient/${id}/details`);
                    setPatient(patientRes.data.personalDetails);
                    
                    // If there's an existing recent record, we could pre-fill it, 
                    // but usually "Update" means adding a new entry to history or editing profile.
                    // The backend 'updateMedicalRecord' takes a record ID, but we have patient ID here.
                    // Let's assume we are adding a NEW medical record entry for this patient.
                    
                    setLoading(false);
                } catch (err) {
                    setError('Failed to fetch patient details');
                    setLoading(false);
                }
            };
    
            fetchPatientAndRecord();
        }, [id]);
    
        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        };
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
                // Assuming endpoint for adding a record to a patient
                await api.post('/medicalrecords', {
                    patientId: id,
                    ...formData
                });
                toast.success('Medical record updated successfully!');
                navigate('/doctor/patients');
            } catch (err) {
                toast.error('Failed to update medical record');
                setSaving(false);
            }
        };
    
        if (loading) return <div className="loading">Loading...</div>;
        if (error) return <div className="error-message">{error}</div>;
    
        return (
            <div className="update-record-container">
                <h1>Update Medical Record</h1>
                {patient && (
                    <div className="patient-info-summary">
                        <h3>Patient: {patient.name}</h3>
                        <p>ID: {patient._id} | Age: {patient.age} | Gender: {patient.gender}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="update-record-form">
                    <div className="form-group">
                        <label>Record Type</label>
                        <select name="reportType" value={formData.reportType} onChange={handleChange}>
                            <option value="Checkup">Checkup</option>
                            <option value="Surgery">Surgery</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Lab Test">Lab Test</option>
                        </select>
                    </div>
    

                <div className="form-group">
                    <label>Description / Symptoms</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange}
                        placeholder="Describe the current symptoms or reason for visit"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Diagnosis</label>
                    <textarea 
                        name="diagnosis" 
                        value={formData.diagnosis} 
                        onChange={handleChange}
                        placeholder="Enter diagnosis"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Treatment Plan</label>
                    <textarea 
                        name="treatment" 
                        value={formData.treatment} 
                        onChange={handleChange}
                        placeholder="Enter prescribed treatment"
                    />
                </div>

                <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Medical Record'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => navigate('/doctor/patients')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateMedicalRecord;