import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import '../style/CreatePrescription.css';

const CreatePrescription = () => {
    const { id, prescriptionId } = useParams(); // id is patientId, prescriptionId is optional
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patientDetails, setPatientDetails] = useState(null);
    const [doctorDetails, setDoctorDetails] = useState(null);
    const [medicationList, setMedicationList] = useState([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState({
        takeAfterFood: false,
        drinkWater: false,
        avoidAlcohol: false,
        restProperly: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError('Patient ID is missing.');
                setLoading(false);
                return;
            }
            try {
                const [patientRes, doctorRes] = await Promise.all([
                    api.get(`/doctor-dashboard/patient/${id}/details`),
                    api.get('/doctor/profile')
                ]);
                setPatientDetails(patientRes.data.personalDetails);
                setDoctorDetails(doctorRes.data);

                // If editing, fetch prescription data
                if (prescriptionId) {
                    const presRes = await api.get(`/prescriptions/${prescriptionId}`);
                    const presData = presRes.data;
                    setMedicationList(presData.medications);
                    
                    // Simple logic to parse back special instructions from notes if possible
                    // Or just set the notes field
                    setDoctorNotes(presData.notes || '');
                    
                    if (presData.notes) {
                        setSpecialInstructions({
                            takeAfterFood: presData.notes.includes('Take after food'),
                            drinkWater: presData.notes.includes('Drink plenty of water'),
                            avoidAlcohol: presData.notes.includes('Avoid alcohol'),
                            restProperly: presData.notes.includes('Rest properly'),
                        });
                    }
                }
            } catch (err) {
                setError('Failed to fetch required details.');
                toast.error('Failed to load information.');
                console.error('Error fetching details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, prescriptionId]);

    if (loading) {
        return <div className="create-prescription-page">Loading details...</div>;
    }

    if (error) {
        return <div className="create-prescription-page error">{error}</div>;
    }

    if (!patientDetails || !doctorDetails) {
        return <div className="create-prescription-page">Information not found.</div>;
    }

    const handleAddMedication = () => {
        setMedicationList([...medicationList, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
    };

    const handleMedicationChange = (index, event) => {
        const { name, value } = event.target;
        const list = [...medicationList];
        list[index][name] = value;
        setMedicationList(list);
    };

    const handleRemoveMedication = (index) => {
        const list = [...medicationList];
        list.splice(index, 1);
        setMedicationList(list);
    };

    const handleInstructionToggle = (instruction) => {
        setSpecialInstructions(prev => ({
            ...prev,
            [instruction]: !prev[instruction]
        }));
    };

    const handleSubmitPrescription = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Basic validation
        if (medicationList.some(med => !med.name || !med.dosage || !med.frequency)) {
            toast.error('Please fill in all required medication fields (Name, Dosage, Frequency).');
            setIsSubmitting(false);
            return;
        }

        try {
            // Combine doctor notes with special instructions for the notes field
            const selectedAdvice = Object.entries(specialInstructions)
                .filter(([_, checked]) => checked)
                .map(([key]) => {
                    if (key === 'takeAfterFood') return 'Take after food';
                    if (key === 'drinkWater') return 'Drink plenty of water';
                    if (key === 'avoidAlcohol') return 'Avoid alcohol';
                    if (key === 'restProperly') return 'Rest properly';
                    return '';
                }).filter(Boolean).join(', ');

            // Avoid duplicating advice if already present in doctorNotes during edit
            let finalNotes = doctorNotes;
            if (selectedAdvice) {
                // If it's a new prescription or advice changed
                // Simple approach: replace the "Advice:" section
                const baseNotes = doctorNotes.split('\nAdvice: ')[0];
                finalNotes = baseNotes + '\nAdvice: ' + selectedAdvice;
            }

            const prescriptionData = {
                patient: id,
                doctor: user.profileId,
                medications: medicationList,
                notes: finalNotes,
            };

            if (prescriptionId) {
                await api.put(`/prescriptions/${prescriptionId}`, prescriptionData);
                toast.success('Prescription updated successfully!');
            } else {
                await api.post('/prescriptions', prescriptionData);
                toast.success('Prescription created successfully!');
            }
            navigate(`/doctor/prescriptions`);
        } catch (err) {
            toast.error('Failed to process prescription. Please try again.');
            console.error('Error processing prescription:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-prescription-page">
            <div className="prescription-header-container">
                <div className="hospital-branding">
                    <h1 className="hospital-name">{doctorDetails.hospitalName || "St. Joseph's Memorial Hospital"}</h1>
                    <p className="hospital-address">123 Medical Center Drive, Cityville, State 56789</p>
                    <p className="hospital-address">Phone: (555) 000-1111 | www.stjosephsmemorial.org</p>
                </div>
                
                <div className="info-columns-container">
                    <div className="info-column">
                        <h2>Patient Information</h2>
                        <p><strong>Name:</strong> {patientDetails.name}</p>
                        <p><strong>Age:</strong> {patientDetails.age || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                        <p><strong>ID:</strong> {patientDetails._id?.toString().slice(-8).toUpperCase() || 'N/A'}</p>
                    </div>
                    
                    <div className="info-column doctor-column">
                        <h2>Doctor Information</h2>
                        <p><strong>Name:</strong> {doctorDetails.name}, M.D.</p>
                        <p><strong>Specialty:</strong> {doctorDetails.specialization}</p>
                        <p><strong>Contact:</strong> (555) 123-4567</p>
                        <p><strong>License:</strong> {doctorDetails.medicalRegistrationNumber}</p>
                    </div>
                </div>
            </div>

            <h1 className="prescription-title">{prescriptionId ? 'Edit Prescription' : 'Prescription'}</h1>

            <form onSubmit={handleSubmitPrescription} className="prescription-form">
                <section className="medications-section">
                    {medicationList.map((medication, index) => (
                        <div key={index} className="medication-item">
                            <div className="medication-grid">
                                <div className="form-group">
                                    <label>Rx:</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={medication.name}
                                        onChange={(e) => handleMedicationChange(index, e)}
                                        required
                                        placeholder="Medication Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dosage:</label>
                                    <input
                                        type="text"
                                        name="dosage"
                                        value={medication.dosage}
                                        onChange={(e) => handleMedicationChange(index, e)}
                                        required
                                        placeholder="e.g. 500mg"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Frequency:</label>
                                    <select
                                        name="frequency"
                                        value={medication.frequency}
                                        onChange={(e) => handleMedicationChange(index, e)}
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Afternoon">Afternoon</option>
                                        <option value="Night">Night</option>
                                        <option value="Morning & Night">Morning & Night</option>
                                        <option value="TDS (3x daily)">TDS (3x daily)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Duration:</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={medication.duration}
                                        onChange={(e) => handleMedicationChange(index, e)}
                                        placeholder="e.g. 7 days"
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '10px' }}>
                                <label>Sig:</label>
                                <textarea
                                    name="notes"
                                    value={medication.notes}
                                    onChange={(e) => handleMedicationChange(index, e)}
                                    rows="1"
                                    placeholder="Instructions for use..."
                                ></textarea>
                            </div>
                            {medicationList.length > 1 && (
                                <button type="button" onClick={() => handleRemoveMedication(index)} className="btn btn-danger add-medication-btn" style={{ position: 'absolute', top: '10px', right: '0' }}>
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddMedication} className="btn btn-secondary add-medication-btn">
                        + Add Medication
                    </button>
                </section>

                <section className="special-instructions-section">
                    <h2>Additional Advice</h2>
                    <div className="special-instructions-grid">
                        <label className={`instruction-chip ${specialInstructions.takeAfterFood ? 'active' : ''}`}>
                            <input type="checkbox" checked={specialInstructions.takeAfterFood} onChange={() => handleInstructionToggle('takeAfterFood')} />
                            Take after food
                        </label>
                        <label className={`instruction-chip ${specialInstructions.drinkWater ? 'active' : ''}`}>
                            <input type="checkbox" checked={specialInstructions.drinkWater} onChange={() => handleInstructionToggle('drinkWater')} />
                            Drink plenty of water
                        </label>
                        <label className={`instruction-chip ${specialInstructions.avoidAlcohol ? 'active' : ''}`}>
                            <input type="checkbox" checked={specialInstructions.avoidAlcohol} onChange={() => handleInstructionToggle('avoidAlcohol')} />
                            Avoid alcohol
                        </label>
                        <label className={`instruction-chip ${specialInstructions.restProperly ? 'active' : ''}`}>
                            <input type="checkbox" checked={specialInstructions.restProperly} onChange={() => handleInstructionToggle('restProperly')} />
                            Rest properly
                        </label>
                    </div>
                </section>

                <section className="doctor-notes-section">
                    <h2>Doctor's Notes</h2>
                    <div className="form-group">
                        <textarea
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            rows="3"
                            placeholder="Add any general notes for the prescription..."
                        ></textarea>
                    </div>
                </section>

                <div className="signature-section">
                    <div className="signature-container">
                        <p className="signature-name">{doctorDetails.name}</p>
                        <div className="signature-line"></div>
                        <p className="signature-date">Signed: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-cancel-doc" 
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary submit-prescription-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (prescriptionId ? 'Update Prescription' : 'Save Prescription')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePrescription;